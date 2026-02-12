"use client";

import { students, processesMap } from "@/lib/mock-data";
import { Cpu, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ProcessesPage() {
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [showBannedOnly, setShowBannedOnly] = useState(false);

  // Collect all processes with student info
  const allProcesses = Object.entries(processesMap).flatMap(([studentId, procs]) => {
    const student = students.find((s) => s.id === studentId);
    return procs.map((p) => ({
      ...p,
      studentId,
      studentName: student?.name || studentId,
    }));
  });

  const filtered = allProcesses
    .filter((p) => selectedStudent === "all" || p.studentId === selectedStudent)
    .filter((p) => !showBannedOnly || p.isBanned)
    .sort((a, b) => b.cpuPercent - a.cpuPercent);

  const bannedCount = allProcesses.filter((p) => p.isBanned).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Процессы</h1>
          <p className="text-muted text-sm mt-0.5">
            Мониторинг запущенных процессов
          </p>
        </div>
        {bannedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger/5 border border-danger/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-sm font-medium text-danger">
              {bannedCount} запрещённых
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-3 py-2.5 text-sm border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">Все компьютеры</option>
          {students
            .filter((s) => s.status === "online")
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.hostname})
              </option>
            ))}
        </select>
        <button
          onClick={() => setShowBannedOnly(!showBannedOnly)}
          className={`px-4 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
            showBannedOnly
              ? "bg-danger text-white border-danger"
              : "bg-card-bg text-muted border-card-border hover:text-foreground"
          }`}
        >
          Только запрещённые
        </button>
      </div>

      {/* Process Table */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase border-b border-card-border bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium">PID</th>
              <th className="text-left px-5 py-3 font-medium">Имя</th>
              <th className="text-left px-5 py-3 font-medium">Ученик</th>
              <th className="text-right px-5 py-3 font-medium">CPU %</th>
              <th className="text-right px-5 py-3 font-medium">MEM %</th>
              <th className="text-right px-5 py-3 font-medium">RSS</th>
              <th className="text-right px-5 py-3 font-medium">THR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filtered.map((p) => (
              <tr
                key={`${p.studentId}-${p.pid}`}
                className={p.isBanned ? "bg-danger/5" : "hover:bg-gray-50/50"}
              >
                <td className="px-5 py-3 text-muted font-mono text-xs">{p.pid}</td>
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
                <td className="px-5 py-3">
                  <Link
                    href={`/students/${p.studentId}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {p.studentName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-right text-success font-medium">
                  {p.cpuPercent}%
                </td>
                <td className="px-5 py-3 text-right text-success font-medium">
                  {p.memPercent}%
                </td>
                <td className="px-5 py-3 text-right text-muted">{p.rss} MB</td>
                <td className="px-5 py-3 text-right text-muted">{p.threads}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-muted">
            <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Процессы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
