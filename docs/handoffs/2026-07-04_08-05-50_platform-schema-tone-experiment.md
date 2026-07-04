---
date: 2026-07-04T08:05:50-05:00
git_commit: a98ac1491607aa7dfd1b62651baa642419bb12f0
branch: main
topic: "Belief-Mapping Platform: Founding Docs → Tone Experiment → Schema v0 → UAP Port Handoff"
tags: [handoff, schema, reducer, tone-experiment, uap-port, platform-design]
status: complete
last_updated: 2026-07-04
type: handoff
---

# Handoff: platform bootstrapped — design decisions locked, tone risk retired, Schema v0 + UAP port shipped

## Task(s)

This session bootstrapped the `whatpointsto` project from a seed document to working, tested code. All tasks below are **completed**; the last section lists discussed-but-not-started work.

1. **Project bootstrap** (completed) — imported founding docs (seed, UAP handoff, 4 research PDFs) into `docs/`, git init, first commits.
2. **Architecture design conversation → design doc** (completed) — divergent build directions analyzed; factory architecture chosen; belief-first front door; captured in `docs/Platform-Design-2026-07.md`.
3. **Tone experiment + retest** (completed) — the seed's "gotcha machine" fatal risk, tested via multi-agent harness. Verdict GO. Protocol iterated v1 → v1.1 → v1.2.
4. **Schema v0** (completed) — TypeScript types + invariant validator + pure cascade reducer + doc. 11 smoke tests.
5. **UAP conformance port** (completed) — full handoff §6 library as `content/uap.ts`, 12 conformance tests, port findings doc.
6. **Dynamic generation / synthetic persona discussion** (discussed only, not started) — see Action Items.

No formal plan document exists; work was driven conversationally. The design doc (§8) carries the open-question list that functions as the backlog.

## Verification Status

**Automated Verification:**
- [x] All automated checks pass: `npm test` → 23/23 (tsc strict build + node --test)
- [x] No lint/CI configured yet (nothing to fail)
- [x] Working tree clean at commit `a98ac14`

**Manual Testing:**
- Status: Complete for this session's scope
- Notes: Tone experiment transcripts were manually driven and adversarially judged (4 conversations, 4 Fable-judge verdicts, all "fairly treated"). No UI exists yet, so nothing else to manually test.

## Critical References

1. `docs/Platform-Design-2026-07.md` — the decision record; §2 decisions are user-affirmed and locked (factory architecture, belief-first arrival, claim+strength pair, menu-surface/LLM-backstage interface §2.5). Read §2 before changing anything structural.
2. `docs/Schema-v0.md` + `src/schema.ts` — schema doc explicitly defers to code as source of truth.
3. `docs/UAP-Belief-Map-Handoff.md` — authoritative UAP *content* spec (its build recommendations are superseded by the platform frame; content still governs).

## Recent Changes

All committed on `main` (linear history, 7 commits, `f6ce919`..`a98ac14`):

- `src/schema.ts` — full type system; positions typed by remediation semantics (world-belief / epistemic-standard / value); `validateMap` with invariants I0–I9 (I1: facts may bear only on world-beliefs — values/standards are fact-proof, as a validation *error*).
- `src/reducer.ts` — pure engine: fact activation → cost-derived log-odds priors → edges → rules → per-question softmax. Derived analyses as re-runs: `counterfactual`, `sensitivity` (total-variation ranking), `confidenceGap` (`supportedStrength` at `src/reducer.ts:214` is a flagged v0 heuristic).
- `content/uap.ts` — the whole handoff §6 library: 10 positions, 13 facts, 12 outcomes over 2 questions, rules R1–R5 (R3 as `redirect` with naive ghost + calibrated update), tensions T1–T2. Magnitudes provisional, directions per handoff.
- `test/smoke.test.ts`, `test/uap.conformance.test.ts` — 23 tests incl. the R3 mechanical assertion (B6=compromised leaves A/H5 raw scores at baseline; lift lands on C/E).
- `experiments/tone/` — PROTOCOL.md (now v1.2), EXPERIMENT.md, RESULTS.md, 4 transcripts.
- `docs/Platform-Design-2026-07.md` — added §2.5 (interface decision) mid-session; §6/§7/§8 updated with experiment outcomes.
- `docs/UAP-Port-Notes.md`, `docs/Schema-v0.md` — new.

## Learnings

1. **The tone failure mode is inverted from the expected one.** The feared Socratic-gotcha never appeared across 4 adversarially-judged conversations; every confirmed breach was *over-accommodation* — false balance paid out under provocation, fabrication inside a steelman, courtroom vocabulary under negation ("not a point scored"). See `experiments/tone/RESULTS.md` §3.
2. **Lexical bans fail; frame bans work.** The v1.1 banned-word list was defeated by word-swapping while keeping the frame (RESULTS §6). The v1.2 rule is "never describe a map action by what it is not." Judge's diagnostic worth keeping: "if a note needs a not-a-score disclaimer, the note is score-shaped."
3. **The schema audits content.** Invariant I1 caught a real conflation in the human-written handoff (F7 corrects a *misapplication* of B3's standard, not the standard) — see `docs/UAP-Port-Notes.md` §2. Model-drafted maps will get the same gauntlet.
4. **Fact-vs-rule double-dip convention** (port notes §3): when a fact and a cascade rule encode the same insight (F5/R3, F12/R5), the rule moves credence; the fact is a display-only evidence card. Carry into the factory pipeline as an authoring rule.
5. **4 of 10 UAP positions are epistemic standards** (B3, B4, B6, B10 with stable `standardId`s) — the cross-topic fingerprint has material from map one.
6. **Windows/node quirks:** `node --test dist/test/` (trailing-slash dir form) fails on this machine; the glob form in package.json works. `@types/node` was needed for node:test/node:assert types.
7. **User context:** careful reasoner, direct, wants honest pushback not flattery ("I do not think all my ideas are necessarily good"). Audience for the product = self-selected rationality-aspirants (seed commitment 3) — user explicitly re-anchored on this; comfort is not a goal; anti-appeasement matters more than de-escalation.

## Artifacts

- `docs/Belief-Map-Seed-Document.md` — the trunk (imported)
- `docs/UAP-Belief-Map-Handoff.md` — UAP v1 content spec (imported)
- `docs/research/` — 4 research PDFs backing the fact library (imported)
- `docs/Platform-Design-2026-07.md` — decision record (§2 locked decisions, §8 open questions/backlog)
- `docs/Schema-v0.md` — schema explainer (code wins on conflict)
- `docs/UAP-Port-Notes.md` — conformance findings + authoring conventions
- `experiments/tone/PROTOCOL.md` — regress-guide prompt v1.2 (the mediator-seam guardrail)
- `experiments/tone/EXPERIMENT.md`, `experiments/tone/RESULTS.md`, `experiments/tone/transcripts/T1–T4`
- `src/schema.ts`, `src/reducer.ts`, `src/index.ts`, `content/uap.ts`, `test/*.test.ts`
- `package.json` / `package-lock.json` / `tsconfig.json` (typescript + @types/node only, installed `--ignore-scripts`)

## Action Items & Next Steps

In the order discussed with the user:

1. **Singularity thin scaffold** (conformance test #2, agreed next step) — `forecast` topicType, `scenario` outcomes, deliberately *empty fact family*; proves the second topic type and draft-mode degradation. Cheap; completes the "rule of two" before UI work biases the schema.
2. **First renderer** — layered map over `reduce()` output so the UAP map is clickable and R3's ghost-vs-solid is visible. Remember design §2.5: menu/map surface, LLM backstage, every user-facing string is a typed lintable artifact; and the seal (§5): no running credence display until position answers are committed.
3. **Dynamic generation experiment** (proposed at session end, user hadn't confirmed) — have Fable draft a full schema-constrained `BeliefMap` for an unmapped belief (candidate: seed oils), then run a *diverse* synthetic-persona panel + judge pass against it; the survival rate measures draft-tier quality. Key design stance from the discussion: personas maximize **diversity around** the expected user (guardrail-1 test operationalized), never similarity to them — user-similarity is only for demand-driven depth (which branches to build deepest). Also proposed: a **move library** (sociological bill, conflicted-checker redirect, conjunction-cost, absence-symmetry) so generation instantiates engineered insight moments instead of inventing them; harvest future human corrections into it.
4. **Open question 5 (confidence gap formalization)** — `supportedStrength` thresholds are placeholder; isolated in one function.
5. **Voice linter** — mechanize PROTOCOL v1.2's frame ban as a check over the schema's copy fields (whyCopy, lessonCopy, tension.copy, prompts); design §2.5 expects this as a factory QA stage.

## Other Notes

- **Environment:** Windows 11, PowerShell primary; git warns LF→CRLF (harmless). Node v22.19.0.
- **Multi-agent harness pattern that worked** (reusable for the persona panel): spawn blind guide agents via Agent tool with protocol inline; relay persona turns via SendMessage; instruct agents to reply via SendMessage to "main" (plain output doesn't reach the orchestrator — this bit us once); judge with `model: "fable"` agents given only transcript + adversarial rubric.
- **Naming lore:** `whatpointsto` = the regress question (intake-shaped); the original domain idea `situationalawareness.to` is factory-shaped; resolution recorded in design doc §2.4 — factory as supply, belief as query language.
- The user model-switched the session to Fable 5 and asked for Fable judges specifically; judge quality was high (each found things I'd missed).
- No CLAUDE.md exists in the repo yet — worth creating when the build settles (npm test is the only verification command so far).
