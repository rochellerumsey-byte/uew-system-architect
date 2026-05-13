/**
 * Page header with brand eyebrow + title + optional subtitle.
 * Server component — no interactivity here.
 */
export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <div className="text-xs font-mono font-bold tracking-widest uppercase text-uew-orange mb-2">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="text-3xl md:text-4xl font-bold text-uew-navy leading-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-base text-slate-600 max-w-2xl">{subtitle}</p>
      ) : null}
    </header>
  );
}
