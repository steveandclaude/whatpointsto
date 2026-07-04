---
date: 2026-07-04T12:01:02-05:00
git_commit: 254de8b7281610ef427eb39f8f6c348982a544fb
branch: main
topic: "Arc A Shipped: Session Engine + Engine v0.2 + Content/Schema v0.2 + Vocabulary Ruling Handoff"
tags: [handoff, session-engine, stances, schema-v02, b5-decomposition, seal-vocabulary, guide-policy]
status: complete
last_updated: 2026-07-04
type: handoff
---

# Handoff: Arc A items 1–3 shipped (session engine, fact stances, content/schema v0.2); seal banned as a surface word; next arc is the scene renderer

## Task(s)

All tasks **completed**; the next build item is **chosen but not started** (scene renderer, THREADS §1 item 4).

1. **Resume from prior handoff** (completed) — clean continuation of
   `docs/handoffs/2026-07-04_10-34-08_interaction-design-spike-threads-register.md`; 35/35 at
   start, all artifacts verified present.
2. **Arc A item 1 — Session engine** (completed, commit `7e4243c`) — `src/session.ts`: 12 typed
   moves (canonical 11 + discovered `commit`), pure `reduceSession(map, state, move)`, exact
   carryback via reducer re-runs, Suppose sandbox, mode contracts as data, deterministic guide
   policy v0; `test/session.test.ts`.
3. **Arc A item 2 — Engine v0.2** (completed, commit `248d011`) —
   `reduce(map, answers, factStances?, opts?)`; stances gate fact-edge participation;
   `ReduceResult.suppositions` + `.parked`; threaded through counterfactual/sensitivity and the
   session engine's carryback + guide policy; `test/stances.test.ts`.
4. **Arc A item 3 — Content/schema v0.2** (completed, commit `80c9864`) — B5 decomposed into
   B5a/B5b (joint weights preserved as sums); `FactSource {authority, citation?, retrievedAt?}`;
   `origin`; `shortLabel` on positions/facts; UAP fully authored; conformance suite deliberately
   diverges (11 positions) with two new guards.
5. **Seal-vocabulary ruling + coherence-probe idea capture** (completed, commit `254de8b`) —
   user ruled "seal" is never a user-facing word; `web/app.ts` copy moved to promise/reveal
   registers; ruling LOCKED in THREADS §2 / Interaction §5.5. A user idea (coherence probe /
   entailment reveal) captured **as an unweighed possibility, not a direction** — Interaction
   §9.10, THREADS §3.

No plan document; work is driven by `docs/THREADS.md` §1 (the register), per repo CLAUDE.md.

## Verification Status

**Automated Verification:**
- [x] `npm test` → **67/67** at `254de8b` (tsc strict + node:test): 11 smoke, 14 UAP
  conformance, 12 singularity conformance, 21 session, 9 stances. Working tree clean.
- [x] No lint/CI configured (nothing to fail).

**Manual Testing:**
- Status: Not repeated this session
- Notes: The engine work is fully covered by tests. `web/app.ts` changes (structured-source
  rendering + seal→reveal copy) compile under tsc strict but were **not re-driven in a
  browser** this session; the prior session verified the renderer end-to-end. A 2-minute
  `npm run web` visual check of the arrival/elicit/payoff copy and fact source chips is the
  only outstanding sanity pass — low risk, template strings only.

## Critical References

1. `docs/THREADS.md` — **start every session here.** §1 items 1–3 marked shipped; item 4
   (scene renderer) is next; §2 has today's LOCKED seal-vocabulary ruling; §3 gained two
   threads (B5b kind question; coherence probe, unweighed).
2. `docs/Interaction-Design-2026-07.md` — **§7.1 (new)**: the exact semantics the session
   reducer forced (12th move, react≠stance, sandbox lifecycle, carryback spec, notices);
   **§5.5 (new)**: seal is backstage language — surface speaks promise + reveal; §6.2/§8
   shipped markers; **§9.10 (new)**: coherence-probe idea on record.
3. `docs/UAP-Port-Notes.md` **§6 (new)** — B5 decomposition record (weight-preservation sums,
   F2/F3 → B5b, T1 partner B5b:steep, interim authority distillation, B5b kind question).

## Recent Changes

Four commits today on `main`, `7e4243c`..`254de8b` (details in each commit body):

- `src/session.ts` (new, ~700 lines) — move union + `MOVE_TYPES`; `MODE_CONTRACTS`
  (peruse/mirror/suppose/contribute: allowedMoves, credenceRender, workspace);
  `createSession`/`reduceSession`/`replaySession`; `SessionError` with typed codes;
  `guideOffers` (dispute-route > gate-weight > present-fact > pop reminder > post-commit
  payoff frames).
- `src/reducer.ts:99` — `reduce(map, answers, factStances = {}, opts = {})`; parked collection
  after fact activation; stance gate + supposition marking in the edge loop;
  `counterfactual`/`sensitivity` thread stances.
- `src/schema.ts` — `FactStance` (moved here from session.ts to avoid `export *` collisions),
  `FactOrigin`, `FactSource`, `shortLabel?` on PositionBase + FactNode, I9 authority check.
- `content/uap.ts` (v0.2.0) — B5a ('credential weight', strong/weak) + B5b ('secondhand
  discount', minor/steep, triggers F2/F3); four replacement edges; T1 → B5b:steep; structured
  sources; shortLabels from the validated spike labels; `origin: 'author-researched'` on all
  13 facts.
- `test/uap.conformance.test.ts` — inventory 11; two new guards (joint-weight preservation;
  v0.2 authoring completeness).
- `web/app.ts:108-118, 182, 243, 248` — promise/reveal copy (no seal words, no padlocks);
  `web/app.ts:121-127` — authority chips with citation tooltips. `web/spike.ts:611` — one-line
  compile fix for structured sources (spike otherwise untouched, still throwaway).

## Learnings

1. **The predicted "writing the reducer forces exactness" effect fired immediately**: the
   canonical 11-move grammar had no move that unseals — `commit` is move 12 (Mirror-only,
   monotone). Also forced: `react` (soft demand signal) split from `stance` (engine input);
   Suppose = sandbox cloned on entry, dropped loudly on exit, entry **throws** during a sealed
   walk; carryback snapshots raw inputs only and diffs the RECORD via two reducer re-runs.
   All recorded in Interaction §7.1.
2. **The seal is engine-enforced, not renderer discipline**: `Carryback.credenceShift` is
   *constructed* only when `revealed` — a renderer cannot leak it by accident
   (`src/session.ts`, carrybackFrom).
3. **Stance exactness calls** (Interaction §6.2 shipped note): stances never touch activation
   (parked facts stay visible); a parked fact's contested readings leave the table; a supposed
   fact is a supposition only if its edges actually moved something; unknown/inactive stances
   are inert. Deferred: suppose-as-reading-adoption on contested edges (needs a reading payload).
4. **B5 decomposition surfaced a kind question** — is the secondhand discount a portable
   epistemic standard? Kept `world-belief` because F2/F3 must bear on it (I1). Open in
   THREADS §3 / Port-Notes §6.
5. **Vocabulary ruling (user)**: "seal" reads as custody language and invites the gotcha
   frame. Surface registers: **promise** ("set it aside — we'll come back to this") and
   **reveal** ("where you land appears after you commit"). Engine's `revealed` flag already
   matches. Seal-words + 🔒/🔓 join the voice-linter rule set. NOTE: `SessionError` messages
   still use seal language — they are dev-facing; renderers must never pipe them to the user
   surface verbatim.
6. **Capture discipline (user feedback, twice-shaped)**: when the user floats an idea, record
   it *as a possibility* — no build weight, no advocacy baked into the register ("not an
   opinion of where we should go"). See the §9.10 phrasing for the calibration.
7. Technical: `exactOptionalPropertyTypes` requires the conditional-spread idiom
   (`...(cond ? { field } : {})`) — used for `credenceShift` and `thoughts[].about`. Fixture
   maps live inline in each test file. Guide policy determinism relies on stable sorts +
   explicit key tiebreaks.
8. Empirical (findings ledger): guide policy's structure-only gate weight independently ranks
   B2 the top unanswered UAP fork (3.9) — matching the map author's "load-bearing fork" note.

## Artifacts

- `src/session.ts`, `test/session.test.ts` (new) — session engine + 21 tests
- `src/reducer.ts`, `test/stances.test.ts` — engine v0.2 + 9 stance tests
- `src/schema.ts` — schema v0.2 (FactStance/FactOrigin/FactSource/shortLabel/I9)
- `content/uap.ts` v0.2.0 — decomposed, authored, structured
- `test/uap.conformance.test.ts` — 14 tests incl. two new v0.2 guards
- `web/app.ts` — vocabulary + source-chip updates (still the interim renderer)
- `docs/Interaction-Design-2026-07.md` — §5.5, §7.1, §9.10 new; §5.1/§5.4/§6.1/§6.2/§8 markers
- `docs/THREADS.md` — §1 items 1–3 shipped; §2 +seal ruling; §3 +2 threads; §6 +4 findings
- `docs/Schema-v0.md` — §2 field tree, origin section, §3 I9 row, §4 reducer contract (v0.2)
- `docs/UAP-Port-Notes.md` — §6 (new)
- Prior handoff: `docs/handoffs/2026-07-04_10-34-08_interaction-design-spike-threads-register.md`

## Action Items & Next Steps

1. **Scene renderer on the session engine** (THREADS §1 item 4; spec Interaction §8.4) —
   Mirror mode first: arrival → set-aside → guided focus walk (drive it with `guideOffers` +
   `reduceSession`) → commit → relight reveal; then Peruse; Suppose after (engine support
   already shipped). Replaces BOTH `web/app.ts`'s wall and the spike. Lift from the spike:
   `neededAssumption()` (web/spike.ts:521-548) and the relation-sector layout
   (web/spike.ts:254-276). Schema now supplies `shortLabel` — the spike's SHORT hardcode is
   obsolete. All copy obeys Interaction §5.5 (no seal words) + PROTOCOL v1.2 frame ban.
2. Optional 2-minute check before/with that work: `npm run web` → eyeball the new arrival/
   elicit/payoff copy and authority chips on `/`.
3. Then (register order): **voice linter** (rule set: single-proposition options, seal-word +
   padlock ban, frame ban) immediately before **LLM seams** (Interaction §8.5).
4. Standing open threads in THREADS §3 — notably B5b kind question, coherence probe (idea,
   unweighed — do not treat as queued work), reflex-relation ghost sector (user still hasn't
   weighed in), supportedStrength/load-language relative-honesty family.

## Other Notes

- **Environment**: Windows 11, PowerShell primary; port 8137 for `npm run web`; `npm test` is
  the only CI-grade verification (glob form in package.json is Windows-required).
- **Session engine invariants worth knowing before extending**: sandbox is non-null exactly
  while mode==='suppose'; stack non-empty ⇒ focus non-null; `revealed` is monotone; notices
  are one-shot (cleared by the next move); carryback clears on the next focus-changing move;
  arrival is one-per-session and enters only via `createSession` or a switch INTO mirror.
- **`createSession` requires an explicit mode** — deliberately, so open question §9.4
  (Peruse-first vs Mirror-first entry) stays undecided.
- **Guide policy emits no knowledge-check offers** — the schema has no entity/primer registry
  yet (Interaction §9.3).
- **Interim authority distillation**: UAP source authorities currently name the project
  research artifacts ('Radar in the Dock', …), not real-world authority classes — the
  trust-layer taxonomy pass re-distills them deliberately (Port-Notes §6).
- **The spike stays throwaway** (THREADS §4 tension) — one compile fix only; its user-facing
  copy still says "seal" (line 632); do not harden, it dies when the scene renderer lands.
- Commits happen only when the user says so (they did, four times today); messages follow the
  repo style (topic line, per-file body, findings inline).
