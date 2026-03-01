import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const config = STATUS_LABELS[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.color, className)}>
      {config.label}
    </span>
  );
}

interface IntensityBadgeProps {
  intensity: string;
  className?: string;
}

export function IntensityBadge({ intensity, className }: IntensityBadgeProps) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    low: "Licht",
    medium: "Gemiddeld",
    high: "Zwaar",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors[intensity] ?? "bg-gray-100 text-gray-800", className)}>
      {labels[intensity] ?? intensity}
    </span>
  );
}
