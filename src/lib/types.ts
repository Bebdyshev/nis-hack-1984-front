// Types for the student monitoring system

export interface StudentPC {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  os: string;
  arch: string;
  cores: number;
  ramTotal: number; // GB
  status: "online" | "offline";
  lastSeen: string;
  classroom: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  load: number;
  timestamp: string;
}

export interface MetricsHistory {
  studentId: string;
  metrics: SystemMetrics[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent: number;
  memPercent: number;
  rss: number; // MB
  threads: number;
  isBanned?: boolean;
}

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  type: "MEMORY" | "CPU" | "PROCESS" | "DOMAIN";
  severity: "WARNING" | "CRITICAL";
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

export interface HealthCheck {
  id: string;
  name: string;
  url: string;
  status: "passing" | "failing" | "pending";
  responseTime?: number;
  lastChecked: string;
}

export interface Screenshot {
  studentId: string;
  data: string; // base64
  timestamp: string;
}
