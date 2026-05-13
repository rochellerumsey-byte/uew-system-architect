/**
 * Centered empty-state card. Icon (optional), title, subtitle, and an
 * action slot for a primary CTA button. Used on the home page when no
 * blueprints exist yet.
 */
import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface EmptyStateProps {
  /** Pass a lucide icon component or any ReactNode. Defaults to BookOpen. */
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Additional explanation rendered below the action. */
  footer?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action, footer }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-slate-200 bg-white/70 shadow-none">
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="text-uew-navy/70 mb-5">
          {icon ?? <BookOpen size={48} strokeWidth={1.5} />}
        </div>
        <h2 className="text-xl font-bold text-uew-navy mb-2">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">{subtitle}</p>
        ) : null}
        {action}
        {footer ? (
          <div className="mt-8 max-w-lg text-xs text-slate-500 leading-relaxed">{footer}</div>
        ) : null}
      </div>
    </Card>
  );
}
