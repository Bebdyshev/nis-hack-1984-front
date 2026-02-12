"use client";

import { use } from "react";
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
} from "lucide-react";
import { useStudentDetail } from "@/lib/api";
import { formatPercent, formatTimeAgo } from "@/lib/utils";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ hostname: string }>;
}) {
  const { hostname } = use(params);
  const { data, loading, error } = useStudentDetail(hostname, 3000);

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
        {summary.last_seen && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(summary.last_seen)}
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mb-6 text-xs text-muted">
        <Circle className="w-2 h-2 fill-success text-success" />
        Обновление каждые 3 сек.
      </div>

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

      {/* Screenshot */}
      {screenshot && (
        <div className="mb-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">Скриншот экрана</h3>
            <p className="text-xs text-muted">{formatTimeAgo(screenshot.timestamp)}</p>
          </div>
          <div className="p-4">
            <img
              src={screenshot.image_url}
              alt="Скриншот экрана"
              className="w-full rounded-lg border border-card-border"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processes Table */}
        <div className="bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">
              Процессы ({applications.length})
            </h3>
          </div>
          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted uppercase border-b border-card-border">
                    <th className="text-left px-5 py-3 font-medium">PID</th>
                    <th className="text-left px-5 py-3 font-medium">Имя</th>
                    <th className="text-right px-5 py-3 font-medium">Память</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {applications
                    .sort((a, b) => b.memory_mb - a.memory_mb)
                    .slice(0, 20)
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
              Последние нарушения
            </h3>
          </div>
          {violations.length > 0 ? (
            <div className="divide-y divide-card-border">
              {violations.slice(0, 10).map((v, i) => (
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
              Нарушений не обнаружено
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
          <div className="divide-y divide-card-border">
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
