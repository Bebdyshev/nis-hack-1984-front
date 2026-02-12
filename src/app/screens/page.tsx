"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MonitorPlay,
  Circle,
  Maximize2,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { SCREEN_VIEW_WS } from "@/lib/api-config";

// ── Types ──────────────────────────────────────────────────────

interface StudentScreen {
  hostname: string;
  objectUrl: string | null;
  lastUpdate: number | null;
}

// ── Component ──────────────────────────────────────────────────

export default function ScreensPage() {
  const [students, setStudents] = useState<Record<string, StudentScreen>>({});
  const [connected, setConnected] = useState(false);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store object URLs for cleanup
  const objectUrls = useRef<Record<string, string>>({});

  // ── WebSocket connection ──────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(SCREEN_VIEW_WS);
    wsRef.current = ws;

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        // JSON control message
        try {
          const msg = JSON.parse(event.data);
          handleControlMessage(msg);
        } catch {
          // Ignore parse errors
        }
      } else {
        // Binary: tagged JPEG frame
        handleBinaryFrame(event.data as ArrayBuffer);
      }
    };
  }, []);

  const handleControlMessage = useCallback(
    (msg: { type: string; students?: string[]; hostname?: string }) => {
      switch (msg.type) {
        case "student_list":
          if (msg.students) {
            setStudents((prev) => {
              const next = { ...prev };
              for (const hn of msg.students!) {
                if (!next[hn]) {
                  next[hn] = { hostname: hn, objectUrl: null, lastUpdate: null };
                }
              }
              return next;
            });
          }
          break;
      }
    },
    []
  );

  const handleBinaryFrame = useCallback((buffer: ArrayBuffer) => {
    const view = new Uint8Array(buffer);

    // Check for JSON event (hostname_len == 0)
    if (view[0] === 0) {
      const jsonBytes = view.slice(1);
      const text = new TextDecoder().decode(jsonBytes);
      try {
        const msg = JSON.parse(text);
        if (msg.type === "student_connected" && msg.hostname) {
          setStudents((prev) => ({
            ...prev,
            [msg.hostname]: {
              hostname: msg.hostname,
              objectUrl: prev[msg.hostname]?.objectUrl || null,
              lastUpdate: prev[msg.hostname]?.lastUpdate || null,
            },
          }));
        } else if (msg.type === "student_disconnected" && msg.hostname) {
          setStudents((prev) => {
            const next = { ...prev };
            // Revoke URL
            if (next[msg.hostname]?.objectUrl) {
              URL.revokeObjectURL(next[msg.hostname].objectUrl!);
              delete objectUrls.current[msg.hostname];
            }
            delete next[msg.hostname];
            return next;
          });
        }
      } catch {
        // Ignore
      }
      return;
    }

    // Tagged binary frame: [1 byte hostnameLen][hostname][JPEG]
    const hnLen = view[0];
    const hnBytes = view.slice(1, 1 + hnLen);
    const hostname = new TextDecoder().decode(hnBytes);
    const jpegBytes = view.slice(1 + hnLen);

    const blob = new Blob([jpegBytes], { type: "image/jpeg" });
    const newUrl = URL.createObjectURL(blob);

    // Revoke previous URL to avoid memory leak
    if (objectUrls.current[hostname]) {
      URL.revokeObjectURL(objectUrls.current[hostname]);
    }
    objectUrls.current[hostname] = newUrl;

    setStudents((prev) => ({
      ...prev,
      [hostname]: {
        hostname,
        objectUrl: newUrl,
        lastUpdate: Date.now(),
      },
    }));
  }, []);

  // ── Lifecycle ─────────────────────────────────────────────────

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      // Cleanup all object URLs
      Object.values(objectUrls.current).forEach(URL.revokeObjectURL);
    };
  }, [connect]);

  // ── Derived state ─────────────────────────────────────────────

  const studentList = Object.values(students);
  const streamingCount = studentList.filter((s) => s.objectUrl).length;
  const fullscreenStudent = fullscreen ? students[fullscreen] : null;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Экраны</h1>
          <p className="text-muted text-sm mt-0.5">
            Мониторинг экранов учащихся в реальном времени
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              connected
                ? "bg-success/5 border-success/20 text-success"
                : "bg-danger/5 border-danger/20 text-danger"
            }`}
          >
            {connected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            {connected ? "Подключено" : "Отключено"}
          </div>
          {/* Student count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border bg-card-bg text-xs font-medium text-foreground">
            <MonitorPlay className="w-3.5 h-3.5 text-accent" />
            {streamingCount} из {studentList.length} трансляций
          </div>
          {/* Reconnect button */}
          {!connected && (
            <button
              onClick={() => {
                if (reconnectTimer.current)
                  clearTimeout(reconnectTimer.current);
                connect();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border bg-card-bg hover:bg-gray-50 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Подключиться
            </button>
          )}
        </div>
      </div>

      {/* Grid of screens */}
      {studentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {studentList.map((student) => (
            <ScreenCard
              key={student.hostname}
              student={student}
              onFullscreen={() => setFullscreen(student.hostname)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <MonitorPlay className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">Нет подключённых учеников</p>
          <p className="text-xs mt-1 opacity-70">
            Запустите агент на компьютерах учащихся
          </p>
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreenStudent && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => setFullscreen(null)}
        >
          {/* Header */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-5 py-2 rounded-lg text-sm font-semibold z-10">
            {fullscreenStudent.hostname}
          </div>
          {/* Close button */}
          <button
            onClick={() => setFullscreen(null)}
            className="absolute top-4 right-4 bg-black/60 text-white rounded-lg p-2 hover:bg-black/80 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Image */}
          {fullscreenStudent.objectUrl ? (
            <img
              src={fullscreenStudent.objectUrl}
              alt={fullscreenStudent.hostname}
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-white/50 text-sm">Ожидание кадра...</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Screen card component ───────────────────────────────────────

function ScreenCard({
  student,
  onFullscreen,
}: {
  student: StudentScreen;
  onFullscreen: () => void;
}) {
  const [lastSeenText, setLastSeenText] = useState("Ожидание...");

  useEffect(() => {
    const interval = setInterval(() => {
      if (!student.lastUpdate) {
        setLastSeenText("Ожидание потока...");
        return;
      }
      const ago = Math.round((Date.now() - student.lastUpdate) / 1000);
      if (ago < 3) setLastSeenText("Обновлено только что");
      else if (ago < 60) setLastSeenText(`Обновлено ${ago} сек. назад`);
      else setLastSeenText(`Обновлено ${Math.round(ago / 60)} мин. назад`);
    }, 1000);
    return () => clearInterval(interval);
  }, [student.lastUpdate]);

  return (
    <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
        <div className="flex items-center gap-2.5">
          <Circle
            className={`w-2.5 h-2.5 ${
              student.objectUrl
                ? "fill-success text-success"
                : "fill-warning text-warning animate-pulse"
            }`}
          />
          <span className="text-sm font-semibold text-foreground">
            {student.hostname}
          </span>
        </div>
        <span className="text-[11px] text-muted">{lastSeenText}</span>
      </div>

      {/* Screen area */}
      <div className="relative bg-black aspect-video flex items-center justify-center group">
        {student.objectUrl ? (
          <>
            <img
              src={student.objectUrl}
              alt={student.hostname}
              className="w-full h-full object-contain"
            />
            {/* Fullscreen button — visible on hover */}
            <button
              onClick={onFullscreen}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              title="На весь экран"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-center text-muted/50">
            <MonitorPlay className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Ожидание потока...</p>
          </div>
        )}
      </div>
    </div>
  );
}
