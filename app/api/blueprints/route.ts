/**
 * /api/blueprints
 *   GET  → list all blueprints (metadata subset)
 *   POST → create a new blueprint (validates input, returns the saved record)
 *
 * Both handlers run on the Node runtime so they can use @octokit/rest and
 * `server-only`. GITHUB_TOKEN never reaches the browser bundle.
 */

import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { listBlueprints, saveBlueprint, StorageError, ValidationError } from "@/lib/github-storage";
import { BlueprintCreateInputSchema } from "@/lib/schemas";
import { createBlankBlueprint } from "@/lib/defaults";

export const runtime = "nodejs";
// Storage state lives in a remote repo. Always re-fetch.
export const dynamic = "force-dynamic";

function errorResponse(err: unknown): NextResponse {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message, issues: err.issues }, { status: err.status });
  }
  if (err instanceof StorageError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const items = await listBlueprints();
    return NextResponse.json({ blueprints: items });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = BlueprintCreateInputSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message);
    return NextResponse.json({ error: "Validation failed", issues }, { status: 400 });
  }

  // ID generation lives at the API boundary so callers can't dictate ids.
  const id = nanoid(12);
  try {
    const blueprint = createBlankBlueprint({
      id,
      title: parsed.data.title,
      systemName: parsed.data.systemName,
      description: parsed.data.description ?? ""
    });
    const saved = await saveBlueprint(blueprint);
    return NextResponse.json({ blueprint: saved }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
