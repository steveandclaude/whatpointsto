# UAP Port Notes — Conformance Test #1 Findings

> Port of `UAP-Belief-Map-Handoff.md` §6 into Schema v0 (`content/uap.ts`, exercised by
> `test/uap.conformance.test.ts`, 12/12 passing on first run). Per seed §4.2, mismatches
> between the source material and the schema are findings, not just port work. These are them.

## 1. The schema forced position-kind decisions the handoff left implicit

The handoff typed everything "belief node." Schema v0 demands a remediation kind, which forced
four judgment calls:

| Node | Ported as | Reasoning |
|---|---|---|
| B3 (unexplained = anomalous?) | `epistemic-standard` (`unexplained-as-anomalous`) | Seed §4.1's "arguably B3" resolved: it is a rule for reading evidence, not a claim about the world |
| B4 (secrecy leakproofness) | `epistemic-standard` (`secrecy-leakproofness-prior`) | Seed §7.1 lists secrecy priors among the transferable standards. Arguable — it is fact-informable in principle (leak base rates) — but its cross-topic transferability is the deciding property |
| B6 (conflicted-investigator reading) | `epistemic-standard` (`conflicted-investigator-reading`) | An institutional-trust setting (§7.1); the *disposition* toward conflicted investigators travels to every topic, even though F4's content informs this topic's instance |
| B1, B2, B5, B7, B8, B9 | `world-belief` | Correctable-by-facts claims about instruments, testimony, physics costs, priors, and history |

**Finding:** four of ten positions are epistemic standards — the cross-topic fingerprint
(seed §7.1) will have real material from map one.

## 2. I1 exposed a real distinction the handoff blurred

The handoff has F6/F7/F8 "triggered by B3" and F7 pedagogically correcting how B3's standard
gets applied. Typing B3 as a standard made `bearsOn: ['B3']` a validation **error** (standards
are fact-proof) — which forced the honest formulation: F7 does not correct the *standard*
("treat unexplained as anomalous"), it corrects a *world-level misapplication* (what the
pre-1960 record can even speak to). So F6/F7/F8 are triggered by B3's answer and shown to the
user, but bear on nothing — they inform the person, not the setting. The schema's constraint
produced a cleaner reading of the correction fact than the source doc had.

## 3. Double-dip resolution: fact vs. rule carrying the same move

Two handoff moves were specified twice (as a fact's `updates` and as a cascade rule):

- **F5 / R3** (the pivot): the credence movement lives in R3's `redirect.calibrated`; F5 is the
  evidence card (display, no edge).
- **F12 / R5** (falsifiability): movement in R5's effects; F12 is the evidence card.

Convention adopted: **when a rule and a fact encode the same insight, the rule moves credence
and the fact is display-only.** Otherwise the move double-counts. Worth carrying into the
factory pipeline as an authoring rule.

## 4. What ported without friction

- The two-explananda separation → `questions[]` + per-question softmax; cross-question effects
  (B4's) needed no I4 flag because B4's scope legitimately spans both.
- Contested evidence (F3, F10) → contested edges, both readings stored; tests confirm zero
  influence and full surfacing.
- R3's ghost-vs-solid → `redirect.naive/calibrated` held byte-for-byte; the test asserts A and
  H5 raw scores stay at baseline when B6 = compromised.
- The heterogeneity rule → assumption-cost-derived priors order the empty traversal correctly
  (H1 > H5, D > A before any answer).
- Router claims → all 12 outcomes carry plain-language landing statements.

## 5. Deferred / provisional

- **All magnitudes are provisional tuning** ("tune magnitudes in code" — handoff §6C). Directions
  are the handoff's. Calibration against real traversals is future work.
- **R2 is a lesson-only rule** (no effects): the mechanic lives in the B2 edge (+) and the F9
  edge (−); the rule exists to *name* the reckoning. A rule with only `lessonCopy` turned out to
  be a legitimate pattern the schema already supported.
- Option sets are authored two-way (low/high). The handoff implies some nodes want a third
  "unsure" option (the payoff's untouched-assumption nudge, §6E.4) — schema supports it; copy
  not yet authored.
- The payoff screen's "untouched assumption" nudge is a renderer concern (unanswered positions
  are visible as absent keys in `answers`); no schema change needed.

## 6. v0.2 content pass (2026-07-04): B5 decomposed, sources structured

- **B5 was double-barreled** — the first confirmed violation of the single-proposition
  authoring rule (Interaction-Design §5.4), found by the assumption face in the spike. It
  conflated credential-weight with the secondhand discount. Decomposed into **B5a — credential
  weight** ("credentials vouch for content" vs "for sincerity only") and **B5b — secondhand
  discount** ("keeps most force" vs "loses most of it"), both `world-belief`, scope II. The
  inventory is deliberately 11 positions now; the conformance suite asserts the divergence.
- **The edge split preserves the joint weights**: strong+minor ⇒ A+0.4 (old B5.strong);
  weak+steep ⇒ B+0.3, D+0.2 (old B5.weak). The redistribution is semantic: credential
  skepticism routes to the rumor loop (sincere people repeating each other); the secondhand
  discount routes the escalation to incentives (D) plus repetition (B). Each fork alone now
  carries roughly half the old force — the joint stays reachable, the halves are honest.
- **The Grusch facts moved to the secondhand half**: F2/F3 `bearsOn: ['B5b']` and trigger from
  B5b's options — both facts are about firsthandness, not credentials. B5a has no bearing
  facts, which is honest: nothing in the fact layer speaks to credential-vouching per se.
- **T1's testimony partner is now B5b:steep** — the wholesale discount is the reading T1's
  copy describes.
- **Sources are structured** (`{authority, citation?, retrievedAt?}`, schema v0.2). Interim
  distillation: the authority named is the project research artifact that vouches for the
  fact ('Radar in the Dock', 'The Case Against AARO', …); the citation keeps the section
  pointer where one existed. Distilling to real-world authority classes (AARO, GAO, named
  journalists) is the trust-layer taxonomy pass — deliberately not done mechanically here.
- **Origin declared**: all 13 facts carry `origin: 'author-researched'` (content produced by
  this project's research artifacts) — orthogonal to their `research-backed` review tier.
- **Open question surfaced by the split**: is the secondhand discount a portable epistemic
  standard? Kept `world-belief` because F2/F3 must bear on it (I1) — the call rhymes with
  §1's B4 note. Revisit if the cross-map fingerprint wants it. Registered in THREADS §3.
