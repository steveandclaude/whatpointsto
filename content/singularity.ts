/**
 * Singularity map — conformance test #2 (the rule of two, design doc §8.1).
 *
 * Deliberately a THIN SCAFFOLD, unresearched on purpose:
 * - topicType 'forecast' with 'scenario' outcomes — the schema's second topic
 *   type, maximally unlike UAP's 'explanation'.
 * - The fact family is EMPTY. This is the draft-mode data condition (design
 *   §2.3.3): a map whose fact layers render as "unresearched — here's what
 *   would need checking." The reducer must compute identically; only
 *   presentation differs.
 * - Every node is 'model-drafted'. This map has had no research pass and no
 *   human review; it must be unmistakably draft-grade if ever rendered.
 * - Cross-topic fingerprint: P4 reuses UAP B10's standardId
 *   ('falsifiability-requirement') — the first standard shared across maps.
 *   P3 introduces a second transferable standard ('inside-vs-outside-view').
 * - All magnitudes are provisional draft tuning; nothing here is calibrated.
 * - Single question, on purpose: UAP proved multi-question separation; this
 *   map exercises the degenerate single-question case.
 */
import type { BeliefMap } from '../src/schema.js';

export const singularityMap: BeliefMap = {
  slug: 'singularity',
  title: 'Does a singularity arrive?',
  topicType: 'forecast',
  version: '0.1.0-draft',

  questions: [
    {
      id: 'S',
      title: 'Does a technological singularity arrive — and on what timescale?',
      blurb:
        'Singularity here means a discontinuity driven by AI improving AI, after which the pace of change escapes human steering.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Positions — the assumption forks a forecast actually turns on.
  // ---------------------------------------------------------------------------
  positions: [
    {
      id: 'P1',
      kind: 'world-belief',
      scope: ['S'],
      prompt:
        'Do the last decade’s capability-scaling trends extrapolate through the next one?',
      provenance: 'model-drafted',
      options: [
        { id: 'extrapolate', label: 'Yes — the curves have held; extrapolation is the default' },
        { id: 'saturate', label: 'No — curves like this saturate; the default is a plateau' },
      ],
    },
    {
      id: 'P2',
      kind: 'world-belief',
      scope: ['S'],
      prompt:
        'Can AI meaningfully automate AI research itself, so that progress compounds?',
      provenance: 'model-drafted',
      note: 'The load-bearing fork: recursive self-improvement is what separates a fast takeoff from every other scenario.',
      options: [
        { id: 'compounds', label: 'Yes — automated research closes the loop and compounds' },
        { id: 'bottlenecked', label: 'No — research automation hits human, institutional, or conceptual bottlenecks' },
      ],
    },
    {
      id: 'P3',
      kind: 'epistemic-standard',
      standardId: 'inside-vs-outside-view',
      scope: ['S'],
      prompt:
        'When forecasting an unprecedented event, which do you privilege: the mechanistic inside-view story, or the outside-view record of past technology forecasts?',
      provenance: 'model-drafted',
      options: [
        { id: 'inside', label: 'Inside view — follow the mechanism where it leads' },
        { id: 'outside', label: 'Outside view — weight the reference class of past forecasts' },
      ],
    },
    {
      id: 'P4',
      kind: 'epistemic-standard',
      standardId: 'falsifiability-requirement',
      scope: ['S'],
      prompt:
        'Do you require a forecast to stake near-term checkable predictions before you take it seriously?',
      provenance: 'model-drafted',
      note: 'Same standard as UAP B10 — the first cross-map fingerprint pair.',
      options: [
        { id: 'strict', label: 'Yes — a forecast that risks nothing near-term earns nothing from me' },
        { id: 'loose', label: 'Not strictly — some real discontinuities resist near-term prediction' },
      ],
    },
    {
      id: 'P5',
      kind: 'world-belief',
      scope: ['S'],
      prompt:
        'Do physical constraints — chips, energy, data — bind hard enough to pace progress regardless of algorithms?',
      provenance: 'model-drafted',
      options: [
        { id: 'bind', label: 'They bind — atoms and joules set the tempo' },
        { id: 'route-around', label: 'They get routed around — efficiency gains and capital outrun them' },
      ],
    },
  ],

  // ---------------------------------------------------------------------------
  // Facts — EMPTY, on purpose. No research pass has run. A renderer must show
  // this layer as "unresearched", per design §2.3.3.
  // ---------------------------------------------------------------------------
  facts: [],

  // ---------------------------------------------------------------------------
  // Outcomes — scenarios (forecast topic). Assumption costs order the
  // empty-traversal landing: a plateau assumes least; a takeoff assumes a
  // conjunction.
  // ---------------------------------------------------------------------------
  outcomes: [
    {
      id: 'S1',
      question: 'S',
      kind: 'scenario',
      name: 'Plateau',
      assumptionCost: 1,
      provenance: 'model-drafted',
      blurb: 'The current paradigm saturates; capabilities level off well short of a discontinuity.',
      claims: ['AI progress is hitting a wall', 'LLMs are a dead end', 'AI is mostly hype'],
    },
    {
      id: 'S2',
      question: 'S',
      kind: 'scenario',
      name: 'Transformative but continuous',
      assumptionCost: 2,
      provenance: 'model-drafted',
      blurb: 'Decades-long diffusion, like electrification — enormous change, human-steered throughout.',
      claims: ['AI will change everything, but gradually', 'there will be no discontinuity, just diffusion'],
    },
    {
      id: 'S3',
      question: 'S',
      kind: 'scenario',
      name: 'In-principle ceiling',
      assumptionCost: 3,
      provenance: 'model-drafted',
      blurb: 'Machine intelligence caps below the takeoff threshold for a principled reason about minds or computation.',
      claims: ['machines can never truly think', 'AGI is impossible in principle'],
    },
    {
      id: 'S4',
      question: 'S',
      kind: 'scenario',
      name: 'Fast takeoff',
      assumptionCost: 4,
      provenance: 'model-drafted',
      blurb: 'Recursive self-improvement produces a discontinuity within roughly a decade.',
      claims: [
        'superintelligence is coming within a decade',
        'the singularity is near',
        'recursive self-improvement will take off',
      ],
    },
  ],

  // ---------------------------------------------------------------------------
  // Edges — position edges only; there are no facts to source from.
  // ---------------------------------------------------------------------------
  edges: [
    {
      id: 'e:P1.extrapolate',
      from: { position: 'P1', option: 'extrapolate' },
      effects: { S4: 0.4, S2: 0.2 },
      whyCopy: 'Extending the capability curves keeps both continued-transformation scenarios live, and the discontinuity most of all.',
    },
    {
      id: 'e:P1.saturate',
      from: { position: 'P1', option: 'saturate' },
      effects: { S1: 0.4 },
      whyCopy: 'Expecting the curves to saturate makes the plateau the default reading of the same data.',
    },
    {
      id: 'e:P2.compounds',
      from: { position: 'P2', option: 'compounds' },
      effects: { S4: 0.5 },
      whyCopy: 'A closed research loop is the engine of the takeoff scenario — granting it moves the discontinuity from speculative to mechanical.',
    },
    {
      id: 'e:P2.bottlenecked',
      from: { position: 'P2', option: 'bottlenecked' },
      effects: { S2: 0.2, S1: 0.2 },
      whyCopy: 'Bottlenecked research automation keeps humans in the loop, which paces change to human institutions.',
    },
    {
      id: 'e:P3.inside',
      from: { position: 'P3', option: 'inside' },
      effects: { S4: 0.2, S3: 0.1 },
      whyCopy: 'Privileging the mechanism story favors the scenarios built on mechanism arguments — the takeoff case, and the in-principle-ceiling case alike.',
    },
    {
      id: 'e:P3.outside',
      from: { position: 'P3', option: 'outside' },
      effects: { S1: 0.2, S2: 0.2 },
      whyCopy: 'The reference class of past technology forecasts pays out to the ordinary-diffusion scenarios — that is what usually happened.',
    },
    {
      id: 'e:P5.bind',
      from: { position: 'P5', option: 'bind' },
      effects: { S2: 0.3, S4: -0.3 },
      whyCopy: 'If atoms and joules set the tempo, change arrives at construction speed — transformative, and paced.',
    },
    {
      id: 'e:P5.route-around',
      from: { position: 'P5', option: 'route-around' },
      effects: { S4: 0.3 },
      whyCopy: 'If efficiency and capital outrun the physical constraints, the last external brake on a fast takeoff releases.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Cascade rules — two engineered moments: a conjunction-cost reveal and a
  // standard-not-evidence reveal (the falsifiability standard prices down BOTH
  // extreme scenarios, which is the insight).
  // ---------------------------------------------------------------------------
  rules: [
    {
      id: 'R1',
      when: [
        { position: 'P1', option: 'extrapolate' },
        { position: 'P2', option: 'compounds' },
        { position: 'P5', option: 'route-around' },
      ],
      effects: { S4: 0.6 },
      lessonCopy:
        'Fast takeoff is a conjunction: the curves keep holding AND research compounds AND the physical constraints get routed around. You have paid all three — the discontinuity now follows from your own assumptions, ahead of any headline.',
    },
    {
      id: 'R2',
      when: [{ position: 'P4', option: 'strict' }],
      effects: { S4: -0.2, S3: -0.3 },
      lessonCopy:
        'Your falsifiability standard, not any evidence about AI, is what prices these down for you — and it cuts both ways: the imminent-takeoff story and the in-principle-ceiling story both resist near-term check.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Declared tensions.
  // ---------------------------------------------------------------------------
  tensions: [
    {
      id: 'T1',
      between: [
        { position: 'P2', option: 'compounds' },
        { position: 'P4', option: 'strict' },
      ],
      copy:
        'You expect AI research to compound once automated, and you require near-term checkable predictions before granting credence — the compounding story stakes few. Which setting carries more weight for you?',
    },
    {
      id: 'T2',
      between: [
        { position: 'P1', option: 'extrapolate' },
        { position: 'P3', option: 'outside' },
      ],
      copy:
        'You extrapolate the capability curves, and you privilege the outside view of past forecasts — but the outside view is exactly the record that says curves like these saturate. Which setting do you keep?',
    },
  ],
};
