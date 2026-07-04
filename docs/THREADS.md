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

_Last updated: 2026-07-04 (session: scene renderer shipped on the session engine — Mirror
end-to-end + Peruse toggle; first renderer and spike retired; answer-shape probe idea
captured, unweighed; BYO-inference thread explored, platform mechanisms verified, and
graduated to docs/BYO-Inference-2026-07.md)._

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
5. `BUILD` **Voice linter, then LLM seams** — linter rule set now includes single-proposition
   authoring rules and the seal-word surface ban (Interaction §5.5); seams per Platform §2.5
   gates.

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
  to rest on — the map disagrees" — Interaction §9.1
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
  would-be constraints in Interaction §9.10 (raised 2026-07-04)
- `OPEN` **Answer-shape probe / keeper-shape refinement (idea, unweighed)** — recorded as a
  possibility, not a direction: an answer is often given against an implicit shape of the
  proposition ("secrets leak" imagines a government keeper), while live testimony asserts a
  different shape (private contractors, highly compartmented); offer the variant shape back as
  a fork ("could that shape of truth be viable?"). Candidate homes (content decomposition of
  B4 / authored follow-up relation = first move-library artifact / answer-conditional guide
  offers) and constraints in Interaction §9.11 (raised 2026-07-04)
- `OPEN` **B5b kind question** — is the secondhand discount a portable epistemic standard?
  Kept world-belief for now because F2/F3 must bear on it (I1); revisit if the cross-map
  fingerprint wants it — UAP-Port-Notes §6
- `OPEN` **Guide visited-memory** — policy v0 re-offers payoff frames the user has already
  visited (no "seen" signal in the ranking); the renderer dedups only the frame currently on
  screen. Does visited-ness belong in the policy (a session-derived input, seal-safe) or is
  re-offering correct? Found building the scene renderer, 2026-07-04
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

## 7. Retired

- `RETIRED` Direction A (bespoke UAP app): inverted from safest to riskiest under the platform
  anchor — Platform §6.
- `RETIRED` The gotcha-machine fear as stated: tested, did not appear; replaced by the
  over-accommodation cluster — experiments/tone/RESULTS.
- `RETIRED` Spike disposability vs. hardening temptation (§4 tension): resolved as designed —
  the spike was deleted 2026-07-04 when the scene renderer landed; only its validated geometry
  (relation sectors, assumption face) was lifted, made map-generic — web/scene.ts.
