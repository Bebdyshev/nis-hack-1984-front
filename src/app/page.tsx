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
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { useStudents, useViolations, useRealtimeEvents } from "@/lib/api";
import { formatTimeAgo, formatPercent } from "@/lib/utils";
import type { Violation, WsEvent } from "@/lib/types";
import { useState, useCallback } from "react";

export default function DashboardPage() {
  const { data: studentsData, loading: sLoading } = useStudents(5000);
  const { data: violationsData, loading: vLoading } = useViolations(undefined, 5000);
  const [rtAlerts, setRtAlerts] = useState<Violation[]>([]);

  useRealtimeEvents(
    useCallback((event: WsEvent) => {
      if (event.type === "violation") {
        setRtAlerts((prev) => [
          { hostname: event.hostname, rule: event.rule, detail: event.detail, severity: event.severity, timestamp: event.timestamp },
          ...prev.slice(0, 49),
        ]);
      }
    }, [])
  );

  const students = studentsData?.students ?? [];
  const onlineCount = students.filter((s) => s.active).length;
  const totalCount = students.length;

  const allViolations = [...rtAlerts, ...(violationsData?.violations ?? [])];
  const seen = new Set<string>();
  const violations = allViolations.filter((v) => {
    const key = `${v.hostname}:${v.timestamp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const criticalCount = violations.filter((v) => v.severity === "high").length;

  if (sLoading || vLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted text-sm mt-0.5">Мониторинг компьютеров учащихся</p>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="mb-6 bg-danger/5 border border-danger/20 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <div>
              <p className="text-sm font-semibold text-danger">{criticalCount} критических нарушений</p>
              <p className="text-xs text-muted">Требуют немедленного внимания</p>
            </div>
          </div>
          <Link href="/alerts" className="text-xs text-danger hover:underline font-medium">Подробнее →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Monitor className="w-4 h-4" />} label="Компьютеры" value={`${onlineCount} / ${totalCount}`} sub="в сети" subColor="text-success" />
        <StatCard icon={<ShieldCheck className="w-4 h-4" />} label="Активных" value={String(onlineCount)} sub="подключены" subColor="text-success" />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Нарушения" value={String(violations.length)} sub={criticalCount > 0 ? `${criticalCount} критических` : "всё чисто"} subColor={criticalCount > 0 ? "text-danger" : "text-success"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Компьютеры</h2>
            <Link href="/students" className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1">Показать все <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
            {students.length === 0 && <div className="px-5 py-10 text-center text-muted text-sm">Нет подключённых компьютеров</div>}
            {students.slice(0, 6).map((s) => (
              <Link key={s.hostname} href={`/students/${s.hostname}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
                <div className="flex items-center gap-3">
                  <Circle className={`w-2.5 h-2.5 ${s.active ? "fill-success text-success" : "fill-gray-300 text-gray-300"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.hostname}</p>
                    <p className="text-xs text-muted">{s.username || s.ip} · {s.os}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted">
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-0.5"><Cpu className="w-3 h-3" /><span className="uppercase font-medium">CPU</span></div>
                    <span className="text-foreground font-semibold text-sm">{formatPercent(s.cpu_usage)}%</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-0.5"><MemoryStick className="w-3 h-3" /><span className="uppercase font-medium">MEM</span></div>
                    <span className="text-foreground font-semibold text-sm">{formatPercent(s.ram_usage)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Последние нарушения</h2>
            <Link href="/alerts" className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1">Показать все <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl divide-y divide-card-border">
            {violations.length === 0 && <div className="px-5 py-10 text-center text-muted text-sm">Нарушений не обнаружено</div>}
            {violations.slice(0, 6).map((v, i) => (
              <div key={`${v.hostname}-${v.timestamp}-${i}`} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-1 h-10 rounded-full shrink-0 ${v.severity === "high" ? "bg-danger" : "bg-warning"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold uppercase ${v.rule === "banned_process" ? "text-danger" : "text-warning"}`}>{v.rule === "banned_process" ? "Процесс" : "Домен"}</span>
                    <Link href={`/students/${v.hostname}`} className="text-xs font-medium text-foreground hover:text-accent">{v.hostname}</Link>
                    <span className={`text-xs font-semibold ${v.severity === "high" ? "text-danger" : "text-warning"}`}>{v.severity === "high" ? "КРИТИЧНО" : "ВНИМАНИЕ"}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{v.detail}</p>
                </div>
                <span className="text-xs text-muted shrink-0">{formatTimeAgo(v.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
