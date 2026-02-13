"use client";

import { useStudents } from "@/lib/api";
import { TEACHER_API } from "@/lib/api-config";
import type { StudentDetail, Application } from "@/lib/types";
import { Cpu, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ProcessEntry extends Application {
  hostname: string;
}

export default function ProcessesPage() {
  const { data: studentsData, loading: sLoading } = useStudents(5000);
  const [processes, setProcesses] = useState<ProcessEntry[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const students = studentsData?.students ?? [];
  const activeStudents = students.filter((s) => s.active);

  const fetchAllApps = useCallback(async () => {
    const entries: ProcessEntry[] = [];
    await Promise.all(
      activeStudents.map(async (s) => {
        try {
          const res = await fetch(`${TEACHER_API}/apps/${s.hostname}`);
          if (!res.ok) return;
          const data = await res.json();
          const apps: Application[] = data.applications ?? [];
          apps.forEach((a) => entries.push({ ...a, hostname: s.hostname }));
        } catch {
          // ignore
        }
      })
    );
    setProcesses(entries);
  }, [activeStudents.map((s) => s.hostname).join(",")]);

  useEffect(() => {
    if (activeStudents.length === 0) return;
    fetchAllApps();
    const id = setInterval(fetchAllApps, 8000);
    return () => clearInterval(id);
  }, [fetchAllApps]);

  const filtered = processes
    .filter((p) => selectedStudent === "all" || p.hostname === selectedStudent)
    .sort((a, b) => b.memory_mb - a.memory_mb);

  if (sLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Процессы</h1>
          <p className="text-muted text-sm mt-0.5">
            {processes.length} процессов на {activeStudents.length} компьютерах
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-3 py-2.5 text-sm border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">Все компьютеры</option>
          {activeStudents.map((s) => (
            <option key={s.hostname} value={s.hostname}>
              {s.hostname} ({s.username || s.ip})
            </option>
          ))}
        </select>
      </div>

      {/* Process Table */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase border-b border-card-border bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium">PID</th>
              <th className="text-left px-5 py-3 font-medium">Имя</th>
              <th className="text-left px-5 py-3 font-medium">Компьютер</th>
              <th className="text-right px-5 py-3 font-medium">Память (MB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filtered.slice(0, 100).map((p, i) => (
              <tr
                key={`${p.hostname}-${p.pid}-${i}`}
                className="hover:bg-gray-50/50"
              >
                <td className="px-5 py-3 text-muted font-mono text-xs">{p.pid}</td>
                <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/students/${p.hostname}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {p.hostname}
                  </Link>
                </td>
                <td className="px-5 py-3 text-right text-muted">
                  {p.memory_mb.toFixed(1)}
                </td>
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
