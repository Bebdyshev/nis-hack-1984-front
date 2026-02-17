"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Shield,
  ShieldCheck,
  Globe,
  Plus,
  X,
  Loader2,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { TEACHER_API } from "@/lib/api-config";

interface TeacherConfig {
  banned_sites: string[];
  banned_apps: string[];
  port: number;
  redis_url: string;
  key_prefix: string;
  scan_interval_secs: number;
  heartbeat_ttl_secs: number;
  sau_mode: boolean;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<TeacherConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  // Banned lists local state
  const [bannedSites, setBannedSites] = useState<string[]>([]);
  const [bannedApps, setBannedApps] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [newApp, setNewApp] = useState("");

  // SAU mode
  const [sauMode, setSauMode] = useState(false);
  const [sauToggling, setSauToggling] = useState(false);

  // Broadcast URL
  const [broadcastUrl, setBroadcastUrl] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Fetch config on mount
  useEffect(() => {
    fetch(`${TEACHER_API}/config`)
      .then((r) => r.json())
      .then((data: TeacherConfig) => {
        setConfig(data);
        setBannedSites(data.banned_sites ?? []);
        setBannedApps(data.banned_apps ?? []);
        setSauMode(data.sau_mode ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Save banned lists
  const handleSave = useCallback(async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch(`${TEACHER_API}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned_sites: bannedSites, banned_apps: bannedApps, sau_mode: sauMode }),
      });
      if (res.ok) {
        setToast({ ok: true, msg: "Настройки сохранены" });
      } else {
        setToast({ ok: false, msg: "Ошибка сохранения" });
      }
    } catch {
      setToast({ ok: false, msg: "Нет связи с сервером" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  }, [bannedSites, bannedApps, sauMode]);

  // Toggle SAU mode immediately
  const toggleSauMode = useCallback(async () => {
    const next = !sauMode;
    setSauToggling(true);
    try {
      const res = await fetch(`${TEACHER_API}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sau_mode: next }),
      });
      if (res.ok) {
        setSauMode(next);
        setToast({ ok: true, msg: next ? "SAU включён" : "SAU выключен" });
      } else {
        setToast({ ok: false, msg: "Ошибка переключения SAU" });
      }
    } catch {
      setToast({ ok: false, msg: "Нет связи с сервером" });
    } finally {
      setSauToggling(false);
      setTimeout(() => setToast(null), 4000);
    }
  }, [sauMode]);

  // Broadcast open-url
  const handleBroadcast = useCallback(async () => {
    const url = broadcastUrl.trim();
    if (!url) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await fetch(`${TEACHER_API}/broadcast/open-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
      });
      const json = await res.json();
      setBroadcastResult({
        ok: json.status === "ok",
        msg: `Открыто на ${json.success ?? 0} из ${json.total ?? 0} компьютеров`,
      });
      if (json.status === "ok") setBroadcastUrl("");
    } catch {
      setBroadcastResult({ ok: false, msg: "Нет связи с сервером" });
    } finally {
      setBroadcasting(false);
      setTimeout(() => setBroadcastResult(null), 5000);
    }
  }, [broadcastUrl]);

  // Add/remove helpers
  const addSite = () => {
    const v = newSite.trim().toLowerCase();
    if (v && !bannedSites.includes(v)) setBannedSites((prev) => [...prev, v]);
    setNewSite("");
  };
  const removeSite = (s: string) => setBannedSites((prev) => prev.filter((x) => x !== s));

  const addApp = () => {
    const v = newApp.trim();
    if (v && !bannedApps.includes(v)) setBannedApps((prev) => [...prev, v]);
    setNewApp("");
  };
  const removeApp = (s: string) => setBannedApps((prev) => prev.filter((x) => x !== s));

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted text-sm mt-0.5">
          Конфигурация системы мониторинга
        </p>
      </div>

      <div className="space-y-6">
        {/* ── SAU Mode Toggle ───────────────────────────────── */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                sauMode ? "bg-emerald-500/10" : "bg-gray-100"
              }`}>
                <ShieldCheck className={`w-4.5 h-4.5 ${sauMode ? "text-emerald-500" : "text-muted"}`} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Режим SAU (АнтиЧит)</h2>
                <p className="text-xs text-muted">Запускает anticheat.py на всех клиентах</p>
              </div>
            </div>
            <button
              onClick={toggleSauMode}
              disabled={sauToggling}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                sauMode ? "bg-emerald-500" : "bg-gray-300"
              } ${sauToggling ? "opacity-50" : ""}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                  sauMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {sauMode && (
            <div className="mt-3 px-4 py-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              SAU активен — anticheat.py запущен на клиентах
            </div>
          )}
        </div>

        {/* ── Broadcast Open URL ─────────────────────────────── */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Send className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Открыть ссылку на всех ПК</h2>
              <p className="text-xs text-muted">Kahoot, презентация и т.д. — откроется у всех учащихся</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={broadcastUrl}
              onChange={(e) => setBroadcastUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
              placeholder="https://kahoot.it/challenge/..."
              className="flex-1 px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={handleBroadcast}
              disabled={broadcasting || !broadcastUrl.trim()}
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {broadcasting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Открыть
            </button>
          </div>
          {broadcastResult && (
            <div
              className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                broadcastResult.ok
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              }`}
            >
              {broadcastResult.ok ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {broadcastResult.msg}
            </div>
          )}
        </div>

        {/* ── General info ───────────────────────────────────── */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Основные</h2>
              <p className="text-xs text-muted">Информация из config.toml (только чтение)</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Порт</span>
              <span className="font-mono text-foreground">{config?.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Интервал сканирования</span>
              <span className="font-mono text-foreground">{config?.scan_interval_secs}с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">TTL heartbeat</span>
              <span className="font-mono text-foreground">{config?.heartbeat_ttl_secs}с</span>
            </div>
          </div>
        </div>

        {/* ── Banned Apps ────────────────────────────────────── */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-danger" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Запрещённые процессы ({bannedApps.length})
              </h2>
              <p className="text-xs text-muted">Процессы, запрещённые к запуску</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newApp}
              onChange={(e) => setNewApp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addApp()}
              placeholder="Discord, Steam..."
              className="flex-1 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={addApp}
              disabled={!newApp.trim()}
              className="px-3 py-2 bg-danger/10 text-danger text-sm font-medium rounded-lg hover:bg-danger/20 transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bannedApps.map((name) => (
              <span
                key={name}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-danger/5 text-danger border border-danger/15 rounded-lg"
              >
                {name}
                <button
                  onClick={() => removeApp(name)}
                  className="opacity-40 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {bannedApps.length === 0 && (
              <p className="text-xs text-muted">Нет запрещённых процессов</p>
            )}
          </div>
        </div>

        {/* ── Banned Sites ───────────────────────────────────── */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-warning" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Запрещённые домены ({bannedSites.length})
              </h2>
              <p className="text-xs text-muted">Домены, заблокированные в DNS кэше</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSite()}
              placeholder="tiktok.com, instagram.com..."
              className="flex-1 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={addSite}
              disabled={!newSite.trim()}
              className="px-3 py-2 bg-warning/10 text-warning text-sm font-medium rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bannedSites.map((domain) => (
              <span
                key={domain}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-warning/5 text-warning border border-warning/15 rounded-lg font-mono"
              >
                {domain}
                <button
                  onClick={() => removeSite(domain)}
                  className="opacity-40 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {bannedSites.length === 0 && (
              <p className="text-xs text-muted">Нет запрещённых доменов</p>
            )}
          </div>
        </div>

        {/* ── Toast + Save ───────────────────────────────────── */}
        {toast && (
          <div
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              toast.ok
                ? "bg-success/10 text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20"
            }`}
          >
            {toast.ok ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.msg}
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
