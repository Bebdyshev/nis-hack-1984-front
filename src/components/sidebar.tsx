"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  AlertTriangle,
  Activity,
  Cpu,
  Settings,
  Shield,
  ScreenShare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Главная", icon: LayoutDashboard },
  { href: "/students", label: "Компьютеры", icon: Monitor },
  { href: "/alerts", label: "Нарушения", icon: AlertTriangle },
  { href: "/activity", label: "Активность", icon: Activity },
  { href: "/processes", label: "Процессы", icon: Cpu },
  { href: "/screens", label: "Экраны", icon: ScreenShare },
];

const settingsItems = [
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <Shield className="w-7 h-7 text-accent" />
        <span className="text-foreground font-semibold text-lg tracking-tight">NisHack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings section */}
      <div className="px-3 pb-2">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted/60">
          Настройки
        </p>
        {settingsItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">А</span>
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium truncate">Администратор</p>
            <p className="text-muted text-xs truncate">admin@nis.edu.kz</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
