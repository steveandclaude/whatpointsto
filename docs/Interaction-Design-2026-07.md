# Interaction Design — Modes, the Focus Engine, and the Session Layer

> **Purpose:** Captures the interaction-layer design of July 4, 2026 — the conversation and
> live-feedback spike that followed the first renderer. The first renderer (`web/app.ts`) proved
> the engine end-to-end but dumped the whole `ReduceResult` at once; this document designs the
> attention model that replaces it: a spatial scene, a focus engine with a digression stack, a
> typed move grammar, fact stances, and distinct operating modes.
>
> **Position in the doc tree:** extends `Platform-Design-2026-07.md` §2.5 (menu surface, LLM
> backstage) — nothing here reopens that decision; it completes it. The tone rules of
> `experiments/tone/PROTOCOL.md` v1.2 govern all narration copy introduced here.
>
> **Provenance:** user design vision + five rounds of live feedback against a throwaway
> focus-graph spike (`web/spike.html` / `web/spike.ts`, UAP map, 2026-07-04). Spike findings are
> marked **[validated]** (seen working) or **[new]** (designed, not yet built).
>
> **Status:** strong defaults, user-shaped but not yet frozen; build order in §8.

---

## 1. The problem the first renderer exposed

A belief map's payoff object is large (credences × questions, movements, rules, contested
readings, tensions, sensitivity, gaps). Rendering it all at once has no attention model: the
user has no way to know what to look at, and every panel competes with every other. The fix is
not a better wall — it is **focus**: at any moment exactly one thing owns attention, the UI
(not user discipline) manages what is adjacent, parked, and promised, and the rest of the map
recedes without disappearing.

## 2. The backstage rule, third application

Platform-Design §2.5 predicted a third application of the named backstage principle. This is it:

> **Real navigation state backstage; conversational feel up front.**

The guided experience *feels* like being led by someone who never loses the thread. The thread
is not model memory — it is a data structure (the focus stack, §4). The LLM narrates moves and
drafts copy at gated seams; it never navigates. A digression's guaranteed return is enforced by
the UI popping a stack, which cannot forget.

## 3. Modes — one engine, one scene, several contracts

**[new — user-named]** Rather than one UI doing every job, the app operates in modes. A mode is
a contract: *which moves the guide may offer* × *what register the surface wears* × *what the
seal requires*. Same schema, same reducer, same scene geometry throughout.

| Mode | Job to be done | Seal contract | Register |
|---|---|---|---|
| **Peruse** | learn the territory; read primers; wayfinding | structure only — never credence | calm, low-commitment |
| **Mirror** | the product moment: arrival pair → sealed walk → payoff | strict (§5 of platform doc) | guided, one focus at a time |
| **Suppose** | sandbox: provisional stances, counterfactual flips | none — explicitly *not your record* | clearly watermarked as play |
| **Contribute** | record reasoning, contribute facts, structured dispute | n/a | every artifact through mediator + confirm gate |

- The first renderer's payoff wall is not discarded — it is Mirror's payoff phase, re-expressed
  as scene relighting plus guided focus over the gap/tension/sensitivity frames.
- Dyad and decision directions (Platform-Design §6, D/F) become future modes; the demotion
  recorded there generalizes into this table.
- Mode transitions are moves (§4) and therefore logged; Suppose → Mirror never leaks
  suppositions into the record silently.

## 4. The focus engine

### 4.1 Scene
- Deterministic layout from the schema — stable geography is the point (spatial memory;
  recognizable "constellation" per map). No force layout. **[validated]**
- Peruse shows structure: node kinds by shape/color, standards visually distinct, live evidence
  glowing, answered forks ringed. **Nothing encodes credence pre-commit** — the seal protects
  the user's running score, not the map's architecture. Authored structure (edge existence,
  assumption-cost dots, static load words §5.3) is seal-safe. **[validated]**
- Post-commit (Mirror payoff): the same scene relights with credence encoding — the unseal is a
  visual event.

### 4.2 Focus + context
- Focused entity centered and enlarged; neighbors placed in **relation-labeled sectors** —
  FEEDS above, RESTS ON / SPEAKS TO below, EVIDENCE to the side — because users care how the
  focus relates to its pieces, not about the whole web. **[validated — user feedback #2]**
- Focus targets are not only nodes: `node | edge | rule | tension | question | gap`. Relational
  payoff moments (T1, R3 ghost-vs-solid, the confidence gap) need frames of their own, or they
  regress into side panels.
- Unrelated territory recedes (small, dim, labels hidden) but keeps its home position.

### 4.3 The digression stack
- **push(target, reason)**: origin keeps a *smaller presence* — pinned at reduced scale with a
  tether and a visible promise ("we'll come back to: …"). **[validated]**
- **pop() → carryback**: returning attaches a strip to the resumed frame — *"While you were
  away: you took a position — '…' · new evidence is live: …"*. Carryback is structural
  (answers taken, facts gone live, thoughts recorded); credence deltas may appear only
  post-commit. **[validated]**
- Wandering (plain focus shift) and digression (push) are distinct moves; only push makes a
  promise. Zoom-out clears the stack loudly, never silently. **[validated]**

## 5. Copy — the human-readable layer

### 5.1 No shorthand on the user surface **[user feedback #1]**
- Node IDs (B5, F3, H1) never reach the user. Full phrases everywhere; scene labels are short
  *names*, panels carry full text. Schema wants an authored `shortLabel` per node (spike
  hardcoded one). *(Added in schema v0.2; UAP authored from the validated spike labels.)*
- `whyCopy` is promoted from tooltip to the primary relation surface: every "this connects to
  that" renders the edge's plain-language story inline. The schema already carried this
  artifact; the renderer was underusing it. **[validated as tooltip; inline is the target]**

### 5.2 The assumption face **[user feedback #4]**
Positions have two renderable faces:
- **question face** — the elicitation prompt; used when the position itself is focused.
- **assumption face** — the proposition that would have to be true; used whenever the position
  appears as something an outcome *rests on*. Derivable today: the option whose edges/rules
  push the focused outcome up; rule-mediated gates that only damage the outcome render as the
  negated range ("anything but: …"). With an answer recorded, the frame shows held-vs-needed:
  *"✓ you grant this" / "✗ you currently hold: …"*. **[validated]**

**No probabilities on this surface, ever.** The hybrid mechanic (Platform-Design §2.6) already
commits to words-not-numbers; additionally the additive engine cannot honestly emit joint
probability thresholds, so "you'd need P(X) > 0.6" would be fake twice over. Degree renders as:
1. categorical assumption statements (above);
2. **load language** — visual weight / "load-bearing" vs "background", from effect magnitudes
   (authored structure, seal-safe);
3. conjunction rules *naming* joint requirements (R4, singularity R1) where jointness is the
   insight.

### 5.3 Knowledge checks and primers **[new — user idea]**
A `knowledgeCheck(entity)` move ("do you know who Grusch is?") gates which copy variant
renders: primer-first for a no, concise for a yes. Primers are typed, lintable artifacts
(factory-drafted, review-tiered like everything else). Requested primers are an audience-
knowledge demand signal. Session state carries known-entities so nothing is asked twice.

### 5.4 Authoring rules (feed the voice/QA linter)
- **One fork, one proposition.** Prompts must be single-barreled; every option label must stand
  alone as an assertible proposition (it *is* the assumption face). First confirmed violation:
  UAP B5 conflates credential-weight with secondhand-discount — queued for decomposition into
  two positions (edges split; optionally a rule if the interaction itself is the insight).
  **[user feedback #3]** *(Done 2026-07-04: B5a/B5b, joint weights preserved as sums — no
  interaction rule needed yet; UAP-Port-Notes §6.)*
- PROTOCOL v1.2 frame ban applies to guide narration verbatim: describe what the map is doing,
  never what it is not.

### 5.5 Surface vocabulary: "seal" is backstage language **[user ruling, 2026-07-04]**

The pre-registration seal (Platform §5) keeps its name as a *mechanism*, but seal / sealed /
unseal — and the padlock glyphs — never appear on the user surface. Custody language reads as
the system locking your words away, which invites exactly the gotcha framing the tone work
warns against. The surface speaks in two positive registers instead (working set, applied to
the first renderer; not yet frozen):

- **The arrival pair gets a promise** — "set it aside — we'll come back to this".
- **Credence gets a reveal** — "where you land appears after you commit your answers";
  the payoff moment is "the reveal". (The session engine's state flag is already `revealed` —
  backstage and surface agree at the moment that matters.)

Voice-linter rule: seal-words and 🔒/🔓 are banned from copy fields and guide narration.
(A mechanical token ban in the linter is fine — the "lexical bans fail" finding is about
steering model narration, not about checking authored artifacts.)

### 5.6 The voice linter **[shipped 2026-07-04 — src/lint.ts]**

Pure `lintMap(map) → LintFinding[]` plus `lintNarration(text, where)` for guide-voice
strings; runs once per finished artifact — in `npm test` over content/ (`test/lint.test.ts`)
and, later, at artifact admission (**admission = validateMap + lintMap**; I9 stays in the
schema validator — the linter re-checks no schema invariant). It never intercepts live LLM
output: lexical bans fail against a steered model but hold on finished artifacts (RESULTS §6).
It is the admission gate every BYO tier needs (BYO-Inference doc §7).

Severity model (the early decision §8.5 called for): **errors fail `npm test`; warnings print
as diagnostics and never fail.** Findings are data — an admission gate applies its own policy
over the same list. Two tiers:

- **Errors (mechanical):** seal-words + padlock glyphs anywhere on the user surface (§5.5);
  non-assertible option labels — empty, question-shaped, or bare yes/no (§5.4).
- **Warnings (heuristic, for human review):** frame-ban negation patterns and rule-11
  prosecutorial vocabulary (PROTOCOL v1.2); double-barrel signals on prompts and option
  labels only — clause-joining conjunctions ("…and on what timescale"), stacked question
  marks, semicolons. Noun lists ("speed, distance, and acceleration") stay legal.

Scope rulings made in the build: author-facing `note` fields are never linted; fact text
speaks in world-reporting voice, so it is exempt from the prosecutorial scan ("officials
admitted…" describes an actor, not the user); router claims are the user's own phrasings
(seal scan only); **"gap" is excluded from the prosecutorial list** — the direction and
confidence gaps are core descriptive product vocabulary (§4.2 makes `gap` a focus kind), and
PROTOCOL bans the word only as a charge in the conversational guide's voice. Question titles
sit outside the double-barrel scan (§5.4 governs elicitation prompts; the singularity title
fuses arrival-and-timescale deliberately).

First real findings: singularity P1's two option labels warn (semicolon-joined propositions)
— model-drafted, never-reviewed content flagged exactly as intended; UAP's human-reviewed
copy lints clean, as does every `why` string guide policy v0 can emit (walked end-to-end in
the test). Open edge: renderer-embedded copy (`web/scene.ts` / `web/index.html` promise and
reveal strings) lives in code, not artifacts, so the linter can't see it — eyeball discipline
for now; revisit if a string-extraction pass earns its keep (THREADS §3).

## 6. Facts — origin and stances

### 6.1 Origin is not review tier **[new — user-named]**
Current `provenance` is a **review tier** (who vouches). Facts also need an **origin** (where
the content came from), orthogonal to review:

- `origin: llm-knowledge | web-researched | author-researched | user-contributed`
- `sources` upgrade from opaque strings to structured authorities:
  `{ authority: string; citation?: string; retrievedAt?: string }` — "distilled to an
  authority" is what a user weighs and what the linter checks. *(Shipped in schema v0.2 with
  `origin`; UAP distilled to research-artifact authorities as an interim step — the
  real-world authority taxonomy is the §6.3 pass. UAP-Port-Notes §6.)*
- **User-contributed facts are a new node class**: the regress engine's raw material ("here's
  why I believe this"), entering at draft tier, wearing origin openly. A user-fact recurring
  across sessions is the factory's strongest research-demand signal.
- The draft register generalizes from map-level to per-fact origin badges.

### 6.2 Stances — first-class reducer inputs **[new — user-named]**
User stance toward a fact, peer to `answers`, never inferred from behavior:

| Stance | Engine effect | Surface |
|---|---|---|
| **accept** | edges apply (as now) | quiet |
| **suppose** (provisional) | edges apply, traversal marked | payoff: "your landing leans on N suppositions — see it without them" (one `reduce()` call). Also the honest mechanic for adopting one reading of a contested edge, revocably. |
| **want more** | parked — exerts nothing | queues a primer; renders as "not yet weighed", never silently counts |
| **dispute** | exerts nothing | routes to the `bearsOn` position when one exists — the dispute *is* a fork the map knows **[validated in spike]** |

Engine change (v0.2, small and pure): `reduce(map, answers, factStances?)`. Non-steering holds:
stances are explicit, visible, reversible inputs.

**Shipped 2026-07-04**: `reduce(map, answers, factStances?, opts?)`; `ReduceResult` gains
`suppositions` and `parked`. Exactness decided in the build: stances never touch activation
(a parked fact stays visible in the traversal); a parked fact's contested readings leave the
table (the fact was set aside upstream of its readings); a supposed fact is a supposition
only if its edges actually moved something — supposing a contested-only fact leans on
nothing; stances on inactive/unknown facts are inert, like unanswered positions. Deferred:
suppose as *reading-adoption* on a contested edge needs a reading payload — not in v0.2.

### 6.3 The trust layer — authorities and graded testimony stances **[new — user-named]**

Sources don't become the ontology (Direction E stays demoted); they become a **layer** the
belief map already depends on. Prerequisite: structured authorities (§6.1).

- **Trust = graded stances toward authority-classes**, on a qualitative ladder (working set:
  *dismiss / skeptical / neutral / lean on / rely on*) — words in the user's face, multipliers
  backstage (the hybrid mechanic again). Never binary, never numeric on the surface.
- **Trust compiles to default fact-stances.** A fact sourced solely to a dismissed class
  arrives *parked* — visible, reason on its face ("parked: its only source is one you
  dismiss") — and a trusted-class fact arrives accepted. Always overridable per-fact. Because
  stances are already reducer inputs (§6.2), the trust layer requires **zero new engine
  mechanics**; movement display stays honest ("this moved less for you — you're skeptical of
  its only source").
- **Ownership rule** (rhymes with the fact-vs-rule double-dip convention): when a map carries
  an explicit engineered position about a source-class (UAP B5 insider testimony, B6 conflicted
  investigator), the **position owns the credence**; the trust profile only pre-fills its
  answer, confirm-gated.
- **Scope = the map's own fact layer.** The trust surface of a topic is the set of authorities
  its facts cite, rolled up an **authority taxonomy** (source → institution class → funding
  class → field) — a factory-authored, stable-id'd, lintable artifact class. Elicitation is
  lazy: no questionnaire; the guide offers a trust move the first time a fact from that
  authority matters, knowledge-check first ("do you know what AARO is?").
- **Freeform → refinement** is §2.5 mediation verbatim: user types "I don't trust pharma-funded
  scientists" → mediator maps onto the taxonomy → returns *menu chips* of refined subsets and
  lateral classes to weigh in on; restatement confirm-gated. Smart menus by default, typing
  always available, never an open channel.
- **The fingerprint's second sheet.** Sheet one: standards (how you read evidence). Sheet two:
  trust profile (whom you'll hear), keyed to stable authority-class ids, portable across maps —
  facts arrive pre-parked *visibly* on a new topic. Sensitive data; sits behind the seed §12.3
  privacy gate. Trust-word drift is a longitudinal scalar worth tracking.
- **Derived payoffs:** systematic **trust tensions** ("your two dismissals pull opposite
  directions here — which carries more weight?"; T1 was this, hand-authored) and the
  **sociological bill** (seed §12.6 lands here): collect the authority-classes a landing
  requires to be wrong and state the bill plainly — the trust profile inverted into a cost.
- **Gaming is answered by revelation, not prevention:** trust stances join the sensitivity
  ranking — "what's carrying your landing: your dismissal of AARO; restore neutral and it
  flips." Weighting the world to protect a conclusion stays possible; it stops being invisible.

## 7. The session layer

- **A session is a log of typed moves.** `focus / push / pop / expand / presentFact / react /
  stance / answer / knowledgeCheck / recordThought / mode-switch`. One decision, four payoffs:
  pure session reducer (`(SessionState, Move) → SessionState`) testable like the belief
  reducer; the move log is the factory demand signal (dwell, pushes, disputes, primer
  requests); it is the persistence unit for the six-month re-elicitation diff (Platform-Design
  §8.7); engineered insight moments become authored move sequences the factory can generate and
  lint (the "move library").
- **Guide policy**: ranks candidate next moves. v0 is a pure, inspectable function over
  (map, session) — unanswered gating positions, sensitivity, assumption cost. Parameterized by
  mode (§3).
- **Curation risk (named):** §2.5 killed improvised-speech tone risk; ordering and selection is
  where manufactured emphasis can now hide. Mitigations: deterministic v0 policy, every move
  logged, LLM-assisted policy later emits typed moves that are linted like all artifacts.
- `recordThought` free text goes through the mediator restatement + confirm gate
  (Platform-Design §2.5.2); a rejected restatement is a §4.2 mismatch finding.

### 7.1 Semantics made exact by the build (2026-07-04, `src/session.ts`)

Writing the session reducer forced these decisions — the effect §8.1 predicted. They are
pinned by `test/session.test.ts` (20 cases); this list is the record. **[validated — engine + tests]**

- **The move grammar gained `commit` (move 12).** The canonical eleven had no move that ends
  the sealed walk, yet Mirror's walk ends with an explicit "commit answers & unseal" act (the
  first renderer already knew this). Commit is Mirror-only and **monotone**: a session unseals
  once and never re-seals; a new arrival is a new session.
- **The arrival pair is the door, not a move.** It enters at `createSession` or once on a
  switch into Mirror (`ARRIVAL_EXISTS` otherwise). Mode is a required constructor argument so
  §9.4 (Peruse-first vs Mirror-first) stays genuinely open.
- **`react` ≠ `stance`.** The spike's reaction chips conflated a soft signal with an engine
  input. `react` (`makes-sense` / `surprising` / `unconvinced` / `hadnt-considered`, a v0
  working set) is a logged demand signal that exerts nothing; `stance` is the §6.2 reducer
  input, revocable (`null` clears), routed to record or sandbox by the mode contract.
- **Suppose is a sandbox workspace**, cloned from the record on entry and dropped on exit with
  a loud one-shot notice counting the dropped suppositions — "never leaks silently" is
  structural, not disciplinary. **Entering Suppose during a sealed walk throws** (`SEALED_WALK`):
  live sandbox bars would un-blind the walk sideways. A no-arrival session may Suppose freely;
  the mild self-served-landing leak is accepted in v0.
- **Carryback is exact.** A push snapshots raw inputs only (record answers, stances, thought
  count); pop diffs the record as-it-was against as-it-is via two belief-reducer re-runs:
  answers taken/changed/cleared, stances changed, facts gone live, thoughts recorded.
  Suppositions never appear in a strip (the record is what carries back). `credenceShift`
  (total-variation) exists on the object **only when the session is unsealed** — the seal is
  engine-enforced, not renderer discipline. The strip attaches to the resumed frame and clears
  on the next focus-changing move.
- **Zoom-out is `focus(null)`**: it clears the stack with a `promises-abandoned` notice naming
  the broken promises. Notices are one-shot (the next move clears them). Wandering never
  touches the stack; only push promises.
- **Mode contracts are data** (`MODE_CONTRACTS`): job, register, `credenceRender`
  (never / after-commit / live), workspace routing, and the allowed-move table — `answer` in
  Mirror + Suppose; `stance` additionally in Contribute (structured dispute is a stance);
  `commit` in Mirror alone; the nine wayfinding moves everywhere. The reducer enforces
  (`MODE_CONTRACT`).
- **Guide policy v0 is a pure ranked-offer function** (`guideOffers`): dispute routing (a
  disputed fact's unanswered `bearsOn` fork outranks everything) → unanswered forks by
  structural gate weight (rule gates + edge magnitudes + fact triggers: authored structure,
  seal-safe per §4.1) → live evidence bearing on the focused fork → a pop reminder whose score
  rises with stack depth (§9.6: no hard cap, observation first) → post-commit only, the payoff
  frames (direction gap, confidence gap, tensions, contested edges, sensitivity revisits).
  Scores are backstage; `why` copy is lintable and PROTOCOL-bound. No knowledge-check offers
  yet — the schema has no entity/primer registry to draw from (§9.3).

## 8. Build order

1. **Session engine** — `src/session.ts`: move types, session reducer, guide policy v0,
   mode contracts as data; node:test suite. (Writing the reducer will force carryback and
   stance semantics to be exact — the "schema audits content" effect.)
   **Shipped 2026-07-04** — `src/session.ts` + `test/session.test.ts`, 55/55 with the map
   suites; the forced decisions are recorded in §7.1.
2. **Engine v0.2** — `factStances` input; suppositions surfaced in `ReduceResult`. (The trust
   layer compiles to stance defaults, so it rides this with no further engine work; the
   authority taxonomy and freeform-trust mediation land in phase 5.)
   **Shipped 2026-07-04** — reducer + carryback/guide-policy threading; exactness notes in
   §6.2; 65/65 with all suites.
3. **Content fixes** — decompose B5; authored `shortLabel`s; begin origin/authority fields
   (schema v0.2) with UAP sources restructured.
   **Shipped 2026-07-04** — B5 → B5a/B5b (joint weights preserved; UAP-Port-Notes §6);
   `shortLabel` on positions/facts; `FactSource {authority, citation?, retrievedAt?}` +
   `origin` in the schema; 67/67 with two new conformance guards.
4. **Scene renderer on the session engine** — replace both the first renderer's elicitation
   wall and the spike; Mirror mode first (arrival → seal → focus walk → relight payoff), then
   Peruse; Suppose after engine v0.2.
   **Shipped 2026-07-04** — `web/scene.ts` + `web/index.html` at `/`; Mirror end-to-end plus a
   Peruse toggle (mode contracts enforced by the engine; the peruse frame simply has no answer
   chips to render). Suppose UI still pending. Every interaction dispatches a typed move; the
   guide rail renders `guideOffers` rank verbatim and only dedups the frame already on screen.
   The spike's relation sectors and assumption face were lifted and made map-generic; the
   deterministic overview layout is computed from any map (outcomes arc by question, positions
   ordered by scope centroid, facts pulled toward adjacency). `web/app.ts` and `web/spike.*`
   deleted. Browser-validated on UAP (full walk incl. digression carryback, stances,
   parked/supposition payoffs, both gaps, T1/T2, contested F3/F10, R3 ghost-vs-solid) and on
   the singularity draft (DRAFT register, no facts, generic layout).
5. **LLM seams last** — primers, expansions, thought restatement, draft-node creation — each
   behind §2.5 gates; **voice linter lands immediately before this phase** (its rule set now
   includes §5.4).
   **Linter half shipped 2026-07-04** — `src/lint.ts` + `test/lint.test.ts` (76/76 with all
   suites); severity model and scope rulings in §5.6. The seams are next.

## 9. Open questions

1. **The reflex relation.** A's "rests on" correctly excludes B6 (only R3's *naive* update
   touches A), yet people arrive believing the AARO fork bears on A — that misbelief is the
   map's signature lesson. Should naive-redirect adjacency render as a distinct ghost sector —
   "commonly thought to rest on — the map disagrees"? (Leading candidate: yes, ghost-styled,
   linking to R3's frame.)
2. **Load-language thresholds.** Magnitude → "load-bearing / supporting / background" needs the
   same honesty treatment as `supportedStrength` (Platform-Design §8.5) — relative to the map,
   not absolute cuts.
3. **Primer authoring.** Factory stage or on-demand LLM draft with cache-and-review? Interacts
   with offline-first (everything through phase 4 works without a model call).
4. **Mode entry.** Does a fresh visitor land in Peruse or Mirror? (Belief-first arrival argues
   Mirror-first with Peruse one gesture away; returning visitors may differ.)
5. **Session persistence.** The move log is the first durable user artifact — localStorage
   until the accounts/privacy question (seed §12.3) is answered deliberately.
6. **Stack depth.** Cap digression depth (2–3?) before the guide insists on returning, or trust
   the tether? Needs observation, not theory.
7. **Authority taxonomy authoring.** Who writes it, at what granularity, and how do classes get
   stable ids across maps? (Cap: only classes the map's facts actually cite, plus their direct
   ancestors.) How are lateral suggestions generated — taxonomy siblings, or mediator judgment?
8. **Trust-ladder honesty.** The word→multiplier mapping needs the same relative-not-absolute
   treatment as `supportedStrength` and load language (§9.2) before anything user-facing.
9. **Trust vs. contested edges.** A contested edge whose readings are backed by different
   authorities the user weighs differently — does the trust profile *suggest* a provisional
   reading (suppose-stance), or stay silent? Suggestion risks steering; silence wastes signal.
10. **Idea on record — the coherence probe (entailment reveal).** Raised 2026-07-04; captured
    as a *possibility*, not a chosen direction — no build weight attached. The idea: a user
    expresses some beliefs, then is prompted with other, seemingly less-related forks — chosen
    because certain combinations naturally narrow the space — so the surface can eventually
    say "for those to all hold together, these further assumptions would have to hold — what
    do you think of them?" Discussion notes, for whichever session weighs it: it echoes the
    commit→reveal spine (a possible third gap — coherence — beside direction and confidence,
    and a user-relative reading of assumption cost); much of it looks derivable
    (counterfactual re-runs over unanswered positions yield the riders of a held outcome;
    latent authored tensions could rank elicitation offers; riders would render via the
    assumption face and route like disputes); tension flags are answer-structural, so
    mid-walk friction surfacing would be seal-safe; a cross-map version could ride the
    standards fingerprint; it resembles a single-player crux-finder (cf. the parked dyad
    mode). If ever pursued: (a) the additive engine cannot honestly say "necessarily" —
    lean-language or a deliberate hard-gate mechanic, same relative-honesty family as
    supportedStrength/load language; (b) the register would need to be invitation, never
    charge (silent-abandonment risk), with any conflict-seeking objective living in the
    inspectable guide policy.
11. **Idea on record — the answer-shape probe (keeper-shape refinement).** Raised 2026-07-04;
    captured as a *possibility*, not a chosen direction — no build weight attached. The idea:
    a user who answers a fork is often answering against an implicit *shape* of the
    proposition — "a multi-decade secret couldn't be kept in government" imagines a government
    keeper with FOIA exposure and oversight — while evidence on the table asserts a different
    shape (the testimony places custody with private contractors in highly compartmented
    setups, outside those channels). The surface could offer the variant shape back as a fork:
    "could that shape of truth be viable?" Discussion notes, for whichever session weighs it:
    it is a subtler cousin of the single-proposition rule (§5.4) — the prompt is
    single-barreled but the reference class is underspecified; three candidate homes, cheapest
    first: (a) content surgery — decompose the position by keeper shape (the B5→B5a/B5b
    operation) plus an author-researched fact bearing on the new fork, after which the
    assumption face does the work with no new machinery; (b) an authored follow-up relation
    ("option held × fact live → offer fork X with this copy") — which would be the first
    concrete move-library artifact (§7); (c) answer-conditional guide offers (gateWeight is
    structure-only today; dispute routing is stance-triggered — neither fires on this).
    Overlaps §9.10's coherence probe in spirit ("what your answers haven't yet covered") but
    is narrower and fully authorable, so it could ship as content long before derived
    machinery. Register: invitation, never charge — the leak prior isn't wrong; the map is
    showing the claim's actual shape. Frame ban applies verbatim.

---

*Companions: `Platform-Design-2026-07.md` (platform frame; §2.5 is the parent decision),
`Schema-v0.md` + `src/schema.ts` (schema; §6 here implies v0.2), `experiments/tone/PROTOCOL.md`
(voice rules), `web/spike.*` (the throwaway spike these findings came from).*
