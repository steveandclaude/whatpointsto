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
   **Visual register redesigned 2026-07-04 (user brief: light mode, no warm-cream/terracotta
   defaults, no text hidden behind ellipses).** The light register is a surveyor's field
   sheet: cold paper, blue-black ink, kind hues ultramarine/violet/petrol and **mulberry for
   landings & credence**; serif prompts, mono annotations, no webfont dependency
   (offline-first holds). The seal's visual translation: **pre-commit the sheet is penciled**
   (outlined shapes; the promise register is dashed graphite) and **commit inks it** (fills
   flood, bars rise, the reveal register is mulberry ink) — pencil→ink is the §4.1 "unseal is
   a visual event" made literal. Readability rule now standing: panel copy never truncates
   (chips/offers/crumbs wrap in full); scene labels wrap to 3–4 balanced lines with an
   ellipsis only past that; relation-sector bands were made disjoint on the circle (feeds
   −135…−45°, evidence 155…205°) after the old edges collided labels. Draft register: hatched
   pencil sheet + rubber-stamp red DRAFT.
5. **LLM seams last** — primers, expansions, thought restatement, draft-node creation — each
   behind §2.5 gates; **voice linter lands immediately before this phase** (its rule set now
   includes §5.4).
   **Linter half shipped 2026-07-04** — `src/lint.ts` + `test/lint.test.ts` (76/76 with all
   suites); severity model and scope rulings in §5.6. The seams are next. Their UI entry
   points are the seam-invitation offers designed in §10.4 — the seams build reads its doors
   from there and does not wait on the visual dissolution.

## 9. Open questions

1. **The reflex relation.** A's "rests on" correctly excludes B6 (only R3's *naive* update
   touches A), yet people arrive believing the AARO fork bears on A — that misbelief is the
   map's signature lesson. Should naive-redirect adjacency render as a distinct ghost sector —
   "commonly thought to rest on — the map disagrees"? (Leading candidate: yes, ghost-styled,
   linking to R3's frame.) *(Delivery vehicle candidate found 2026-07-04: the generative
   journey's probe beats — §11.)*
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
    inspectable guide policy. *(Delivery vehicle candidate found 2026-07-04: the generative
    journey's left-field probes — §11.)*
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
    showing the claim's actual shape. Frame ban applies verbatim. *(Delivery vehicle
    candidate found 2026-07-04: the generative journey — §11.)*
12. **Idea on record — dissolving the panel into the scene (focus-adjacent rendering).**
    Raised 2026-07-04, right after the light-register redesign; captured as a *possibility*,
    not a chosen direction — no build weight attached; the user wants a dedicated session on
    it ("I don't quite know how that would work"). The instinct: the sidebar duplicates what
    the scene already says spatially — the relation sectors hold the very neighbors the
    panel restates as chip lists — so far more of the focus/questioning surface could live
    in the surroundings of the focused entity. The user's sketch of the feel: **clicking an
    item surfaces its further options in place** — e.g. clicking a fact surfaces the stance
    moves right there (accept / grant for now / want more / dispute), rather than in a
    frame beside the map. Discussion notes, for the session that weighs it: (a) the
    redundancy is real and half-acknowledged by the docs already — carryback "attaches a
    strip to the resumed frame" (§4.3) and promise origins keep a pinned scene presence, so
    several panel strips are natural scene residents; (b) candidate shapes, cheapest first:
    click-to-surface affordance clusters on scene items (the user's sketch — stance chips at
    a fact, option plaques at a fork, elicitation becoming spatial; answering inks the
    chosen plaque); relational chip rows leave the panel while prompt + transient strips
    stay in a compact focus card; edge whyCopy revealed along its edge; full dissolution
    last; (c) the hard cases are exactly why §4.2 made non-node focus targets first-class —
    tension/gap/rule frames are relational and node-less, and dissolving the panel must not
    regress them into nothing (the "guided one-at-a-time vs. relational payoffs" tension
    cuts both ways here); (d) wherever the guide rail renders, the policy's rank must stay
    legible (curation risk, §7) — spatial placement that obscures rank is a regression, not
    a redesign; (e) option labels are full assertible propositions (§5.4) and scene text
    real estate is contested (the label-collision fix this session is the proof), so
    in-scene elicitation needs a layout answer, not just intent; (f) mode contracts still
    gate affordances (Peruse renders no answer or stance chips); (g) every surfaced option
    still dispatches the same typed move — this is a renderer-surface question, the session
    grammar is untouched; (h) **freedom needs a counterweight** (user, same conversation):
    with more clicking freedom the guide's job widens from "what to look at next" to "when
    to bring the model in before continuing" — seam invitations (have Claude research this
    disputed fact; draft a primer for this want-more; restate this thought) become a
    first-class guide-offer family with *structural, inspectable* triggers (unrouted
    disputes, accumulating want-mores, knowledge-check misses — stance/structure-derived,
    so seal-safe pre-commit), ranked and worded like every other offer (lintable why copy).
    §2.5 pull-not-push holds throughout: the interface invites, the user invokes, the model
    never enters the record uninvited. Rhymes with BYO-Inference §5a, where those same
    stances already form the agent's research queue — this is the same demand signal,
    surfaced to the user in the moment instead of pulled by an agent later. Payoff if it
    works: the scene reclaims the panel's 470px and the walk feels like inhabiting the map
    rather than reading beside it — with the guide, not the layout, carrying the discipline.
    *(The dedicated session ran later the same day — the design record is §10; this entry
    stays as the original capture.)*

## 10. Dissolving the panel — three organs and the journey rail

**[designed 2026-07-04, the dedicated session §9.12 asked for; direction user-affirmed,
details not frozen; build not ordered — the register keeps the LLM seams next (§8.5)]**

Graduates §9.12 (kept above as the original capture). Provenance: user riffs + a
code-grounded pass over `web/scene.ts` / `web/index.html` as shipped in the light register
(§8.4).

### 10.1 The organizing principle

Every sentence the panel renders is *about* something: a scene object (a fork's options, a
fact's text, an edge's story, the assumption an outcome rests on) — or the session itself
(the promise, the guide's suggestions, the commit act, notices). So the dissolution is not
"move the panel into the scene" but:

> **Content goes home to its object. The session's own voice gets organs of its own.**

The panel deserved to die for restating **space** — neighbors the relation sectors already
place (§9.12(a); proven in code: `retarget()` already pins digression origins in-scene as
§4.3's "smaller presence" while `crumbsHtml()` restated them in the panel). But nothing
anywhere showed **time** — where you've been, what you flagged, what's unfinished, what's
worth returning to. That is the missing dimension, and it becomes the third organ:

- **Scene** — objects in space. A node's perimeter budget is hard (the §8.4 label-collision
  fix is the proof); it carries only the object's own affordances.
- **Focus card** — the focused thing's full text. §5.1 (no shorthand) + §5.4 (option labels
  are full assertible propositions) make total dissolution a mirage: a readable block
  survives in any honest version, exactly as §9.12(b)'s "compact focus card" anticipated.
  It docks *at the focus* — the −45°…30° arc is unclaimed by relation sectors (feeds
  −135…−45, rests-on/speaks-to 30…150, evidence 155…205), and neighbors orbit at ~275px, so
  the focus layout has already cleared the real estate — and it contains only the focused
  thing's own content, everything relational having moved onto sector members.
- **Journey rail** — the session made visible (§10.3). Plus a thin top **register banner**
  (promise/reveal line, one-shot notices, DRAFT stamp — register-level voice, object-less).

### 10.2 Dispositions

| Panel resident today | Destination |
|---|---|
| Crumbs ("we'll come back to…") | Deleted — the pinned origins `retarget()` already draws *are* the crumbs; they gain the pop click + promise wording, and the rail absorbs the column |
| Carryback strip | Attaches to the resumed focus card — §4.3 said "attaches a strip to the resumed frame" verbatim |
| Relational chip rows (evidence-that-speaks-to, where-this-points, bears-on, runs-from, fires-from, answers-in-friction) | Deleted as lists — sector members *are* these chips. Sectors are promoted from navigation to content: each member wears the payload the panel said about it (assumption-face text + held ✓/✗ on rests-on members; `edgeWhy` along its edge) |
| Answer options ("Where do you stand?") | A **ballot** docked in the free −45°…30° band at the focused fork — stacked full-width plaques (never radial scatter; the label-collision lesson), penciled; the chosen plaque inks. Input-echo, not credence: seal-safe pre-commit, same as the answered rings that already render |
| Stance row, react row | Short-chip rows riding the focused fact / focus card — short labels genuinely fit at the node |
| Prompt, fact text, sources, badges, notes | The focus card |
| Non-node frames (tension, rule, edge, question, gap) | Center-stage card **tethered to its relit participants** — `highlightIdsFor()` already computes exactly those nodes; today they sit lit but scattered while the explanation lives in the sidebar. This is §9.12(c) answered: the frames keep frames; only the container moves |
| Pre-commit overview | Dissolves — question titles already render as scene captions, legend becomes a corner key, answered-dots + promise live in rail/banner |
| Post-commit overview (the reveal) | **Kept as the one whole-sheet moment** (leading answer, unobjected): an overlay dismissed into the relit scene. Commit is when the sheet is inked *and read whole*; post-commit the seal no longer constrains, so a wall is finally honest; it is the home of "what moved beneath you" and the only door to rule frames |
| Guide rail + commit bar | The journey rail — offers at its head in rank order, commit at its foot |

Net: the 470px sidebar dies; fixed chrome shrinks to the rail (~48px collapsed) + the top
banner; the 1400×920 viewBox renders ~50% larger on screen, easing every label problem.

### 10.3 The journey rail — the walk made visible

The user's organ (sketched as "a vertical row of dots where some get an emphasis treatment
and one-liners about why the user may want to revisit"), given legs: the scene shows only
space; the rail shows **time**. It is also the standing answer to "I can click anything —
but what *should* I click next?", which is §1's attention problem restated: freedom of
movement plus an always-visible, specific, ranked next move. The north star is the
interface guiding a conversation — the session log is the transcript; the rail is the
transcript made visible; the guide policy is the interlocutor choosing the next question.

- **Geometry**: a ~48px vertical spine, expanding one-liners on hover/focus. **Hard cap:
  one line per notch** — full text lives in the focus card the notch links to; the cap is
  what keeps the rail from creeping back into a panel. Side: leaning **left** (it absorbs
  the pinned-origin column already drawn at x≈130); right stays a live alternative.
- **Zones, top→bottom — the conversation's arc**: **ahead** (guide offers in rank order;
  reading order = rank order, so §9.12(d) legibility survives unchanged; seam invitations
  render here, §10.4) → **here** (the current focus, tethered to its scene node) →
  **behind/around** (coverage dots: one per fork, filled when answered, hollow when not;
  kept-promise ticks) → **foot: commit** — the terminal notch; the walk literally leads
  down the trail to the inking moment.
- **Emphasis vocabulary, split on the seal**: pre-commit the rail may echo only *the user's
  own visible inputs* — `unconvinced` / `hadn't-considered` reactions (the first payoff
  surface the `react` move has ever had), **wavering** (repeated `answer` moves on one
  fork: a pure move-log derivation), want-more / dispute stances — plus authored structure
  (gate weight). Post-commit, credence-derived emphasis joins: sensitivity ("this one
  answer is carrying your landing — flip it and you land elsewhere"). One-liners are
  authored/templated copy → `lintNarration`, like guide `why` strings.
- **Tension magnetism**: two answered dots in friction render pulled toward each other; the
  pair opens the tension frame.
- **Visited-memory resolves here** (THREADS §3): the rail is the seen-surface, and
  visited-ness enters guide policy as an explicit session-derived input (seal-safe) — the
  policy can then stop re-offering visited frames, or re-offer deliberately.
- Scale caveat: dot-per-fork suits curated maps (UAP: 11); revisit density past ~20 forks.

*(2026-07-04, later: §11 R2 revises the coverage zone — the census dots give way to the
trail + fade-horizon path.)*

### 10.4 Seam invitations — the counterweight, designed

§9.12(h) made concrete: a new guide-offer family whose triggers are structural,
deterministic, and seal-safe.

1. **Unrouted dispute** — a disputed fact with no unanswered `bearsOn` fork: the map cannot
   metabolize the objection. Ranks immediately below dispute routing — the map's own answer
   always outranks bringing the model in.
2. **Want-more accumulation** — parked want-mores ≥ N; score climbs with count (the pop
   reminder's pattern). This is BYO-Inference §5a's research queue surfaced in-moment.
3. **Knowledge-check misses** — named but dormant until an entity/primer registry exists
   (§9.3).

`why` copy is lintable and frame-ban-bound like every offer. **Accepting is tier-specific
and belongs to the seams build**: workbench — the queue is already the agent's
pull-briefing (BYO §5a); door tier — a completion seam; chat tier — a deep link. Ordering
consequence (resolving the 2026-07-04 handoff question): **this family defines the seams'
UI entry points** — the seams build reads its doors from here, and does not wait on the
visual dissolution stages.

### 10.5 Guidance: coded vs. LLM

"The interface guiding a conversation" decomposes into three jobs. (1) *Choosing the next
question* — coded today, and demonstrably decent: guide policy v0 independently ranked B2
the top unanswered UAP fork, agreeing with the map author's load-bearing note (THREADS §6).
(2) *Saying why it matters now* — authored templates today; the genuine LLM upgrade is
situational fluency (phrasing the why against the user's arrival claim and reactions;
completion-shaped, so BYO tier-1 viable, viewer-billed). (3) *Pacing the arc* — depth vs.
breadth vs. "you're ready to commit"; v0 is crude here (the stack-depth pop score), and a
model could modulate it.

The architectural point is already locked in §7: **policy v1 is an LLM re-ranker emitting
the same typed ranked offers with linted `why` copy through the same channel** — a
swappable implementation behind a stable interface. The rail renders v0 and v1 identically;
curation risk stays managed because rank stays logged, inspectable, and linted. Cadence:
model inference fires at *trigger boundaries* (the §10.4 triggers, wavering, dwell), never
per-move — deterministic re-ranking already runs on every move for free. Periodic inference
is optional fuel, not architecture.

### 10.6 Staging (build candidate — not ordered)

1. **Chrome migration** — commit + promise/reveal + notices into rail skeleton/banner;
   carryback attaches to the resumed focus card; crumbs absorbed by the pinned origins.
   Pure renderer shuffling; kills most sidebar height; lets us feel the direction cheaply.
2. **Elicitation in place** — the ballot at forks; stance/react chip rows at facts;
   relational chip rows deleted; sector members wear their payloads; `edgeWhy` along its
   edge.
3. **Focus card + center stage** — sidebar deleted; non-node frames become tethered
   center-stage cards; the reveal becomes the whole-sheet overlay.

Implementation notes: in-scene affordances are **HTML overlays positioned from scene
coordinates**, not SVG text — keeping existing chip markup, CSS, wrapping, and the
`role="button"`/keyboard delegation for free. Browser iteration loops run in a background
agent (session memory). Open sub-questions: left vs. right rail; ballot geometry at high
option counts; rail density on much larger maps; whether dismissing the reveal overlay is
`focus(null)` or wants its own move.

**Stage 1 shipped 2026-07-04** — built by a delegated background fork off
`docs/plans/2026-07-04_journey-rail-stage1.md`; `npm test` 76/76; browser-validated
end-to-end on both maps (walk, digression + carryback via rail notches, commit at the
foot, Peruse contract, keyboard pass; the seal split checked programmatically — zero
credence-derived emphasis pre-commit, `carrying` only after the reveal). `#register`
banner + left journey rail (toolbar · top-3 offers in rank order · here-marker · promise
notches · coverage dots · commit foot); `#panel` slimmed to frame + carryback;
`crumbsHtml`/`commitBar`/`guideRail` retired. Build rulings worth keeping: (a) the rail
expands as an **overlay** — in-flow expansion rescales the SVG scene on every hover, so
the stage-3 focus card should be an overlay too; (b) **react rows were added to position
frames** — the flagged emphasis keys on fork-target reactions, which previously had no UI
entry point (react is engine-legal on any target; minimal one-line enabler); (c) expanded
width 308px so the vetted commit label never truncates.

## 11. The journey — a generative walk, not a script

**[captured 2026-07-04, from the first remote walk-through (the Pages deploy, same day);
R1–R2 user-affirmed, R3 proposed; rule-mining ongoing — this section accretes as
commentary continues]**

### 11.1 The gap the walk-through exposed

Guide policy v0 is a counselor, not an itinerary: it ranks the locally best next move, so
it is always coherent and never composed — no warm-up, no escalation, no deliberate
left-field beat, no setup-then-payoff. Mirror's contract promises "guided, one focus at a
time"; what shipped is self-directed-with-advice. The imagined experience (user): be
walked stop by stop, one thing at a time, mostly sensible, occasionally a question out of
left field — because the walk is checking whether the user is confident about something
demonstrably wrong, and then showing them the fact. UAP's signature instance: most
visitors confidently hold "there's nothing new here" and have never met the dated record
(sworn congressional testimony; the 2017 NYT disclosures).

Ruled out in the same conversation: authored story scripts. The ask is **rules and schema
that architect the dynamics** — nobody writes the plot. This reframes §7's move library:
its artifacts become beat templates and eligibility tags, not hand-authored sequences.

### 11.2 The probe beat — the seal, miniaturized

The three-beat template: **elicit a small commitment → reveal the fact → re-ask (or
react)**. It lands because the user answered first — commit-then-reveal is the product
thesis applied at stop scale, and it is seal-safe throughout (facts are authored
structure; what gets revealed is the user's own prior meeting the record). Register:
invitation, never charge — the fact does the confronting in world-reporting voice; guide
copy stays PROTOCOL-bound. **Both-directions requirement:** a journey must surprise the
dismissive skeptic (testimony under oath) and the confident believer (the contested
F3/F10 readings) with the same mechanics, or it is a conversion funnel rather than a
mirror.

The journey is the delivery vehicle three recorded ideas were waiting for: the reflex
ghost (§9.1 — confidently-assumed-but-wrong adjacency), the coherence probe (§9.10 —
deliberately non-local prompts), and the answer-shape probe (§9.11 — correct the implicit
shape with a fact).

### 11.3 The generative architecture

A journey is (disclosure rule × beat grammar × eligibility tags × rhythm rule), with an
optional LLM sequencer on top. The deterministic core:

- **Beat grammar** — *decide* (focus a fork, answer), *read* (present a fact or edge,
  react or stance), *probe* (the three-beat above): typed, lintable templates,
  instantiated from the graph — never from a script.
- **Eligibility as schema** — a fact may declare which held option it surprises (a small,
  authorable, lintable field; kin to §9.1's naive-redirect adjacency). Probe trigger =
  the user holds the surprised option ∧ the fact's strength qualifies — structural and
  inspectable, the same trigger family as §10.4's seam invitations.
- **Rhythm rule** — N frontier stops, then a probe if one is eligible: the
  mostly-coherent-with-occasional-left-field texture, deterministically schedulable.
- **The journey is a guide-policy variant** through the same typed-offer channel
  (§10.5's swap slot): a journey policy emits the next stop as the top offer with beat
  copy as the why. The walk, the rail, the moves, the seal — untouched.

**LLM uplift, bounded (§2.5 posture — the graph is the menu):** the deterministic core
produces a frontier of a few legal stops; the model (a) chooses among them toward
**named, inspectable target states** — curiosity, productive surprise, reconsideration;
never a destination — and (b) writes the transition voice ("that answer makes this next
question matter — it will feel unrelated; stay with me"). Sensor = the explicit react log
(`surprising` is the applause meter; a run of nothing-but-makes-sense is the boredom
detector). Every output is a typed offer with lintable copy.

### 11.4 Disclosure rules — the mined ledger

Mined from live walk commentary; each felt-wrongness converts to a rule candidate.

- **R1 — the map is drawn by walking it** [user-affirmed]. Post-arrival the sheet is
  nearly blank: one penciled thread — the claim's outcome and the top-gate-weight fork
  beneath it. Each answer draws its consequences (activated edges sketch in, facts that
  went live appear, the next fork pencils in at the frontier). Beyond the drawn
  territory: **blank** (ruled — no silhouettes). Commit inks what was drawn.
  Blank→pencil→ink: the walk draws the map, the reckoning scores it. Stable geography
  holds — things appear only at their home positions. Seal-safe: §4.1 *permits* structure
  pre-commit, never requires it. Whole-territory viewing is Peruse's register; the full
  overview inside Mirror was a register leak (provenance: the first phone walk landed on
  the full constellation right after arrival — §1's wall at minute zero).
- **R2 — the rail is a path, not a census** [user-affirmed]. Trail behind = only stops
  actually made; horizon ahead = up to X stops, then **fade — never an end**. No
  deterministic step count: journey length is conditional (probes fire on holdings,
  disputes and want-mores add stops), so any census claims a false denominator.
  Resolution gradient across the horizon: next stop named → then shaped-but-not-named
  ("something about sensor evidence") → mist. The horizon is a pure-lookahead **forecast,
  not a plan**, recomputed every move; visible rerouting in the fade zone is a feature —
  the path is seen responding to answers. *(Supersedes stage 1's coverage census — one
  dot per fork from minute one — when the journey builds.)*
- **R3 — readiness in words; commit lifts the fog** [proposed, leaning yes]. The commit
  affordance drops counts for load-language readiness ("most of what your claim rests on
  is still unasked" → "you've spoken to the load-bearing forks"). At commit the whole
  sheet finally appears — inked where walked, faint pencil where defaulted — the
  confidence gap made spatial: *here is what your landing takes on faith.* Mystery
  belongs to the walk, not the verdict.

### 11.5 Method and open questions

The method is rule-mining: the user walks the live build and narrates every moment that
feels wrong; each felt-wrongness converts to a rule candidate. Two comments produced R1
and R2. Ongoing — this section accretes.

Ruled 2026-07-04 (build go-ahead): **the journey is Mirror's default entry** — free
wandering survives inside drawn territory, with Peruse one gesture away (interacts with
§9.4). R1–R3 enter the J1/J2 build (docs/plans/2026-07-04_journey-j1-j2.md); R3's
ratification is the walk itself. Still open: the X value and fade curve; the
register of shaped-not-named teaser copy; whether R3's fog-lift shares §10.6's
reveal-overlay mechanism; authoring conventions for the surprises tag (what evidence bar
establishes "commonly assumed"?); whether probe density wants a per-session cap
(fatigue).

**J1+J2 shipped 2026-07-04** (delegated fork; 88/88; browser-validated on both maps with
zero console messages; Peruse round-trip restores the fog). `src/journey.ts` — the pure
core: `neighbors`, `disclosure {drawn, frontier, full}` (R1), `journeyOffers` (guide
policy v0 + the no-leak filter), `journeyHorizon` (status-quo forecast, k=3),
`readiness` (load words, never counts); the seal is pinned by a basePrior-variant
disclosure test. Renderer: fog + pencil-in entrances; the rail becomes trail (last-8
window) → here → horizon → promises → readiness foot; **the named horizon stop IS the
policy's top offer** — ranks 2–3 render shaped-not-named per R2, absorbing the old
three-offer list (reading order is still rank order; revisit if the shaped ranks ever
feel like curation opacity); commit lifts the fog with walked-vs-unwalked *re-derived*
from pre-commit disclosure, never snapshotted. Build rulings: active facts draw only
adjacent to drawn territory (baseline facts otherwise flood R1's near-blank arrival —
the verification contract outranked the plan's literal wording); the no-leak rule keeps
exactly two doors, `present-fact` and dispute routes; `SessionState.presented` already
existed, so session.ts is untouched; `gateWeight` is temporarily duplicated in
journey.ts (consolidation queued). R3 is built — its ratification is the walk itself.

---

*Companions: `Platform-Design-2026-07.md` (platform frame; §2.5 is the parent decision),
`Schema-v0.md` + `src/schema.ts` (schema; §6 here implies v0.2), `experiments/tone/PROTOCOL.md`
(voice rules), `web/spike.*` (the throwaway spike these findings came from).*
