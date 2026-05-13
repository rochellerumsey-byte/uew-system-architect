import type { BlueprintStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Status pill. Color hint:
 *   draft     → amber  (in-progress, not yet reviewed)
 *   in-review → navy   (under review)
 *   approved  → emerald (signed off)
 *   archived  → slate  (out of active rotation)
 */
const STATUS_META: Record<
  BlueprintStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-uew-amber/15 text-amber-900 border-amber-300/60 hover:bg-uew-amber/20"
  },
  "in-review": {
    label: "In Review",
    className: "bg-uew-navy/10 text-uew-navy border-uew-navy/30 hover:bg-uew-navy/15"
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
  },
  archived: {
    label: "Archived",
    className: "bg-uew-slate/15 text-slate-700 border-uew-slate/30 hover:bg-uew-slate/20"
  }
};

export interface StatusBadgeProps {
  status: BlueprintStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn("font-mono text-xs uppercase tracking-wide", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
