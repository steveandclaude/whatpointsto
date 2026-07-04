/**
 * UAP map — conformance port of UAP-Belief-Map-Handoff.md §6 into Schema v0.
 *
 * Fidelity notes:
 * - Node inventory is the handoff's: 10 positions (B1–B10), 13 facts (F1–F13),
 *   12 outcomes (H1–H7 for question I, A–E for question II), rules R1–R5.
 * - All delta MAGNITUDES are provisional tuning (the handoff: "tune magnitudes
 *   in code"); DIRECTIONS are the handoff's.
 * - Judgment calls and schema-forced clarifications: docs/UAP-Port-Notes.md.
 * - Double-dip resolution: where a fact and a rule encode the same move
 *   (F5/R3, F12/R5), the RULE carries the credence effect and the fact is the
 *   evidence card (display, no edge). Recorded in the port notes.
 */
import type { BeliefMap } from '../src/schema.js';

export const uapMap: BeliefMap = {
  slug: 'uap',
  title: 'What explains UAPs?',
  topicType: 'explanation',
  version: '0.1.0',

  questions: [
    { id: 'I', title: 'What explains the sightings and sensor reports?' },
    {
      id: 'II',
      title: 'What explains the recovered-craft and reverse-engineering allegations?',
      blurb:
        'Kept separate from the sightings on purpose: collapsing the two is the most common error in this topic.',
    },
  ],

  // -------------------------------------------------------------------------
  // Positions
  // -------------------------------------------------------------------------
  positions: [
    {
      id: 'B1',
      kind: 'world-belief',
      scope: ['I'],
      prompt:
        'How much do you trust uninstrumented eyewitness estimates of speed, distance, and acceleration?',
      provenance: 'human-reviewed',
      note: 'Pilots are genuinely poor at this without reference points — that observation is what the fork is about.',
      options: [
        { id: 'low', label: 'Not much — people misjudge kinematics without instruments' },
        { id: 'high', label: 'Substantially — trained observers get this roughly right' },
      ],
    },
    {
      id: 'B2',
      kind: 'world-belief',
      scope: ['I'],
      prompt:
        'Do you treat radar tracks as measurements, or as possibly artifacts (anomalous propagation, second-time-around returns)?',
      provenance: 'human-reviewed',
      note: 'The load-bearing fork for pre-1960 anomaly.',
      options: [
        { id: 'measurement', label: 'Measurements — radar is an instrument', triggersFacts: ['F9', 'F10'] },
        { id: 'artifact-possible', label: 'Possibly artifacts — radar can be fooled', triggersFacts: ['F9', 'F10'] },
      ],
    },
    {
      id: 'B3',
      kind: 'epistemic-standard',
      standardId: 'unexplained-as-anomalous',
      scope: ['I', 'II'],
      prompt: 'Do you treat "unexplained" as "anomalous"?',
      provenance: 'human-reviewed',
      options: [
        { id: 'yes', label: 'Yes — a persistent residue points at something real', triggersFacts: ['F6', 'F7', 'F8'] },
        { id: 'no', label: 'No — unexplained usually means bad data, not strange content', triggersFacts: ['F6', 'F7', 'F8'] },
      ],
    },
    {
      id: 'B4',
      kind: 'epistemic-standard',
      standardId: 'secrecy-leakproofness-prior',
      scope: ['I', 'II'],
      prompt:
        'How leakproof can a multi-decade, multi-thousand-person secret be — especially one with physical evidence?',
      provenance: 'human-reviewed',
      options: [
        { id: 'leaky', label: 'Secrets that big leak — decades of silence is implausible' },
        { id: 'holds', label: 'Compartmentalization works — such a secret could hold' },
      ],
    },
    {
      id: 'B5',
      kind: 'world-belief',
      scope: ['II'],
      prompt:
        'Is credentialed-insider testimony strong evidence even when secondhand? How do you weight sincerity against accuracy?',
      provenance: 'human-reviewed',
      options: [
        { id: 'strong', label: 'Strong — credentialed insiders under oath carry real weight', triggersFacts: ['F2', 'F3'] },
        { id: 'weak', label: 'Weak — sincerity is attested, content is not verified', triggersFacts: ['F2', 'F3'] },
      ],
    },
    {
      id: 'B6',
      kind: 'epistemic-standard',
      standardId: 'conflicted-investigator-reading',
      scope: ['I', 'II'],
      prompt:
        'How do you read a conflicted, self-investigating body (AARO sits inside the chain of command it investigates)?',
      provenance: 'human-reviewed',
      note: 'The key node. See rule R3 — this is where the calibrated update diverges from the naive one.',
      options: [
        { id: 'credible', label: 'Broadly credible despite the conflict' },
        { id: 'compromised', label: 'Structurally compromised — its conclusions can’t be taken on authority', triggersFacts: ['F4', 'F5'] },
      ],
    },
    {
      id: 'B7',
      kind: 'world-belief',
      scope: ['I'],
      prompt:
        'How costly is the assumption that new physics (FTL, inertia control) is required?',
      provenance: 'human-reviewed',
      options: [
        { id: 'high-cost', label: 'Very costly — new physics is an enormous ask', triggersFacts: ['F11'] },
        { id: 'low-cost', label: 'Not prohibitive — physics has surprised us before', triggersFacts: ['F11'] },
      ],
    },
    {
      id: 'B8',
      kind: 'world-belief',
      scope: ['I'],
      prompt: 'What is your prior that ET civilizations are within reach and here now?',
      provenance: 'human-reviewed',
      options: [
        { id: 'low', label: 'Low — the conjunction of requirements is steep', triggersFacts: ['F11'] },
        { id: 'high', label: 'Appreciable — the galaxy is old and large', triggersFacts: ['F11'] },
      ],
    },
    {
      id: 'B9',
      kind: 'world-belief',
      scope: ['I', 'II'],
      prompt:
        'How much does the historical government debunking precedent (Robertson Panel, Condon) shape your read of today’s efforts?',
      provenance: 'human-reviewed',
      options: [
        { id: 'heavy', label: 'Heavily — the pattern repeats', triggersFacts: ['F13'] },
        { id: 'light', label: 'Lightly — analogy is not evidence of intent', triggersFacts: ['F13'] },
      ],
    },
    {
      id: 'B10',
      kind: 'epistemic-standard',
      standardId: 'falsifiability-requirement',
      scope: ['I', 'II'],
      prompt: 'Do you require a hypothesis to make checkable predictions to take it seriously?',
      provenance: 'human-reviewed',
      options: [
        { id: 'strict', label: 'Yes — unfalsifiable claims don’t get credence from me', triggersFacts: ['F12'] },
        { id: 'loose', label: 'Not strictly — some real things resist prediction' },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Facts (strengths and directions per handoff §6C; sources are artifact keys
  // in docs/research/ plus the handoff itself)
  // -------------------------------------------------------------------------
  facts: [
    {
      id: 'F1',
      baseline: true,
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['UAP-Belief-Map-Handoff §6C', 'The Case Against AARO'],
      text: 'Most investigated cases resolve to mundane objects (AARO and the historical record). Exotic hypotheses only ever need to explain a residue.',
    },
    {
      id: 'F2',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ["David Grusch's UAP Claims"],
      bearsOn: ['B5'],
      text: 'Grusch is firsthand to his investigation and to others’ testimony — not to craft or bodies; his framing escalated 2023→2026 with no new public evidence.',
    },
    {
      id: 'F3',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ["David Grusch's UAP Claims"],
      bearsOn: ['B5'],
      text: 'AARO says Grusch’s sources lacked firsthand program access (circular reporting); Mellon disputes this and says he introduced firsthand witnesses. Genuinely two-sided.',
    },
    {
      id: 'F4',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['The Case Against AARO'],
      text: 'AARO is structurally conflicted; its 2024 Historical Record Report is methodologically weak; Congress mandated a GAO audit of it.',
    },
    {
      id: 'F5',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['The Case Against AARO', 'UAP-Belief-Map-Handoff §6C'],
      text: 'THE PIVOT: a conflicted debunker raises the plausibility of terrestrial secrecy, not of aliens — mundane black programs explain the same conflicted-investigation pattern at far lower assumption cost.',
      note: 'Evidence card for rule R3; the credence movement lives in the rule.',
    },
    {
      id: 'F6',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['Pre-1960 UFO Cases and the 5 Observables'],
      text: 'Credible unexplained pre-1960 cases exist (Battelle SR-14: 21.5% unknowns, better cases more often unknown; Condon: ~30% of 117 unexplained). A residue is real; that alone does not imply anomaly.',
    },
    {
      id: 'F7',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['Pre-1960 UFO Cases and the 5 Observables'],
      text: 'THE CORRECTION: "antigravity" is a proposed mechanism, not an observable — only behavior is ever visible. Cloaking and trans-medium travel are undetectable-by-construction pre-1960. That era is SILENT — not negative, not positive — on observables #1/#4/#5, and can speak only to #2 (acceleration) and #3 (speed-without-signature).',
      note: 'Cuts both ways by design: blocks "no cloaking, therefore weak" and "the old cases showed all five" alike.',
    },
    {
      id: 'F8',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['Pre-1960 UFO Cases and the 5 Observables'],
      text: 'The pre-1960 observables question therefore collapses to #2/#3 — which depend entirely on whether the radar tracks were genuine measurements or artifacts.',
      note: 'The bridge from B3 to B2.',
    },
    {
      id: 'F9',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['Radar in the Dock'],
      bearsOn: ['B2'],
      text: 'THE RADAR HINGE: in both best cases (Lakenheath, RB-47) every speed/acceleration figure is an eyeball estimate or a ~10-year-later memory reconstruction. No instrument-logged track, radar film, or scope photo survives.',
    },
    {
      id: 'F10',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['Radar in the Dock'],
      bearsOn: ['B2'],
      text: 'Lakenheath retains a residue if the multi-sensor concurrency is real — but that rests on a 1968 memory letter. RB-47’s diagnostic S-band signal matches a common ground radar (CPS-6B), and a "UTAH had negative contact" teletype line contradicts the simultaneity claim.',
    },
    {
      id: 'F11',
      strength: 'STRONG',
      provenance: 'research-backed',
      sources: ['UAP-Belief-Map-Handoff §6C'],
      text: 'The ET hypothesis requires a conjunction: a civilization within reach, interstellar travel (new physics or extreme patience), present now, behaving ambiguously for decades, leaving no public proof. The assumption cost is the product of all of these.',
    },
    {
      id: 'F12',
      strength: 'MODERATE',
      provenance: 'research-backed',
      sources: ['UAP-Belief-Map-Handoff §6C'],
      text: 'The interdimensional hypothesis, as usually stated, is near-unfalsifiable.',
      note: 'Evidence card for rule R5; the credence movement lives in the rule.',
    },
    {
      id: 'F13',
      strength: 'MODERATE',
      provenance: 'research-backed',
      sources: ['The Case Against AARO'],
      text: 'The Robertson Panel recommended a public debunking campaign; Condon is widely read as predetermined. Pattern-matching AARO to these is analogy, not evidence of intent.',
    },
  ],

  // -------------------------------------------------------------------------
  // Outcomes (assumption costs per handoff §6A; claims are the router index)
  // -------------------------------------------------------------------------
  outcomes: [
    // Question I — the sightings
    { id: 'H1', question: 'I', kind: 'rival-hypothesis', name: 'Prosaic null', assumptionCost: 1, provenance: 'human-reviewed', blurb: 'Misidentification plus sensor and instrument artifacts.', claims: ['there is nothing unusual going on', 'it is all misidentification and sensor error'] },
    { id: 'H2', question: 'I', kind: 'rival-hypothesis', name: 'Foreign adversary tech', assumptionCost: 3, provenance: 'human-reviewed', blurb: 'Secret terrestrial craft — an adversary’s.', claims: ['UAPs are secret foreign aircraft', 'it is Chinese or Russian technology'] },
    { id: 'H3', question: 'I', kind: 'rival-hypothesis', name: 'Secret US programs', assumptionCost: 2, provenance: 'human-reviewed', blurb: 'Our own black projects; observers not read in.', claims: ['UAPs are secret American aircraft', 'it is our own black projects'] },
    { id: 'H4', question: 'I', kind: 'rival-hypothesis', name: 'Novel natural phenomena', assumptionCost: 3, provenance: 'human-reviewed', blurb: 'Uncharacterized atmospheric, plasma, or electromagnetic effects.', claims: ['UAPs are an unknown natural phenomenon'] },
    { id: 'H5', question: 'I', kind: 'rival-hypothesis', name: 'Extraterrestrial (ETH)', assumptionCost: 5, provenance: 'human-reviewed', blurb: 'Non-human craft visiting.', claims: ['UAPs are alien craft', 'aliens are visiting Earth', 'something non-human is flying in our skies'] },
    { id: 'H6', question: 'I', kind: 'rival-hypothesis', name: 'Interdimensional / ultraterrestrial', assumptionCost: 5, provenance: 'human-reviewed', blurb: 'Vallée-style; near-unfalsifiable as usually stated.', claims: ['UAPs are interdimensional beings'] },
    { id: 'H7', question: 'I', kind: 'rival-hypothesis', name: 'Psychosocial', assumptionCost: 1, provenance: 'human-reviewed', blurb: 'Perception, culture, and expectation — not external stimuli.', claims: ['UAP sightings are a social and psychological phenomenon'] },
    // Question II — the recovery allegations
    { id: 'A', question: 'II', kind: 'rival-hypothesis', name: 'It’s true — non-human craft held', assumptionCost: 5, provenance: 'human-reviewed', blurb: 'Requires a secret leakproof for artifacts yet leaky for rumor, sustained for decades.', claims: ['the government has recovered non-human craft', 'crash retrievals are real and hidden'] },
    { id: 'B', question: 'II', kind: 'rival-hypothesis', name: 'Circular reporting / sincere misperception', assumptionCost: 2, provenance: 'human-reviewed', blurb: 'AARO’s account: a rumor loop mistaken for convergence.', claims: ['the recovery claims are a rumor feeding on itself', 'sincere people are repeating each other'] },
    { id: 'C', question: 'II', kind: 'rival-hypothesis', name: 'Deliberate disinformation / limited hangout', assumptionCost: 3, provenance: 'human-reviewed', blurb: 'The alien rumor as cover for terrestrial black programs.', claims: ['the alien story is a cover for secret programs', 'it is disinformation protecting classified tech'] },
    { id: 'D', question: 'II', kind: 'rival-hypothesis', name: 'Grift / movement dynamics', assumptionCost: 1, provenance: 'human-reviewed', blurb: 'Incentives sustain the claims independent of their truth.', claims: ['the whistleblowers are grifting', 'Grusch is a grifter', 'the UFO movement runs on incentives, not evidence'] },
    { id: 'E', question: 'II', kind: 'rival-hypothesis', name: 'Real-but-terrestrial secret program', assumptionCost: 3, provenance: 'human-reviewed', blurb: 'A genuine recovery/exploitation effort — of terrestrial exotic tech — internally mythologized as non-human.', claims: ['there is a real recovery program but it is not alien'] },
  ],

  // -------------------------------------------------------------------------
  // Edges. Position edges carry the elicitation forks; fact edges carry the
  // evidence nudges. Directions per handoff; magnitudes provisional.
  // -------------------------------------------------------------------------
  edges: [
    // B1 — eyewitness kinematics trust
    { id: 'e:B1.low', from: { position: 'B1', option: 'low' }, effects: { H5: -0.3, H6: -0.2, H1: 0.2, H7: 0.2 }, whyCopy: 'Distrusting uninstrumented kinematic estimates removes the most dramatic numbers from the exotic case.' },
    { id: 'e:B1.high', from: { position: 'B1', option: 'high' }, effects: { H5: 0.3, H6: 0.2 }, whyCopy: 'Trusting trained observers’ estimates lets the reported kinematics count as data.' },
    // B2 — radar
    { id: 'e:B2.measurement', from: { position: 'B2', option: 'measurement' }, effects: { H5: 0.4, H4: 0.2 }, whyCopy: 'Reading radar tracks as measurements makes the best cases carry instrumented weight.' },
    { id: 'e:B2.artifact', from: { position: 'B2', option: 'artifact-possible' }, effects: { H1: 0.3 }, whyCopy: 'Allowing for radar artifacts reads the same tracks as data-quality problems.' },
    // B3 — unexplained-as-anomalous
    { id: 'e:B3.yes', from: { position: 'B3', option: 'yes' }, effects: { H5: 0.2, H4: 0.2 }, whyCopy: 'Treating the unexplained residue as anomalous brightens the hypotheses that need a real anomaly.' },
    { id: 'e:B3.no', from: { position: 'B3', option: 'no' }, effects: { H1: 0.2, H7: 0.1 }, whyCopy: 'Reading the residue as data-quality keeps the weight on prosaic explanations.' },
    // B4 — secrecy prior (scope spans both questions)
    { id: 'e:B4.leaky', from: { position: 'B4', option: 'leaky' }, effects: { A: -0.6, E: -0.2, H3: -0.1 }, whyCopy: 'If big secrets leak, decades of leakproof artifact custody is exactly what your prior says doesn’t happen.' },
    { id: 'e:B4.holds', from: { position: 'B4', option: 'holds' }, effects: { A: 0.3, H3: 0.2, C: 0.2 }, whyCopy: 'If compartmentalization works, long-held secrets stop being an extraordinary assumption.' },
    // B5 — insider testimony
    { id: 'e:B5.strong', from: { position: 'B5', option: 'strong' }, effects: { A: 0.4 }, whyCopy: 'Weighting credentialed testimony heavily lets the whistleblower accounts move the recovery question.' },
    { id: 'e:B5.weak', from: { position: 'B5', option: 'weak' }, effects: { B: 0.3, D: 0.2 }, whyCopy: 'Separating sincerity from accuracy routes the same testimony toward rumor-loop and incentive readings.' },
    // B6 — conflicted investigator
    { id: 'e:B6.credible', from: { position: 'B6', option: 'credible' }, effects: { B: 0.4 }, whyCopy: 'Taking AARO as broadly credible lends its circular-reporting account real weight.' },
    { id: 'e:B6.compromised', from: { position: 'B6', option: 'compromised' }, effects: { B: -0.3 }, whyCopy: 'A structurally conflicted investigator can’t settle the question on authority — its account loses standing.' },
    // B7 / B8 — gating priors
    { id: 'e:B7.high', from: { position: 'B7', option: 'high-cost' }, effects: { H5: -0.2, H6: -0.2 }, whyCopy: 'Pricing new physics as an enormous ask dims every hypothesis that requires it.' },
    { id: 'e:B7.low', from: { position: 'B7', option: 'low-cost' }, effects: { H5: 0.2 }, whyCopy: 'Discounting the new-physics cost removes a gate from the exotic hypotheses.' },
    { id: 'e:B8.low', from: { position: 'B8', option: 'low' }, effects: { H5: -0.3 }, whyCopy: 'A low here-now prior gates the ET hypothesis before any sighting is weighed.' },
    { id: 'e:B8.high', from: { position: 'B8', option: 'high' }, effects: { H5: 0.3 }, whyCopy: 'An appreciable here-now prior lets sighting-level evidence reach the ET hypothesis.' },
    // B9 — precedent
    { id: 'e:B9.heavy', from: { position: 'B9', option: 'heavy' }, effects: { C: 0.2 }, whyCopy: 'Weighting the debunking precedent heavily brightens the disinformation reading of today’s efforts.' },
    // Fact edges
    { id: 'e:F1', from: { fact: 'F1' }, effects: { H1: 0.3 }, whyCopy: 'Most cases resolving mundane sets the baseline: exotic explanations are only needed for a residue.' },
    { id: 'e:F2', from: { fact: 'F2' }, effects: { A: -0.4, D: 0.3, B: 0.2 }, whyCopy: 'Escalating claims with no new public evidence, from a witness firsthand only to testimony, shifts weight toward incentive and rumor readings.' },
    {
      id: 'e:F3',
      from: { fact: 'F3' },
      effects: {},
      contested: {
        readings: [
          { label: 'AARO: the sources lacked firsthand access — circular reporting', effects: { B: 0.4 } },
          { label: 'Mellon: firsthand witnesses were introduced — the testimony stands', effects: { A: 0.4 } },
        ],
      },
      whyCopy: 'Whether Grusch’s sources had firsthand access is genuinely two-sided — both readings shown, neither applied.',
    },
    { id: 'e:F4', from: { fact: 'F4' }, effects: { B: -0.2 }, whyCopy: 'A conflicted investigator with a weak report can’t carry "nothing here" on authority.' },
    { id: 'e:F6', from: { fact: 'F6' }, effects: { H1: -0.2, H4: 0.1 }, whyCopy: 'A real unexplained residue exists — which the pure-null reading must account for, and which does not by itself imply anomaly.' },
    { id: 'e:F9', from: { fact: 'F9' }, effects: { H5: -0.5, H6: -0.3 }, whyCopy: 'With no instrument-logged track surviving, the best radar cases are estimate-grade, not measurement-grade — the exotic readings lose their instrumented anchor.' },
    {
      id: 'e:F10',
      from: { fact: 'F10' },
      effects: {},
      contested: {
        readings: [
          { label: 'The Lakenheath concurrency is real — an honest residue remains', effects: { H4: 0.3, H5: 0.2 } },
          { label: 'Artifacts and the UTAH teletype — the residue dissolves', effects: { H1: 0.3 } },
        ],
      },
      whyCopy: 'The radar residue is genuinely contested — it turns on a 1968 memory letter and a disputed teletype line. Neither side gets proof.',
    },
    { id: 'e:F11', from: { fact: 'F11' }, effects: { H5: -0.4 }, whyCopy: 'The ET hypothesis pays for a conjunction of requirements; its cost is the product of them all.' },
    { id: 'e:F13', from: { fact: 'F13' }, effects: { C: 0.2 }, whyCopy: 'The debunking precedent is real — and it is analogy, not evidence of present intent. It moves the disinformation reading modestly.' },
  ],

  // -------------------------------------------------------------------------
  // Cascade rules — the engineered insight moments (handoff §6D)
  // -------------------------------------------------------------------------
  rules: [
    {
      id: 'R1',
      when: [
        { position: 'B1', option: 'low' },
        { position: 'B3', option: 'no' },
      ],
      effects: { H5: -0.3, H6: -0.3, H1: 0.3, H7: 0.3 },
      lessonCopy:
        'Your skepticism about exotic explanations is doing its work through one move — distrust of eyewitness estimation, compounded by reading the residue as data-quality.',
    },
    {
      id: 'R2',
      when: [{ position: 'B2', option: 'measurement' }],
      lessonCopy:
        'The radar cases can’t bear the weight of measurement — every figure is an estimate or a decade-later memory. Your conclusion was resting on a data-quality assumption.',
    },
    {
      id: 'R3',
      when: [{ position: 'B6', option: 'compromised' }],
      redirect: {
        naive: { A: 0.6, H5: 0.4 },
        calibrated: { C: 0.6, E: 0.5 },
      },
      lessonCopy:
        '"The debunker is compromised, therefore aliens" skips the cheaper explanation the same evidence supports better: human secrecy. The lift lands on terrestrial-secrecy readings, not on the exotic ones.',
    },
    {
      id: 'R4',
      when: [
        { position: 'B7', option: 'high-cost' },
        { position: 'B8', option: 'low' },
      ],
      effects: { H5: -0.8, H6: -0.5, A: -0.5 },
      lessonCopy:
        'Two background priors — the price of new physics and the odds anyone is here — are silently gating everything downstream of them.',
    },
    {
      id: 'R5',
      when: [{ position: 'B10', option: 'strict' }],
      effects: { H6: -0.5, A: -0.3 },
      lessonCopy:
        'Your epistemic standard, not the evidence, is what rules these out for you — the near-unfalsifiable readings fail your falsifiability requirement before any fact is weighed.',
    },
  ],

  // -------------------------------------------------------------------------
  // Declared tensions (handoff §6E.3)
  // -------------------------------------------------------------------------
  tensions: [
    {
      id: 'T1',
      between: [
        { position: 'B6', option: 'compromised' },
        { position: 'B5', option: 'weak' },
      ],
      copy:
        'You distrust AARO and you distrust the insider testimony — these two settings pull your recovery-question view in opposite directions. Which one carries more weight for you?',
    },
    {
      id: 'T2',
      between: [
        { position: 'B3', option: 'yes' },
        { position: 'B10', option: 'strict' },
      ],
      copy:
        'You read the unexplained residue as pointing at something real, and you require checkable predictions before granting credence — the residue can’t currently meet the standard you hold. Which setting do you keep?',
    },
  ],
};
