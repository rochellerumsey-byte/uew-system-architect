/**
 * GitHub-backed storage for blueprints.
 *
 * All blueprint reads / writes flow through this module. The Next.js API
 * routes at /app/api/blueprints/* are thin wrappers that call these
 * functions; the GITHUB_TOKEN never crosses the server / client boundary.
 *
 * Layout in the storage repo:
 *   /blueprints/.gitkeep         (placeholder so the folder exists)
 *   /blueprints/{id}.json        (one JSON file per blueprint)
 *
 * Each save commit is messaged "blueprint: create|update|delete <title>" so
 * the GitHub repo doubles as an audit log of every change.
 */

import "server-only";
import { Octokit } from "@octokit/rest";
import type { Blueprint, BlueprintListItem } from "./types";
import { BlueprintSchema } from "./schemas";

// ── Typed errors ─────────────────────────────────────────

/** Base class for any storage-layer failure. Caught by the API routes. */
export class StorageError extends Error {
  /** HTTP status the API route should respond with. */
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "StorageError";
    this.status = status;
  }
}

export class NotFoundError extends StorageError {
  constructor(message = "Blueprint not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends StorageError {
  /** Zod-style array of human-readable issues. */
  issues: string[];
  constructor(issues: string[]) {
    super("Validation failed: " + issues.join("; "), 400);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

// ── Octokit client ───────────────────────────────────────

interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

function readConfig(): RepoConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  const missing: string[] = [];
  if (!token) missing.push("GITHUB_TOKEN");
  if (!owner) missing.push("GITHUB_OWNER");
  if (!repo) missing.push("GITHUB_REPO");
  if (!branch) missing.push("GITHUB_BRANCH");
  if (missing.length > 0) {
    throw new StorageError(
      `Storage config missing required env var(s): ${missing.join(", ")}. See .env.example.`,
      500
    );
  }
  return { token: token!, owner: owner!, repo: repo!, branch: branch! };
}

function makeOctokit(): { octokit: Octokit; config: RepoConfig } {
  const config = readConfig();
  return { octokit: new Octokit({ auth: config.token }), config };
}

// ── Path helpers ─────────────────────────────────────────

const BLUEPRINTS_DIR = "blueprints";
const blueprintPath = (id: string) => `${BLUEPRINTS_DIR}/${id}.json`;

/**
 * Quick sanity check on a blueprint id. Allows the nanoid alphabet
 * (A-Z a-z 0-9 _ -) and a reasonable length range. Defense in depth against
 * any caller that constructs a path from untrusted input.
 */
function assertValidId(id: string) {
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) {
    throw new ValidationError([`Invalid blueprint id: ${JSON.stringify(id)}`]);
  }
}

// ── Octokit error → our error mapping ────────────────────

interface OctokitError {
  status?: number;
  message?: string;
}

function rethrowOctokit(err: unknown, defaultMsg: string): never {
  const e = err as OctokitError;
  if (e && e.status === 404) throw new NotFoundError();
  if (e && e.status === 422) throw new StorageError(e.message || defaultMsg, 422);
  throw new StorageError((e && e.message) || defaultMsg, (e && e.status) || 500);
}

// ── Public API ───────────────────────────────────────────

/**
 * List all blueprints. Returns the metadata subset (BlueprintListItem) by
 * reading every JSON file under /blueprints. For very large collections this
 * is O(n) file fetches, but the blueprint count is expected to stay small
 * (~ tens for the lifetime of the tool) so simplicity wins over caching.
 *
 * Skips .gitkeep and anything that isn't a .json file.
 */
export async function listBlueprints(): Promise<BlueprintListItem[]> {
  const { octokit, config } = makeOctokit();
  let entries: Array<{ name: string; type: string; path: string }> = [];
  try {
    const res = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      ref: config.branch,
      path: BLUEPRINTS_DIR
    });
    if (!Array.isArray(res.data)) {
      throw new StorageError("Unexpected response from GitHub for /blueprints — expected a folder.");
    }
    entries = res.data as Array<{ name: string; type: string; path: string }>;
  } catch (err: unknown) {
    const e = err as OctokitError;
    if (e && e.status === 404) {
      // The folder doesn't exist yet. Treat as empty.
      return [];
    }
    rethrowOctokit(err, "Failed to list blueprints.");
  }

  const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));
  // Fetch and parse each file in parallel. Files that fail to parse are
  // dropped from the list — better than failing the whole call for one bad
  // entry. The detail page (getBlueprint) will surface the failure if the
  // user opens that blueprint specifically.
  const items = await Promise.all(
    files.map(async (entry): Promise<BlueprintListItem | null> => {
      try {
        const fileRes = await octokit.rest.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          ref: config.branch,
          path: entry.path
        });
        if (Array.isArray(fileRes.data) || !("content" in fileRes.data)) return null;
        const decoded = Buffer.from(fileRes.data.content, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        const bp = BlueprintSchema.parse(parsed);
        return {
          id: bp.id,
          title: bp.title,
          systemName: bp.systemName,
          description: bp.description,
          status: bp.status,
          createdAt: bp.createdAt,
          updatedAt: bp.updatedAt
        };
      } catch {
        return null;
      }
    })
  );
  return items.filter((x): x is BlueprintListItem => x !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Read a single blueprint. Returns null when the id is not found. */
export async function getBlueprint(id: string): Promise<Blueprint | null> {
  assertValidId(id);
  const { octokit, config } = makeOctokit();
  try {
    const res = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      ref: config.branch,
      path: blueprintPath(id)
    });
    if (Array.isArray(res.data) || !("content" in res.data)) {
      throw new StorageError("Unexpected response shape from GitHub for a single blueprint.");
    }
    const decoded = Buffer.from(res.data.content, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    const validated = BlueprintSchema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.map((i) => i.path.join(".") + ": " + i.message);
      throw new ValidationError(issues);
    }
    return validated.data;
  } catch (err: unknown) {
    const e = err as OctokitError;
    if (e && e.status === 404) return null;
    if (err instanceof StorageError) throw err;
    rethrowOctokit(err, "Failed to read blueprint.");
  }
}

/**
 * Look up the SHA of an existing blueprint file. Returns null when the file
 * doesn't exist yet. Used by saveBlueprint to know whether this is a create
 * or an update.
 */
async function getBlueprintSha(id: string): Promise<string | null> {
  const { octokit, config } = makeOctokit();
  try {
    const res = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      ref: config.branch,
      path: blueprintPath(id)
    });
    if (Array.isArray(res.data) || !("sha" in res.data)) return null;
    return res.data.sha;
  } catch (err: unknown) {
    const e = err as OctokitError;
    if (e && e.status === 404) return null;
    throw err;
  }
}

/**
 * Validate + commit a blueprint to the storage repo. Used for both
 * create-new and update flows.
 *   - First call: no existing SHA → create file (`blueprint: create <title>`)
 *   - Subsequent calls: existing SHA → update file (`blueprint: update <title>`)
 * Returns the saved blueprint.
 */
export async function saveBlueprint(blueprint: Blueprint): Promise<Blueprint> {
  // Defense: validate before we hit the network.
  const validated = BlueprintSchema.safeParse(blueprint);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => i.path.join(".") + ": " + i.message);
    throw new ValidationError(issues);
  }
  assertValidId(validated.data.id);

  const { octokit, config } = makeOctokit();
  const json = JSON.stringify(validated.data, null, 2) + "\n";
  const content = Buffer.from(json, "utf-8").toString("base64");
  const existingSha = await getBlueprintSha(validated.data.id);
  const action = existingSha ? "update" : "create";
  const message = `blueprint: ${action} ${validated.data.title}`;

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: blueprintPath(validated.data.id),
      message,
      content,
      ...(existingSha ? { sha: existingSha } : {})
    });
  } catch (err: unknown) {
    rethrowOctokit(err, "Failed to save blueprint.");
  }
  return validated.data;
}

/** Delete a blueprint. Throws NotFoundError when the id doesn't exist. */
export async function deleteBlueprint(id: string): Promise<void> {
  assertValidId(id);
  const existing = await getBlueprint(id);
  if (!existing) throw new NotFoundError();
  const sha = await getBlueprintSha(id);
  if (!sha) throw new NotFoundError();
  const { octokit, config } = makeOctokit();
  try {
    await octokit.rest.repos.deleteFile({
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: blueprintPath(id),
      message: `blueprint: delete ${existing.title}`,
      sha
    });
  } catch (err: unknown) {
    rethrowOctokit(err, "Failed to delete blueprint.");
  }
}
