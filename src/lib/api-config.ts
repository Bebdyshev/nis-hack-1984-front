// ── Teacher backend connection config ────────────────────────────
// The teacher Rust server runs on the same LAN.
// For dev: set NEXT_PUBLIC_TEACHER_WS_URL env var, or edit defaults below.

/** Base WebSocket URL of the teacher backend */
export const TEACHER_WS_URL =
  process.env.NEXT_PUBLIC_TEACHER_WS_URL || "ws://10.10.64.215:8080";

/** WebSocket endpoint for live screen viewing (teacher dashboard) */
export const SCREEN_VIEW_WS = `${TEACHER_WS_URL}/ws/screen/view`;

/** REST API base (proxied through Next.js rewrites) */
export const TEACHER_API = "/api/teacher";
