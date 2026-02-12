import { StudentPC, SystemMetrics, ProcessInfo, Alert, MetricsHistory } from "./types";

// ── Student PCs ─────────────────────────────────────────────────
export const students: StudentPC[] = [
  {
    id: "pc-01",
    name: "Ахметов Алихан",
    hostname: "PC-LAB1-01",
    ip: "192.168.1.101",
    os: "Windows 11",
    arch: "x86_64",
    cores: 4,
    ramTotal: 8,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 301",
  },
  {
    id: "pc-02",
    name: "Бекова Айгерим",
    hostname: "PC-LAB1-02",
    ip: "192.168.1.102",
    os: "Windows 11",
    arch: "x86_64",
    cores: 4,
    ramTotal: 8,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 301",
  },
  {
    id: "pc-03",
    name: "Касымов Данияр",
    hostname: "PC-LAB1-03",
    ip: "192.168.1.103",
    os: "Windows 10",
    arch: "x86_64",
    cores: 2,
    ramTotal: 4,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 301",
  },
  {
    id: "pc-04",
    name: "Нурланова Дана",
    hostname: "PC-LAB2-01",
    ip: "192.168.1.104",
    os: "Windows 11",
    arch: "x86_64",
    cores: 8,
    ramTotal: 16,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 302",
  },
  {
    id: "pc-05",
    name: "Серикбаев Арман",
    hostname: "PC-LAB2-02",
    ip: "192.168.1.105",
    os: "Windows 10",
    arch: "x86_64",
    cores: 4,
    ramTotal: 8,
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    classroom: "Кабинет 302",
  },
  {
    id: "pc-06",
    name: "Жумабекова Мадина",
    hostname: "PC-LAB2-03",
    ip: "192.168.1.106",
    os: "Windows 11",
    arch: "x86_64",
    cores: 4,
    ramTotal: 8,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 302",
  },
  {
    id: "pc-07",
    name: "Омаров Тимур",
    hostname: "PC-LAB3-01",
    ip: "192.168.1.107",
    os: "Windows 11",
    arch: "x86_64",
    cores: 4,
    ramTotal: 8,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 303",
  },
  {
    id: "pc-08",
    name: "Тулеубаева Камила",
    hostname: "PC-LAB3-02",
    ip: "192.168.1.108",
    os: "Windows 10",
    arch: "x86_64",
    cores: 4,
    ramTotal: 4,
    status: "online",
    lastSeen: new Date().toISOString(),
    classroom: "Кабинет 303",
  },
];

// ── Generate realistic metrics history ──────────────────────────
function generateMetrics(count: number): SystemMetrics[] {
  const now = Date.now();
  const metrics: SystemMetrics[] = [];
  for (let i = count; i >= 0; i--) {
    const t = now - i * 60000; // 1 minute intervals
    metrics.push({
      cpu: 25 + Math.random() * 35,
      memory: 55 + Math.random() * 30,
      disk: 45 + Math.random() * 15,
      load: 1.0 + Math.random() * 2.5,
      timestamp: new Date(t).toISOString(),
    });
  }
  return metrics;
}

export const metricsHistory: MetricsHistory[] = students.map((s) => ({
  studentId: s.id,
  metrics: generateMetrics(60),
}));

// ── Current metrics for each student ────────────────────────────
export function getCurrentMetrics(studentId: string): SystemMetrics {
  const hist = metricsHistory.find((m) => m.studentId === studentId);
  if (hist && hist.metrics.length > 0) {
    return hist.metrics[hist.metrics.length - 1];
  }
  return { cpu: 0, memory: 0, disk: 0, load: 0, timestamp: new Date().toISOString() };
}

// ── Processes ───────────────────────────────────────────────────
export const processesMap: Record<string, ProcessInfo[]> = {
  "pc-01": [
    { pid: 1234, name: "chrome.exe", cpuPercent: 12.3, memPercent: 8.5, rss: 680, threads: 24 },
    { pid: 2345, name: "code.exe", cpuPercent: 5.1, memPercent: 4.2, rss: 336, threads: 18 },
    { pid: 3456, name: "python.exe", cpuPercent: 2.8, memPercent: 3.1, rss: 248, threads: 4 },
    { pid: 4567, name: "explorer.exe", cpuPercent: 0.5, memPercent: 1.8, rss: 144, threads: 32 },
    { pid: 5678, name: "Discord.exe", cpuPercent: 3.2, memPercent: 5.4, rss: 432, threads: 28, isBanned: true },
    { pid: 6789, name: "svchost.exe", cpuPercent: 0.3, memPercent: 0.9, rss: 72, threads: 8 },
    { pid: 7890, name: "SearchHost.exe", cpuPercent: 0.1, memPercent: 1.2, rss: 96, threads: 12 },
    { pid: 8901, name: "WindowsTerminal.exe", cpuPercent: 0.4, memPercent: 1.5, rss: 120, threads: 6 },
  ],
  "pc-02": [
    { pid: 1100, name: "chrome.exe", cpuPercent: 8.7, memPercent: 6.3, rss: 504, threads: 20 },
    { pid: 2200, name: "word.exe", cpuPercent: 1.2, memPercent: 3.8, rss: 304, threads: 8 },
    { pid: 3300, name: "explorer.exe", cpuPercent: 0.3, memPercent: 1.4, rss: 112, threads: 28 },
    { pid: 4400, name: "svchost.exe", cpuPercent: 0.2, memPercent: 0.7, rss: 56, threads: 6 },
    { pid: 5500, name: "OneDrive.exe", cpuPercent: 0.8, memPercent: 2.1, rss: 168, threads: 10 },
  ],
  "pc-03": [
    { pid: 1001, name: "chrome.exe", cpuPercent: 15.2, memPercent: 12.1, rss: 484, threads: 18 },
    { pid: 2002, name: "RobloxPlayerBeta.exe", cpuPercent: 35.6, memPercent: 18.7, rss: 748, threads: 12, isBanned: true },
    { pid: 3003, name: "explorer.exe", cpuPercent: 0.4, memPercent: 1.6, rss: 128, threads: 30 },
    { pid: 4004, name: "svchost.exe", cpuPercent: 0.5, memPercent: 1.0, rss: 80, threads: 8 },
  ],
  "pc-04": [
    { pid: 1111, name: "code.exe", cpuPercent: 7.3, memPercent: 5.6, rss: 896, threads: 22 },
    { pid: 2222, name: "node.exe", cpuPercent: 4.5, memPercent: 3.2, rss: 512, threads: 11 },
    { pid: 3333, name: "chrome.exe", cpuPercent: 6.1, memPercent: 4.8, rss: 768, threads: 16 },
    { pid: 4444, name: "explorer.exe", cpuPercent: 0.2, memPercent: 0.9, rss: 144, threads: 28 },
    { pid: 5555, name: "python3.11.exe", cpuPercent: 2.1, memPercent: 2.4, rss: 384, threads: 4 },
    { pid: 6666, name: "WindowsTerminal.exe", cpuPercent: 0.6, memPercent: 1.1, rss: 88, threads: 4 },
  ],
  "pc-06": [
    { pid: 1010, name: "chrome.exe", cpuPercent: 9.4, memPercent: 7.2, rss: 576, threads: 22 },
    { pid: 2020, name: "Telegram.exe", cpuPercent: 2.1, memPercent: 3.5, rss: 280, threads: 14, isBanned: true },
    { pid: 3030, name: "excel.exe", cpuPercent: 1.8, memPercent: 4.1, rss: 328, threads: 6 },
    { pid: 4040, name: "explorer.exe", cpuPercent: 0.3, memPercent: 1.3, rss: 104, threads: 26 },
  ],
  "pc-07": [
    { pid: 1500, name: "chrome.exe", cpuPercent: 11.0, memPercent: 9.1, rss: 728, threads: 26 },
    { pid: 2500, name: "code.exe", cpuPercent: 6.8, memPercent: 4.5, rss: 360, threads: 16 },
    { pid: 3500, name: "python.exe", cpuPercent: 3.2, memPercent: 2.8, rss: 224, threads: 4 },
    { pid: 4500, name: "explorer.exe", cpuPercent: 0.4, memPercent: 1.5, rss: 120, threads: 30 },
  ],
  "pc-08": [
    { pid: 1600, name: "chrome.exe", cpuPercent: 14.5, memPercent: 11.3, rss: 452, threads: 20 },
    { pid: 2600, name: "steam.exe", cpuPercent: 8.2, memPercent: 6.7, rss: 268, threads: 10, isBanned: true },
    { pid: 3600, name: "steamwebhelper.exe", cpuPercent: 3.4, memPercent: 4.2, rss: 168, threads: 8, isBanned: true },
    { pid: 4600, name: "explorer.exe", cpuPercent: 0.3, memPercent: 1.2, rss: 96, threads: 24 },
  ],
};

// ── Alerts ───────────────────────────────────────────────────────
export const alerts: Alert[] = [
  {
    id: "a1",
    studentId: "pc-03",
    studentName: "Касымов Данияр",
    type: "PROCESS",
    severity: "CRITICAL",
    message: "Запущен запрещённый процесс: RobloxPlayerBeta.exe",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "a2",
    studentId: "pc-01",
    studentName: "Ахметов Алихан",
    type: "PROCESS",
    severity: "WARNING",
    message: "Запущен запрещённый процесс: Discord.exe",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "a3",
    studentId: "pc-06",
    studentName: "Жумабекова Мадина",
    type: "PROCESS",
    severity: "WARNING",
    message: "Запущен запрещённый процесс: Telegram.exe",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "a4",
    studentId: "pc-08",
    studentName: "Тулеубаева Камила",
    type: "PROCESS",
    severity: "WARNING",
    message: "Запущен запрещённый процесс: steam.exe",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "a5",
    studentId: "pc-04",
    studentName: "Нурланова Дана",
    type: "MEMORY",
    severity: "WARNING",
    message: "Использование памяти: 82.4% (порог: 80%)",
    value: 82.4,
    threshold: 80,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "a6",
    studentId: "pc-04",
    studentName: "Нурланова Дана",
    type: "MEMORY",
    severity: "WARNING",
    message: "Использование памяти: 81.1% (порог: 80%)",
    value: 81.1,
    threshold: 80,
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "a7",
    studentId: "pc-01",
    studentName: "Ахметов Алихан",
    type: "DOMAIN",
    severity: "WARNING",
    message: "Обнаружен заход на запрещённый домен: discord.com",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "a8",
    studentId: "pc-03",
    studentName: "Касымов Данияр",
    type: "DOMAIN",
    severity: "WARNING",
    message: "Обнаружен заход на запрещённый домен: roblox.com",
    timestamp: new Date(Date.now() - 3900000).toISOString(),
  },
  {
    id: "a9",
    studentId: "pc-08",
    studentName: "Тулеубаева Камила",
    type: "DOMAIN",
    severity: "WARNING",
    message: "Обнаружен заход на запрещённый домен: store.steampowered.com",
    timestamp: new Date(Date.now() - 4200000).toISOString(),
  },
  {
    id: "a10",
    studentId: "pc-06",
    studentName: "Жумабекова Мадина",
    type: "MEMORY",
    severity: "WARNING",
    message: "Использование памяти: 80.7% (порог: 80%)",
    value: 80.7,
    threshold: 80,
    timestamp: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "a11",
    studentId: "pc-03",
    studentName: "Касымов Данияр",
    type: "CPU",
    severity: "WARNING",
    message: "Использование CPU: 91.2% (порог: 90%)",
    value: 91.2,
    threshold: 90,
    timestamp: new Date(Date.now() - 6000000).toISOString(),
  },
  {
    id: "a12",
    studentId: "pc-06",
    studentName: "Жумабекова Мадина",
    type: "DOMAIN",
    severity: "WARNING",
    message: "Обнаружен заход на запрещённый домен: web.telegram.org",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];
