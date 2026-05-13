# UEW System Architect — PROJECT_STATE.md

Cross-session contract. Read first before doing meaningful work in this repo.

---

## What this is

- **Name:** System Architect
- **Purpose:** Decompose and document AI-augmented systems. Each entry is a "blueprint" with 12 tabs and a Current State / Future State pair per tab. Exports as Executive Brief, Build Instructions, Compliance Review Package, or Interactive HTML Blueprint.
- **Owner:** Rochelle Rumsey (AI Innovations Lead, UEW Healthcare)
- **Storage:** GitHub repo `rochellerumsey-byte/uew-system-architect`, blueprints as JSON at `/blueprints/{id}.json`.
- **Local path:** `C:\Users\Rochelle\Projects\uew-system-architect`
- **Deploys to:** Netlify (planned)
- **Sister app:** [UEW AI Portfolio Manager](https://github.com/rochellerumsey-byte/uewaihub) — separate codebase, shared brand, shared worldview, no shared data.

---

## Active phase

**Phase 1 complete — 2026-05-13. Standing by for Phase 2.**

Scope file: none active
Status: Complete

Phase 1 closed 2026-05-13. All 6 commits shipped:
- Commit 1: project scaffold and config
- Commit 2: type definitions and zod schemas
- Commit 3: github storage layer with api routes
- Commit 4: home page with blueprint list and create flow
- Commit 5: uew context data for suggest-defaults buttons
- Commit 6: deployment, scope doc, phase 1 closeout

---

## Previous phase

**Phase 1: Foundation** — closed 2026-05-13.
Scope file: `PHASE_1_SCOPE.md`
Status: Closed.

---

## Closed phases

| Phase | Theme | Items | Closed |
|---|---|---|---|
| 1 | Foundation | 6 | 2026-05-13 |

---

## Recent decisions (do not undo)

- Sister site to UEW Portfolio Manager, separate repo, separate URL, separate codebase. Brand and language rules are shared.
- 12-tab editor per blueprint (Project Basics, Kickoff Six, Phase Map, Phase Details, Agent Roster, Agent Anatomy, Tech Stack, System RACI, Decision Rules, Hierarchy, Risks, Export).
- Two-pass workflow: every blueprint has Current State + Future State per tab with a toggle.
- 4 export formats: Executive Brief, Build Instructions, Compliance Review Package, Interactive HTML Blueprint.
- No chatbot in v1 (deferred indefinitely; can revisit after Phase 11).
- Storage is the GitHub repo. Blueprints are JSON files at `/blueprints/{id}.json`. No database.
- "Blueprint" is the vocabulary. Not "use case" (avoids collision with the Portfolio Manager), not "project", not "system spec".
- Per-tab "Suggest UEW Defaults" buttons land in Phase 3, sourced from `/content/defaults/uew-context.json`.
- Self-Filing seeded as Future State only (no Current State data). Lands in Phase 11.
- Side-by-side comparison view (Current vs Future) lands in Phase 10.

---

## Locked vocabulary

- "Blueprint" — not "use case", "project", or "system spec".
- "Current State" and "Future State" — not "as-is" and "to-be".
- "Tab" — not "section".
- "Export" — not "report" or "deliverable".

---

## Locked design tokens

### Brand palette (UEW)

| Token | Hex | Tailwind utility |
|---|---|---|
| Navy (primary) | `#003A65` | `bg-uew-navy` / `text-uew-navy` |
| Orange (action) | `#F05734` | `bg-uew-orange` / `text-uew-orange` |
| Amber (highlight) | `#FCB33C` | `bg-uew-amber` / `text-uew-amber` |
| Slate (secondary text) | `#8296A5` | `bg-uew-slate` / `text-uew-slate` |
| Cream (background) | `#F5F3EE` | `bg-uew-cream` |

### Typography

- Body: `font-sans` → Inter (system fallback chain).
- Code, labels, eyebrows: `font-mono` → JetBrains Mono.

### Spacing & radius

- Spacing: Tailwind defaults (no custom scale).
- Default radius: `rounded-lg`.

---

## Locked language rules

(Inherited from the Portfolio Manager. Apply to every label, tooltip, and copy string.)

**USE:**
- operational capacity returned
- workforce support
- scalability
- reduced administrative burden
- AI-assisted workflow improvement

**AVOID:**
- headcount reduction
- staff replacement
- automating jobs
- reducing positions
- eliminating labor
- workforce reduction

---

## File size goal

Each component focused and small. Server components by default; client components only where interactivity demands it (forms, dialogs, drag, picker).

---

## What is next

**Phase 2: Editor shell.** Toolbar (Save, Status, Toggle Current/Future, Export dropdown), 12-tab navigation, blueprint detail page at `/blueprints/[id]`. Project Basics tab is the first one wired end-to-end as the pattern other tabs follow.

After Phase 2: Phase 3 (Suggest UEW Defaults), Phase 4 (tab content fill-in across all 12 tabs), Phase 5 (two-pass workflow wiring), Phases 6–9 (export generators), Phase 10 (side-by-side compare), Phase 11 (Self-Filing seed + polish).

---

## Recent decisions added during Phase 1 execution

- **Scaffold tooling lock:** Next.js `14.2.35`, shadcn CLI `2.1.8`, Tailwind v3 (HSL color variables, not Tailwind v4 oklch). Future scaffold revisions stay on the same major versions until Phase 11 closeout — keeps the editor build path predictable.
- **`/blueprints/new` is a redirect**, not a dedicated page. The New Blueprint dialog on the home page is the only create entry point in v1.
- **Detail page is a server component** that calls `getBlueprint()` directly. No client-side fetch on the detail page until Phase 2 needs it for the editor's optimistic updates.
- **Default `createdBy` is `"rochelle"`** for v1. Replace when auth lands.
- **Storage layer error mapping:** Octokit 404 on `/blueprints` folder returns `[]` (not error), 404 on a single file returns `null` (not error). 404 specifically on a deleted blueprint surfaces as `NotFoundError` in the DELETE flow. The split avoids a confusing first-run experience when the folder doesn't exist yet.
- **`.gitkeep`** committed inside the storage repo's `/blueprints` folder so the very first `saveBlueprint()` call has somewhere to land. Documented in README "Storage initialization" section.
- **Zod v4 record syntax:** `z.record(z.string(), z.unknown())` (not `z.record(z.unknown())`). Future schemas must follow.
