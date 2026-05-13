/**
 * Zod schemas for runtime validation.
 *
 * Used at the API boundary (server routes) and inside github-storage.ts before
 * a blueprint is committed to the GitHub repo. The compile-time TypeScript
 * types in `./types` and the runtime Zod schemas here are kept in lockstep —
 * change one, change the other.
 */

import { z } from "zod";

// ── Workflow state ───────────────────────────────────────

export const BlueprintStateSchema = z.enum(["current", "future"]);
export const BlueprintStatusSchema = z.enum(["draft", "in-review", "approved", "archived"]);
export const ExportFormatSchema = z.enum([
  "executive-brief",
  "build-instructions",
  "compliance-review",
  "interactive-html"
]);

// ── Per-tab data ─────────────────────────────────────────
// Phase 1 only specifies ProjectBasicsData. The other tabs accept any shape
// that matches their stub interface (record of unknown). Phase 4 will replace
// each stub with the real schema when the tab UI ships.

export const ProjectBasicsDataSchema = z.object({
  title: z.string(),
  owner: z.string(),
  problem: z.string(),
  audience: z.string(),
  scope: z.string(),
  businessValue: z.string()
});

/** Permissive stub used by 10 of 12 tabs until Phase 4 fleshes them out.
 *  Zod v4 requires explicit key + value schemas for `z.record`. */
const StubTabSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional()
});

export const KickoffSixDataSchema = StubTabSchema;
export const PhaseMapDataSchema = StubTabSchema;
export const PhaseDetailsDataSchema = StubTabSchema;
export const AgentRosterDataSchema = StubTabSchema;
export const AgentAnatomyDataSchema = StubTabSchema;
export const TechStackDataSchema = StubTabSchema;
export const SystemRACIDataSchema = StubTabSchema;
export const DecisionRulesDataSchema = StubTabSchema;
export const HierarchyDataSchema = StubTabSchema;
export const RisksDataSchema = StubTabSchema;

export const ExportDataSchema = z.object({
  lastExportedFormat: ExportFormatSchema.optional(),
  lastExportedAt: z.string().optional()
});

// ── Tab content envelope ─────────────────────────────────

function tabContentSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    currentState: dataSchema,
    futureState: dataSchema,
    hasCurrent: z.boolean(),
    lastEditedTab: BlueprintStateSchema
  });
}

// ── Full tab set ─────────────────────────────────────────

export const BlueprintTabsSchema = z.object({
  projectBasics: tabContentSchema(ProjectBasicsDataSchema),
  kickoffSix: tabContentSchema(KickoffSixDataSchema),
  phaseMap: tabContentSchema(PhaseMapDataSchema),
  phaseDetails: tabContentSchema(PhaseDetailsDataSchema),
  agentRoster: tabContentSchema(AgentRosterDataSchema),
  agentAnatomy: tabContentSchema(AgentAnatomyDataSchema),
  techStack: tabContentSchema(TechStackDataSchema),
  systemRACI: tabContentSchema(SystemRACIDataSchema),
  decisionRules: tabContentSchema(DecisionRulesDataSchema),
  hierarchy: tabContentSchema(HierarchyDataSchema),
  risks: tabContentSchema(RisksDataSchema),
  exportTab: tabContentSchema(ExportDataSchema)
});

// ── Blueprint ────────────────────────────────────────────

export const BlueprintSchema = z.object({
  id: z.string().min(1, "id is required"),
  schemaVersion: z.number().int().positive(),
  title: z.string().min(1, "title is required"),
  systemName: z.string().min(1, "systemName is required"),
  description: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  createdBy: z.string().min(1),
  status: BlueprintStatusSchema,
  tabs: BlueprintTabsSchema
});

// ── List item subset ─────────────────────────────────────

export const BlueprintListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  systemName: z.string(),
  description: z.string(),
  status: BlueprintStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

// ── API input schemas ────────────────────────────────────

/** Inputs accepted by POST /api/blueprints. */
export const BlueprintCreateInputSchema = z.object({
  title: z.string().min(1, "title is required").max(200, "title is too long"),
  systemName: z.string().min(1, "systemName is required").max(200, "systemName is too long"),
  description: z.string().max(2000, "description is too long").optional()
});

/**
 * Inputs accepted by PUT /api/blueprints/[id].
 * Every field is optional; the server route deep-merges with the existing record.
 */
export const BlueprintUpdateInputSchema = BlueprintSchema.omit({
  id: true,
  createdAt: true
}).partial();

// ── Inferred types (handy for route handlers) ────────────

export type BlueprintInput = z.infer<typeof BlueprintCreateInputSchema>;
export type BlueprintUpdate = z.infer<typeof BlueprintUpdateInputSchema>;
