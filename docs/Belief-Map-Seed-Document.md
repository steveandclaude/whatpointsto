# Belief Mapping Project — Seed Document

> **Purpose:** This is the master seed from which the project can grow in multiple directions. It captures the full arc of a design conversation (July 2026) that started with a domain-hack question and ended with a multi-framework epistemic tooling platform concept. It is written so a future collaborator (human or Claude) can pick up any single thread without the others, but also see how they interlock.
>
> **Companion document:** `UAP-Belief-Map-Handoff.md` — the detailed build spec for the first curated topic map (node library, cascade engine, fact base from four research artifacts). This seed document supersedes nothing in it; the handoff remains the authoritative v1 build spec. Where this document says "the UAP spec," it means that file.
>
> **Status of everything here:** generative. Nothing below is locked except the design commitments in Section 3, which carry over from the UAP spec and were re-affirmed during this conversation.

---

## 1. Origin and technical seed

The conversation began with a practical question: register `situationalawareness.to` and use catch-all routing so any word in the path (`situationalawareness.to/anything`) triggers an endpoint that renders a dynamic page. Confirmed feasible and standard (wildcard routes; Cloudflare Workers / Vercel Edge recommended for a `.to` domain hack; Next.js `[slug]` routes or Express `/:word` params as alternatives; needs a fallback for unresolvable paths and caching for repeat visits).

The product vision behind the domain: start with a hand-built UAP belief map, then build **repeatable systems to spin up dynamic maps for other topics** (climate change, the singularity) through Q&A with users + research + model knowledge. The catch-all route is the eventual delivery mechanism: `/uap`, `/seed-oils`, `/singularity` — each path a map, some curated, some generated.

## 2. The core idea and how it evolved across the conversation

The idea passed through three distinct formulations, each subsuming the last:

**v1 — Topic-first curated map (the UAP spec).** An interactive visual belief graph for one question ("what explains UAPs?"). Three node types (belief / fact / hypothesis), a cascade engine, a sensitivity readout. User traverses; the tool surfaces which assumptions are load-bearing. Fully specified in the companion doc.

**v2 — Belief-first regress engine.** Inversion of the architecture: instead of the user traversing an authored topic map, the user *states a belief* ("the weather is manipulated by glorbons") and the tool generates the regress backward — *what must be true for this to be true?* The curated topic map becomes a special case: a regress that was pre-computed and whose fact nodes were pre-researched. (Section 6 details this mode.)

**v3 — Multi-framework platform.** Recognition that v1/v2 both silently assume one philosophical framework (analytic epistemology, foundationalist flavor: beliefs are propositions, justification flows backward, rationality = consistency + evidence-proportioned credence). Six alternative frameworks were mapped, each implying a genuinely different product on shared infrastructure — with a meta-move of making the framework itself a switchable lens. (Section 8.)

The likely shape of the eventual product: **regress engine as intake → routes into curated deep maps where they exist → framework lenses as modes of examination → social/dyadic layers as the growth loop.**

## 3. Design commitments (locked, carried from the UAP spec and re-affirmed)

1. **Self-knowledge, not persuasion.** The purpose is to force people to state out loud the priors that must be true for their beliefs, and to surface inconsistency. It is explicitly *not* a conversion tool for skeptics or dogmatists.
2. **Discomfort is by design — but in the content, never the voice.** "These two settings pull in opposite directions — which do you keep?" is productive discomfort. "You're being inconsistent" is terminal discomfort. The user is always the author resolving a tension, never the defendant answering a charge. The mirror is merciless; the mirror's tone is neutral.
3. **Target audience: self-selected rationality-aspirants.** People who *want* to interrogate their beliefs and are open to changing their minds. The tool accepts that it may not be an evidence-based intervention for irrational thinking; that is not its job.
4. **Non-steering — with a precise meaning.** Neutral about the *user's assumptions*; never neutral about *evidence strength*. A sincere believer and sincere skeptic must both feel fairly treated (UAP spec guardrail 1), but on topics where evidence has a verdict, non-steering must not manufacture false symmetry.
5. **Beliefs before consequences.** Users commit to assumptions before seeing where they cascade. This is pre-registration for beliefs and is the mechanism that makes the whole thing work (see 5.1).
6. **Stable landing spots for non-evidential belief.** "I hold this on faith, and I know it" is a labeled, legitimate terminal state — not a defeat. The payoff for such a user is learning *which kind of believer they are* and what the position costs.

## 4. Ontological analysis (of the v1 design)

**4.1 The hidden fourth node type.** The UAP spec's belief nodes conflate two kinds: beliefs about the world (B1 eyewitness trust, B2 radar trust) and **epistemic standards** — beliefs about how to weigh evidence (B10 falsifiability requirement, arguably B3). The distinction matters because the remedies differ: world-beliefs can be corrected by facts; epistemic standards can only be *surfaced* and checked for consistency. Cascade rule R5 already gestures at this ("your standard, not the evidence, ruled this out"). Recommendation: promote epistemic standards to a first-class node type. They are also the most *transferable* asset — a person's secrecy-leakproofness prior (B4) or falsifiability requirement does work in every topic, which is what makes the cross-topic fingerprint (7.1) possible.

**4.2 Whose graph is it?** The v1 topology is authored: the designer decided which assumptions exist and which edges connect them. A user may hold their conclusion for a reason not on the map. Tension: **curated graphs are rigorous but can feel rigged; elicited graphs are personal but have quality-control problems.** Resolution: a hybrid where the model (Fable) maps the user's stated reasoning *onto* the curated graph and flags what doesn't fit — the mismatch between a user's actual reasoning and the canonical graph is itself a finding worth showing them.

**4.3 Topic typology.** UAP is nearly ideal for the rival-hypotheses format: genuine uncertainty, competing explanations of one explanandum, evidence quality as the crux. Not all topics share that shape:
- **Explanation problems** (UAP): rival hypotheses of an explanandum. The v1 schema fits natively.
- **Forecasting problems** (the singularity): no explanandum; the load-bearing assumptions are priors like takeoff speed and timelines. "Hypothesis" nodes become scenario nodes.
- **Policy/value problems** (much of climate): attribution is settled — a rival-hypotheses map there would manufacture false symmetry. The honest map lives at impacts/policy, where load-bearing nodes are often *values*, not factual errors. Value disagreements are not assumption errors and must not be rendered as such.

The topic-general schema therefore needs topic types, each redefining what a "hypothesis" node is.

**4.4 Facts have timestamps.** The domain is dynamic (Grusch's claims escalated 2023→2026 with no new evidence — itself a fact node). Fact nodes need versioning and supersession, which connects to prediction hooks (7.3).

## 5. Pedagogical analysis

**5.1 Pre-registration is the load-bearing design choice.** Beliefs-before-facts ordering means that once a user commits to "radar tracks are measurements" *before* seeing F9 (no instrument-logged track survives), they cannot motivated-reason out of the cascade — they watch their own prior commitment do the work. This is what makes cascade rule R2 land.

**5.2 The counterfactual flip is the best single device.** One-tap "flip this belief and see where you'd land" operationalizes "consider the opposite" — one of the few debiasing interventions with real empirical support.

**5.3 The sensitivity readout is the actual product.** The transferable skill is *locating load-bearing assumptions*; UAPs are the vehicle. This should be said explicitly in the app.

**5.4 The audience's specific failure mode is gaming, not dogmatism.** Kahan's cultural cognition findings: more numerate, more educated people polarize *more* on identity-charged questions — sophistication upgrades the ability to defend priors. Self-identified rationalists are often the best motivated reasoners. The threat for this audience is quietly revising an earlier answer once its cascade becomes visible, so the final readout shows a consistent, flattering self. Countermeasure: **make revision itself a first-class, displayed signal.** "You changed your secrecy prior after seeing it gated the recovery claims" is the most honest thing the tool can show someone. Never prevent revision; always display it.

**5.5 Argue-with-an-edge.** Hybrid mechanics (numbers backstage) can still smuggle false authority. Users must be able to dispute an edge ("I don't think F9 bears on H5 that much") — and the tool records the disagreement as a new assumption the user now visibly holds, rather than forbidding it. This keeps non-steering honest all the way down.

**5.6 Solo discomfort has a short half-life.** Discomfort alone at a screen fades; discomfort *witnessed by someone you respect* is what moves people. This is the argument for the dyadic mode (7.2) being the product with legs, not a feature.

## 6. The belief-first regress engine (v2 mode)

**The move:** user states any belief; the tool generates backward — *what must be true for this to be true?* Each answer spawns its own regress until chains hit terminal nodes (checkable facts, acknowledged non-evidential commitments, or unfalsifiable-by-choice positions).

**The glorbon worked example.** "The weather is manipulated by glorbons" forks almost immediately, and the fork itself is the diagnosis:

- **Branch 1 — "There is evidence for glorbons."** The regress continues: why hasn't the broader epistemic ecosystem converged on it? This forces a choice among three sub-branches, collectively the **sociological bill** that every anomalous belief must pay:
  - **Suppression** — imports the full secrecy-cost machinery (UAP spec node B4: how leakproof can a multi-decade, multi-thousand-person secret be?).
  - **Mass incompetence** — experts systematically cannot see it; requires a theory of *why* they fail.
  - **Privileged access** — I/my community can see what others can't; requires a theory of why *you're exempt* from the failure mode you attribute to everyone else.
  
  Key insight: **assumption cost usually concentrates in the sociological bill, not the object-level claim.** The tool's job is to make that bill itemized and visible.

- **Branch 2 — "My belief doesn't require external evidence."** Not automatically an error — people hold faith commitments consciously — but it carries a **consistency cost** the tool surfaces descriptively, never accusatorially: do you apply that standard everywhere, or only here? ("You require peer-reviewed trials for medications but accept testimony for glorbons.")

**Terminal question for every branch** (borrowed from Street Epistemology): *"Is there anything that could change your mind?"* If no, the tool labels the belief unfalsifiable-by-choice and stops. That labeling is itself self-knowledge; it is a stable landing spot, not a defeat (design commitment 6).

**Design risk:** belief-first mode can degenerate into a Socratic gotcha machine. "Aha, you believe beliefs don't need evidence!" reads as a trap and the person disengages. The non-steering guardrail does real work here.

**Why this mode matters strategically:**
1. **Cheaper to generate than topic maps.** The regress backbone (evidence? → why no convergence? → suppression / incompetence / access, each with costs) is topic-invariant and model-generable. Expensive researched fact nodes are only needed when a chain touches checkable claims. The repeatable-systems ambition may be easier belief-first than topic-first.
2. **Most real users aren't at glorbon distance.** They're at "seed oils are toxic" or "the Fed engineered the recession" distance, where the backward chain hits verifiable facts within two or three hops and the tool does its full job.
3. **Intake architecture.** Regress engine as the intake conversation → routes users into curated deep maps where one exists. This intake→map handoff may be the cleanest overall architecture.

## 7. Extensions catalog (v1-adjacent, ordered by excitement at time of writing)

**7.1 Belief fingerprint across topics.** Epistemic-standard nodes (secrecy priors, falsifiability requirements, institutional-trust settings) recur across every topic. After 2–3 maps, the system can show a user their epistemic *style* — and its inconsistencies: "you weight institutional consensus heavily in topic A and discount it in topic B." Cross-topic tension detection is something no existing tool does.

**7.2 Crux-finding between two people (dyadic diff).** Two people traverse independently; the tool diffs their profiles and names the crux: "you share nine of ten settings; your disagreement is entirely B2 (radar trust)." Usually the disagreement is one belief node, not the conclusion. This operationalizes double crux (CFAR) and Street Epistemology — both worth studying as design inspiration. Reframes discomfort from judgment to shared discovery; the mode people would tell friends about. A population variant: anonymized aggregate profiles — "people who share your B1–B5 answers land here; you land there — what's different?"

**7.3 Prediction hooks / calibration trainer.** Attach checkable future predictions to hypotheses (UAP has pending resolvable events: the GAO audit of AARO, disclosure legislation). When events resolve, notify users: "here's what your map says should move; here's what you actually moved." Converts a static map into a calibration trainer and provides the re-engagement loop.

**7.4 Stated-conclusion-first entry point** (resolves UAP spec open question 5). Ask where the user thinks they'll land, run the traversal, then headline the payoff screen with the gap between the stated view and where their assumptions actually lead. The gap is the product moment.

**7.5 The generation pipeline (repeatable systems).** The UAP handoff doc is accidentally the template. Cost structure observed in building it: hypothesis space + assumption costs are cheap for a model to draft; **fact nodes required four cited research artifacts and two human epistemic corrections** (the user's absence-of-evidence correction became fact node F7). Pipeline: model drafts the scaffold → research pass produces strength-tagged fact nodes → contested edges flagged for human review. Fact nodes are the expensive, quality-critical asset; budget accordingly.

## 8. Dual patterns on the same infrastructure (four inversions of the engine)

The node schema, cascade engine, and sensitivity readout support at least four modes beyond the primary one:

**8.1 Steelman mode (ideological Turing test).** Traverse the map answering as someone you disagree with would; the engine scores whether your model of *their* reasoning is coherent. Same nodes, inverted user. Emotionally cheap (not your beliefs on the line), attractive to the rationality-aspirant audience, quietly builds empathy the solo mode can't.

**8.2 Author mode.** The dual of consuming a map is building one. The generation effect is robust — constructing the assumption graph teaches more than traversing it — and every user-authored map feeds the content pipeline (7.5). Requires exposing the editor plus a review layer for fact nodes. This is how the founder eventually stops being the content bottleneck.

**8.3 Decision mode.** Point the identical engine at personal decisions instead of world-beliefs: "full basement excavation vs. patch repair" decomposes into assumptions with sensitivity analysis the same way; a FIRE plan is nothing but a load-bearing-assumption cascade. **This is the retention mode** — decisions recur; beliefs about glorbons mostly don't.

**8.4 Longitudinal mode.** Snapshot the profile; re-traverse in six months; diff. Combined with prediction hooks (7.3), becomes a full calibration trainer.

**Sequencing bet stated in conversation:** solo UAP map proves the mechanic → dyadic diff is the growth loop → decision mode is the retention loop → author mode removes the content bottleneck.

## 9. Philosophical frameworks catalog (v3 — alternative foundations)

The v1/v2 design silently assumes **analytic epistemology, foundationalist flavor**: beliefs are propositions; justification flows backward to assumptions; rationality = consistency + credence proportioned to evidence. That is a choice. Six live alternatives, each rejecting a different piece, each implying a different product:

**9.1 Pragmatism (Peirce, James).** Beliefs are instruments for action, not representations to justify. Probe changes to: *"What does this belief do? What did you do differently last Tuesday because glorbons control the weather?"* Maps beliefs to behavioral cash value; surfaces **decorative beliefs** (held for comfort/identity, doing zero work). A different and arguably more piercing self-knowledge than inconsistency detection; sidesteps evidence fights entirely. **Best single question to steal even if nothing else is built around it.**

**9.2 Social epistemology (Goldman; the testimony literature).** Almost everything anyone believes arrives via testimony, not personal investigation. The real map is the **trust network**: source nodes instead of belief nodes. "Your views on UAPs, seed oils, and the Fed all route through the same three information brokers, who themselves share upstream sources." Same graph infrastructure, different ontology. Arguably more actionable — people can diversify sources more easily than revise priors. **Most differentiated standalone product.**

**9.3 Quinean web of belief (coherentism).** No foundations; beliefs form a mutually supporting web with a core (revising it forces massive rewiring) and periphery (cheap to revise). The tool stops asking "what's load-bearing?" and instead measures **revision cost**: "here's what else you'd have to rewire to give this up." Tensions stop being errors and become measurements of where a belief sits in the web. Closest to the current build — the cascade engine could compute it — but the framing shift is real: consistency isn't demanded; the *price* of each belief is displayed.

**9.4 Verbal-dispute detection (Wittgenstein; Chalmers's formalization).** A large fraction of disagreement is people meaning different things by the same word. Run a definitional pass before the belief engine: "when you say *evidence* / *manipulated* / *UAP*, do you mean X or Y?" Chalmers's test: restate the dispute banning the contested word; if it evaporates, it was verbal. For dyadic mode this is huge — some fraction of crux-diffs dissolve at this layer, and dissolving a fight is a better payoff than mapping it. **Cheapest to build; instantly improves the dyadic mode.**

**9.5 Narrative identity (MacIntyre, Ricoeur).** Beliefs are load-bearing in the story one tells about oneself ("I'm the one who sees through official narratives"). Probe: *"What would you have to give up about who you are to revise this?"* Explains why factually cheap revisions are existentially expensive — which the assumption-cost model cannot represent, and which is where belief revision actually lives per Kahan's identity-protective cognition findings. **Deepest and most dangerous** — closest to therapy; strictly opt-in, never sprung on users.

**9.6 Virtue epistemology (Sosa, Zagzebski).** Evaluate the thinker, not the beliefs: curiosity, intellectual humility, courage, thoroughness. The tool becomes a trait profiler using **behavioral evidence from traversal** — did they take counterfactual flips? seek disconfirmation? revise under pressure or game the readout? The fingerprint idea (7.1) was already drifting here; this gives it a formal backbone and a literature.

**The meta-move: don't pick one.** Make the framework a switchable lens — same belief viewed as proposition-with-assumptions, as instrument, as trust-inheritance, as web-position, as identity-element. Teaching people that *multiple valid frames exist for examining a belief* may be the most rationality-building feature of all.

## 10. Positioning and prior art

- **Kialo, Society Library** — map *debates*. **Rootclaim** — numeric Bayesian verdicts on controversies; illustrates the false-precision trap the hybrid mechanic deliberately avoids. **Guesstimate** — uncertainty modeling, adjacent. None of them map *the user*. **"Maps the user, not the debate" is the wedge.**
- **Street Epistemology** and **double crux (CFAR)** — the closest methodological ancestors; the dyadic mode and the terminal "what could change your mind?" question are operationalizations of them. Study both.
- **Kahan (cultural cognition / identity-protective cognition)** — the key empirical literature on why sophistication increases polarization; source of the gaming-risk analysis (5.4) and the narrative-identity rationale (9.5).

## 11. Reasoning trail (Claude's thought process, preserved as requested)

The recommendations above were not free-floating; each came from an identifiable move. Preserving them so future directions can re-run or challenge the reasoning:

1. **Type-checking the ontology** produced the fourth node type (4.1): asking "are all belief nodes the same kind of thing?" revealed world-beliefs vs. epistemic standards, which then unlocked the fingerprint (7.1) and virtue-epistemology (9.6) threads — the observation that standards are topic-invariant is what makes both possible.
2. **Stress-testing generalization** produced the topic typology (4.3): running the schema against climate and the singularity showed the rival-hypotheses format fails on settled-attribution and forecasting topics, forcing the explanation/forecast/policy split and the sharpened definition of non-steering.
3. **Asking "what's the failure mode of this specific audience?"** — not audiences in general — produced the gaming analysis (5.4) via Kahan, and its countermeasure (revision as displayed signal).
4. **Following the glorbon regress mechanically** produced the sociological bill (6): the three sub-branches fell out of asking "why hasn't the epistemic ecosystem converged?" and noticing each escape route imports its own assumptions. The concentration of cost in the sociological layer, not the object-level claim, was the emergent insight.
5. **Inverting each component** produced the dual modes (8): invert the user → steelman; invert consume/produce → author mode; invert the object (world-beliefs → decisions) → decision mode; invert time (snapshot → diff) → longitudinal.
6. **Naming the unexamined framework** produced v3 (9): the tool designed to surface hidden assumptions had a hidden assumption — its own epistemology. Each alternative framework was found by asking which pillar (belief-as-proposition, backward justification, consistency-as-rationality, individual-as-unit) a major tradition rejects.
7. **The recurring guardrail** applied throughout: every mode was checked against "does this position the user as author-resolving-tension or defendant-answering-charge?" — the content/voice discomfort split (commitment 2) is the test that kept the gotcha failure mode out of every design.

## 12. Open questions (union of UAP spec §10 and new ones from this conversation)

From the UAP spec (still open): mechanic (hybrid recommended), visual (layered map recommended), v1 scope (both explananda vs. sightings-only), persistence (`window.storage` vs. in-session), entry point (stated-conclusion-first now recommended — see 7.4), depth toggle.

New from this conversation:
1. Is belief-first (v2) a separate mode or the universal intake that routes into curated maps?
2. Which framework lens ships first alongside foundationalist default? (Recommendation on record: verbal-dispute detection for cheapness; pragmatist probe as a stolen question regardless.)
3. Does the dyadic mode require accounts/identity, and what does that do to the privacy posture of a tool that stores people's belief profiles?
4. Topic types: how much of the schema is shared across explanation/forecast/policy maps vs. per-type?
5. How is revision-display (5.4) rendered without feeling like surveillance of the user by the tool?
6. What's the minimum viable version of the sociological bill generator — pure prompting, or a structured template the model fills?

## 13. One-paragraph summary for re-entry

A belief-mapping platform whose purpose is self-knowledge, not persuasion: users state beliefs and the system surfaces the assumptions that must be true, the evidence for and against, the inconsistencies between their own standards, and the one or two load-bearing priors their conclusions actually rest on. It begins as a curated UAP map (fully specified in the companion handoff doc), generalizes through a belief-first regress engine whose signature move is itemizing the "sociological bill" of anomalous beliefs, extends through dyadic crux-finding, prediction-based calibration, decision analysis, and authoring, and ultimately offers multiple philosophical frameworks — foundationalist, pragmatist, social-epistemological, coherentist, linguistic, narrative, virtue-theoretic — as switchable lenses on the same belief. The discomfort is by design, in the content and never the voice; the mirror is merciless and its tone is neutral.

---

*End of seed document. Companion: `UAP-Belief-Map-Handoff.md` (v1 build spec). This document is the trunk; each numbered section is a branch that can be grown independently.*
