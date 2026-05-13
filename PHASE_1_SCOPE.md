# PHASE_1_SCOPE.md — Foundation

Cross-session contract for Phase 1 of System Architect.

---

## What this phase is

[#what-this-phase-is](#what-this-phase-is)

**Phase 1: Foundation**

Stand up the System Architect project end-to-end: scaffold, type system, GitHub-backed storage, home page with create flow, default blueprint factory, UEW context data, and a Netlify deploy target. No tab UIs and no exports — those land in later phases. The point of Phase 1 is to make the **round trip** work: create a blueprint → persist to GitHub → reload → render.

Started: 2026-05-13.

---

## What this phase ships

[#what-this-phase-ships](#what-this-phase-ships)

- Next.js 14 project scaffolded with TypeScript strict, Tailwind CSS, ESLint, and shadcn/ui (14 primitives installed).
- All core type definitions for Blueprint and 12 tabs in `/lib/types.ts`. Only `ProjectBasicsData` is fully specified; the other 10 tab data shapes are permissive stubs that Phase 4 will replace.
- Zod schemas mirroring every type in `/lib/schemas.ts`. `BlueprintSchema`, `BlueprintCreateInputSchema`, `BlueprintUpdateInputSchema`, plus per-tab data schemas.
- GitHub-backed storage layer in `/lib/github-storage.ts`. Reads env vars, validates on read + write, maps Octokit errors to typed errors (`StorageError`, `NotFoundError`, `ValidationError`).
- API routes:
  - `GET /api/blueprints` → list (metadata subset).
  - `POST /api/blueprints` → validate input, generate nanoid, save.
  - `GET /api/blueprints/[id]` → read one.
  - `PUT /api/blueprints/[id]` → patch with deep-merge of `tabs`, bump `updatedAt`.
  - `DELETE /api/blueprints/[id]` → remove.
- Home page (`/app/page.tsx` → `BlueprintList` client component) with search, status filter, sortable table, per-row actions (open, mark in review, archive, delete), and an empty-state card.
- `+ New Blueprint` dialog with title / system name / description fields, validation, toast feedback, and post-create navigation.
- Placeholder blueprint detail page (`/blueprints/[id]`) that fetches via the storage layer server-side and shows Title / System Name / Status / Description / Project Basics Future State as a read-only preview. The real editor lands in Phase 2.
- Redirect at `/blueprints/new` that bounces to the home page (the dialog is the only create entry point).
- Default blueprint factory in `/lib/defaults.ts`. Builds a fully populated Blueprint with empty data for every tab; seeds `tabs.projectBasics.futureState.title` with the blueprint title so the very first save isn't completely blank.
- UEW context data at `/content/defaults/uew-context.json` (company facts, compliance constraints, sanctioned tech stack, departments, agent patterns, value categories, language rules). Typed `UEWContext` interface + `getUEWContext()` accessor in `defaults.ts` for Phase 3 to consume.
- Netlify deploy config: `netlify.toml` + `@netlify/plugin-nextjs` as a dev dependency.
- `README.md` covering what it builds, exports, stack, setup, env vars, architecture diagram, storage initialization notes, deploy, and the 11-phase roadmap.
- `PROJECT_STATE.md` with locked vocabulary, design tokens, language rules, and roadmap.
- This file.

---

## What is NOT in Phase 1 (deferred)

[#what-is-not-in-phase-1](#what-is-not-in-phase-1)

- The editor itself (Phase 2).
- Any actual tab content beyond Project Basics (Phases 2–4).
- The Current / Future toggle wired across all 12 tabs (Phase 5).
- Export generators (Phases 6–9).
- Side-by-side comparison view (Phase 10).
- Self-Filing seed (Phase 11).
- Authentication or access control.
- Chatbot / AI recommendations (deferred indefinitely).
- "Suggest UEW Defaults" buttons (Phase 3 wires them; the data is staged here so Phase 3 can ship without revisiting context).

---

## How to know Phase 1 is done

[#how-to-know-phase-1-is-done](#how-to-know-phase-1-is-done)

- [ ] `npm install` succeeds from a clean clone.
- [ ] `npm run build` compiles cleanly with no TypeScript or ESLint errors.
- [ ] `npm run dev` starts a working server.
- [ ] Home page loads at `http://localhost:3000` and shows the empty-state card the first time.
- [ ] Clicking `+ New Blueprint` opens the dialog.
- [ ] Submitting the dialog with a title + system name creates a record at `/blueprints/{id}.json` in the storage repo and routes to `/blueprints/{id}`.
- [ ] Reloading the home page shows the new blueprint in the table.
- [ ] Per-row "Archive" sets the blueprint's status to archived and the badge updates.
- [ ] Per-row "Delete" with confirm removes the JSON file from the storage repo.
- [ ] Netlify build succeeds (or the manual deployment path is documented in README.md).
- [ ] PROJECT_STATE.md, README.md, and this scope doc are committed.

---

## Sub-phases shipped

[#sub-phases-shipped](#sub-phases-shipped)

1. **Project scaffold and config** — create-next-app, shadcn init + 14 components, folder structure, UEW brand palette wired into Tailwind, README + PROJECT_STATE, placeholder home.
2. **Type definitions and Zod schemas** — `lib/types.ts` + `lib/schemas.ts`. ProjectBasicsData fully specified; 10 other tab shapes stubbed. Permissive `z.record(z.string(), z.unknown())` for Zod v4 compatibility.
3. **GitHub storage layer with API routes** — `lib/github-storage.ts` + `app/api/blueprints/{route.ts, [id]/route.ts}`. Typed errors. Server-only import. Defense-in-depth id validation. createBlankBlueprint minimal version shipped here so POST works end-to-end.
4. **Home page with blueprint list and create flow** — React Query provider, page-header / status-badge / empty-state shared components, BlueprintList + BlueprintListRow + NewBlueprintDialog, placeholder detail page that round-trips through the storage layer.
5. **UEW context data** — `/content/defaults/uew-context.json` + typed `UEWContext` interface + `UEW_CONTEXT` / `getUEWContext()` accessors.
6. **Deployment, scope doc, closeout** — `netlify.toml`, `@netlify/plugin-nextjs` devDep, this file, PROJECT_STATE.md flipped to "Phase 1 complete".

---

## Commit message convention for Phase 1

[#commit-message-convention](#commit-message-convention)

Format: `phase-1: <one-line summary>`

Examples:
- `phase-1: project scaffold and config`
- `phase-1: type definitions and zod schemas`
- `phase-1: github storage layer with api routes`
- `phase-1: home page with blueprint list and create flow`
- `phase-1: uew context data for suggest-defaults buttons`
- `phase-1: deployment, scope doc, phase 1 closeout`
