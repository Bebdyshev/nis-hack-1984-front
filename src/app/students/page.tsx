"use client";

import Link from "next/link";
import { Monitor, Circle, Cpu, MemoryStick, Search } from "lucide-react";
import { students, getCurrentMetrics } from "@/lib/mock-data";
import { formatPercent } from "@/lib/utils";
import { useState } from "react";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.hostname.toLowerCase().includes(search.toLowerCase()) ||
      s.classroom.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const onlineCount = students.filter((s) => s.status === "online").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Компьютеры</h1>
          <p className="text-muted text-sm mt-0.5">
            {onlineCount} из {students.length} в сети
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Поиск по имени, хосту, кабинету..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="flex bg-card-bg border border-card-border rounded-lg overflow-hidden">
          {(["all", "online", "offline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? "Все" : f === "online" ? "В сети" : "Не в сети"}
            </button>
          ))}
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const metrics = getCurrentMetrics(student.id);
          return (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/5 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted">
                      {student.hostname}
                    </p>
                  </div>
                </div>
                <Circle
                  className={`w-2.5 h-2.5 mt-1 ${
                    student.status === "online"
                      ? "fill-success text-success"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              </div>

              <p className="text-xs text-muted mb-3">
                {student.os} · {student.cores} ядер · {student.ramTotal} ГБ ОЗУ · {student.classroom}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-muted mb-1">
                    <Cpu className="w-3 h-3" />
                    <span className="text-[11px] font-medium uppercase">CPU</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatPercent(metrics.cpu)}
                    <span className="text-xs font-normal text-muted ml-0.5">%</span>
                  </span>
                </div>
                <div className="bg-background rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-muted mb-1">
                    <MemoryStick className="w-3 h-3" />
                    <span className="text-[11px] font-medium uppercase">MEM</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatPercent(metrics.memory)}
                    <span className="text-xs font-normal text-muted ml-0.5">%</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Компьютеры не найдены</p>
        </div>
      )}
    </div>
  );
}
