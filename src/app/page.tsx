"use client";

import Link from "next/link";
import {
  Monitor,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Cpu,
  MemoryStick,
  Circle,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { students, alerts, getCurrentMetrics } from "@/lib/mock-data";
import { formatTimeAgo, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const onlineCount = students.filter((s) => s.status === "online").length;
  const totalCount = students.length;
  const activeAlerts = alerts.filter(
    (a) => Date.now() - new Date(a.timestamp).getTime() < 3600000
  );
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "CRITICAL");

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted text-sm mt-0.5">
            Мониторинг компьютеров учащихся
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="mb-6 bg-danger/5 border border-danger/20 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <div>
              <p className="text-sm font-semibold text-danger">
                {criticalAlerts.length} критическое нарушение
              </p>
              <p className="text-xs text-muted">
                {criticalAlerts.length} активных оповещений
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Circle className="w-2 h-2 fill-success text-success" />
            Онлайн
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Monitor className="w-4 h-4" />}
          label="Компьютеры"
          value={`${onlineCount} / ${totalCount}`}
          sub="в сети"
          subColor="text-success"
        />
        <StatCard
          icon={<ShieldCheck className="w-4 h-4" />}
          label="Проверки"
          value={`${totalCount} / ${totalCount}`}
          sub="все пройдены"
          subColor="text-success"
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Нарушения"
          value={String(activeAlerts.length)}
          sub="требуют внимания"
          subColor="text-danger"
        />
      </div>

      {/* Two columns: Students + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Компьютеры
            </h2>
            <Link
              href="/students"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              Показать все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
            {students.slice(0, 6).map((student) => {
              const metrics = getCurrentMetrics(student.id);
              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="flex items-center gap-3">
                    <Circle
                      className={`w-2.5 h-2.5 ${
                        student.status === "online"
                          ? "fill-success text-success"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted">
                        {student.hostname} · {student.classroom}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-muted">
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Cpu className="w-3 h-3" />
                        <span className="uppercase font-medium">CPU</span>
                      </div>
                      <span className="text-foreground font-semibold text-sm">
                        {formatPercent(metrics.cpu)}%
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <MemoryStick className="w-3 h-3" />
                        <span className="uppercase font-medium">MEM</span>
                      </div>
                      <span className="text-foreground font-semibold text-sm">
                        {formatPercent(metrics.memory)}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Последние нарушения
            </h2>
            <Link
              href="/alerts"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              Показать все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
            {alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div
                  className={`w-1 h-10 rounded-full shrink-0 ${
                    alert.severity === "CRITICAL"
                      ? "bg-danger"
                      : "bg-warning"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-bold uppercase ${
                        alert.type === "PROCESS"
                          ? "text-danger"
                          : "text-warning"
                      }`}
                    >
                      {alert.type === "PROCESS"
                        ? "Процесс"
                        : alert.type === "DOMAIN"
                        ? "Домен"
                        : alert.type}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {alert.studentName}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        alert.severity === "CRITICAL"
                          ? "text-danger"
                          : "text-warning"
                      }`}
                    >
                      {alert.severity === "CRITICAL" ? "КРИТИЧНО" : "ВНИМАНИЕ"}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {alert.message}
                  </p>
                </div>
                <span className="text-xs text-muted shrink-0">
                  {formatTimeAgo(alert.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}