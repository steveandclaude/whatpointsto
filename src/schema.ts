/**
 * Topic-general belief map schema, v0.
 *
 * A map is one document: header + three node families (positions, facts, outcomes)
 * + first-class edges + cascade rules + declared tensions. It is evaluated by the
 * pure reducer in `reducer.ts`.
 *
 * Design source: docs/Schema-v0.md (field tables and invariants derive from these
 * types). Provenance of every design decision: docs/Platform-Design-2026-07.md.
 */

// ---------------------------------------------------------------------------
// Scalars
// ---------------------------------------------------------------------------

export type TopicType = 'explanation' | 'forecast' | 'policy';

/** Who vouches for a node's content. A draft-mode map is all 'model-drafted'. */
export type Provenance = 'model-drafted' | 'research-backed' | 'human-reviewed';

/**
 * Where a fact's CONTENT came from — orthogonal to provenance, which is a
 * review tier (Interaction-Design §6.1: origin is not review tier). A
 * user-contributed fact enters at draft tier wearing its origin openly.
 */
export type FactOrigin = 'llm-knowledge' | 'web-researched' | 'author-researched' | 'user-contributed';

export type FactStrength = 'STRONG' | 'MODERATE' | 'WEAK';

/**
 * User stance toward a fact — a first-class reducer input, peer to answers,
 * never inferred from behavior (Interaction-Design §6.2). accept: edges apply
 * (the unstanced default made explicit); suppose: edges apply and the
 * traversal is marked; want-more / dispute: the fact exerts nothing and is
 * surfaced as parked. The trust layer (§6.3) compiles to defaults of these.
 */
export type FactStance = 'accept' | 'suppose' | 'want-more' | 'dispute';

/** The qualitative arrival/holding ladder. Never numbers in the user's face. */
export type StrengthWord = 'lean' | 'think' | 'confident' | 'certain';
export const STRENGTH_LADDER: readonly StrengthWord[] = [
  'lean',
  'think',
  'confident',
  'certain',
];

/** How many new things must be true for this outcome to hold. Orders basePrior. */
export type AssumptionCost = 1 | 2 | 3 | 4 | 5;

export type QuestionId = string;
export type PositionId = string;
export type FactId = string;
export type OutcomeId = string;

// ---------------------------------------------------------------------------
// Questions (generalized explananda — a map may carry several, kept separate)
// ---------------------------------------------------------------------------

export interface Question {
  id: QuestionId;
  title: string;
  blurb?: string;
}

// ---------------------------------------------------------------------------
// Position nodes — what the USER supplies.
// Typed by remediation semantics: what kind of pressure may bear on them.
//   world-belief       ← facts may bear on it
//   epistemic-standard ← only consistency checks; carries a stable cross-map id
//   value              ← nothing may render it an error (policy maps)
// ---------------------------------------------------------------------------

export interface PositionOption {
  id: string;
  label: string;
  /** Facts injected into the traversal when this option is chosen. */
  triggersFacts?: FactId[];
}

interface PositionBase {
  id: PositionId;
  prompt: string;
  /**
   * Authored short scene label — node IDs never reach the user (Interaction
   * Design §5.1). Renderers fall back to truncating the prompt when absent.
   */
  shortLabel?: string;
  /** Which questions this position feeds. */
  scope: QuestionId[];
  options: PositionOption[];
  provenance: Provenance;
  note?: string;
}

export interface WorldBeliefNode extends PositionBase {
  kind: 'world-belief';
}

export interface EpistemicStandardNode extends PositionBase {
  kind: 'epistemic-standard';
  /**
   * Stable identity across ALL maps (e.g. "falsifiability-requirement",
   * "secrecy-leakproofness-prior"). This one field is what makes the
   * cross-topic fingerprint possible.
   */
  standardId: string;
}

export interface ValueNode extends PositionBase {
  kind: 'value';
}

export type PositionNode = WorldBeliefNode | EpistemicStandardNode | ValueNode;
export type PositionKind = PositionNode['kind'];

// ---------------------------------------------------------------------------
// Fact nodes — what the WORLD supplies. Empty (or all model-drafted) in a
// draft-mode regress; the renderer must degrade gracefully.
// ---------------------------------------------------------------------------

/**
 * A structured source: the AUTHORITY is what a user weighs — and what the
 * trust layer keys stances on (Interaction-Design §6.1/§6.3); the citation
 * says where to look. "Distilled to an authority" is what the linter checks.
 */
export interface FactSource {
  authority: string;
  citation?: string;
  /** ISO date the source was consulted. */
  retrievedAt?: string;
}

export interface FactNode {
  id: FactId;
  text: string;
  /** Authored short scene label (Interaction Design §5.1). */
  shortLabel?: string;
  strength: FactStrength;
  provenance: Provenance;
  /** Where the content came from — orthogonal to the review tier above. */
  origin?: FactOrigin;
  /** Structured sources. May be empty only at model-drafted tier. */
  sources: FactSource[];
  /** ISO date the fact was last verified/asserted. Facts have timestamps. */
  assertedAt?: string;
  /** Supersession pointer — the domain is dynamic; facts version. */
  supersededBy?: FactId | null;
  /**
   * Positions this fact speaks to (display: "this bears on your assumption B2").
   * Invariant I1: world-belief positions ONLY — standards and values are
   * constitutionally fact-proof.
   */
  bearsOn?: PositionId[];
  /** If true, active from the start; otherwise active only when triggered. */
  baseline?: boolean;
  note?: string;
}

// ---------------------------------------------------------------------------
// Outcome nodes — the landing spots. Kind is set by the map's topicType.
// ---------------------------------------------------------------------------

export type OutcomeKind = 'rival-hypothesis' | 'scenario' | 'policy-option';

export const OUTCOME_KIND_FOR_TOPIC: Record<TopicType, OutcomeKind> = {
  explanation: 'rival-hypothesis',
  forecast: 'scenario',
  policy: 'policy-option',
};

export interface OutcomeNode {
  id: OutcomeId;
  question: QuestionId;
  kind: OutcomeKind;
  name: string;
  blurb?: string;
  assumptionCost: AssumptionCost;
  /**
   * Starting score in log-odds. If omitted, derived inversely from
   * assumptionCost by the reducer (cheaper outcomes start ahead).
   */
  basePrior?: number;
  /**
   * Router index: plain-language belief statements that land here
   * ("UAPs are alien craft" → H5). The claim picks the map position.
   */
  claims: string[];
  provenance: Provenance;
}

// ---------------------------------------------------------------------------
// Edges — first-class, because two things must live on them: contested state
// (both readings preserved, never resolved) and the lintable "why did this
// move" copy.
// ---------------------------------------------------------------------------

export type EdgeSource =
  | { fact: FactId }
  | { position: PositionId; option: string };

export interface ContestedReading {
  label: string;
  effects: Record<OutcomeId, number>;
}

export interface Edge {
  id: string;
  from: EdgeSource;
  /** Additive log-odds nudges, applied when the source is active. */
  effects: Record<OutcomeId, number>;
  /**
   * Present = genuinely two-sided (e.g. F3 Grusch sources, F10 radar residue).
   * The reducer applies NO effect and surfaces both readings unresolved.
   * `effects` is ignored when this is present.
   */
  contested?: { readings: [ContestedReading, ContestedReading] };
  /**
   * Required when a position-sourced edge influences an outcome in a question
   * outside the position's scope. Guardrail: cross-question influence only
   * through explicit, shown edges (invariant I4).
   */
  crossQuestion?: boolean;
  /** Lintable artifact: the plain-language "why did this move" tooltip. */
  whyCopy: string;
}

// ---------------------------------------------------------------------------
// Cascade rules — the engineered aha moments. A redirect rule carries BOTH the
// naive and the calibrated update: the product moment is showing them side by
// side (ghosted vs. solid). R3 (the AARO pivot) is the canonical instance.
// ---------------------------------------------------------------------------

export interface RuleCondition {
  position: PositionId;
  option: string;
}

export interface CascadeRule {
  id: string;
  /** Conjunction over chosen options. */
  when: RuleCondition[];
  /** Plain extra effects (R1/R4-style gating). */
  effects?: Record<OutcomeId, number>;
  /**
   * R3-style redirect: `naive` is what an uncalibrated update would do
   * (rendered ghosted, never applied); `calibrated` is applied.
   */
  redirect?: {
    naive: Record<OutcomeId, number>;
    calibrated: Record<OutcomeId, number>;
  };
  /** Lintable artifact: the lesson shown when the rule fires. */
  lessonCopy: string;
}

// ---------------------------------------------------------------------------
// Declared tensions — co-held answers the evidence puts in friction. Surfaced
// at the payoff; never resolved by the engine. This (not facts) is the ONLY
// pressure that may reference epistemic standards.
// ---------------------------------------------------------------------------

export interface TensionFlag {
  id: string;
  /** The co-held answers in friction (all must be chosen for the flag to fire). */
  between: RuleCondition[];
  /** Lintable artifact: authored as a tension between positions, never a charge. */
  copy: string;
}

// ---------------------------------------------------------------------------
// The map document
// ---------------------------------------------------------------------------

export interface BeliefMap {
  /** Route slug: the map's shareable address (`/uap`). */
  slug: string;
  title: string;
  topicType: TopicType;
  version: string;
  questions: Question[];
  positions: PositionNode[];
  facts: FactNode[];
  outcomes: OutcomeNode[];
  edges: Edge[];
  rules: CascadeRule[];
  tensions: TensionFlag[];
}

// ---------------------------------------------------------------------------
// Validation — the invariants that make the schema mean what it says.
// ---------------------------------------------------------------------------

export interface SchemaViolation {
  code: string;
  severity: 'error' | 'warning';
  message: string;
}

export function validateMap(map: BeliefMap): SchemaViolation[] {
  const out: SchemaViolation[] = [];
  const err = (code: string, message: string) =>
    out.push({ code, severity: 'error', message });
  const warn = (code: string, message: string) =>
    out.push({ code, severity: 'warning', message });

  const questions = new Map(map.questions.map((q) => [q.id, q]));
  const positions = new Map(map.positions.map((p) => [p.id, p]));
  const facts = new Map(map.facts.map((f) => [f.id, f]));
  const outcomes = new Map(map.outcomes.map((o) => [o.id, o]));

  const optionExists = (p: PositionNode, optionId: string) =>
    p.options.some((o) => o.id === optionId);

  // I0 — referential integrity for scopes, questions, triggers.
  for (const p of map.positions) {
    for (const q of p.scope) {
      if (!questions.has(q)) err('I0', `position ${p.id} scope references unknown question ${q}`);
    }
    for (const o of p.options) {
      for (const f of o.triggersFacts ?? []) {
        if (!facts.has(f)) err('I0', `option ${p.id}/${o.id} triggers unknown fact ${f}`);
      }
    }
  }
  for (const o of map.outcomes) {
    if (!questions.has(o.question)) err('I0', `outcome ${o.id} references unknown question ${o.question}`);
  }

  // I1 — remediation semantics: facts may bear only on world-beliefs.
  for (const f of map.facts) {
    for (const pid of f.bearsOn ?? []) {
      const p = positions.get(pid);
      if (!p) {
        err('I0', `fact ${f.id} bearsOn unknown position ${pid}`);
      } else if (p.kind !== 'world-belief') {
        err(
          'I1',
          `fact ${f.id} bearsOn ${pid} (${p.kind}) — standards and values are fact-proof; only world-beliefs may be borne on`,
        );
      }
    }
  }

  // I2 — standards carry a stable cross-map id (types enforce in TS; re-check for JSON input).
  for (const p of map.positions) {
    if (p.kind === 'epistemic-standard' && !p.standardId) {
      err('I2', `epistemic-standard ${p.id} missing standardId`);
    }
  }

  // I3 — edges reference existing sources, options, outcomes.
  for (const e of map.edges) {
    if ('fact' in e.from) {
      if (!facts.has(e.from.fact)) err('I3', `edge ${e.id} from unknown fact ${e.from.fact}`);
    } else {
      const p = positions.get(e.from.position);
      if (!p) err('I3', `edge ${e.id} from unknown position ${e.from.position}`);
      else if (!optionExists(p, e.from.option))
        err('I3', `edge ${e.id} from unknown option ${e.from.position}/${e.from.option}`);
    }
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    for (const oid of targets) {
      if (!outcomes.has(oid)) err('I3', `edge ${e.id} targets unknown outcome ${oid}`);
    }
  }

  // I4 — cross-question influence must be explicit.
  for (const e of map.edges) {
    if (!('position' in e.from)) continue;
    const p = positions.get(e.from.position);
    if (!p) continue;
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    const spans = targets.some((oid) => {
      const o = outcomes.get(oid);
      return o !== undefined && !p.scope.includes(o.question);
    });
    if (spans && e.crossQuestion !== true) {
      err(
        'I4',
        `edge ${e.id} moves an outcome outside position ${p.id}'s scope — cross-question influence must set crossQuestion: true (explicit, shown)`,
      );
    }
  }

  // I5 — supersession sanity.
  for (const f of map.facts) {
    if (f.supersededBy != null) {
      if (!facts.has(f.supersededBy)) err('I5', `fact ${f.id} superseded by unknown fact ${f.supersededBy}`);
      if (f.baseline) warn('I5', `fact ${f.id} is superseded but still baseline-active`);
    }
  }

  // I6 — rules and tensions reference existing positions/options.
  const checkConditions = (owner: string, conds: RuleCondition[]) => {
    for (const c of conds) {
      const p = positions.get(c.position);
      if (!p) err('I6', `${owner} references unknown position ${c.position}`);
      else if (!optionExists(p, c.option))
        err('I6', `${owner} references unknown option ${c.position}/${c.option}`);
    }
  };
  for (const r of map.rules) {
    checkConditions(`rule ${r.id}`, r.when);
    const targets = [
      ...Object.keys(r.effects ?? {}),
      ...Object.keys(r.redirect?.naive ?? {}),
      ...Object.keys(r.redirect?.calibrated ?? {}),
    ];
    for (const oid of targets) {
      if (!outcomes.has(oid)) err('I6', `rule ${r.id} targets unknown outcome ${oid}`);
    }
  }
  for (const t of map.tensions) checkConditions(`tension ${t.id}`, t.between);

  // I7 — router index: outcomes should declare landing claims (warn at draft tier).
  for (const o of map.outcomes) {
    if (o.claims.length === 0) warn('I7', `outcome ${o.id} declares no claims — unreachable by the router`);
  }

  // I8 — topicType/outcome-kind agreement.
  const expected = OUTCOME_KIND_FOR_TOPIC[map.topicType];
  for (const o of map.outcomes) {
    if (o.kind !== expected) {
      warn('I8', `outcome ${o.id} kind ${o.kind} unusual for topicType ${map.topicType} (expected ${expected})`);
    }
  }

  // I9 — research-tier facts must cite sources, distilled to an authority.
  for (const f of map.facts) {
    if (f.provenance !== 'model-drafted' && f.sources.length === 0) {
      err('I9', `fact ${f.id} is ${f.provenance} but cites no sources`);
    }
    for (const s of f.sources) {
      if (!s.authority) err('I9', `fact ${f.id} has a source with no authority — the authority is what a user weighs`);
    }
  }

  return out;
}
