# THREADS — the living register of our collaborative thinking

> **What this is:** the single index of every design thread — decided, building, exploring,
> countervailing, parked — with one line each and a pointer to where it's actually documented.
> Decision *content* lives in the decision docs; this file only tracks existence, status, and
> location, so nothing gets lost and build focus stays explicit.
>
> **Maintenance rule (binding):** any session that touches design updates this file before it
> ends. New ideas raised in conversation land here the same session — **no thread lives only in
> chat.** Threads are never deleted: they move to *Decided* or *Retired* with a pointer.
>
> Statuses: `LOCKED` (user-affirmed decision) · `BUILD` (current focus) · `OPEN` (design thread,
> complementary) · `TENSION` (countervailing pair, kept alive on purpose) · `PARKED` (deliberate,
> revisit condition noted) · `RETIRED` (dead, with cause).

_Last updated: 2026-07-04 (fifth update today — earlier batches, all committed: voice
linter; light-register redesign; §10 dissolution design; rail stage 1 built by a delegated
fork. This batch: **shipped online** — repo public, GitHub Pages auto-deploy on push,
https://steveandclaude.github.io/whatpointsto/ — and the first remote walk-through
immediately mined a new thread: the **generative journey** (rules, not scripts) — probe
beats as the seal miniaturized; R1 drawn-by-walking disclosure (blank beyond the thread);
R2 fade-horizon rail, superseding stage 1's census dots; R3 proposed (readiness words;
commit lifts the fog); LLM as bounded sequencer toward named states. Captured in new
Interaction §11. Sixth: J1+J2 shipped by a delegated fork — disclosure fog, trail +
fade-horizon rail, readiness words, fog-lift at commit; 88/88; four renderer/engine
findings in §6; R3's ratification is the user's phone walk)._

---

## 1. Current build focus

The agreed next arc (Interaction-Design §8):

1. `BUILD` **Session engine** — **shipped 2026-07-04**: `src/session.ts` (12 typed moves incl.
   the discovered `commit`; pure reducer; exact carryback; Suppose sandbox; mode contracts as
   data; guide policy v0) + `test/session.test.ts` (55/55 with the map suites). The decisions
   the reducer forced are recorded in Interaction-Design §7.1.
2. `BUILD` **Engine v0.2** — **shipped 2026-07-04**: `reduce(map, answers, factStances?, opts?)`;
   `ReduceResult.suppositions` + `.parked`; stances threaded through counterfactual/sensitivity
   and the session engine's carryback + guide policy. Exactness notes in Interaction §6.2.
   Trust layer rides this for free (Interaction §6.3).
3. `BUILD` **Content fixes** — **shipped 2026-07-04**: B5 → B5a/B5b with joint weights
   preserved as sums (UAP-Port-Notes §6); authored `shortLabel`s on all UAP positions/facts;
   `FactSource {authority, citation?, retrievedAt?}` + `origin` in schema v0.2 (interim:
   authorities = the project research artifacts; the real-world taxonomy is the trust-layer
   pass). Conformance suite deliberately updated — 11 positions, 67/67.
4. `BUILD` **Scene renderer on the session engine** — **shipped 2026-07-04**: `web/scene.ts` +
   `web/index.html` at `/`. Mirror end-to-end (arrival door → promise → guided focus walk →
   commit → relight reveal with gap/tension/contested/rule frames) + a Peruse toggle; every
   interaction dispatches a typed move; guide rail renders `guideOffers` rank verbatim (renderer
   only dedups the frame already on screen). Suppose UI not yet built (engine support shipped).
   `web/app.ts` and the spike are deleted; the map-generic deterministic layout replaced the
   spike's UAP hardcodes. Browser-validated on UAP (full walk) and the singularity draft.
5. `BUILD` **Voice linter, then LLM seams** — **linter shipped 2026-07-04**: `src/lint.ts`,
   pure `lintMap` + `lintNarration`; errors (seal vocabulary, non-assertible option labels)
   fail `npm test`, heuristic warnings (frame negation, prosecutorial vocabulary,
   double-barrel signals) print for human review; `test/lint.test.ts` covers rule mechanics,
   field wiring, both maps, and every guide-policy `why` string (76/76 with all suites).
   Severity model + scope rulings recorded in Interaction §5.6; it is the admission gate
   every BYO tier needs (BYO doc §7). **Next: the LLM seams** per Platform §2.5 gates
   (Interaction §8.5).

## 2. Decided & locked

- `LOCKED` Factory architecture; UAP is a data file — Platform-Design §2.1–2.2
- `LOCKED` Belief-first universal front door; router as core v1; claims index maps — §2.4
- `LOCKED` Menu surface; LLM backstage as creator/mediator; never an open channel — §2.5
- `LOCKED` Arrival pair = claim + strength; words-not-numbers everywhere — §2.6, §3–4
- `LOCKED` Pre-registration seal (structure may show pre-commit; credence never) — §5; Interaction §4.1
- `LOCKED` Schema v0 shape: remediation-typed positions; standards first-class with stable ids;
  facts bear only on world-beliefs (I1); pure provenance-blind reducer — Schema-v0.md, src/schema.ts
- `LOCKED` Rule of two satisfied: forecast/scenario expressed with zero schema changes — Platform §8.1
- `LOCKED` Tone: frame ban (PROTOCOL v1.2); observed failure mode is over-accommodation, not
  gotcha — experiments/tone/RESULTS §3
- `LOCKED` Interaction layer: modes; focus engine with relation sectors + assumption face;
  structural digression stack; session = log of typed moves — Interaction-Design §3–§7
- `LOCKED` Backstage rule ×3: weights, generation, navigation — Platform §2.5; Interaction §2
- `LOCKED` Authoring conventions: one insight one owner (fact-vs-rule double-dip;
  position-vs-trust-profile); single-barreled prompts; option labels are assertible
  propositions — UAP-Port-Notes §3; Interaction §5.4, §6.3
- `LOCKED` "Seal" is backstage vocabulary — never a user-facing word (custody language invites
  the gotcha frame); the surface speaks promise ("set it aside — we'll come back to this") and
  reveal ("where you land appears after you commit") — Interaction §5.5

## 3. Open design threads (complementary)

- `OPEN` **Trust layer mechanics** — authority taxonomy authoring + stable class ids;
  trust-ladder honesty; may-the-profile-suggest-on-contested-edges — Interaction §6.3, §9.7–9.9
- `OPEN` **Knowledge checks & primers** — authoring pipeline (factory vs on-demand);
  known-entity session state — Interaction §5.3, §9.3
- `OPEN` **Reflex-relation ghost sector** — render naive-redirect adjacency as "commonly thought
  to rest on — the map disagrees" — Interaction §9.1 — delivery vehicle candidate: the
  generative journey (Interaction §11)
- `OPEN` **Load language** — magnitude → load-bearing/supporting/background words; needs
  relative-not-absolute honesty — Interaction §5.2, §9.2
- `OPEN` **Confidence-gap formalization** — `supportedStrength` thresholds are a flagged fake;
  finding: full-skeptic ceiling on H1 is ~48% in a 7-outcome question, so either magnitudes are
  timid or supported-confidence must normalize by achievable range — Platform §8.5;
  src/reducer.ts:240 banner; finding from 2026-07-04 session (confidence-gap demo)
- `OPEN` **BYO inference** — run the LLM seams on users' own Claude subscriptions, not
  platform-paid inference. Verified 2026-07-04: viewer-billed artifact embeds reach even our
  own domain (completion seams only); research must live where tools live (claude.ai chat via
  connector, or Claude Code beside the app — where want-more/dispute stances ARE the research
  queue). Candidate three-tier architecture + cache-and-review flywheel + edges consolidated
  in **docs/BYO-Inference-2026-07.md** (Platform §8.8 now points there). No direction chosen;
  build order unchanged — the voice linter is every tier's admission gate
- `OPEN` **Router implementation** — belief → (map, position) match quality bar; partial-match
  rendering — Platform §8.2
- `OPEN` **Strength vocabulary** — explicit "nothing could change my mind" rung? — Platform §8.4
- `OPEN` **Draft register completion** — spike validated the DRAFT scene register + unresearched
  layer; `wouldNeedChecking` copy field candidate so drafts can say *what* a research pass would
  check — Platform §8.1(e), §8.3
- `OPEN` **Dynamic generation experiment** — Fable drafts a schema-constrained map (candidate:
  seed oils); *diversity-around-expected-user* synthetic persona panel + adversarial judges;
  survival rate = draft-tier quality metric; the **move library** (engineered insight moves the
  generator instantiates; harvest human corrections into it) — currently documented only in
  handoff 2026-07-04 §Action-3; needs a design doc section when picked up
- `OPEN` **Sociological bill generator** — seed §12.6; candidate implementation found: invert
  the trust profile — collect authority-classes a landing requires to be wrong — Interaction §6.3
- `OPEN` **Longitudinal metric & persistence** — strength/trust-word drift across snapshots;
  move log is the persistence unit; blocked behind privacy gate (seed §12.3) — Platform §8.7;
  Interaction §9.5
- `OPEN` **Coherence probe / entailment reveal (idea, unweighed)** — recorded as a possibility,
  not a direction: prompt seemingly-unrelated forks whose joint grant would commit the user to
  derived riders, offered back as forks ("what do you think of Z?"). Discussion notes and
  would-be constraints in Interaction §9.10 (raised 2026-07-04) — delivery vehicle
  candidate: the generative journey's left-field probes (Interaction §11)
- `OPEN` **Answer-shape probe / keeper-shape refinement (idea, unweighed)** — recorded as a
  possibility, not a direction: an answer is often given against an implicit shape of the
  proposition ("secrets leak" imagines a government keeper), while live testimony asserts a
  different shape (private contractors, highly compartmented); offer the variant shape back as
  a fork ("could that shape of truth be viable?"). Candidate homes (content decomposition of
  B4 / authored follow-up relation = first move-library artifact / answer-conditional guide
  offers) and constraints in Interaction §9.11 (raised 2026-07-04) — delivery vehicle
  candidate: the generative journey (Interaction §11)
- `OPEN` **B5b kind question** — is the secondhand discount a portable epistemic standard?
  Kept world-belief for now because F2/F3 must bear on it (I1); revisit if the cross-map
  fingerprint wants it — UAP-Port-Notes §6
- `OPEN` **Guide visited-memory** — policy v0 re-offers payoff frames the user has already
  visited (no "seen" signal in the ranking); the renderer dedups only the frame currently on
  screen. Does visited-ness belong in the policy (a session-derived input, seal-safe) or is
  re-offering correct? Found building the scene renderer, 2026-07-04 — direction found in
  the §10 session: the journey rail is the seen-surface, and visited-ness enters the policy
  as an explicit session-derived input (Interaction §10.3)
- `OPEN` **Dissolve the panel → three organs + journey rail (direction user-affirmed
  2026-07-04)** — the dedicated session §9.12 asked for ran the same day. The shape:
  content goes home to its object (sectors promoted from navigation to content; a ballot of
  option plaques at the fork; stance chips at the fact; carryback on the resumed focus
  card; non-node frames as center-stage cards tethered to their relit participants), while
  the session's own voice gets organs — a compact focus card, a thin register banner, and
  the **journey rail**: the walk made visible (coverage dots; emphasis only from the user's
  own signals pre-commit, credence-derived emphasis post-commit; guide offers at the head
  in rank order; commit at the foot). Seam-invitation offer family designed (unrouted
  disputes just below dispute routing; want-more accumulation climbing with count;
  KC-misses dormant behind §9.3) — it defines the LLM seams' UI entry points, so the seams
  build is unblocked and does not wait on visual dissolution. Guidance stays deterministic;
  policy v1 = LLM re-ranker at trigger boundaries through the same typed-offer channel.
  Staged build candidate (chrome migration → in-place elicitation → focus card + center
  stage); build not ordered — seams keep register order. Full record: Interaction §10
  (§9.12 kept as the original capture) — **stage 1 shipped 2026-07-04**: journey rail +
  register banner + slimmed panel, built by a delegated fork off
  docs/plans/2026-07-04_journey-rail-stage1.md, browser-validated both maps; rulings +
  findings in the §10.6 shipped marker
- `OPEN` **The generative journey (rules, not scripts)** — found in the first remote
  walk-through, 2026-07-04: the walk should be a composed journey without anyone scripting
  it — beat grammar (decide / read / probe→reveal→re-ask: the seal miniaturized),
  fact-level `surprises` eligibility tags, a rhythm rule for left-field texture, and a
  journey policy as a guide-policy variant through the same typed-offer channel; LLM as
  bounded sequencer toward named states (§2.5 menu posture; the react log as sensor).
  Disclosure rulings user-affirmed: R1 drawn-by-walking (blank beyond the thread; the full
  overview inside Mirror was a register leak), R2 fade-horizon rail (path not census —
  supersedes stage-1 coverage dots), R3 proposed (readiness words; commit lifts the fog).
  Delivery vehicle for the reflex-ghost / coherence-probe / answer-shape threads.
  Rule-mining ongoing — Interaction §11. Ruled same day: journey is Mirror's default
  entry; J1 (engine) + J2 (renderer) build ordered —
  docs/plans/2026-07-04_journey-j1-j2.md — **J1+J2 shipped same day** (delegated fork;
  88/88; fog / trail + fade horizon / readiness words / fog-lift commit live on both
  maps; R3 awaits the user's walk; shipped marker + build rulings in Interaction §11.5;
  four findings below). Next: the user walks the deploy and mines rules; J3 (surprises
  tags + probe beats) is the content session after that
- `OPEN` **Linter coverage of renderer-embedded copy** — the scene renderer speaks promise/
  reveal copy as code literals (`web/scene.ts`, `web/index.html`) the artifact linter can't
  see; eyeball discipline for now; revisit if a string-extraction or copy-table pass earns
  its keep. Found building the voice linter, 2026-07-04 — Interaction §5.6
- `OPEN` **Mode entry** — Peruse-first or Mirror-first for a fresh visitor — Interaction §9.4.
  The scene renderer provisionally enters Mirror (belief-first door); the question stays open
- `OPEN` **Stack depth cap** — observation needed, not theory — Interaction §9.6

## 4. Countervailing tensions (kept alive on purpose)

- `TENSION` **Revelation vs. prevention** on motivated reasoning: trust stances let users dial
  down disliked authorities (Kahan amplifier risk); current stance = never prevent, always
  reveal (trust joins sensitivity ranking) — Interaction §6.3. Revisit if user tests show
  revelation isn't felt.
- `TENSION` **Guided one-at-a-time vs. relational payoffs**: focus frames must hold
  edges/rules/tensions/gaps or the best moments regress to side panels — Interaction §4.2.
- `TENSION` **Menu surface vs. conversational force**: accepted cost of §2.5 (T4's "nobody's
  asked me that" moment); terminal-question copy is the pressure point — Platform §2.5.
- `TENSION` **Silent abandonment** replaced eruption as the defensive user's failure mode; a UX
  metric to watch, not a tone bug — Platform §2.5.
- `TENSION` **Deterministic vs. LLM-assisted guide policy**: curation risk (ordering/selection
  is where steering now hides); v0 deterministic, LLM policy later emits lintable typed moves —
  Interaction §7.
- `TENSION` **Lazy elicitation vs. profile completeness**: trust/knowledge asked only when a
  fact matters; accept sparse profiles — Interaction §6.3.

## 5. Parked

- `PARKED` **Dyad mode** (crux-finder for two) and **decision mode** — future modes on the same
  contracts table; revisit after Mirror mode ships — Platform §6 (D/F); Interaction §3.
- `PARKED` **Direction C (conversation-first product)** — dead as product, alive as
  prompt-testing methodology (persona panels) — Platform §6.
- `PARKED` **Accounts/privacy design** — deliberately deferred until the longitudinal metric
  forces it; localStorage until then — seed §12.3; Interaction §9.5.

## 6. Findings ledger (empirical results worth not re-learning)

- I1 caught a real conflation in the human-written handoff (F7 corrects a misapplication, not
  the standard) — UAP-Port-Notes §2.
- 4 of 10 UAP positions are epistemic standards — the fingerprint has material from map one —
  Port-Notes §1.
- R3 ghost-vs-solid holds byte-exact through port and renderer — uap.conformance tests; both
  renderers.
- Full-skeptic ceiling: all-skeptical answers yield H1 ≈ 48% (see confidence-gap thread) —
  2026-07-04 demo.
- Tone breaches cluster on over-accommodation (false balance under provocation, steelman
  fabrication, reassurance-by-negation) — experiments/tone/RESULTS §3, §6.
- Lexical bans fail; frame bans work — RESULTS §6 → PROTOCOL v1.2.
- Spike validations (2026-07-04): focus+context feel at ~40 nodes; pinned-promise stack +
  carryback; relation sectors; assumption face with held-vs-needed; dispute→position routing —
  Interaction-Design provenance markers.
- B5 is double-barreled — first violation found by the assumption face — Interaction §5.4;
  decomposed 2026-07-04 into B5a/B5b, joint weights preserved — UAP-Port-Notes §6.
- The canonical 11-move grammar had no unseal move — building the session reducer surfaced
  `commit` as move 12 (first firing of the predicted "writing the reducer forces exactness"
  effect) — Interaction §7.1.
- The seal is engine-enforceable, not just renderer discipline: carryback constructs its
  credence delta only post-commit, so a renderer cannot leak it by accident — src/session.ts.
- Guide policy v0's structure-only gate weight independently ranks B2 (radar-as-measurement)
  the top unanswered UAP fork — agreeing with the map author's "load-bearing fork" note on B2 —
  guideOffers, 2026-07-04.
- Windows quirk: `node --test` needs the glob form (package.json), not a trailing-slash dir.
- The seal held with zero renderer effort in the scene build: bars/gaps/sensitivity render
  behind one `revealed` check, and the engine-side carryback guard meant nothing credence-shaped
  existed to leak pre-commit — the "engine-enforced, not renderer discipline" prediction held —
  web/scene.ts, 2026-07-04.
- Guide policy v0 never offers rule frames, so the R3 ghost-vs-solid moment was unreachable
  until the reveal hub grew a "what moved beneath you" section (renderer-side navigation, not a
  policy change) — web/scene.ts frameOverview, 2026-07-04.
- The voice linter's first pass: UAP's human-reviewed copy and all nine guide-policy `why`
  strings lint clean; the only findings are two double-barrel warnings on singularity P1's
  model-drafted option labels (semicolon-joined propositions) — the draft tier flagged
  exactly as designed. A naive `\band\b` scan would have false-positived on legitimate noun
  lists ("speed, distance, and acceleration"), so the heuristic keys on clause-joining
  signals instead — test/lint.test.ts, 2026-07-04.
- The panel's promise crumbs were already duplicated in-scene: `retarget()` pins digression
  origins (§4.3's "smaller presence") while `crumbsHtml()` restated them in the panel —
  §9.12(a)'s redundancy claim proven in code; the journey rail absorbs the pinned column —
  web/scene.ts, 2026-07-04.
- Flex-column scroll containers silently squeeze `overflow: hidden` children to zero
  height — the rail's zone captions vanished until `#rail > * { flex-shrink: 0 }`; cousin
  of the §8.4 specificity trap (the styling surprise lives in CSS defaults, not the
  renderer) — web/index.html, 2026-07-04.
- A design keyed on fork-target reactions silently no-ops if no surface offers them: react
  rows existed only on fact/tension/gap frames, so §10.3's flagged emphasis was unreachable
  until position frames gained a react row in the stage-1 build — web/scene.ts, 2026-07-04.
- Overlay beats reflow for edge surfaces: hover-expanding an in-flow rail rescales the
  whole SVG viewBox (~20% scene wobble); absolute-overlay expansion keeps scene geometry
  still — the stage-3 focus card is an overlay candidate for the same reason —
  web/index.html, 2026-07-04.
- The first remote walk-through (Pages deploy, on a phone) surfaced the minute-zero wall:
  right after arrival the scene showed the full constellation, and the map's own author
  read it as zoomed-out overload — §1's attention problem survives at session start; fixed
  by design as §11 R1 (drawn-by-walking) — 2026-07-04.
- The drawn sheet reflects current commitments, not history: disclosure derives from
  state, so changing an answer can undraw the old option's consequences — felt right in
  the browser (the sheet redraws to what you now hold), but the semantics matter before
  J3 probes re-ask forks — src/journey.ts, 2026-07-04.
- The journey's no-leak rule needs exactly two doors — `present-fact` (evidence is how
  new territory enters) and dispute routes (the user's own objection made walkable);
  filter either and the walk deadlocks. Any future offer family (probes included) enters
  through the same doors — src/journey.ts, 2026-07-04.
- Count-shaped copy accretes at commit-adjacent surfaces: a second census (the overview
  frame's answered-dots line) hid behind the commit bar's; §11 R3's no-counts rule caught
  it — web/scene.ts, 2026-07-04.
- Unwalked + front-runner compose into a free payoff: post-commit a front-running landing
  can render in faint pencil — "your leading landing rests on forks you never met" — the
  confidence gap made spatial with zero new machinery; kept deliberately — web/scene.ts,
  2026-07-04.

## 7. Retired

- `RETIRED` Direction A (bespoke UAP app): inverted from safest to riskiest under the platform
  anchor — Platform §6.
- `RETIRED` The gotcha-machine fear as stated: tested, did not appear; replaced by the
  over-accommodation cluster — experiments/tone/RESULTS.
- `RETIRED` Spike disposability vs. hardening temptation (§4 tension): resolved as designed —
  the spike was deleted 2026-07-04 when the scene renderer landed; only its validated geometry
  (relation sectors, assumption face) was lifted, made map-generic — web/scene.ts.
