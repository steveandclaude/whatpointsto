# Platform Design — Factory Architecture & the Belief-First Front Door

> **Purpose:** Captures the design conversation of July 3, 2026 — the first architecture session held after the seed document. It anchors the project on the platform vision (seed §2 v3), selects the **factory** as the thing being built, and derives the front-door architecture from the observation that **everyone arrives with a belief, varying only in how strongly it is held.**
>
> **Position in the doc tree:** `Belief-Map-Seed-Document.md` is the trunk; this document grows the trunk's architecture branches and resolves several of its open questions (§7 below). `UAP-Belief-Map-Handoff.md` remains the authoritative *content* spec for the UAP instance, but its build recommendations (single-file artifact, hard-coded node library) are superseded by the platform frame: **UAP is a data file, not an app** (§2.1).
>
> **Status:** Decisions in §2 are made (user-affirmed in conversation). §3–§5 are derived architecture — strong defaults, revisable if a §2 decision changes. §8 is open.

---

## 1. The anchor

The project anchors on the **seed document's platform vision**, not the UAP map. UAP is one instance — the first conformance test of a topic-general system, not the product. Every design question is now evaluated as: *which layer of the platform does this build, and does UAP drop in as content?*

This reframe was the session's first move, and it re-scored everything downstream.

## 2. Decisions

### 2.1 UAP is a data file, not an app
The handoff's Section 6 node library becomes the first document conforming to a topic-general schema. The engine never knows the word "radar." The handoff's Section 10 open questions (mechanic, visual) mostly dissolve — they are *platform* decisions made once, not per-map.

### 2.2 Factory over intake — the platform is the map-production system
Two competing theories of what the platform *is* were identified:
- **Platform = intake:** the regress engine is the universal front door; curated maps are cached, pre-researched regresses. Value accrues at the conversation layer.
- **Platform = factory:** the generation pipeline (model drafts scaffold → research pass produces strength-tagged fact nodes → contested edges flagged for human review, per seed §7.5) is the core system. Value accrues in the growing library of maps at `/uap`, `/seed-oils`, `/singularity`.

**Decision: factory.** The deciding consideration: the seed's own cost finding — fact nodes are the expensive, quality-critical asset (four research artifacts, two human epistemic corrections for one map). If fact nodes are where quality lives, the factory is where the platform's defensibility lives.

### 2.3 The strip-back is preserved — the belief mapper is factory stage 1, exposed
Question asked: if we build the factory, can it still be stripped back to a pure belief mapper (user states a belief → map of what must be true)?

**Answer: yes, for free — if four constraints are adopted early.** The regress engine and the factory's scaffold-drafting stage are *the same operation*: a pure belief mapper is the factory in draft-only, single-user, ephemeral mode (the research pass simply not run). The constraints that keep this true (cheap now, expensive to retrofit):

1. **One schema for drafts and published maps, with provenance as first-class node metadata:** every node tiered `model-drafted` / `research-backed` / `human-reviewed`. A user's regress is a map whose fact nodes are all draft-tier or absent. (This also delivers the seed's fact-timestamp/supersession requirement, §4.4, as provenance-over-time.)
2. **The scaffold-drafter takes a *belief statement* as input, not a topic name** ("seed oils are toxic," not "make a map about seed oils"), deriving the topic. Both entry points then work forever.
3. **The renderer degrades gracefully when fact nodes are absent** — empty fact layers render as "unresearched: here's what would need checking," which is itself honest self-knowledge.
4. **The engine stays pure and provenance-blind.** The reducer computes cascades identically on draft and published maps; only presentation of confidence differs.

**Labeling discipline is the price.** The factory's brand is rigor; model-drafted maps must be *unmistakably* draft-grade in the UI — a different visual register, explicit "no research pass has run" framing, not a small badge. Non-steering risk is highest in ungoverned generated content (nothing checked the map for manufactured false symmetry on settled questions).

**Strategic bonus:** the stripped-back mode is the factory's demand signal. Every user regress is market research; chains repeatedly landing in the same territory form the prioritization queue for the expensive research pass. It is also the catch-all route's fallback: `/some-unmapped-topic` serves a labeled draft-grade map instead of a 404 — every path resolves, some resolve to drafts.

### 2.4 Everyone arrives with a belief — belief is the query language
The intake-vs-factory fork was a false dichotomy: **factory is the supply side; belief is the query language.** Nobody browses to `/uap` out of neutral topical curiosity — even that visitor carries "I think there's something to this" or "it's obviously nonsense." Topic paths are shareable *addresses* of maps; a belief is how anyone actually enters one.

Consequences:
- **Stated-conclusion-first entry (seed §7.4) is promoted from recommended option to universal front door.** Every map, curated or draft, opens with "what do you currently think?" The payoff headline is the gap between the stated belief and where the user's assumptions lead; no stated belief, no gap, no product moment.
- **The router is a core v1 component, not a deferred seam.** Front door = a text box; behind it, a matcher: belief statement → existing curated map (and a *position* in it) or, failing that, the draft-grade regress. The homepage is the question; the directory is for return visits and sharing.
- **Maps are indexed by claims, not just topics.** Hypothesis/conclusion nodes are the router's landing spots ("UAPs are aliens" → H5; "the government holds craft" → explanandum-II A; "Grusch is a grifter" → D). Arrival belief → matched hypothesis node → traversal walks *backward* through the belief nodes gating it. Curated map and regress engine thus share not only a schema but a **direction of traversal**: both run conclusion-backward. A curated map is a pre-computed, pre-researched regress — the seed's v2 framing, arrived at from the other end.
- **Router misses are triple-valuable** (resolves seed §4.2 operationally): when an arrival belief or its reasoning doesn't match the curated graph, the mismatch is simultaneously (a) a finding shown to the user ("your reasoning doesn't route through any assumption we mapped — here's the fresh chain"), (b) a patch request against the curated map, (c) a factory demand signal. One event, three consumers.

### 2.5 Interface: menu-like surface, LLM as mediator/creator — never an open channel *(added 2026-07-04)*
The primary interface is **not conversational**. The surface is structured — a visual map, menus,
click targets, detail panels — and the LLM lives entirely backstage in two roles: **creator**
(drafting scaffolds, authoring node copy, generating fork menus — the factory) and **mediator**
(translating free-text arrival beliefs into map positions, generating draft regresses for unmapped
territory, expanding detail on demand). The user never meets the model in an open channel.

Grounding: the tone experiment (`experiments/tone/RESULTS.md`) showed every confirmed voice breach
was a failure of *improvised speech under social pressure* — appeasement of a provoked user,
fabrication inside a live steelman, reassurance-by-negation. None of these failure modes exists on
a structured surface, because none can: there is no improvisation and no dyad. Tone is a property
of a social relationship; a map is a mirror-shaped entity, not a judge-shaped one, so commitment 2
("the mirror is merciless; the mirror's tone is neutral") is enforced architecturally.

Three consequences:
1. **Typed artifacts.** Every LLM output is a schema-validated, typed artifact (node, fork option,
   tension flag, detail panel) — lintable against the voice rules (PROTOCOL v1.2 frame ban) as a
   build/QA stage rather than a runtime constraint. Voice review joins fact-node review in the
   factory's human-review layer.
2. **User-confirmed mediation.** When the mediator restates a user's free text (arrival routing,
   "something else in your own words," §4.2 reasoning-onto-graph mapping), the UI shows the
   artifact for acceptance before it enters map state. Fidelity breaches can still be generated
   but cannot persist — and a rejected mapping *is* the §4.2 mismatch finding.
3. **Generative tone risk concentrates at two seams** — mediator restatements (guarded by the
   confirm gate) and draft-regress copy (guarded by lint + the unmistakably-draft visual
   register, §2.3) — which is exactly where the tone protocol applies. The experiment tested the
   mediator under worst-case conditions (open channel, social provocation) and the v1.2 protocol
   survived; the seams are guarded by validated rules.

Named principle — **backstage rule, applied twice**: the handoff's hybrid mechanic was "real
weights backstage, qualitative surface up front"; this decision is "real generation backstage,
structured surface up front." Same design move: rigor where it can be rigorous, legibility where
the user lives. Expect a third application eventually.

Accepted costs: the terminal question loses conversational force (copy problem; needs care — T4's
"nobody's actually asked me that before" moment came from being *asked*); and the defensive user's
failure mode shifts from recoverable eruption to silent abandonment (a UX metric to watch, not a
tone bug — a map cannot de-escalate). Direction C is dead as a product direction; it survives as
prompt-testing methodology.

### 2.6 Arrival capture is a pair: the claim, and how strongly it's held
Beliefs vary not in presence but in strength. "I lean toward thinking seed oils are bad" and "seed oils are poison, full stop" match the same hypothesis node but are different users having different sessions.

- **Capture strength qualitatively, never numerically** — "lean / think / confident / certain," not a percentage slider. The no-false-precision guardrail applies to elicitation, not just display; backstage the engine maps words to weights (the same hybrid trick as everywhere else).
- **The claim picks the map; the strength picks the mirror** (see §3, §4).

## 3. The two-dimensional gap

With strength captured, the payoff moment has two axes:

- **Direction gap** (already in the design): "you said X; your assumptions lead to Y."
- **Confidence gap** (new): "your assumptions support this conclusion at roughly lean-level confidence — you're holding it at certainty. The surplus is coming from somewhere this map doesn't show." Fires even on users who are directionally *right* — directional gaps catch the confused; confidence gaps catch everyone. The inverse fires as a gift: "your own assumptions commit you to more than you claim — you believe this harder than you say."

The confidence surplus is often identity doing the work (seed §9.5, Kahan) — the map can show *that* there is a surplus without asserting *what* it is, which stays on the right side of the author-not-defendant guardrail.

## 4. Strength as the lens dispatcher

The first place the seed's framework lenses (§9) earn a v1 job. Strength-of-holding is the user's *felt report of web-centrality* (a certainty-grade belief is core-of-web by definition), and it predicts the failure mode — Kahan-style gaming concentrates in strongly-held, identity-adjacent arrivals. So strength routes the experience:

| Arrival strength | Treatment |
|---|---|
| Lean / think | Standard foundationalist cascade (cheap, direct) — user updates easily |
| Confident / certain | Coherentist register (seed §9.3): revision-*cost* framing, not error framing — "here's what giving this up would cost you to rewire." Revision-display (seed §5.4) matters most here. |
| "Nothing could change my mind" | The labeled non-evidential landing spot (design commitment 6), offered up front rather than discovered at the end |

v1 needs a lens *dispatcher*, not a lens *switcher* — the user hands over the dispatch key in their second answer.

## 5. Ordering: the pre-registration seal

Belief-first arrival and pre-registration (seed §5.1) must be ordered carefully: the stated conclusion would contaminate assumption elicitation (users back-solving belief-node answers toward their landing spot). Fix: capture the arrival pair, then **visibly seal it** — "we'll come back to this" — and run assumption elicitation with no running credence bars until commitments lock. The seal is theater, but honest theater: it tells the user their stated view is safe from judgment while their assumptions speak.

## 6. Divergent directions considered (and how the platform frame re-scored them)

Six build directions were mapped across three axes — interface (map vs. conversation-with-map-as-receipt), content source (curated / generated / user-authored), unit of use (solo / dyad / decision-maker):

| Direction | One-line | Fate under the platform frame |
|---|---|---|
| A — Museum Piece | Bespoke curated UAP app per the handoff | **Inverted from safest to riskiest**: hand-builds exactly what the factory should generate. Content stays valuable; the build wouldn't. |
| B — Regress engine first | Belief-first generation, no curated content | Merged with the pipeline into the intake-vs-factory fork; resolved in §2.2–2.4 |
| C — Conversation, not app | Chat-first Street Epistemology; map as receipt | **Run 2026-07-04** (`experiments/tone/`): guardrail survived (4/4 "fairly treated" verdicts); breaches found were over-accommodation, fixed in PROTOCOL v1.2. Dead as a product direction per §2.5 (open channel = highest-risk surface); survives as prompt-testing methodology. |
| D — Dyadic wedge | Crux-finder for two people first | Demoted to mode (seed §7.2); design test = expressible on the platform without touching the engine |
| E — Trust-network product | Map sources, not beliefs (seed §9.2) | Demoted to lens; different ontology on shared graph infrastructure |
| F — Decision mode first | Personal decisions (seed §8.3) | Demoted to mode; commercially safest, missionally furthest drift |

**Genuine one-way doors identified:** only two — map-first vs. conversation-first (interaction paradigm), and beliefs vs. sources as node ontology. Everything else is sequencing. The shared cascade engine (schema + pure reducer + sensitivity computation) is ~15% of any build and common to all directions.

## 7. Seed/handoff open questions this session resolved or moved

| Question | Status after this session |
|---|---|
| Seed §12.1 — belief-first as separate mode or universal intake? | **Resolved:** universal intake (router), backed by the factory (§2.4) |
| Seed §12.2 — which framework lens ships first? | **Advanced:** coherentist lens gets a v1 job via the strength dispatcher (§4); verbal-dispute and pragmatist probe still queued per seed recommendation |
| Handoff §10.5 — entry point | **Resolved:** stated-conclusion-first, universally, with the seal (§2.4, §5) |
| Handoff §10.1/10.2 — mechanic, visual | **Reframed:** platform-level decisions, made once. Hybrid mechanic effectively affirmed (qualitative strength words → backstage weights, §2.6). Visual narrowed by §2.5: a structured map/menu surface, LLM backstage; layout metaphor still open. |
| Seed §12.4 — schema shared across topic types? | **Constrained:** schema must fit explanation/forecast/policy from day one; retrofitting is the expensive path. Rule of two applies (§8.1). |
| Seed §12.6 — minimum viable sociological-bill generator | Open; now scoped as part of factory stage 1 |

Also affirmed early in the session: **epistemic standards promoted to a first-class node type from the first schema draft** (seed §4.1) — they are the cross-topic asset enabling the fingerprint (§7.1), and B4/B10-style nodes will appear in every map ever shipped.

## 8. Open questions (new or sharpened)

1. **Topic #2 for the rule of two.** ~~Recommendation on record: the **singularity** (forecasting type — maximally unlike UAP's explanation type) as a deliberately *unresearched* thin scaffold, purely to prove the schema generalizes. Seed oils would be another explanation-type map and proves nothing new.~~ Built 2026-07-04 — `content/singularity.ts` + `test/singularity.conformance.test.ts` (12 tests). Findings: (a) forecast/scenario expressed with **zero schema changes**; (b) the empty fact family computes cleanly — draft mode is confirmed as a data condition, not an engine mode, and the reducer's provenance-blindness (§2.3 constraint 4) is now mechanically asserted; (c) first cross-map fingerprint pair exists: `falsifiability-requirement` is held by UAP B10 and singularity P4; (d) single-question maps are exercised (I4 never in play); (e) what draft mode still lacks is entirely renderer-side — the "unresearched: here's what would need checking" surface (§2.3.3) has no data to draw on yet, suggesting a possible `wouldNeedChecking` copy field or convention when the renderer lands.
2. **Router implementation.** Belief statement → (map, position) matching is a model task; what's the failure/quality bar before a miss falls back to draft regress? How is a *partial* match (right map, unmapped reasoning) rendered?
3. **Draft-grade visual register.** What does "unmistakably draft" look like concretely, such that it doesn't read as merely ugly?
4. **Strength vocabulary.** Is lean/think/confident/certain the right ladder? Does it need a "certain and nothing could change my mind" rung explicitly, or is that elicited by the terminal question later?
5. **Confidence-gap computation.** The direction gap falls out of the reducer; the confidence gap needs the engine to emit a *supported-confidence* level per hypothesis. What is that, formally, in the hybrid mechanic?
6. **The tone experiment (Direction C).** ~~Still unrun.~~ Run 2026-07-04 — see `experiments/tone/RESULTS.md`. Verdict: GO. The gotcha failure mode did not appear; the observed failure cluster was over-accommodation (false balance under provocation, steelman fabrication, frame-denial), fixed as PROTOCOL v1.2 rules 9–14. Note the audience calibration: the appeasement findings matter *more* for the actual audience (self-selected rationality-aspirants, seed commitment 3) than the de-escalation findings — a curious self-examiner is failed by flattery, not by bluntness.
7. **Longitudinal metric.** Strength is the trackable scalar across snapshots (direction rarely flips; strength drifts). What's the minimum persistence design that supports a six-month re-elicitation diff without prematurely forcing the accounts/privacy question (seed §12.3)?
8. **BYO inference (raised 2026-07-04, exploratory — options recorded, no direction chosen).**
   The product's LLM seams could run on the *user's own* model (their Claude subscription via
   their own agent) rather than platform-paid inference. Three locked decisions make this the
   near-native deployment shape: the LLM is backstage at gated seams only and phases 1–4 run
   with zero model calls (base product ≈ free to serve); every seam output is a typed, linted,
   confirm-gated artifact entering at draft tier wearing its origin (trust is model-agnostic);
   and a session is a replayable move log (multi-client — user's agent proposes, the scene
   confirms and renders — falls out of the persistence design). Option space: (a) **user's
   agent as MCP client** (localhost first; hosted connector later reaches claude.ai users) with
   seam-scoped tools — the leading shape; (b) product-inside-the-agent (npx + skill; zero
   hosting, smaller audience, demand signal lost unless shared); (c) BYOK web (clean but
   mismatched — consumers hold subscriptions, not API keys); (d) the **cache-and-review
   flywheel**: first user's agent drafts a primer/expansion/map, linter + review promote it to
   shared content — users donate generation, the platform pays only curation (resolves
   Interaction §9.3's factory-vs-on-demand fork); (e) conversational elicitation revives as the
   *user's* channel (their agent interviews, product receives typed moves — Direction C's risk
   was an open channel on OUR model). Edges to hold: agent must be propose-only on soft inputs
   (a model that answers forks mirrors the model, not the user); the seal is advisory against
   the user's own computing agent (structure-only pre-commit resources can make spoiling
   awkward, not impossible — accept this); third-party agent tone is out of lint jurisdiction
   (ship frame-ban instructions with the connector, best-effort); never collect user
   subscription tokens server-side (ToS); local shapes lose the move-log demand signal.
   **The typing surface (the ergonomic crux):** two stable patterns, avoid the middle —
   (1) *browser-primary, agent as worker*: the scene carries the text inputs; typed text lands
   in the session store as a pending seam request; the user's agent runs a serve-loop and
   writes confirm-gated proposals back (protocol-native mechanism is MCP sampling — client
   support spotty today; a polling loop works now); (2) *terminal-primary, scene as shared
   screen*: the user converses with their agent in one window while the scene is a passive
   live view of the move log — one input surface, no toggling. The broken middle is two active
   input surfaces (browser forks + terminal chat = alt-tab). The toggle only hurts mid-walk
   seams (mediation, expansions); batch seams (draft a map, generate primers) are naturally
   agent-side. The options compose, not compete: (a) is delivery, pattern 1/2 is ergonomics
   inside it, (d) is the economic engine, (e) is a register (a) can grow into, (b) is the
   zero-cost fallback and power-user story.

## 9. Reasoning trail (this session's moves, preserved per seed §11 convention)

1. **Re-scoring under a new anchor** — declaring the seed (platform) the anchor inverted Direction A from safest to riskiest and dissolved most per-map open questions into platform-level ones. The evaluation criterion shifted from "how do we build the UAP map well" to "which layer of the platform does this build."
2. **Naming the axes before the options** — interface / content source / unit of use proved more durable than any single direction and exposed that most directions differ by sequencing, not architecture.
3. **Recognizing two operations as one** — the factory's scaffold-drafter and the regress engine are the same function with different callers; this is what makes the strip-back free and turned "should we preserve it?" into four cheap schema constraints.
4. **Dissolving the fork with a supply/demand split** — "everyone arrives with a belief" resolved intake-vs-factory into *factory as supply, belief as query language*, which promoted the router and stated-conclusion-first entry to core v1.
5. **Following the scalar** — "just a matter of how strongly held" made arrival a (claim, strength) pair, which generated the confidence gap (a payoff that fires on directionally-correct users) and the lens dispatcher (strength routes foundationalist vs. coherentist treatment). The lenses stopped being v3 luxury the moment a v1 component needed them.
6. **Checking every mechanism against pre-registration** — belief-first entry threatened elicitation contamination; the seal (capture, visibly set aside, elicit blind, then reveal) preserves §5.1 inside the new front door.
7. **The naming observation as evidence** — the project's two names encode the two arrival stories (`situationalawareness.to` = factory/shelf; `whatpointsto` = intake/question). The resolution keeps both: the factory makes the destinations; the question is how everyone finds them.

## 10. One-paragraph summary for re-entry

The platform is a **map factory** — a generation pipeline whose expensive, quality-critical asset is researched, strength-tagged fact nodes — fronted by a **belief-first door**: every user arrives with a claim and a strength ("what do you think, and how hard?"), a router matches the claim to a curated map position or falls back to a clearly-labeled draft-grade regress (which is just the factory's first stage running without the research pass), the stated belief is sealed while assumptions are elicited blind, and the payoff is two-dimensional — the direction gap (where your assumptions actually lead) and the confidence gap (how much certainty they actually support). Strength dispatches the lens: lightly-held beliefs get the foundationalist cascade, strongly-held ones get coherentist revision-cost framing, and "nothing could change my mind" gets its honest, labeled landing spot. UAP is the first data file; the singularity scaffold is the schema's second conformance test; the mirror stays merciless and its tone stays neutral.

---

*Companions: `Belief-Map-Seed-Document.md` (trunk), `UAP-Belief-Map-Handoff.md` (UAP instance content spec), `docs/research/` (the four fact-library artifacts).*
