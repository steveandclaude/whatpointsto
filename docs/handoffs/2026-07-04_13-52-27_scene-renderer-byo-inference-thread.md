---
date: 2026-07-04T13:52:27-05:00
git_commit: 75a5fde65a3331283fd9fb44291eaca3f88ce65b
branch: main
topic: "Scene Renderer Shipped + BYO-Inference Thread Explored Handoff"
tags: [handoff, scene-renderer, session-engine, byo-inference, mcp, artifacts, voice-linter, answer-shape-probe]
status: complete
last_updated: 2026-07-04
type: handoff
---

# Handoff: Scene renderer shipped (Mirror end-to-end, old renderers retired); BYO-inference thread explored, verified, and captured; voice linter is next

## Task(s)

1. **Resume from prior handoff** (completed) — clean continuation of
   `docs/handoffs/2026-07-04_12-01-02_arc-a-session-engine-stances-content-v02.md`; state
   matched exactly (67/67 at `254de8b`).
2. **Scene renderer on the session engine** (completed, commits `b65a40c` prior-handoff add +
   `9815fa6`) — THREADS §1 item 4. `web/scene.ts` (~1000 lines) + rewritten `web/index.html`
   at `/`. Mirror end-to-end: arrival door → promise → guided focus walk → commit → relight
   reveal; Peruse toggle; Suppose UI deliberately deferred (engine support already shipped).
   `web/app.ts`, `web/spike.ts`, `web/spike.html` **deleted**. Browser-validated on the full
   UAP walk and the singularity draft (zero console errors).
3. **Answer-shape probe idea captured** (completed, in `9815fa6`) — user idea, recorded as an
   unweighed possibility per capture discipline: Interaction §9.11 + THREADS §3.
4. **BYO-inference design thread** (completed as exploration, commit `75a5fde` + **uncommitted
   final round**) — multi-round conversation: can users power the LLM seams with their own
   Claude subscriptions? Includes a web-research verification pass of platform mechanisms
   (July 2026 state). Consolidated into **`docs/BYO-Inference-2026-07.md`** (new doc);
   Platform §8.8 compressed to a pointer; THREADS §3 entry. **No direction chosen** — it is
   an OPEN thread with a user lean, not a locked decision.
5. **Voice linter** (planned/discussed, NOT started) — THREADS §1 item 5, the agreed next
   build. Mechanical design discussed in conversation (see Learnings 8) but no code exists.

No plan document; work is driven by `docs/THREADS.md` §1 per repo CLAUDE.md.

## Verification Status

**Automated Verification:**
- [x] `npm test` → **67/67** at `75a5fde` + uncommitted doc changes (tsc strict + node:test).
- [x] No lint/CI configured (nothing to fail).

**Manual Testing:**
- Status: Complete (this session, browser-driven via chrome-devtools MCP)
- Notes: Full UAP Mirror walk validated end-to-end at http://localhost:8137/: arrival
  (claim+strength) → promise copy → guide rail (B2 ranked top, matching the gate-weight
  finding) → all 11 forks answered → stance (suppose) + reaction on a fact → push/pop with
  structural carryback → commit → relight (bars invisible pre-commit, opacity checked) →
  direction gap, confidence gap, both tensions (T1/T2), contested edges (F3/F10), R3
  ghost-vs-solid, post-commit carryback with magnitude words, promises-abandoned notice,
  peruse contract (no answer chips), start-over, singularity draft map (DRAFT register,
  generic layout, no facts). Zero console errors/warnings.

**IMPORTANT — uncommitted work in the tree:** `docs/BYO-Inference-2026-07.md` (new),
`docs/Platform-Design-2026-07.md` (§8.8 compressed to pointer), `docs/THREADS.md` (BYO entry
updated to point at the new doc + last-updated line). User was asked "want it committed?" and
responded by invoking this handoff instead — **commit only when the user says so.**

## Critical References

1. `docs/THREADS.md` — start every session here. §1 items 1–4 shipped; **item 5 (voice
   linter → LLM seams) is next**; §3 gained answer-shape-probe + BYO-inference + guide
   visited-memory threads.
2. `docs/BYO-Inference-2026-07.md` (new) — the consolidated BYO thread: hard constraint,
   verified mechanisms w/ sources, three-tier candidate architecture, workbench sync
   mechanics (§5a), edges. Platform §8.8 and THREADS point here.
3. `docs/Interaction-Design-2026-07.md` — §8.4 shipped marker (scene renderer details);
   §9.11 (new, answer-shape probe); §5.4/§5.5 + PROTOCOL v1.2 are the voice-linter rule set.

## Recent Changes

- `web/scene.ts` (new) — the real renderer: session-driven state (`dispatch` →
  `reduceSession`), map-generic deterministic layout (`homeLayout`), relation-sector focus
  camera (`retarget`), frames for all 8 focus kinds, guide rail rendering `guideOffers` rank
  verbatim (dedups only current focus, web/scene.ts:~guideRail), carryback/notice strips,
  arrival door, commit bar, DRAFT register.
- `web/index.html` — rewritten: dark scene aesthetic, panel styles, promise/reveal registers,
  `#arrival[hidden]{display:none}` (the one browser bug found: display:flex beat the hidden
  attribute).
- `web/app.ts`, `web/spike.ts`, `web/spike.html` — deleted (spike-disposability tension
  retired as designed, THREADS §7).
- `scripts/serve.mjs:2`, `CLAUDE.md` commands section — updated references.
- `docs/Platform-Design-2026-07.md` §8.8 — now a compact pointer to the BYO doc (uncommitted).
- `docs/BYO-Inference-2026-07.md` — new consolidated design doc (uncommitted).
- `docs/THREADS.md` — item 4 shipped; retired tension; 2 findings; 3 new §3 threads;
  BYO entry → doc pointer (partly committed in `75a5fde`, final round uncommitted).

## Learnings

1. **The seal held with zero renderer effort** (predicted, now confirmed): bars/gaps/
   sensitivity render behind one `revealed` check and the engine constructs `credenceShift`
   only post-commit — nothing credence-shaped existed to leak. THREADS §6.
2. **Guide policy v0 gaps found by building the renderer**: (a) it never offers rule frames —
   R3 ghost-vs-solid was unreachable until the post-commit overview grew a "what moved
   beneath you" chip row (renderer navigation, not policy change); (b) no visited-memory —
   payoff frames re-offer forever; renderer dedups only the on-screen frame (new §3 thread).
3. **Scene-label matching gotcha**: node labels are two-line-wrapped tspans; textContent
   concatenates without the space at the cut — normalize whitespace when matching (bit the
   browser-automation scripts; would bite tests too).
4. **BYO hard constraint (verified with sources, in the BYO doc)**: subscriptions spend only
   inside Anthropic surfaces; no "Sign in with Claude" exists; OAuth-token borrowing is
   banned AND server-side enforced (~Jan–Feb 2026).
5. **The surprise mechanism (verified)**: published Claude artifacts embed on external
   domains (allowed-domains + iframe snippet) with `window.claude.complete` billed to the
   *viewer's* subscription — completion-only, no tools/web-search. So completion-shaped seams
   can run on whatpoints.to viewer-billed; **research cannot** (must live in claude.ai chat
   via connector, or Claude Code). MCP Apps (UI panels in chat) ratified 2026-01-26, live in
   Claude web/desktop + ChatGPT rolling out, but beta-grade; it is UI-in-chat, NOT
   viewer-billed server inference.
6. **Workbench sync insight (BYO doc §5a)**: the move log is the agent-sync protocol — agent
   keeps a cursor, pulls deltas at turn boundaries ("before YOU act, pull the delta" — never
   blocks the user); the delta digest is carryback re-aimed at the agent; want-more/dispute
   stances ARE the research queue; agent writes back only through draft-tier artifacts +
   confirm-gated proposal inbox.
7. **Capture discipline applied twice**: answer-shape probe (Interaction §9.11) and BYO lean
   recorded as possibilities/leans, never directions. The register phrasing pattern from
   §9.10 is the calibration reference.
8. **Voice linter mechanics (discussed, not yet designed in a doc)**: pure
   `lintMap(map) → LintFinding[]`, runs (a) in `npm test` over content/ and (b) at artifact
   admission — once per artifact, never intercepting LLM calls (lexical bans fail on live
   narration but work on finished artifacts — RESULTS §6). Two tiers: mechanical errors
   (seal-word/padlock tokens, non-assertible option labels, missing authorities) and
   heuristic warnings flagged for human review (frame-ban negation patterns, double-barrel
   conjunction signals).

## Artifacts

- `web/scene.ts`, `web/index.html` — the shipped scene renderer
- `docs/BYO-Inference-2026-07.md` — new design doc (uncommitted)
- `docs/THREADS.md` — updated register
- `docs/Interaction-Design-2026-07.md` — §8.4 shipped marker, §9.11 new
- `docs/Platform-Design-2026-07.md` — §8.8 → pointer (uncommitted)
- `CLAUDE.md`, `scripts/serve.mjs` — reference updates
- Commits this session: `b65a40c` (prior handoff doc), `9815fa6` (scene renderer),
  `75a5fde` (BYO + probe captures, round 1)
- Prior handoff: `docs/handoffs/2026-07-04_12-01-02_arc-a-session-engine-stances-content-v02.md`

## Action Items & Next Steps

1. **Commit the uncommitted BYO-doc round** when the user says so (new doc + §8.8 compression
   + THREADS pointer). Message style: topic line + per-file body.
2. **Voice linter** (THREADS §1 item 5, user affirmed "next" twice) — `src/lint.ts` (or
   similar) + test suite, wired into `npm test` over both maps. Rule set sources:
   Interaction §5.4 (single-proposition), §5.5 (seal-word/padlock token ban),
   PROTOCOL v1.2 (frame ban — heuristic/warning tier), Schema I9 (authorities; already
   enforced). Design decision to make early: severity model (error vs warning) and whether
   warnings fail `npm test` or print. It is now triply load-bearing: factory QA + agent
   research gate + BYO flywheel admission (BYO doc §7).
3. **Then LLM seams** (Interaction §8.5) — after the linter, per the register order.
4. Smaller queued candidates if priorities shift: Suppose UI on the scene renderer (engine
   ready; mode chip + watermark + drop-notice rendering exists); session-log persistence
   (Platform §8.7 — doubles as the workbench research queue, BYO doc §5a).
5. Standing open threads: answer-shape probe (§9.11, unweighed), guide visited-memory
   (THREADS §3), B5b kind question, coherence probe (§9.10, unweighed), reflex-relation
   ghost sector.

## Other Notes

- **Environment**: Windows 11, PowerShell primary; `npm run web` → http://localhost:8137/
  (a dev server may still be running in the background from this session — harmless;
  restart with `npm run web` after builds). `npm test` is the only CI-grade verification
  (Windows-required glob form in package.json).
- **Scene renderer invariants**: every interaction dispatches a typed Move; SessionError is
  dev-facing (console.error only, never surfaced); the guide rail must never reorder offers
  (curation risk) — dedup-current-focus + slice(0,4) only; `createSession(map,'mirror',…)`
  is the renderer's provisional §9.4 answer (question stays open, noted in THREADS).
- **BYO thread status discipline**: it is OPEN with a user lean ("ideal = fully in-browser";
  research requirement pushes tier-3 workbench), NOT a decision. If a session starts building
  connector/skill/artifact-embed work, that's a register change — update THREADS §1 first.
- **Verify-before-building list for BYO** (BYO doc §6): artifact CSP details,
  `window.claude.complete` rate limits, shared-store write semantics, MCP Apps iframe
  network/persistence rules — all flagged unverified as of 2026-07-04.
- The user counts on THREADS.md maintenance every design session (memory:
  maintain-threads-register). This session added three §3 threads, two §6 findings, one
  §7 retirement — pattern to continue.
