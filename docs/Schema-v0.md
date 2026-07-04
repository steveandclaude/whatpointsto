# Topic-General Schema v0 — Map Document & Cascade Engine

> **Source of truth:** `src/schema.ts` (types + invariant validator) and `src/reducer.ts`
> (the pure cascade engine). This document explains them; where prose and code disagree,
> the code wins. Exercised by `test/smoke.test.ts`. Design provenance:
> `Platform-Design-2026-07.md` (esp. §2.1–2.6) plus constraints inherited from the seed
> (§4.1, §4.3, §4.4) and the UAP handoff (§5–§7).
>
> **One sentence:** a map is one document — header, three node families, first-class edges,
> cascade rules, declared tensions — evaluated by a pure reducer whose purity makes
> sensitivity, counterfactual flips, and the confidence gap each a re-run rather than a feature.

## 1. The core design decision

Position nodes are typed by **remediation semantics** — what kind of pressure may
legitimately bear on them:

| Kind | What may bear on it | Why it exists |
|---|---|---|
| `world-belief` | Facts (`fact.bearsOn`) | Correctable assumptions (B2 "radar trust") |
| `epistemic-standard` | Consistency checks only (tension flags) | Facts can't correct a standard, only surface it (seed §4.1). Carries `standardId`, a **stable cross-map identity** — the field that makes the cross-topic fingerprint (seed §7.1) possible |
| `value` | Trade-off displays only | Policy maps: value disagreements are not assumption errors and the schema *forbids* rendering them as such (seed §4.3) |

Invariant **I1** gives this teeth: a fact whose `bearsOn` references a standard or value
node is a validation *error*, not a style violation. The epistemology is in the data model.

## 2. The map document

```
BeliefMap
├─ slug, title, topicType, version
├─ questions[]   generalized explananda (UAP: two). Outcomes compete within a
│                question, never across (softmax per question).
├─ positions[]   user-supplied: prompt + options (+ authored shortLabel — node
│                IDs never reach the user); options may trigger facts
├─ facts[]       world-supplied: strength, structured sources {authority,
│                citation?, retrievedAt?}, origin, assertedAt, supersededBy,
│                provenance tier, optional bearsOn, baseline, shortLabel
├─ outcomes[]    landing spots: kind per topicType, assumptionCost, basePrior?,
│                claims[] (router index)
├─ edges[]       first-class influence: source (fact | position+option) →
│                effects, contested?, crossQuestion?, whyCopy
├─ rules[]       cascade rules: when (conjunction) → effects | redirect
│                {naive, calibrated} + lessonCopy
└─ tensions[]    declared frictions between co-held answers + copy
```

### topicType sets the outcome kind
`explanation → rival-hypothesis` (UAP), `forecast → scenario` (singularity),
`policy → policy-option` (climate). Mismatch is a warning (I8) — deliberate hybrids allowed.

### Provenance is first-class on every node
`model-drafted | research-backed | human-reviewed`. A draft-mode regress is a map whose
fact family is empty or all draft-tier — same schema, same engine (the §2.3 strip-back
expressed as data). Research-tier facts must cite sources (I9). The reducer is
provenance-blind; only presentation differs.

### Origin is not review tier (facts, v0.2)
`origin: llm-knowledge | web-researched | author-researched | user-contributed` — where the
CONTENT came from, orthogonal to who vouches for it (Interaction-Design §6.1). Each source is
structured: the **authority** is what a user weighs — and what the trust layer keys stances
on — while the citation says where to look. I9 errors on a source without an authority.

### Edges are first-class, not embedded weight tables
Two things must live on them: **contested state** — genuinely two-sided evidence (F3, F10)
stores both readings and the reducer applies *neither*, surfacing the dispute unresolved —
and **whyCopy**, the lintable "why did this move" artifact (every user-visible string in the
schema is a typed artifact per design §2.5: `whyCopy`, `lessonCopy`, `tension.copy`,
prompts, labels — all voice-lintable at build time).

### Redirect rules carry both updates
R3's shape (the AARO pivot): `naive` is what an uncalibrated engine would do — rendered
ghosted, never applied; `calibrated` is applied. The product's signature moment is the
side-by-side, so the data holds both.

## 3. Invariants (validateMap)

| Code | Severity | Rule |
|---|---|---|
| I0 | error | Referential integrity: scopes, questions, triggers exist |
| I1 | error | `fact.bearsOn` may reference world-beliefs only — standards and values are fact-proof |
| I2 | error | Epistemic standards carry a `standardId` (re-checked for JSON input) |
| I3 | error | Edges reference existing sources, options, outcomes |
| I4 | error | Cross-question influence must set `crossQuestion: true` — never silent (handoff guardrail 2) |
| I5 | error/warn | Supersession pointers valid; superseded facts shouldn't stay baseline-active |
| I6 | error | Rules and tensions reference existing positions/options/outcomes |
| I7 | warn | Outcomes should declare `claims[]` — else unreachable by the router |
| I8 | warn | Outcome kind should match topicType |
| I9 | error | Research-tier facts must cite sources; every source names an authority |

## 4. The reducer contract

```
reduce(map, answers, factStances?, opts?) → {
  credences,    // question → outcome → probability (softmax per question)
  scores,       // raw log-odds, backstage only — never user-facing
  movements,    // every applied delta with its source and whyCopy
  firedRules,   // incl. naive (ghost) vs applied for redirects
  activeFacts,  // baseline + triggered − superseded (stances never touch this)
  contested,    // surfaced two-sided edges, no effect applied
  tensions,     // declared frictions whose answers are co-held
  suppositions, // facts whose applied influence rests on a 'suppose' stance
  parked        // facts exerting nothing by stance (want-more / dispute), reason on face
}
```

Pipeline: activate facts (baseline + option-triggered, minus superseded) → init scores at
`basePrior ?? -priorScale·(assumptionCost−1)` (cheaper outcomes start ahead — assumption
cost is the organizing spine) → apply active uncontested edges (skipping stance-parked
facts — a parked fact's contested readings leave the table too) → fire rules (calibrated
side of redirects) → surface tensions → softmax per question.

**Fact stances (engine v0.2, Interaction-Design §6.2):** `factStances` maps factId →
`accept | suppose | want-more | dispute`. Unstanced facts behave as accepted (stances are
lazily elicited; sparse records cost nothing). A supposed fact counts like accepted and is
listed in `suppositions` only if its edges actually moved something. Want-more/dispute facts
stay active (visible) but participate in nothing. Stances on inactive or unknown facts are
inert, symmetric with unanswered positions.

**Purity is load-bearing.** Derived analyses are re-runs:
- `counterfactual(map, answers, position, option, factStances?)` — the one-tap flip.
- `sensitivity(map, answers, factStances?)` — rank answered positions by max total-variation
  shift under their most-moving flip. This readout *is* the product (seed §5.3).
- `confidenceGap(result, matchedOutcome, statedStrength)` — the two-dimensional gap's
  second axis: stated strength vs. `supportedStrength(credence)`, in ladder steps.

**Strength ladder:** `lean / think / confident / certain` — qualitative capture, numeric
only backstage (design §2.6).

## 5. Open items (known, deliberate)

1. **`supportedStrength` is a v0 heuristic** (credence thresholds → ladder words). The
   formal definition of "supported confidence" is design-doc open question 5. Isolated in
   one function so it can be replaced without touching anything else.
2. **The router is out of scope here.** `outcome.claims[]` is its index; matching free-text
   arrival beliefs to claims is a mediator (LLM) task with its own confirm-gate UX (§2.5).
3. **`priorScale` (default 0.5)** — the cost→prior conversion is a tuning knob, not a claim.
4. **Mixture weights** are currently the softmax distribution itself; explicit user-assigned
   mixtures (handoff heterogeneity rule) may need a dedicated answer type later.
5. **Provenance summary** on the header is computed, not stored (deferred until the factory
   pipeline exists).

## 6. Conformance obligations (the rule of two)

1. **UAP port** — exercises contested edges (F3, F10), redirect rules (R3), two questions,
   fact triggers, the full 10-position/13-fact/12-outcome library from the handoff §6.
2. **Singularity thin scaffold** — exercises `forecast`/`scenario` with an *empty fact
   family* (deliberately unresearched), proving the draft-mode degradation and the
   schema's second topic type.

Anything that won't port is a schema bug, and a port mismatch is itself a finding (seed §4.2).
