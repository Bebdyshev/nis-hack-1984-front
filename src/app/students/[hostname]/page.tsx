"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  MemoryStick,
  Circle,
  Monitor,
  AlertTriangle,
  AppWindow,
  Globe,
  Loader2,
  Clock,
  ScreenShare,
  ScreenShareOff,
  MonitorOff,
  Lock,
  ExternalLink,
  Send,
} from "lucide-react";
import { useStudentDetail } from "@/lib/api";
import { TEACHER_API } from "@/lib/api-config";
import { SCREEN_VIEW_WS } from "@/lib/api-config";
import { formatPercent, formatTimeAgo } from "@/lib/utils";

// ── Live screen hook via teacher WebSocket relay ────────────────

function useLiveScreen(hostname: string) {
  const [frame, setFrame] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      ws = new WebSocket(SCREEN_VIEW_WS);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        if (!unmounted) setConnected(true);
      };

      ws.onmessage = (e) => {
        if (unmounted) return;

        // Text messages = JSON events (student_list, etc.)
        if (typeof e.data === "string") return;

        // Binary: [1 byte hn_len][hostname][JPEG]
        const buf = new Uint8Array(e.data as ArrayBuffer);
        if (buf.length < 2) return;

        const hnLen = buf[0];
        // hnLen === 0 means JSON event encoded as binary, skip
        if (hnLen === 0) return;

        const hnBytes = buf.slice(1, 1 + hnLen);
        const hn = new TextDecoder().decode(hnBytes);

        // Only keep frames for THIS student
        if (hn !== hostname) return;

        const jpegBytes = buf.slice(1 + hnLen);
        const blob = new Blob([jpegBytes], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        setFrame((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      };

      ws.onclose = () => {
        if (!unmounted) {
          setConnected(false);
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      unmounted = true;
      wsRef.current?.close();
      setFrame((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [hostname]);

  return { frame, connected };
}

// ── Page component ──────────────────────────────────────────────

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ hostname: string }>;
}) {
  const { hostname } = use(params);
  const { data, loading, error } = useStudentDetail(hostname, 3000);
  const { frame: liveFrame, connected: streamConnected } = useLiveScreen(hostname);
  const [lockLoading, setLockLoading] = useState<"soft" | "hard" | null>(null);
  const [lockResult, setLockResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const sendLock = useCallback(async (mode: "soft" | "hard") => {
    setLockLoading(mode);
    setLockResult(null);
    try {
      const res = await fetch(`${TEACHER_API}/students/${hostname}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        setLockResult({ ok: true, msg: mode === "soft" ? "Окна свёрнуты" : "Компьютер заблокирован" });
      } else {
        setLockResult({ ok: false, msg: json.error || "Ошибка" });
      }
    } catch (e) {
      setLockResult({ ok: false, msg: "Нет связи с сервером" });
    } finally {
      setLockLoading(null);
      setTimeout(() => setLockResult(null), 4000);
    }
  }, [hostname]);

  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const sendOpenUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    setUrlResult(null);
    try {
      const res = await fetch(`${TEACHER_API}/students/${hostname}/open-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        setUrlResult({ ok: true, msg: "Ссылка открыта" });
        setUrlInput("");
      } else {
        setUrlResult({ ok: false, msg: json.error || "Ошибка" });
      }
    } catch {
      setUrlResult({ ok: false, msg: "Нет связи с сервером" });
    } finally {
      setUrlLoading(false);
      setTimeout(() => setUrlResult(null), 4000);
    }
  }, [hostname, urlInput]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">{error || "Компьютер не найден"}</p>
        <Link href="/students" className="text-accent text-sm mt-2 inline-block">
          ← Назад к списку
        </Link>
      </div>
    );
  }

  const { summary, apps, violations, screenshot } = data;
  const applications = apps?.applications ?? [];
  const browserTabs = apps?.browser_tabs ?? [];

  // Use live frame if available, fallback to screenshot from Redis
  const screenSrc = liveFrame || screenshot?.image_url || null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Back */}
      <Link
        href="/students"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к компьютерам
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/5 flex items-center justify-center">
            <Monitor className="w-7 h-7 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{summary.hostname}</h1>
              <Circle
                className={`w-2.5 h-2.5 ${
                  summary.active
                    ? "fill-success text-success"
                    : "fill-gray-300 text-gray-300"
                }`}
              />
            </div>
            <p className="text-sm text-muted">
              {summary.os} · {summary.username} · {summary.ip}:{summary.port}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary.last_seen && (
            <div className="flex items-center gap-1.5 text-xs text-muted mr-3">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(summary.last_seen)}
            </div>
          )}
          <button
            onClick={() => sendLock("soft")}
            disabled={lockLoading !== null || !summary.active}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-warning/30 bg-warning/5 text-warning hover:bg-warning/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Свернуть все окна на компьютере ученика"
          >
            {lockLoading === "soft" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MonitorOff className="w-3.5 h-3.5" />
            )}
            Soft Lock
          </button>
          <button
            onClick={() => sendLock("hard")}
            disabled={lockLoading !== null || !summary.active}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-danger/30 bg-danger/5 text-danger hover:bg-danger/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Заблокировать компьютер ученика (Win+L)"
          >
            {lockLoading === "hard" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            Hard Lock
          </button>
        </div>
      </div>

      {/* Lock result toast */}
      {lockResult && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
            lockResult.ok
              ? "bg-success/10 text-success border border-success/20"
              : "bg-danger/10 text-danger border border-danger/20"
          }`}
        >
          {lockResult.msg}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-medium">CPU</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatPercent(summary.cpu_usage)}
            <span className="text-base font-normal text-muted ml-1">%</span>
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <MemoryStick className="w-4 h-4" />
            <span className="text-xs font-medium">Память</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatPercent(summary.ram_usage)}
            <span className="text-base font-normal text-muted ml-1">%</span>
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <AppWindow className="w-4 h-4" />
            <span className="text-xs font-medium">Приложения</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{applications.length}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Нарушения</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{summary.violation_count}</p>
        </div>
      </div>

      {/* ── Live Screen ───────────────────────────────────────── */}
      <div className="mb-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Экран</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {streamConnected && liveFrame ? (
              <>
                <ScreenShare className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success font-medium">Live</span>
              </>
            ) : screenshot ? (
              <>
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span className="text-xs text-muted">
                  Скриншот · {formatTimeAgo(screenshot.timestamp)}
                </span>
              </>
            ) : (
              <>
                <ScreenShareOff className="w-3.5 h-3.5 text-muted" />
                <span className="text-xs text-muted">Нет изображения</span>
              </>
            )}
          </div>
        </div>
        <div className="p-4 bg-black/5">
          {screenSrc ? (
            <img
              src={screenSrc}
              alt={`Экран ${summary.hostname}`}
              className="w-full rounded-lg border border-card-border"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <ScreenShareOff className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Экран недоступен</p>
              <p className="text-xs mt-1">Студент не подключён к стримингу</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processes Table */}
        <div className="bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">
              Процессы ({applications.length})
            </h3>
          </div>
          {applications.length > 0 ? (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card-bg">
                  <tr className="text-xs text-muted uppercase border-b border-card-border">
                    <th className="text-left px-5 py-3 font-medium">PID</th>
                    <th className="text-left px-5 py-3 font-medium">Имя</th>
                    <th className="text-right px-5 py-3 font-medium">Память</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {[...applications]
                    .sort((a, b) => b.memory_mb - a.memory_mb)
                    .slice(0, 30)
                    .map((app) => (
                      <tr key={app.pid}>
                        <td className="px-5 py-3 text-muted font-mono text-xs">{app.pid}</td>
                        <td className="px-5 py-3 font-medium text-foreground">{app.name}</td>
                        <td className="px-5 py-3 text-right text-muted">
                          {app.memory_mb.toFixed(1)} MB
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-muted text-sm">
              Нет данных о процессах
            </div>
          )}
        </div>

        {/* Violations */}
        <div className="bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">
              Последние нарушения ({violations.length})
            </h3>
          </div>
          {violations.length > 0 ? (
            <div className="divide-y divide-card-border max-h-[400px] overflow-y-auto">
              {violations.slice(0, 20).map((v, i) => (
                <div key={`${v.timestamp}-${i}`} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={`w-1 h-10 rounded-full shrink-0 ${
                      v.severity === "high" ? "bg-danger" : "bg-warning"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-bold uppercase ${
                          v.rule === "banned_process" ? "text-danger" : "text-warning"
                        }`}
                      >
                        {v.rule === "banned_process" ? "Процесс" : "Домен"}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          v.severity === "high" ? "text-danger" : "text-warning"
                        }`}
                      >
                        {v.severity === "high" ? "КРИТИЧНО" : "ВНИМАНИЕ"}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{v.detail}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {formatTimeAgo(v.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-muted text-sm">
              Нарушений не обнаружено ✅
            </div>
          )}
        </div>
      </div>

      {/* Browser Tabs */}
      {browserTabs.length > 0 && (
        <div className="mt-6 bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Вкладки браузера ({browserTabs.length})
            </h3>
          </div>
          <div className="divide-y divide-card-border max-h-[300px] overflow-y-auto">
            {browserTabs.map((tab, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-medium text-accent bg-accent/5 px-1.5 py-0.5 rounded">
                    {tab.browser}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">{tab.title}</span>
                </div>
                <p className="text-xs text-muted truncate">{tab.url}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
