/**
 * Placeholder blueprint detail page. The real editor (toolbar + 12-tab
 * navigation + tab UI) lands in Phase 2. For Phase 1 we just need a target
 * for `router.push('/blueprints/[id]')` after create-new so the round trip
 * works end-to-end.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlueprint } from "@/lib/github-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function BlueprintDetailPage({ params }: PageProps) {
  let blueprint;
  try {
    blueprint = await getBlueprint(params.id);
  } catch (err) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-uew-navy mb-6"
        >
          <ArrowLeft size={14} className="mr-1" />
          All blueprints
        </Link>
        <PageHeader title="Couldn't load blueprint" />
        <Card className="p-6 text-sm text-red-700 bg-red-50 border-red-200">
          {err instanceof Error ? err.message : "Unexpected error"}
        </Card>
      </main>
    );
  }
  if (!blueprint) return notFound();
  const pb = blueprint.tabs.projectBasics.futureState;
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-600 hover:text-uew-navy mb-6"
      >
        <ArrowLeft size={14} className="mr-1" />
        All blueprints
      </Link>
      <PageHeader
        eyebrow={`Blueprint · ${blueprint.systemName}`}
        title={blueprint.title}
        subtitle={blueprint.description || undefined}
      />
      <div className="flex items-center gap-3 mb-8">
        <StatusBadge status={blueprint.status} />
        <span className="text-xs text-slate-500 font-mono">id: {blueprint.id}</span>
      </div>
      <Card className="p-6 bg-white">
        <div className="text-xs font-mono font-bold tracking-widest uppercase text-uew-orange mb-2">
          Project Basics · Future State
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field label="Title" value={pb.title} />
          <Field label="Owner" value={pb.owner} />
          <Field label="Problem" value={pb.problem} full />
          <Field label="Audience" value={pb.audience} />
          <Field label="Scope" value={pb.scope} />
          <Field label="Business Value" value={pb.businessValue} full />
        </dl>
        <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-500">
          The full editor (toolbar, 12-tab navigation, Current/Future toggle, side-by-side, export
          dropdown) lands in <strong className="text-uew-navy">Phase 2</strong>. This placeholder
          confirms the blueprint round trip — create → save to GitHub → reload → render — works
          end-to-end.
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back to list</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </dt>
      <dd className="text-slate-800">
        {value ? value : <span className="text-slate-400 italic">not set</span>}
      </dd>
    </div>
  );
}
