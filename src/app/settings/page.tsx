"use client";

import { Settings, Shield, Bell, Monitor } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted text-sm mt-0.5">
          Конфигурация системы мониторинга
        </p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Основные</h2>
              <p className="text-xs text-muted">Общие настройки системы</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Интервал сканирования</p>
                <p className="text-xs text-muted">Как часто агент сканирует процессы</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={3}
                  className="w-20 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <span className="text-xs text-muted">сек.</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Интервал heartbeat</p>
                <p className="text-xs text-muted">Частота проверки связи с агентом</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={30}
                  className="w-20 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <span className="text-xs text-muted">сек.</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Redis URL</p>
                <p className="text-xs text-muted">Адрес Redis сервера</p>
              </div>
              <input
                type="text"
                defaultValue="redis://192.168.8.151:6379"
                className="w-64 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Monitor className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Скриншоты</h2>
              <p className="text-xs text-muted">Настройки захвата экрана</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Включить захват</p>
                <p className="text-xs text-muted">Делать скриншоты экранов учащихся</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Интервал</p>
                <p className="text-xs text-muted">Частота захвата экрана</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={10}
                  className="w-20 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <span className="text-xs text-muted">сек.</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Качество JPEG</p>
                <p className="text-xs text-muted">1-100, выше = лучше качество</p>
              </div>
              <input
                type="number"
                defaultValue={75}
                min={1}
                max={100}
                className="w-20 px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        </div>

        {/* Banned Processes */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-danger" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Запрещённые процессы</h2>
              <p className="text-xs text-muted">Процессы, запрещённые к запуску</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "RobloxPlayerBeta", "RobloxPlayerLauncher", "RobloxStudioBeta",
              "FortniteClient", "EpicGamesLauncher", "MinecraftLauncher",
              "GTA5", "FiveM", "steam", "steamwebhelper",
              "Discord", "DiscordPTB", "DiscordCanary",
              "Telegram",
            ].map((name) => (
              <span
                key={name}
                className="px-3 py-1.5 text-xs font-medium bg-danger/5 text-danger border border-danger/15 rounded-lg"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Banned Domains */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-warning" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Запрещённые домены</h2>
              <p className="text-xs text-muted">Домены, заблокированные в DNS кэше</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "roblox.com", "fortnite.com", "epicgames.com",
              "store.steampowered.com", "discord.com",
              "web.telegram.org", "tiktok.com", "instagram.com",
            ].map((domain) => (
              <span
                key={domain}
                className="px-3 py-1.5 text-xs font-medium bg-warning/5 text-warning border border-warning/15 rounded-lg font-mono"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors">
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
