/**
 * Default blueprint factory.
 *
 * createBlankBlueprint() builds a fully-populated Blueprint with empty data
 * for every tab. The result is what POST /api/blueprints persists on the
 * very first save.
 *
 * Commit 5 expands this with UEW-specific defaults (sourced from
 * /content/defaults/uew-context.json) that the Phase 3 "Suggest UEW Defaults"
 * buttons will pull from. For now the factory only needs to produce a valid,
 * empty Blueprint that satisfies BlueprintSchema.
 */

import type {
  Blueprint,
  BlueprintTabs,
  ProjectBasicsData,
  TabContent
} from "./types";

/** Inputs for createBlankBlueprint. The route handler builds this from the
 *  client's POST body + a nanoid-generated id. */
export interface CreateBlankBlueprintInput {
  id: string;
  title: string;
  systemName: string;
  description: string;
  /** Defaults to "rochelle" for v1. Will be replaced when auth lands. */
  createdBy?: string;
}

const EMPTY_PROJECT_BASICS: ProjectBasicsData = {
  title: "",
  owner: "",
  problem: "",
  audience: "",
  scope: "",
  businessValue: ""
};

/** Helper for the 10 tabs that share the permissive stub shape today. */
function blankStubTab(): TabContent<{ data?: Record<string, unknown> }> {
  return {
    currentState: { data: {} },
    futureState: { data: {} },
    hasCurrent: false,
    lastEditedTab: "future"
  };
}

/** Helper for Project Basics specifically — uses its real shape. */
function blankProjectBasics(seedTitle: string): TabContent<ProjectBasicsData> {
  // Seed the tab title with the blueprint title so the first save isn't blank.
  // The user overwrites in the Project Basics editor whenever they want.
  return {
    currentState: { ...EMPTY_PROJECT_BASICS },
    futureState: { ...EMPTY_PROJECT_BASICS, title: seedTitle },
    hasCurrent: false,
    lastEditedTab: "future"
  };
}

function blankTabs(seedTitle: string): BlueprintTabs {
  return {
    projectBasics: blankProjectBasics(seedTitle),
    kickoffSix: blankStubTab(),
    phaseMap: blankStubTab(),
    phaseDetails: blankStubTab(),
    agentRoster: blankStubTab(),
    agentAnatomy: blankStubTab(),
    techStack: blankStubTab(),
    systemRACI: blankStubTab(),
    decisionRules: blankStubTab(),
    hierarchy: blankStubTab(),
    risks: blankStubTab(),
    exportTab: {
      currentState: {},
      futureState: {},
      hasCurrent: false,
      lastEditedTab: "future"
    }
  };
}

/**
 * Build a Blueprint from create-flow input. Sets timestamps to now, status
 * to "draft", schemaVersion to 1, createdBy to "rochelle" by default.
 */
export function createBlankBlueprint(input: CreateBlankBlueprintInput): Blueprint {
  const now = new Date().toISOString();
  return {
    id: input.id,
    schemaVersion: 1,
    title: input.title,
    systemName: input.systemName,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "rochelle",
    status: "draft",
    tabs: blankTabs(input.title)
  };
}
