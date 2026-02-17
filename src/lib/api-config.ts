// ── Teacher backend connection config ────────────────────────────
// The teacher Rust server runs on localhost.
// All requests are proxied through the Next.js server, so no
// external IPs are needed.

/** Base WebSocket URL — derived from current page origin (proxied via Next.js) */
function getWsUrl(): string {
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
  }
  return "ws://localhost:3000";
}

export const TEACHER_WS_URL = getWsUrl();

/** WebSocket endpoint for live screen viewing (teacher dashboard) */
export const SCREEN_VIEW_WS = `${TEACHER_WS_URL}/ws/screen/view`;

/** REST API base (proxied through Next.js rewrites) */
export const TEACHER_API = "/api/teacher";
