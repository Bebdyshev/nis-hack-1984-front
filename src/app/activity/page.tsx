"use client";

import { alerts, students } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/utils";
import { Activity } from "lucide-react";
import Link from "next/link";

interface ActivityEvent {
  id: string;
  type: "alert" | "connect" | "disconnect";
  message: string;
  studentId: string;
  studentName: string;
  timestamp: string;
}

function generateActivity(): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  // Alerts as activity
  alerts.forEach((a) => {
    events.push({
      id: `alert-${a.id}`,
      type: "alert",
      message: a.message,
      studentId: a.studentId,
      studentName: a.studentName,
      timestamp: a.timestamp,
    });
  });

  // Some connect/disconnect events
  students.forEach((s) => {
    if (s.status === "online") {
      events.push({
        id: `conn-${s.id}`,
        type: "connect",
        message: `${s.hostname} подключился к мониторингу`,
        studentId: s.id,
        studentName: s.name,
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      });
    } else {
      events.push({
        id: `disc-${s.id}`,
        type: "disconnect",
        message: `${s.hostname} отключился от мониторинга`,
        studentId: s.id,
        studentName: s.name,
        timestamp: s.lastSeen,
      });
    }
  });

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export default function ActivityPage() {
  const events = generateActivity();

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
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4 pb-6">
              {/* Dot */}
              <div
                className={`relative z-10 w-[10px] h-[10px] rounded-full mt-1.5 ring-4 ring-background shrink-0 ml-[15px] ${
                  event.type === "alert"
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
                      href={`/students/${event.studentId}`}
                      className="text-sm font-semibold text-foreground hover:text-accent"
                    >
                      {event.studentName}
                    </Link>
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        event.type === "alert"
                          ? "bg-warning/10 text-warning"
                          : event.type === "connect"
                          ? "bg-success/10 text-success"
                          : "bg-gray-100 text-muted"
                      }`}
                    >
                      {event.type === "alert"
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

      {events.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет событий</p>
        </div>
      )}
    </div>
  );
}
