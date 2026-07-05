# whatpointsto

Belief-mapping platform: a **map factory** (generation pipeline whose expensive asset is
researched, strength-tagged fact nodes) fronted by a **belief-first door** (every user arrives
with a claim held at a strength; the payoff is the direction gap and the confidence gap).
The engine is a pure reducer over a topic-general schema; UAP is the first content instance,
the singularity scaffold the second.

## Commands

- `npm test` — tsc strict build + node:test (the only CI-grade verification).
  Windows note: the glob form in package.json is required; `node --test dist/test/` fails here.
- `npm run web` — build + dev server at http://localhost:8137/ (the scene renderer,
  `web/scene.ts`, driven by the session engine; the first renderer and the spike are retired).
- Live build: https://steveandclaude.github.io/whatpointsto/ — public repo
  `steveandclaude/whatpointsto`; GitHub Pages redeploys on every push to `main`
  (`.github/workflows/pages.yml`).

## Doc tree — read in this order

1. `docs/THREADS.md` — **the living register of all design threads. Start here every session;
   update it before ending any session that touched design. No thread lives only in chat.**
2. `docs/Platform-Design-2026-07.md` — locked architecture decisions (§2 is user-affirmed; read
   before changing anything structural). Open platform questions in §8.
3. `docs/Interaction-Design-2026-07.md` — modes, focus engine, move grammar, stances, trust
   layer. Extends Platform §2.5.
4. `docs/Schema-v0.md` + `src/schema.ts` — schema; **code wins on conflict**.
5. `docs/UAP-Port-Notes.md` — conformance findings + authoring conventions (one insight, one
   owner; standards are fact-proof).
6. `docs/Belief-Map-Seed-Document.md` — the trunk (vision, commitments, lenses).
7. `experiments/tone/PROTOCOL.md` — v1.2 voice rules (frame ban). Applies to every user-facing
   copy field and all guide narration.

## Conventions

- **Docs-first culture**: significant design conversation gets captured into a decision doc the
  same session, and THREADS.md is updated to point at it. Findings (empirical results) go in
  THREADS.md §6.
- **Purity is load-bearing**: the belief reducer and (future) session reducer are pure; every
  "soft" input (answers, stances, trust, strength) enters as explicit, visible input data —
  never as hidden modifiers. Derived analyses are re-runs.
- **Words, not numbers, in the user's face**: numeric credences/probabilities never render;
  bars, strength words, load words only.
- **Seal discipline**: nothing user-credence-derived renders before answers commit. Authored
  structure (edges, costs) is seal-safe.
- **No new dependencies casually** (repo currently: typescript + @types/node, installed
  `--ignore-scripts`). Vet anything new per the user's global security guidelines.
- Commit only when the user asks; linear history on `main`; commit messages follow the existing
  style (topic: what shipped, findings inline).
