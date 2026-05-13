# System Architect

Design, decompose, and document AI-augmented systems.

System Architect is the sister application to the [UEW AI Portfolio Manager](https://github.com/rochellerumsey-byte/uewaihub). Where the Portfolio Manager tracks the day-to-day operation of UEW's AI portfolio (use cases, foundation work, decisions, dependency map), System Architect is the **blueprint workshop**: it captures how a single system is built — current state and future state — across 12 architectural dimensions, then exports executive briefs, build instructions, and compliance packages.

The two apps share a brand and a worldview but are entirely separate codebases.

---

## What you build with it

Every entry in System Architect is a **blueprint**. A blueprint captures one system (e.g. "Self-Filing Agentic System", "Care Coordination Copilot") across 12 tabs:

1. **Project Basics** — title, owner, problem, audience, scope, business value.
2. **Kickoff Six** — the six questions every project answers before work starts.
3. **Phase Map** — sequencing of the work.
4. **Phase Details** — deliverables, exit criteria, and owners per phase.
5. **Agent Roster** — every AI agent in the system, with role and purpose.
6. **Agent Anatomy** — for each agent: model, tools, prompts, memory, escalation rules.
7. **Tech Stack** — sanctioned platforms, integrations, data flows.
8. **System RACI** — who's Responsible, Accountable, Consulted, Informed for each piece.
9. **Decision Rules** — guardrails, escalation triggers, and human-review gates.
10. **Hierarchy** — how the system fits inside UEW's broader org and data model.
11. **Risks** — compliance, operational, and adoption risks with mitigations.
12. **Export** — generates deliverables in 4 formats.

Each tab carries **Current State** and **Future State** data, with a toggle to flip between them and a side-by-side view for direct comparison.

---

## Exports

Four formats per blueprint:

- **Executive Brief** — short HTML/PDF summary for board / leadership review.
- **Build Instructions** — a long-form spec (DOCX) that engineering can hand to a builder.
- **Compliance Review Package** — the bundle Compliance needs to sign off (decision rules, risks, RACI, data flow).
- **Interactive HTML Blueprint** — a standalone single-page HTML the user can paste into the Portfolio Manager's Document Library as an artifact.

Export generators land in Phases 6–9.

---

## Stack

- **Next.js 14** (App Router, server components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **@octokit/rest** for GitHub-backed storage
- **docx** for Word export (Phase 7)
- **Zod** for input validation
- **@tanstack/react-query** for client-side data fetching
- **nanoid** for blueprint IDs
- **lucide-react** for icons

Blueprints are persisted as JSON files in this repo at `/blueprints/{id}.json`. There is no database. The GitHub API is the storage layer.

---

## Setup

Prerequisites: **Node 18.18+** (this repo uses Node 20+ in development), **npm 9+**, and a GitHub personal access token with `repo` scope.

```bash
# Install
npm install

# Configure
cp .env.example .env.local
# Then fill in GITHUB_TOKEN — get one from https://github.com/settings/tokens
# Leave GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH at the defaults unless you fork.

# Run
npm run dev
# Visit http://localhost:3000
```

### Required environment variables

| Variable | Purpose | Default |
|---|---|---|
| `GITHUB_TOKEN` | Personal access token with `repo` scope on `uew-system-architect` | _none, required_ |
| `GITHUB_OWNER` | GitHub user/org owning the storage repo | `rochellerumsey-byte` |
| `GITHUB_REPO` | Storage repo name | `uew-system-architect` |
| `GITHUB_BRANCH` | Branch that holds the blueprint JSON files | `main` |
| `NEXT_PUBLIC_APP_NAME` | App name shown in the UI | `System Architect` |

---

## Architecture

```
/app
  /blueprints
    /[id]/page.tsx          blueprint editor (Phase 2+)
    /new/page.tsx           create-new redirect / placeholder
  /api
    /blueprints
      route.ts              GET (list), POST (create)
      /[id]/route.ts        GET (read), PUT (update), DELETE
  layout.tsx                root layout with React Query provider
  page.tsx                  home: blueprint list + create flow
  globals.css

/components
  /ui                       shadcn primitives
  /blueprint                blueprint-specific components (Phase 2+)
  /shared                   page-header, status-badge, empty-state, etc.

/lib
  types.ts                  Blueprint + tab types
  schemas.ts                Zod runtime validation
  github-storage.ts         storage abstraction (list / get / save / delete)
  defaults.ts               createBlankBlueprint + default tab data
  utils.ts                  cn() helper from shadcn

/content
  /defaults
    uew-context.json        UEW-specific context for "Suggest UEW Defaults"

/blueprints
  {id}.json                 one file per blueprint (created at runtime)
```

API routes are server-only. `GITHUB_TOKEN` never reaches the browser.

---

## Storage initialization

The first time you run the app against a fresh GitHub repo, the `/blueprints` folder must already exist. The `.gitkeep` in this repo handles it on the first push.

If you're running against a different repo, either:

- Push this repo's `/blueprints/.gitkeep` to that repo first, or
- Create `/blueprints/.gitkeep` manually in the GitHub UI before saving any blueprint.

`saveBlueprint()` will not create the folder for you on the first call — it expects the path to exist.

---

## Deploy

System Architect is built for Netlify via `@netlify/plugin-nextjs`.

1. Push to GitHub.
2. Connect the repo on Netlify (or run `netlify link` locally).
3. Set the four required environment variables in Netlify's site settings.
4. Deploy — Netlify picks up `netlify.toml` and the plugin handles the rest.

Vercel works too (`vercel deploy`); no Vercel-specific config is needed.

---

## Roadmap (phases)

1. **Foundation** — scaffold, types, storage, home page, defaults, deployment. _(this phase)_
2. **Editor shell** — toolbar, 12-tab navigation, blueprint detail page.
3. **Suggest UEW Defaults** — per-tab buttons that pull from `/content/defaults/uew-context.json`.
4. **Tab content** — Project Basics → Risks UI complete.
5. **Two-pass workflow** — Current/Future toggle wired across all 12 tabs.
6. **Executive Brief export.**
7. **Build Instructions (DOCX) export.**
8. **Compliance Review Package export.**
9. **Interactive HTML Blueprint export.**
10. **Side-by-side comparison view.**
11. **Self-Filing seed** (Future State only) + polish.

Phase docs land at `/PHASE_<N>_SCOPE.md`. State lives in [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Related

- Sister app: [UEW AI Portfolio Manager](https://github.com/rochellerumsey-byte/uewaihub) — live at https://uewaihub.netlify.app
- PROJECT_STATE.md (this repo) — cross-session contract.
