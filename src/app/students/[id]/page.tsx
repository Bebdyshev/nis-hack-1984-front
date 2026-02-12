"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  MemoryStick,
  HardDrive,
  Gauge,
  Circle,
  Monitor,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { students, getCurrentMetrics, metricsHistory, processesMap, alerts } from "@/lib/mock-data";
import { formatPercent, formatTimeAgo } from "@/lib/utils";
import { MetricsChart } from "@/components/metrics-chart";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">Компьютер не найден</p>
        <Link href="/students" className="text-accent text-sm mt-2 inline-block">
          ← Назад к списку
        </Link>
      </div>
    );
  }

  const metrics = getCurrentMetrics(student.id);
  const history = metricsHistory.find((m) => m.studentId === student.id);
  const processes = processesMap[student.id] || [];
  const studentAlerts = alerts.filter((a) => a.studentId === student.id).slice(0, 5);
  const bannedProcesses = processes.filter((p) => p.isBanned);

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
              <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
              <Circle
                className={`w-2.5 h-2.5 ${
                  student.status === "online"
                    ? "fill-success text-success"
                    : "fill-gray-300 text-gray-300"
                }`}
              />
            </div>
            <p className="text-sm text-muted">
              {student.os} · {student.cores} ядер · {student.ramTotal} ГБ ОЗУ · {student.classroom}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-card-border rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mb-6 text-xs text-muted">
        <Circle className="w-2 h-2 fill-success text-success" />
        Обновление каждые 2 сек.
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-medium">CPU</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatPercent(metrics.cpu)}
            <span className="text-base font-normal text-muted ml-1">%</span>
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <MemoryStick className="w-4 h-4" />
            <span className="text-xs font-medium">Память</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatPercent(metrics.memory)}
            <span className="text-base font-normal text-muted ml-1">%</span>
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-medium">Диск</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatPercent(metrics.disk)}
            <span className="text-base font-normal text-muted ml-1">%</span>
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-2">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-medium">Нагрузка</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {metrics.load.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      {history && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <MetricsChart data={history.metrics} type="cpu-memory" />
          <MetricsChart data={history.metrics} type="disk" />
        </div>
      )}

      {/* Banned processes alert */}
      {bannedProcesses.length > 0 && (
        <div className="mb-6 bg-danger/5 border border-danger/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <h3 className="text-sm font-semibold text-danger">
              Запрещённые процессы ({bannedProcesses.length})
            </h3>
          </div>
          <div className="space-y-2">
            {bannedProcesses.map((p) => (
              <div
                key={p.pid}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted ml-2">PID: {p.pid}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>CPU: {p.cpuPercent}%</span>
                  <span>MEM: {p.memPercent}%</span>
                  <span>{p.rss} MB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Processes + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processes Table */}
        <div className="bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">
              Процессы (по CPU)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase border-b border-card-border">
                  <th className="text-left px-5 py-3 font-medium">PID</th>
                  <th className="text-left px-5 py-3 font-medium">Имя</th>
                  <th className="text-right px-5 py-3 font-medium">CPU %</th>
                  <th className="text-right px-5 py-3 font-medium">MEM %</th>
                  <th className="text-right px-5 py-3 font-medium">RSS</th>
                  <th className="text-right px-5 py-3 font-medium">THR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {processes
                  .sort((a, b) => b.cpuPercent - a.cpuPercent)
                  .map((p) => (
                    <tr
                      key={p.pid}
                      className={p.isBanned ? "bg-danger/5" : ""}
                    >
                      <td className="px-5 py-3 text-muted">{p.pid}</td>
                      <td className="px-5 py-3 font-medium">
                        <span className={p.isBanned ? "text-danger" : "text-foreground"}>
                          {p.name}
                        </span>
                        {p.isBanned && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                            запрещён
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-success">{p.cpuPercent}%</td>
                      <td className="px-5 py-3 text-right text-success">{p.memPercent}%</td>
                      <td className="px-5 py-3 text-right text-muted">{p.rss} MB</td>
                      <td className="px-5 py-3 text-right text-muted">{p.threads}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent alerts for this student */}
        <div className="bg-card-bg border border-card-border rounded-xl">
          <div className="px-5 py-4 border-b border-card-border">
            <h3 className="text-sm font-semibold text-foreground">
              Последние нарушения
            </h3>
          </div>
          {studentAlerts.length > 0 ? (
            <div className="divide-y divide-card-border">
              {studentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={`w-1 h-10 rounded-full shrink-0 ${
                      alert.severity === "CRITICAL" ? "bg-danger" : "bg-warning"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-bold uppercase ${
                          alert.type === "PROCESS" ? "text-danger" : "text-warning"
                        }`}
                      >
                        {alert.type === "PROCESS"
                          ? "Процесс"
                          : alert.type === "DOMAIN"
                          ? "Домен"
                          : alert.type}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          alert.severity === "CRITICAL" ? "text-danger" : "text-warning"
                        }`}
                      >
                        {alert.severity === "CRITICAL" ? "КРИТИЧНО" : "ВНИМАНИЕ"}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {formatTimeAgo(alert.timestamp)}
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
    </div>
  );
}
