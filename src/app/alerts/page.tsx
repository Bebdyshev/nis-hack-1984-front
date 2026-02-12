"use client";

import { useViolations } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { AlertTriangle, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type RuleFilter = "ALL" | "banned_process" | "banned_domain";

export default function AlertsPage() {
  const { data, loading } = useViolations(undefined, 5000);
  const [ruleFilter, setRuleFilter] = useState<RuleFilter>("ALL");

  const violations = data?.violations ?? [];

  const filtered =
    ruleFilter === "ALL"
      ? violations
      : violations.filter((v) => v.rule === ruleFilter);

  const ruleLabel: Record<string, string> = {
    banned_process: "Процесс",
    banned_domain: "Домен",
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Нарушения</h1>
          <p className="text-muted text-sm mt-0.5">
            {violations.length} нарушений зарегистрировано
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-muted" />
        <div className="flex bg-card-bg border border-card-border rounded-lg overflow-hidden">
          {(["ALL", "banned_process", "banned_domain"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRuleFilter(f)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                ruleFilter === f
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "Все" : ruleLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Violations list */}
      <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-muted">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Нарушений не найдено</p>
          </div>
        )}
        {filtered.map((v, i) => (
          <div
            key={`${v.hostname}-${v.timestamp}-${i}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
          >
            <div
              className={`w-1.5 h-12 rounded-full shrink-0 ${
                v.severity === "high" ? "bg-danger" : v.severity === "medium" ? "bg-warning" : "bg-blue-400"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                    v.rule === "banned_process"
                      ? "text-danger bg-danger/10"
                      : "text-orange-600 bg-orange-50"
                  }`}
                >
                  {ruleLabel[v.rule] || v.rule}
                </span>
                <Link
                  href={`/students/${v.hostname}`}
                  className="text-sm font-semibold text-foreground hover:text-accent"
                >
                  {v.hostname}
                </Link>
                <span
                  className={`text-xs font-semibold ${
                    v.severity === "high"
                      ? "text-danger"
                      : v.severity === "medium"
                      ? "text-warning"
                      : "text-blue-500"
                  }`}
                >
                  {v.severity === "high" ? "КРИТИЧНО" : v.severity === "medium" ? "ВНИМАНИЕ" : "ИНФО"}
                </span>
              </div>
              <p className="text-sm text-muted">{v.detail}</p>
            </div>
            <span className="text-xs text-muted shrink-0 min-w-[70px] text-right">
              {formatTimeAgo(v.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
