"use client";

import { alerts } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/utils";
import { AlertTriangle, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type AlertType = "ALL" | "PROCESS" | "DOMAIN" | "MEMORY" | "CPU";

export default function AlertsPage() {
  const [typeFilter, setTypeFilter] = useState<AlertType>("ALL");

  const filtered =
    typeFilter === "ALL"
      ? alerts
      : alerts.filter((a) => a.type === typeFilter);

  const typeLabel: Record<string, string> = {
    PROCESS: "Процесс",
    DOMAIN: "Домен",
    MEMORY: "Память",
    CPU: "CPU",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Нарушения</h1>
          <p className="text-muted text-sm mt-0.5">
            {alerts.length} нарушений за последние 24 часа
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-muted" />
        <div className="flex bg-card-bg border border-card-border rounded-lg overflow-hidden">
          {(["ALL", "PROCESS", "DOMAIN", "MEMORY", "CPU"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                typeFilter === f
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "Все" : typeLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-muted">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Нарушений не найдено</p>
          </div>
        )}
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
          >
            <div
              className={`w-1.5 h-12 rounded-full shrink-0 ${
                alert.severity === "CRITICAL"
                  ? "bg-danger"
                  : "bg-warning"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                    alert.type === "PROCESS"
                      ? "text-danger bg-danger/10"
                      : alert.type === "DOMAIN"
                      ? "text-orange-600 bg-orange-50"
                      : "text-warning bg-warning/10"
                  }`}
                >
                  {typeLabel[alert.type] || alert.type}
                </span>
                <Link
                  href={`/students/${alert.studentId}`}
                  className="text-sm font-semibold text-foreground hover:text-accent"
                >
                  {alert.studentName}
                </Link>
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
              <p className="text-sm text-muted">{alert.message}</p>
            </div>
            {alert.value && (
              <div className="text-right shrink-0">
                <p
                  className={`text-lg font-bold ${
                    alert.severity === "CRITICAL"
                      ? "text-danger"
                      : "text-warning"
                  }`}
                >
                  {alert.value}%
                </p>
                <p className="text-[11px] text-muted">
                  порог: {alert.threshold}%
                </p>
              </div>
            )}
            <span className="text-xs text-muted shrink-0 min-w-[70px] text-right">
              {formatTimeAgo(alert.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
