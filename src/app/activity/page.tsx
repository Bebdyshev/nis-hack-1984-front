"use client";

import { useViolations, useStudents, useRealtimeEvents } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import type { WsEvent } from "@/lib/types";
import { useState, useCallback } from "react";

interface ActivityEvent {
  id: string;
  type: "violation" | "connect" | "disconnect";
  message: string;
  hostname: string;
  timestamp: string;
}

export default function ActivityPage() {
  const { data: studentsData, loading: sLoading } = useStudents(5000);
  const { data: violationsData, loading: vLoading } = useViolations(undefined, 5000);
  const [rtEvents, setRtEvents] = useState<ActivityEvent[]>([]);

  useRealtimeEvents(
    useCallback((event: WsEvent) => {
      if (event.type === "violation") {
        setRtEvents((prev) => [
          {
            id: `rt-${Date.now()}`,
            type: "violation",
            message: event.detail,
            hostname: event.hostname,
            timestamp: event.timestamp,
          },
          ...prev.slice(0, 99),
        ]);
      }
    }, [])
  );

  const students = studentsData?.students ?? [];
  const violations = violationsData?.violations ?? [];

  // Build activity events
  const events: ActivityEvent[] = [];

  // Real-time events first
  rtEvents.forEach((e) => events.push(e));

  // Past violations as activity
  violations.forEach((v, i) => {
    events.push({
      id: `v-${v.hostname}-${v.timestamp}-${i}`,
      type: "violation",
      message: `[${v.rule === "banned_process" ? "Процесс" : "Домен"}] ${v.detail}`,
      hostname: v.hostname,
      timestamp: v.timestamp,
    });
  });

  // Student connect/disconnect
  students.forEach((s) => {
    if (s.active) {
      events.push({
        id: `conn-${s.hostname}`,
        type: "connect",
        message: `${s.hostname} подключился к мониторингу`,
        hostname: s.hostname,
        timestamp: s.last_seen || new Date().toISOString(),
      });
    } else if (s.last_seen) {
      events.push({
        id: `disc-${s.hostname}`,
        type: "disconnect",
        message: `${s.hostname} отключился от мониторинга`,
        hostname: s.hostname,
        timestamp: s.last_seen,
      });
    }
  });

  // De-dup by id, sort by timestamp desc
  const seen = new Set<string>();
  const unique = events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (sLoading || vLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Активность</h1>
        <p className="text-muted text-sm mt-0.5">
          Журнал событий мониторинга
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-card-border" />

        <div className="space-y-0">
          {unique.map((event) => (
            <div key={event.id} className="relative flex gap-4 pb-6">
              {/* Dot */}
              <div
                className={`relative z-10 w-[10px] h-[10px] rounded-full mt-1.5 ring-4 ring-background shrink-0 ml-[15px] ${
                  event.type === "violation"
                    ? "bg-warning"
                    : event.type === "connect"
                    ? "bg-success"
                    : "bg-gray-300"
                }`}
              />

              {/* Content */}
              <div className="bg-card-bg border border-card-border rounded-xl px-5 py-3.5 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/students/${event.hostname}`}
                      className="text-sm font-semibold text-foreground hover:text-accent"
                    >
                      {event.hostname}
                    </Link>
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        event.type === "violation"
                          ? "bg-warning/10 text-warning"
                          : event.type === "connect"
                          ? "bg-success/10 text-success"
                          : "bg-gray-100 text-muted"
                      }`}
                    >
                      {event.type === "violation"
                        ? "Нарушение"
                        : event.type === "connect"
                        ? "Подключение"
                        : "Отключение"}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted">{event.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {unique.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет событий</p>
        </div>
      )}
    </div>
  );
}
