---
date: 2026-07-04T14:46:46-05:00
git_commit: d7b6e6039bb44380b324acdca7ea05f77675f2e9
branch: main
topic: "Voice Linter + Light Redesign + Panel Dissolution Designed (§10) + Journey-Rail Stage 1 Handoff"
tags: [handoff, voice-linter, lint, scene-renderer, light-mode, panel-dissolution, journey-rail, seam-invitations, byo-inference]
status: complete
last_updated: 2026-07-04
type: handoff
---

# Handoff: Voice linter shipped & committed; light "surveyor's sheet" register built; panel dissolution designed (Interaction §10) with journey-rail stage 1 in the working tree — all renderer/doc work uncommitted

## Task(s)

1. **Resume from prior handoff** (completed) — clean continuation of
   `docs/handoffs/2026-07-04_13-52-27_scene-renderer-byo-inference-thread.md`; state matched
   exactly (67/67 at `75a5fde`, uncommitted BYO round present as described).
2. **Voice linter** (completed, committed `d7b6e60`) — THREADS §1 item 5, first half.
   `src/lint.ts` (pure `lintMap` + `lintNarration`) + `test/lint.test.ts` (9 tests; 76/76
   with all suites). Severity model user-picked via AskUserQuestion: **errors fail `npm
   test`, warnings print for human review**. Design record: Interaction-Design §5.6.
3. **Commit backlog cleared** (completed) — user said "sure commit": `c165145` (BYO round:
   new doc + Platform §8.8 pointer + THREADS), `d5a5fd0` (prior session's handoff doc),
   `d7b6e60` (linter). THREADS carried edits from two sessions, so its linter edits were
   temporarily reverted and re-applied to keep each commit coherent.
4. **Scene renderer light-mode redesign** (completed as build, **UNCOMMITTED**) — user brief
   via /frontend-design: "light mode but not warm claude orange defaults; text readable and
   not hidden by ellipses". Full visual re-register of `web/index.html` + `web/scene.ts`
   plus draft-tier `shortLabel`s in `content/singularity.ts`. Browser-validated end-to-end;
   design record appended to Interaction-Design §8.4.
5. **Panel-dissolution thread: captured, then explored the same day** (design completed,
   **UNCOMMITTED**) — first captured unweighed as Interaction §9.12 from three user riffs
   (dissolve the sidebar; click-to-surface options in place; prompt the user when Claude
   should weigh in). A dedicated session then ran the exploration: **direction
   user-affirmed** — *content goes home to its object; the session's own voice gets organs
   of its own* — recorded as **Interaction §10** (three organs: scene / focus card /
   **journey rail** + register banner; dispositions table §10.2; rail design §10.3; **seam
   invitations designed §10.4 — they define the LLM seams' UI entry points, so the seams
   build is unblocked**; coded-vs-LLM guidance §10.5; staging §10.6). Details not frozen;
   build not ordered — the register keeps the LLM seams next.
6. **Journey-rail stage 1 (chrome migration)** (build in tree, **UNCOMMITTED**; executed by
   a background "rail-builder" fork per plan) — `docs/plans/2026-07-04_journey-rail-stage1.md`:
   `#register` banner + `#rail` (offers in rank order / here-marker / promise notches /
   coverage dots with seal-split emphasis / commit at the foot) + `#panel` slimmed toward
   the proto-focus-card. Stages 2–3 deliberately out of scope (they carry sub-questions
   wanting the user's eye after stage 1 is felt).
7. **Memory saved** (completed) — `delegate-ui-exploration-to-agents`: offload browser
   screenshot-iterate loops to a background Agent-tool teammate; the rail exploration
   already used this pattern.

Plan document in play: `docs/plans/2026-07-04_journey-rail-stage1.md` (stage 1 only; its
own verification checklist is the acceptance bar).

## Verification Status

**Automated Verification:**
- [x] `npm test` → **76/76** on the current tree (tsc strict covers `web/`; re-run after
  the rail work landed).
- [x] Voice linter over both maps: 0 errors; 2 known warnings (singularity P1's
  semicolon-joined option labels — model-drafted content flagged as designed; expected
  output, not a regression).

**Manual Testing:**
- Status: light-register redesign — Complete (full UAP walk + singularity draft via
  chrome-devtools MCP, zero console errors; penciled→inked reveal, gaps, R3
  ghost-vs-solid, crumb/pop carryback all verified). **Journey-rail stage 1 — validate per
  the plan's checklist before building further**: the plan (§Verification) requires the
  full rail walk (banner promise → dots fill → waver/flagged emphasis → commit at the
  foot → reveal + carrying emphasis → singularity DRAFT banner) plus keyboard reach; the
  user should also *feel* the direction before stages 2–3 (that review gate is written
  into the plan's scope note). Dev server is NOT currently running — `npm run web`.

**IMPORTANT — uncommitted work in the tree** (user has not asked to commit it):
`web/index.html`, `web/scene.ts` (light register + rail stage 1, interleaved),
`content/singularity.ts` (shortLabels), `docs/Interaction-Design-2026-07.md` (§5.6 was
committed; §8.4 tail + §9.12 + §10 are not), `docs/THREADS.md`, plus untracked
`docs/plans/2026-07-04_journey-rail-stage1.md` and this handoff. Commit shapes when asked:
the light-register and rail diffs interleave in the same two web files, so a clean split
needs the revert/re-apply dance — pragmatic recommendation is two commits: (a) docs design
record (§8.4 tail, §9.12, §10, THREADS, plan doc), (b) the renderer work + singularity
shortLabels in one "light register + journey-rail stage 1" commit with a per-file body; a
single combined commit is also defensible.

## Critical References

1. `docs/THREADS.md` — start here; its last-updated block narrates all three same-day
   sessions. §1 item 5: linter shipped, **LLM seams are the register-order next build**.
2. `docs/Interaction-Design-2026-07.md` — **§10** (the dissolution design record; §10.4
   seam invitations define the seams' entry points; §10.6 staging), **§5.6** (linter
   record), §8.4 tail (light register), §9.12 (original capture, kept).
3. `docs/plans/2026-07-04_journey-rail-stage1.md` — stage-1 scope, contracts that must not
   budge, and the verification checklist that gates "done".

## Recent Changes

- `src/lint.ts` (new, committed) — rules: seal-vocabulary + padlocks (error),
  option-label-assertible (error), frame-negation, prosecutorial-vocabulary ("gap"
  deliberately exempt), double-barrel (clause-joiners/stacked-?/semicolons; prompts+labels
  only) — warnings. `lintNarration` for guide-voice strings; admission = validateMap +
  lintMap; I9 stays in the schema validator. Exported via `src/index.ts`.
- `test/lint.test.ts` (new, committed) — probe mechanics, planted-violation wiring fixture,
  both real maps (warnings via `t.diagnostic`), scripted Mirror walk linting all nine
  guide-policy `why` literals.
- `web/index.html` (uncommitted) — light-register token system ("surveyor's field sheet":
  cold paper `#EEF2F3`, ink `#1C2A33`, ultramarine/violet/petrol kind hues, **mulberry
  `#9C2E63` landings/credence**; serif prompts, mono annotations; pencil promise register,
  mulberry reveal, hatched + rubber-stamp DRAFT; penciled→inked node rules under
  `svg.revealed`; state-ring specificity overrides; `:focus-visible`; reduced motion) —
  plus the stage-1 chrome: `#register` banner and `#rail` CSS (collapsed ~56px spine,
  hover/focus-within expansion, one-line notches, coverage `.dotmark` emphasis classes
  `.waver`/`.flagged`/`.carrying`, sticky commit foot).
- `web/scene.ts` (uncommitted) — truncation removed from all panel surfaces (`targetLabel`
  max optional; full text everywhere; rule chips block); `wrapLabel` balanced 3–4 lines;
  question captions wrap; `shortOf` fallback 26→56; `RELATION_BAND` made disjoint (feeds
  −135…−45°, evidence 155…205°) fixing a label collision; legend dots shape-matched;
  chips/crumbs `role="button"` + delegated keydown; `REDUCED_MOTION`; plus stage-1
  `renderBanner()` / `renderRail()` per the plan (offers logic moved from `guideRail`,
  dedup + top-N kept; `rail-focus` wander act; commit moved to the rail foot; panel
  slimmed toward the focus card).
- `content/singularity.ts` (uncommitted) — draft-tier `shortLabel`s on P1–P5 (P4 reuses UAP
  B10's 'falsifiability bar' — same standardId, same name). Linted clean.
- `docs/Interaction-Design-2026-07.md` — §5.6 (committed); §8.4 redesign record, §9.12
  capture, §10 design record (uncommitted).
- `docs/THREADS.md` — §1 item 5 half-shipped (committed); §3 entries + §6 finding +
  last-updated narrating the day (uncommitted).

## Learnings

1. **CSS specificity vs the reveal**: `svg.revealed .node.position .shape` (0,3,1) silently
   out-ranks `.node.answered .shape` (0,2,1) — the answered/focus rings vanished
   post-commit until explicit `svg.revealed .node.answered/.focus-ring` overrides were
   added. Any future scene-state class needs the same treatment.
2. **Degree bands live on a circle**: feeds' −150° edge ≡ 210°, inside the old evidence arc
   [162,252] — an outcome and a fact could land on the same ray (user saw the overlap
   live). Bands must be checked mod 360 for disjointness (web/scene.ts RELATION_BAND).
3. **Every ellipsis came from one helper** (`trunc`): the panel fix was deleting call sites
   + letting chips wrap; the scene fix was authored shortLabels (content jurisdiction) +
   balanced wrapping (renderer jurisdiction).
4. **Linter heuristics need real-content calibration**: naive `\band\b` would flag "speed,
   distance, and acceleration"; the shipped double-barrel rule keys on clause-joining
   signals. "gap" is product vocabulary (§4.2 focus kind) and stays out of the
   prosecutorial list. Fact text is world-reporting voice — exempt from the prosecutorial
   scan; claims are user phrasings — seal-scan only.
5. **Guide narration is fully covered cheaply**: `guideOffers` emits exactly nine fixed
   `why` literals; one scripted walk exercises all five offer families (test/lint.test.ts).
6. **The seal's light-mode translation is pencil→ink**, and §10 extends it: pre-commit the
   rail echoes only the user's own visible inputs (reactions, wavering, stances) plus
   authored structure; credence-derived emphasis (sensitivity/"carrying") joins post-commit.
7. **§10.4 resolved this handoff's ordering question**: the seam-invitation offer family
   defines the LLM seams' UI entry points, so the seams build does not wait on dissolution
   stages 2–3.
8. **The delegation pattern works** (memory: delegate-ui-exploration-to-agents): the rail
   exploration ran with a strategist + background rail-builder fork; browser loops belong
   in background agents, one-off screenshots inline.
9. **Scene-label matching gotcha** (automation & tests): two-line tspans concatenate
   without spaces — strip ALL whitespace when matching node labels.

## Artifacts

- Committed this session: `c165145` (BYO doc round), `d5a5fd0` (prior handoff), `d7b6e60`
  (voice linter: src/lint.ts, test/lint.test.ts, src/index.ts, Interaction §5.6, THREADS).
- Uncommitted: `web/index.html`, `web/scene.ts`, `content/singularity.ts`,
  `docs/Interaction-Design-2026-07.md` (§8.4 tail, §9.12, §10), `docs/THREADS.md`,
  `docs/plans/2026-07-04_journey-rail-stage1.md` (untracked), this handoff.
- Memory: `delegate-ui-exploration-to-agents.md` (+ MEMORY.md index line).
- Prior handoff: `docs/handoffs/2026-07-04_13-52-27_scene-renderer-byo-inference-thread.md`.

## Action Items & Next Steps

1. **Validate journey-rail stage 1 in the browser** against the plan's checklist
   (`docs/plans/2026-07-04_journey-rail-stage1.md` §Verification) — `npm run web`, full UAP
   walk incl. waver/flagged emphasis and the commit foot, keyboard reach, zero console
   errors; the user should feel the direction before stages 2–3 are weighed. Run the loop
   in a background agent per memory.
2. **Commit the uncommitted rounds** when the user says so — split guidance in the
   Verification section above.
3. **Register-order build: the LLM seams** (Interaction §8.5, Platform §2.5 gates) — now
   unblocked: §10.4 defines the entry points (unrouted-dispute and want-more-accumulation
   invitations; acceptance is tier-specific per BYO doc). The voice linter is in place as
   the admission gate.
4. **Dissolution stages 2–3** (Interaction §10.6: ballot at forks, sector payloads, focus
   card + center-stage frames, reveal overlay) — deliberately unordered; want the user's
   reaction to stage 1 first. Open sub-questions listed at §10.6's tail (rail side, ballot
   geometry, rail density on large maps, reveal-dismissal move).
5. Smaller queued candidates: Suppose UI; session-log persistence (Platform §8.7, doubles
   as the BYO §5a research queue). Standing threads: renderer-embedded-copy linting, guide
   visited-memory (§10.3 sketches its resolution via the rail), answer-shape probe (§9.11),
   coherence probe (§9.10), confidence-gap formalization, B5b kind question.

## Other Notes

- **Environment**: Windows 11, PowerShell primary; `npm run web` → http://localhost:8137/
  (no dev server currently running; `npx tsc` alone refreshes dist for a running server).
  `npm test` is the only CI-grade verification (Windows-required glob form).
- **Light-register token system** lives in `web/index.html` `:root` — all scene/panel/rail
  colors are CSS vars; scene state classes (`answered`, `live`, `parked`, `focus-ring`,
  `front`, `revealed`) are the styling surface; `web/scene.ts` sets geometry/opacity only.
- **Stage-1 contracts that must not budge** (from the plan): typed moves through
  `dispatch()` only; `guideOffers` rank verbatim (dedup, never reorder); words-not-numbers;
  no seal words/padlocks; nothing credence-derived pre-commit; reduced motion; notches keep
  `role="button"` + `tabindex="0"`.
- **Voice-linter severity contract**: errors fail the build; warnings print every run until
  content is rephrased or a future waiver mechanism lands (user chose against waivers for
  now).
- THREADS.md is the session-start point per repo culture; the user counts on it being
  updated every design session (memory: maintain-threads-register).
