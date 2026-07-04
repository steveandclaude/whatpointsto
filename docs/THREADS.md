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

_Last updated: 2026-07-04 (session: session engine v0 shipped — Arc A item 1)._

---

## 1. Current build focus

The agreed next arc (Interaction-Design §8):

1. `BUILD` **Session engine** — **shipped 2026-07-04**: `src/session.ts` (12 typed moves incl.
   the discovered `commit`; pure reducer; exact carryback; Suppose sandbox; mode contracts as
   data; guide policy v0) + `test/session.test.ts` (55/55 with the map suites). The decisions
   the reducer forced are recorded in Interaction-Design §7.1.
2. `BUILD` **Engine v0.2** — `factStances` input; suppositions surfaced in `ReduceResult`.
   Trust layer rides this for free (Interaction §6.3).
3. `BUILD` **Content fixes** — decompose B5 (double-barreled, Interaction §5.4); authored
   `shortLabel`s; structured authorities on UAP sources (schema v0.2).
4. `BUILD` **Scene renderer on the session engine** — Mirror mode first; replaces both the
   first renderer's wall and the spike.
5. `BUILD` **Voice linter, then LLM seams** — linter rule set now includes single-proposition
   authoring rules; seams per Platform §2.5 gates.

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
- `OPEN` **Mode entry** — Peruse-first or Mirror-first for a fresh visitor — Interaction §9.4
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
- `TENSION` **Spike disposability vs. hardening temptation**: `web/spike.*` stays throwaway;
  the real scene renderer is rebuilt on the session engine — Interaction §8.4.

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
- B5 is double-barreled — first violation found by the assumption face — Interaction §5.4.
- The canonical 11-move grammar had no unseal move — building the session reducer surfaced
  `commit` as move 12 (first firing of the predicted "writing the reducer forces exactness"
  effect) — Interaction §7.1.
- The seal is engine-enforceable, not just renderer discipline: carryback constructs its
  credence delta only post-commit, so a renderer cannot leak it by accident — src/session.ts.
- Guide policy v0's structure-only gate weight independently ranks B2 (radar-as-measurement)
  the top unanswered UAP fork — agreeing with the map author's "load-bearing fork" note on B2 —
  guideOffers, 2026-07-04.
- Windows quirk: `node --test` needs the glob form (package.json), not a trailing-slash dir.

## 7. Retired

- `RETIRED` Direction A (bespoke UAP app): inverted from safest to riskiest under the platform
  anchor — Platform §6.
- `RETIRED` The gotcha-machine fear as stated: tested, did not appear; replaced by the
  over-accommodation cluster — experiments/tone/RESULTS.
