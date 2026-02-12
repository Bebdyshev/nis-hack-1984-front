// ── Types matching teacher backend API responses ────────────────

/** GET /api/students → { students: StudentSummary[] } */
export interface StudentSummary {
  hostname: string;
  ip: string;
  port: number;
  active: boolean;
  os: string;
  username: string;
  cpu_usage: number;
  ram_usage: number;
  violation_count: number;
  last_seen: string | null;
}

/** GET /api/violations → { violations: Violation[] } */
export interface Violation {
  hostname: string;
  rule: string;      // "banned_process" | "banned_domain"
  detail: string;
  severity: string;  // "low" | "medium" | "high"
  timestamp: string;
}

/** Application in AppList */
export interface Application {
  name: string;
  pid: number;
  memory_mb: number;
}

/** Browser tab */
export interface BrowserTab {
  browser: string;
  title: string;
  url: string;
}

/** Running apps snapshot */
export interface AppList {
  hostname: string;
  applications: Application[];
  browser_tabs: BrowserTab[];
  timestamp: string;
}

/** Screenshot from student */
export interface Screenshot {
  hostname: string;
  image_url: string;
  timestamp: string;
}

/** Notification from student */
export interface Notification {
  hostname: string;
  title: string;
  message: string;
  level: string;
  timestamp: string;
}

/** GET /api/students/:hostname */
export interface StudentDetail {
  summary: StudentSummary;
  screenshot: Screenshot | null;
  apps: AppList | null;
  notifications: Notification[];
  violations: Violation[];
}

// ── WebSocket real-time event types ─────────────────────────────

export interface WsViolationEvent {
  type: "violation";
  hostname: string;
  rule: string;
  detail: string;
  severity: string;
  timestamp: string;
}

export interface WsNotificationEvent {
  type: "notification";
  hostname: string;
  title: string;
  message: string;
  level: string;
  timestamp: string;
}

export type WsEvent = WsViolationEvent | WsNotificationEvent;
