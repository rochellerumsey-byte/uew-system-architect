/**
 * /api/blueprints/[id]
 *   GET    → read one blueprint
 *   PUT    → patch one blueprint (deep-merges with the existing record)
 *   DELETE → remove one blueprint
 */

import { NextResponse } from "next/server";
import {
  getBlueprint,
  saveBlueprint,
  deleteBlueprint,
  StorageError,
  NotFoundError,
  ValidationError
} from "@/lib/github-storage";
import { BlueprintUpdateInputSchema } from "@/lib/schemas";
import type { Blueprint, BlueprintTabs } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(err: unknown): NextResponse {
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message, issues: err.issues }, { status: err.status });
  }
  if (err instanceof StorageError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

interface RouteCtx {
  params: { id: string };
}

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const bp = await getBlueprint(ctx.params.id);
    if (!bp) return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    return NextResponse.json({ blueprint: bp });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * Deep-merge a patch into an existing Blueprint. Specifically handles the
 * tabs object: keys not present in the patch keep their existing value,
 * keys present in the patch fully replace the matching tab's content.
 *
 * Top-level fields (title, systemName, description, status, etc.) are
 * shallow-replaced.
 */
function applyUpdate(existing: Blueprint, patch: Partial<Blueprint>): Blueprint {
  const merged: Blueprint = {
    ...existing,
    ...patch,
    // id is preserved by the schema (.omit({id})), but be defensive.
    id: existing.id,
    // createdAt is also preserved (.omit({createdAt})).
    createdAt: existing.createdAt,
    // Always bump updatedAt on any patch.
    updatedAt: new Date().toISOString(),
    // tabs needs a shallow merge so partial tab patches don't wipe siblings.
    tabs: patch.tabs ? ({ ...existing.tabs, ...patch.tabs } as BlueprintTabs) : existing.tabs
  };
  return merged;
}

export async function PUT(req: Request, ctx: RouteCtx) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = BlueprintUpdateInputSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message);
    return NextResponse.json({ error: "Validation failed", issues }, { status: 400 });
  }
  try {
    const existing = await getBlueprint(ctx.params.id);
    if (!existing) return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    const next = applyUpdate(existing, parsed.data as Partial<Blueprint>);
    const saved = await saveBlueprint(next);
    return NextResponse.json({ blueprint: saved });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  try {
    await deleteBlueprint(ctx.params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
