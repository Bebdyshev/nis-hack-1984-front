import { useCallback, useEffect, useRef, useState } from "react";
import { TEACHER_API } from "./api-config";
import type { StudentSummary, Violation, StudentDetail, WsEvent } from "./types";

// ── Generic fetch helper ────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TEACHER_API}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── Polling hook ────────────────────────────────────────────────

function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 5000
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  // During SSR (not mounted) always return loading to avoid hydration mismatch
  if (!mounted) return { data: null, loading: true, error: null, refetch: fetchData };

  return { data, loading, error, refetch: fetchData };
}

// ── Data hooks ──────────────────────────────────────────────────

/** Fetch all registered students, polls every 5s */
export function useStudents(intervalMs = 5000) {
  const fetcher = useCallback(
    () => apiFetch<{ count: number; students: StudentSummary[] }>("/students"),
    []
  );
  return usePolling(fetcher, intervalMs);
}

/** Fetch active students only */
export function useActiveStudents(intervalMs = 5000) {
  const fetcher = useCallback(
    () => apiFetch<{ count: number; students: StudentSummary[] }>("/students/active"),
    []
  );
  return usePolling(fetcher, intervalMs);
}

/** Fetch violations (optionally filtered by hostname) */
export function useViolations(hostname?: string, intervalMs = 5000) {
  const fetcher = useCallback(() => {
    const params = new URLSearchParams();
    if (hostname) params.set("hostname", hostname);
    params.set("count", "100");
    return apiFetch<{ violations: Violation[] }>(`/violations?${params}`);
  }, [hostname]);
  return usePolling(fetcher, intervalMs);
}

/** Fetch full detail for one student */
export function useStudentDetail(hostname: string, intervalMs = 5000) {
  const fetcher = useCallback(
    () => apiFetch<StudentDetail>(`/students/${hostname}`),
    [hostname]
  );
  return usePolling(fetcher, intervalMs);
}

/** Fetch teacher server config (banned lists, etc.) */
export function useTeacherConfig() {
  const fetcher = useCallback(
    () => apiFetch<Record<string, unknown>>("/config"),
    []
  );
  return usePolling(fetcher, 30000); // every 30s
}

// ── WebSocket hook for real-time violations/notifications ───────

export function useRealtimeEvents(onEvent: (event: WsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    function connect() {
      // Connect to the teacher's general WS endpoint
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${proto}//${window.location.hostname}:8080/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "violation" || msg.type === "notification") {
            onEventRef.current(msg as WsEvent);
          }
        } catch {
          // ignore non-JSON
        }
      };

      ws.onclose = () => {
        setTimeout(connect, 4000);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);
}
