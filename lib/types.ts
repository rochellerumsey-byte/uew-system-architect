/**
 * Core types for System Architect blueprints.
 *
 * A Blueprint is one system being decomposed (e.g. "Self-Filing Agentic
 * System"). It carries 12 tabs, each with a Current State + Future State pair
 * that the editor (Phase 2+) lets the user toggle between or view side-by-side.
 *
 * Phase 1 only wires the ProjectBasics tab data in detail. The other 11 tabs
 * stub with `{ data?: Record<string, unknown> }` so persistence works
 * end-to-end while later phases fill in the specifics.
 */

// ── Workflow state ───────────────────────────────────────

/** "current" = the as-is, "future" = the to-be. Internal key. */
export type BlueprintState = "current" | "future";

/** Used by the editor toolbar to switch between viewing modes. */
export type StateView = "current-only" | "future-only" | "side-by-side";

/** Lifecycle of a blueprint. */
export type BlueprintStatus = "draft" | "in-review" | "approved" | "archived";

/** Available export formats (generators land in Phases 6–9). */
export type ExportFormat =
  | "executive-brief"
  | "build-instructions"
  | "compliance-review"
  | "interactive-html";

// ── Per-tab data shapes ──────────────────────────────────
// Phase 1 only fleshes out ProjectBasicsData. The rest are stubs that conform
// to a permissive shape so the editor + storage layer work today and Phase 4
// (tab content fill-in) can land each tab's structure without changing
// Blueprint or BlueprintTabs.

/** Tab 1 — Project Basics. Fully specified in Phase 1. */
export interface ProjectBasicsData {
  /** Project / blueprint title for headline display. May match Blueprint.title. */
  title: string;
  /** Person responsible (free text — name, email, or position label). */
  owner: string;
  /** What problem this system solves. */
  problem: string;
  /** Who this system serves (audience / cohort). */
  audience: string;
  /** What's in scope and out of scope. */
  scope: string;
  /** Expected impact / business value. */
  businessValue: string;
}

/** Tab 2 — Kickoff Six. Filled in Phase 4. */
export interface KickoffSixData {
  data?: Record<string, unknown>;
}

/** Tab 3 — Phase Map. Filled in Phase 4. */
export interface PhaseMapData {
  data?: Record<string, unknown>;
}

/** Tab 4 — Phase Details. Filled in Phase 4. */
export interface PhaseDetailsData {
  data?: Record<string, unknown>;
}

/** Tab 5 — Agent Roster. Filled in Phase 4. */
export interface AgentRosterData {
  data?: Record<string, unknown>;
}

/** Tab 6 — Agent Anatomy. Filled in Phase 4. */
export interface AgentAnatomyData {
  data?: Record<string, unknown>;
}

/** Tab 7 — Tech Stack. Filled in Phase 4. */
export interface TechStackData {
  data?: Record<string, unknown>;
}

/** Tab 8 — System RACI. Filled in Phase 4. */
export interface SystemRACIData {
  data?: Record<string, unknown>;
}

/** Tab 9 — Decision Rules. Filled in Phase 4. */
export interface DecisionRulesData {
  data?: Record<string, unknown>;
}

/** Tab 10 — Hierarchy. Filled in Phase 4. */
export interface HierarchyData {
  data?: Record<string, unknown>;
}

/** Tab 11 — Risks. Filled in Phase 4. */
export interface RisksData {
  data?: Record<string, unknown>;
}

/** Tab 12 — Export. Tracks last-export metadata; no user-edited fields. */
export interface ExportData {
  lastExportedFormat?: ExportFormat;
  lastExportedAt?: string;
}

// ── Tab content envelope ─────────────────────────────────

/**
 * Every tab carries Current State + Future State data of the same shape.
 * - `hasCurrent` lets the editor hide the Current section for blueprints that
 *   describe net-new systems (no as-is). Default false on create.
 * - `lastEditedTab` lets the editor restore focus across sessions.
 */
export interface TabContent<T> {
  currentState: T;
  futureState: T;
  hasCurrent: boolean;
  lastEditedTab: BlueprintState;
}

// ── Full tab set ─────────────────────────────────────────

export interface BlueprintTabs {
  projectBasics: TabContent<ProjectBasicsData>;
  kickoffSix: TabContent<KickoffSixData>;
  phaseMap: TabContent<PhaseMapData>;
  phaseDetails: TabContent<PhaseDetailsData>;
  agentRoster: TabContent<AgentRosterData>;
  agentAnatomy: TabContent<AgentAnatomyData>;
  techStack: TabContent<TechStackData>;
  systemRACI: TabContent<SystemRACIData>;
  decisionRules: TabContent<DecisionRulesData>;
  hierarchy: TabContent<HierarchyData>;
  risks: TabContent<RisksData>;
  exportTab: TabContent<ExportData>;
}

// ── Blueprint ────────────────────────────────────────────

export interface Blueprint {
  /** 12-char nanoid. Stable across the blueprint's lifetime. */
  id: string;
  /** Schema version. Increment on breaking shape changes; migrate on load. */
  schemaVersion: number;
  /** Human-readable title for the blueprint. */
  title: string;
  /** Name of the system the blueprint describes (e.g. "Self-Filing"). */
  systemName: string;
  /** Short description of what the blueprint covers. */
  description: string;
  /** ISO string. */
  createdAt: string;
  /** ISO string. */
  updatedAt: string;
  /** Identifier for the user who created the blueprint. */
  createdBy: string;
  /** Lifecycle stage. */
  status: BlueprintStatus;
  /** 12-tab payload. */
  tabs: BlueprintTabs;
}

// ── Utility types ────────────────────────────────────────

/** Subset of Blueprint shown in list views (no full tab content). */
export interface BlueprintListItem {
  id: string;
  title: string;
  systemName: string;
  description: string;
  status: BlueprintStatus;
  createdAt: string;
  updatedAt: string;
}

/** Inputs accepted by the "+ New Blueprint" flow. */
export interface BlueprintCreateInput {
  title: string;
  systemName: string;
  description?: string;
}

/**
 * Partial update payload. Any field can be patched; nested tab data is
 * applied with a deep merge in the storage layer / API route.
 */
export type BlueprintUpdateInput = Partial<Omit<Blueprint, "id" | "createdAt">>;
