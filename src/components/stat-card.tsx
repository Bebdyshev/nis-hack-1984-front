import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = "text-success",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-5">
      <div className="flex items-center gap-2 text-muted mb-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && (
        <p className={cn("text-sm mt-1", subColor)}>{sub}</p>
      )}
    </div>
  );
}
