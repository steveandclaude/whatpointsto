---
date: 2026-07-04T10:34:08-05:00
git_commit: be072236ce275232bc8b49347732029fdba53204
branch: main
topic: "Singularity Scaffold → First Renderer → Focus-Graph Spike → Interaction Design + Threads Register Handoff"
tags: [handoff, renderer, spike, interaction-design, threads-register, session-engine, stances, trust-layer]
status: complete
last_updated: 2026-07-04
type: handoff
---

# Handoff: rule of two closed, two renderers built, interaction layer designed, threads register installed — next arc chosen (session engine)

## Task(s)

All of this session's tasks are **completed**; the next arc is **chosen but not started**.

1. **Resume from prior handoff** (completed) — verified clean continuation of
   `docs/handoffs/2026-07-04_08-05-50_platform-schema-tone-experiment.md`; 23/23 tests passed.
2. **Confidence-gap walkthrough** (completed) — user asked twice for explanation of backlog
   item 4; ran a live demo against the real map. Produced two registered findings (see
   Learnings 1–2).
3. **Singularity thin scaffold — conformance test #2** (completed, commit `406115d`) —
   forecast/scenario topic, empty fact family, all model-drafted; 12 new tests; design doc §8.1
   marked resolved. Zero schema changes needed = rule of two closed.
4. **First renderer** (completed, commit `7f23809`) — `web/app.ts` + `scripts/serve.mjs`
   (`npm run web`, port 8137). Arrival→seal→blind elicitation→payoff; R3 ghost-vs-solid;
   draft register; verified end-to-end in Chrome on both maps.
5. **Focus-graph vision → throwaway spike** (completed, preserved in commit `be07223`) —
   user found renderer overwhelming, described a focus+context node-graph model. Built
   `web/spike.html`/`web/spike.ts` (dark constellation scene over the UAP map) and iterated
   through **five rounds of live user feedback** (see Learnings 5).
6. **Interaction design capture** (completed, commit `be07223`) —
   `docs/Interaction-Design-2026-07.md`: modes, focus engine, move grammar, stances, fact
   origin vs review tier, trust layer, authoring rules, build order.
7. **Organization system** (completed, same commit) — `docs/THREADS.md` living register (user
   explicitly charged me with organizing collaborative thinking; binding rule: *no thread lives
   only in chat*), repo `CLAUDE.md` bootstrap, and a persistent memory entry
   (`maintain-threads-register`) so future sessions inherit the practice.
8. **Next arc chosen — Arc A** (planned, not started): session engine + engine v0.2 + content
   fixes. See Action Items.

No formal plan document; work is driven conversationally with `docs/THREADS.md` §1 as the
build-focus anchor.

## Verification Status

**Automated Verification:**
- [x] `npm test` → **35/35** (tsc strict + node:test; 11 smoke, 12 UAP conformance, 12
  singularity conformance) at commit `be07223`, working tree clean.
- [x] No lint/CI configured (nothing to fail).

**Manual Testing:**
- Status: Complete for this session's scope
- Notes: First renderer driven end-to-end in Chrome via chrome-devtools MCP (UAP full flow with
  hand-verified gap numbers; singularity draft register; what-if view). Spike driven through
  focus → unpack → answer → dispute-routing → double pop with carryback. Screenshots in session
  scratchpad only (disposable).

## Critical References

1. `docs/THREADS.md` — **start every session here** (per repo CLAUDE.md). §1 = current build
   focus (Arc A). §4 = countervailing tensions kept alive on purpose.
2. `docs/Interaction-Design-2026-07.md` — the new layer's design: §3 modes, §4 focus engine,
   §5 copy (assumption face, knowledge checks, authoring rules), §6 stances + trust layer,
   §7 session layer, **§8 build order (= Arc A spec)**, §9 open questions.
3. `docs/Platform-Design-2026-07.md` §2 — locked decisions (unchanged today; §2.5 is the
   parent of the interaction doc).

## Recent Changes

Five commits today, `99091ce`..`be07223`, all on `main`:

- `content/singularity.ts` — 5 positions (P4 reuses `standardId: 'falsifiability-requirement'`
  from UAP B10 — first cross-map fingerprint pair), 4 scenario outcomes, `facts: []`, rules
  R1 (conjunction reveal) / R2 (standard prices both extremes), 2 tensions.
- `test/singularity.conformance.test.ts` — incl. the provenance-blind assertion (promoting all
  nodes to human-reviewed yields identical scores) — design §2.3 constraint 4 is now a
  regression guard.
- `web/app.ts` (~530 lines) — first renderer; seal discipline (no credence pre-commit);
  bars/words only, no numerals; `web/index.html` CSS incl. draft register.
- `scripts/serve.mjs` — dep-free static server; `npm run web`; `tsconfig.json` gained DOM lib +
  `web/**` include; `package.json` gained `web` script.
- `web/spike.ts` (~600 lines, THROWAWAY by design) — focus+context scene: rAF-lerp camera,
  relation-sectored ring, digression stack with pinned promises + tethers, carryback diffing,
  `neededAssumption()` (assumption-face derivation from edge/rule directions — the pattern the
  real renderer should lift), dispute→`bearsOn` routing.
- `docs/Interaction-Design-2026-07.md`, `docs/THREADS.md`, `CLAUDE.md` — as above.
- `docs/Platform-Design-2026-07.md` §8.1 — singularity resolution + findings appended.

## Learnings

1. **`supportedStrength` is dishonest in two provable ways** (registered in THREADS §3):
   softmax credence depends on outcome count (7-outcome uniform = 14.3% "unsupported"; a
   2-outcome uniform = 50% "think" for free), and the full-skeptic ceiling on UAP H1 is
   **48.2%** — "confident"/"certain" are unreachable with current magnitudes. Fix direction:
   normalize by baseline/achievable range, possibly cap by sensitivity fragility.
   `src/reducer.ts:246`.
2. **The pure reducer keeps paying**: what-if views, counterfactual landings, and the
   provenance-blind test were each a few lines because every analysis is a re-run. Session
   reducer should copy this shape.
3. **Every UI demand so far resolved to a *derivable rendering*, not new mechanics** —
   assumption face from edge directions, relation sectors from node kinds, held-vs-needed from
   answers×edges. The genuinely new layers are exactly two: session (moves/stances as inputs)
   and copy tier (faces, shortLabels, primers).
4. **Spike technique**: chrome-devtools a11y snapshot can't click SVG shapes (labels have
   `pointer-events:none`; uids go stale on innerHTML re-render). Use `evaluate_script` with
   dispatched MouseEvents (`window.__clickNode/__clickChip` helpers in the spike). Windows ESM
   scratch scripts need `file:///C:/...` import URLs.
5. **The five feedback rounds** (all captured in Interaction doc): (a) no shorthand/IDs on the
   user surface + knowledge-check/primer idea; (b) relation clarity beats web overview —
   sectored focus layout; (c) B5 is double-barreled → single-proposition authoring rule;
   (d) "rests on" must show assumptions not questions; no probabilities on that surface — load
   words instead; (e) fact origin ≠ review tier, graded trust stances, and modes
   (peruse/mirror/suppose/contribute).
6. **User working style** (also in persistent memory): rapid live feedback against running
   artifacts; explicitly charged me with organizing the collaborative thinking —
   **update `docs/THREADS.md` before ending any design session**; commits happen when the user
   says so (they did, five times today).
7. Cosmetic: the "Shell cwd was reset" notice every command is a case-mismatch
   (`Projects` vs `projects`) in the harness path comparison — harmless.

## Artifacts

- `docs/THREADS.md` — living register (new; binding maintenance rule in header)
- `docs/Interaction-Design-2026-07.md` — interaction layer design (new)
- `CLAUDE.md` — repo bootstrap: reading order, conventions, commands (new)
- `docs/Platform-Design-2026-07.md` — §8.1 resolved (edited)
- `content/singularity.ts`, `test/singularity.conformance.test.ts` (new)
- `web/app.ts`, `web/index.html`, `scripts/serve.mjs` (new; first renderer)
- `web/spike.html`, `web/spike.ts` (new; throwaway — provenance for interaction doc findings)
- Memory: `~/.claude/projects/C--Users-steph-projects-whatpointsto/memory/maintain-threads-register.md`
- Prior handoff: `docs/handoffs/2026-07-04_08-05-50_platform-schema-tone-experiment.md`

## Action Items & Next Steps

**Arc A (user-chosen, next session's work) — spec lives in Interaction-Design §8 items 1–3:**

1. **Session engine** — `src/session.ts`: typed moves (`focus/push/pop/expand/presentFact/
   react/stance/answer/knowledgeCheck/recordThought/mode-switch`), `SessionState`, pure
   `(SessionState, Move) → SessionState` reducer, carryback semantics made exact, mode
   contracts as data (§3 table), deterministic guide policy v0 (rank candidate moves from
   unanswered gates / sensitivity / cost), node:test suite. Session = move log (replay,
   demand signals, longitudinal unit).
2. **Engine v0.2** — `reduce(map, answers, factStances?)`: stances
   `accept/suppose/want-more/dispute` gate fact-edge participation; suppositions surfaced in
   `ReduceResult` (payoff: "leans on N suppositions — see it without them"). Keep pure; keep
   provenance-blind test green; add stance tests.
3. **Content/schema v0.2** — decompose B5 into two single-proposition positions (edges split;
   update conformance tests + inventory counts deliberately); add authored `shortLabel` field;
   restructure `sources` to `{authority, citation?, retrievedAt?}` on UAP facts (trust-layer
   prerequisite). Schema-v0.md notes code wins — update doc after.
4. Then (later arcs, in register order): Mirror-mode scene renderer on the session engine
   (replaces `web/app.ts` wall AND the spike; lift `neededAssumption()` and relation sectors
   from the spike); voice linter; LLM seams last.
5. Standing open threads live in THREADS §3 — notably the dynamic-generation experiment
   (persona-diversity stance recorded there) and the reflex-relation ghost sector
   (Interaction §9.1, user hasn't weighed in yet).

## Other Notes

- **Environment**: Windows 11, PowerShell primary; Node v22.19.0; port 8137 for `npm run web`
  (a background server from this session may still be running — disposable).
- **Two renderers coexist on purpose**: `web/app.ts` (committed, proves engine end-to-end,
  becomes Mirror's payoff-phase reference) and `web/spike.*` (throwaway, do NOT harden — its
  job was findings, which are captured; THREADS §4 records the disposability tension).
- The user model-switched to Fable 5 with max effort mid-session for the interaction design
  work; judge/experiment work in this repo has used Fable agents specifically.
- Repo CLAUDE.md now exists — the "create when build settles" note from the prior handoff is
  resolved.
