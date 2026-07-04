/**
 * The cascade engine: a pure reducer over a BeliefMap and a set of answers.
 *
 * Purity is the load-bearing property — sensitivity, counterfactual flips, and
 * the confidence gap are each a re-run with one input changed, not features.
 * The reducer is provenance-blind (drafts and researched maps compute
 * identically); only presentation differs.
 *
 * Mechanic: hybrid. Scores are additive log-odds backstage; the surface renders
 * normalized bars and strength words. No numbers in the user's face.
 */

import type {
  BeliefMap,
  ContestedReading,
  Edge,
  FactId,
  OutcomeId,
  PositionId,
  QuestionId,
  StrengthWord,
} from './schema.js';
import { STRENGTH_LADDER } from './schema.js';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/** positionId → chosen optionId. Unanswered positions simply exert no influence. */
export type Answers = Readonly<Record<PositionId, string>>;

export interface ReduceOptions {
  /**
   * Log-odds head start per point of assumption-cost advantage, used when an
   * outcome has no explicit basePrior: basePrior = -priorScale * (cost - 1).
   */
  priorScale?: number;
}

const DEFAULT_PRIOR_SCALE = 0.5;

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export interface Movement {
  /** What moved it: an edge or a rule. */
  source: { type: 'edge' | 'rule'; id: string };
  outcome: OutcomeId;
  delta: number;
  /** The lintable "why did this move" copy, straight from the map. */
  whyCopy: string;
}

export interface FiredRule {
  id: string;
  lessonCopy: string;
  /** For redirect rules: the ghosted update that was NOT applied. */
  naive?: Record<OutcomeId, number>;
  /** The update that was applied (redirect.calibrated, or plain effects). */
  applied: Record<OutcomeId, number>;
}

export interface SurfacedContested {
  edgeId: string;
  whyCopy: string;
  readings: [ContestedReading, ContestedReading];
}

export interface SurfacedTension {
  id: string;
  copy: string;
}

export interface ReduceResult {
  /** Normalized per question: question → outcome → probability. */
  credences: Record<QuestionId, Record<OutcomeId, number>>;
  /** Raw log-odds scores before normalization (backstage only). */
  scores: Record<OutcomeId, number>;
  movements: Movement[];
  firedRules: FiredRule[];
  /** Facts live in this traversal (baseline + triggered, minus superseded). */
  activeFacts: FactId[];
  /** Genuinely two-sided edges, both readings preserved, no effect applied. */
  contested: SurfacedContested[];
  /** Declared tensions whose co-held answers are all present. */
  tensions: SurfacedTension[];
}

// ---------------------------------------------------------------------------
// The reducer
// ---------------------------------------------------------------------------

function edgeSourceActive(edge: Edge, answers: Answers, activeFacts: ReadonlySet<FactId>): boolean {
  if ('fact' in edge.from) return activeFacts.has(edge.from.fact);
  return answers[edge.from.position] === edge.from.option;
}

export function reduce(map: BeliefMap, answers: Answers, opts: ReduceOptions = {}): ReduceResult {
  const priorScale = opts.priorScale ?? DEFAULT_PRIOR_SCALE;

  // 1. Active facts: baseline + triggered by chosen options, minus superseded.
  const active = new Set<FactId>();
  for (const f of map.facts) if (f.baseline) active.add(f.id);
  for (const p of map.positions) {
    const chosen = answers[p.id];
    if (chosen === undefined) continue;
    const option = p.options.find((o) => o.id === chosen);
    for (const fid of option?.triggersFacts ?? []) active.add(fid);
  }
  for (const f of map.facts) if (f.supersededBy != null) active.delete(f.id);

  // 2. Scores start at basePrior (explicit, or derived inversely from cost).
  const scores: Record<OutcomeId, number> = {};
  for (const o of map.outcomes) {
    scores[o.id] = o.basePrior ?? -priorScale * (o.assumptionCost - 1);
  }

  const movements: Movement[] = [];
  const contested: SurfacedContested[] = [];

  // 3. Edges: apply effects of active, uncontested edges; surface contested ones.
  for (const e of map.edges) {
    if (!edgeSourceActive(e, answers, active)) continue;
    if (e.contested) {
      contested.push({ edgeId: e.id, whyCopy: e.whyCopy, readings: e.contested.readings });
      continue;
    }
    for (const [oid, delta] of Object.entries(e.effects)) {
      if (!(oid in scores)) continue;
      scores[oid]! += delta;
      movements.push({ source: { type: 'edge', id: e.id }, outcome: oid, delta, whyCopy: e.whyCopy });
    }
  }

  // 4. Rules: fire when every condition is a chosen answer. Redirects apply
  //    only the calibrated update; the naive one rides along for ghost display.
  const firedRules: FiredRule[] = [];
  for (const r of map.rules) {
    const fires = r.when.every((c) => answers[c.position] === c.option);
    if (!fires) continue;
    const applied = r.redirect ? r.redirect.calibrated : (r.effects ?? {});
    for (const [oid, delta] of Object.entries(applied)) {
      if (!(oid in scores)) continue;
      scores[oid]! += delta;
      movements.push({ source: { type: 'rule', id: r.id }, outcome: oid, delta, whyCopy: r.lessonCopy });
    }
    firedRules.push({
      id: r.id,
      lessonCopy: r.lessonCopy,
      ...(r.redirect ? { naive: r.redirect.naive } : {}),
      applied,
    });
  }

  // 5. Tensions: surface declared frictions whose answers are all co-held.
  const tensions: SurfacedTension[] = [];
  for (const t of map.tensions) {
    if (t.between.every((c) => answers[c.position] === c.option)) {
      tensions.push({ id: t.id, copy: t.copy });
    }
  }

  // 6. Normalize per question (softmax): outcomes compete within a question,
  //    never across questions.
  const credences: Record<QuestionId, Record<OutcomeId, number>> = {};
  for (const q of map.questions) {
    const members = map.outcomes.filter((o) => o.question === q.id);
    if (members.length === 0) continue;
    const max = Math.max(...members.map((o) => scores[o.id]!));
    const exps = members.map((o) => Math.exp(scores[o.id]! - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    credences[q.id] = {};
    members.forEach((o, i) => {
      credences[q.id]![o.id] = exps[i]! / sum;
    });
  }

  return { credences, scores, movements, firedRules, activeFacts: [...active], contested, tensions };
}

// ---------------------------------------------------------------------------
// Derived analyses — each is a re-run, which is the point.
// ---------------------------------------------------------------------------

/** One-tap counterfactual: same traversal with one answer changed. */
export function counterfactual(
  map: BeliefMap,
  answers: Answers,
  position: PositionId,
  option: string,
  opts?: ReduceOptions,
): ReduceResult {
  return reduce(map, { ...answers, [position]: option }, opts);
}

/** Max total-variation distance between two credence sets, across questions. */
export function divergence(a: ReduceResult, b: ReduceResult): number {
  let worst = 0;
  for (const q of Object.keys(a.credences)) {
    const qa = a.credences[q]!;
    const qb = b.credences[q] ?? {};
    let tv = 0;
    for (const oid of Object.keys(qa)) tv += Math.abs(qa[oid]! - (qb[oid] ?? 0));
    worst = Math.max(worst, tv / 2);
  }
  return worst;
}

export interface SensitivityEntry {
  position: PositionId;
  /** The alternative option that moves the landing most. */
  mostMovingOption: string;
  /** Total-variation shift that flip would cause (0..1). */
  shift: number;
}

/**
 * The sensitivity readout — the actual product. Ranks answered positions by
 * how much the landing moves under their most-moving flip.
 */
export function sensitivity(map: BeliefMap, answers: Answers, opts?: ReduceOptions): SensitivityEntry[] {
  const base = reduce(map, answers, opts);
  const entries: SensitivityEntry[] = [];
  for (const p of map.positions) {
    const chosen = answers[p.id];
    if (chosen === undefined) continue;
    let best: { option: string; shift: number } | undefined;
    for (const o of p.options) {
      if (o.id === chosen) continue;
      const flipped = counterfactual(map, answers, p.id, o.id, opts);
      const shift = divergence(base, flipped);
      if (!best || shift > best.shift) best = { option: o.id, shift };
    }
    if (best) entries.push({ position: p.id, mostMovingOption: best.option, shift: best.shift });
  }
  return entries.sort((x, y) => y.shift - x.shift);
}

// ---------------------------------------------------------------------------
// The confidence gap. PROVISIONAL (v0 heuristic): the formal definition of
// "supported confidence" is open question 5 in Platform-Design-2026-07 §8.
// v0 maps the matched outcome's normalized credence to the strength ladder.
// ---------------------------------------------------------------------------

export function supportedStrength(credence: number): StrengthWord | 'unsupported' {
  if (credence >= 0.85) return 'certain';
  if (credence >= 0.65) return 'confident';
  if (credence >= 0.5) return 'think';
  if (credence >= 0.35) return 'lean';
  return 'unsupported';
}

export interface ConfidenceGap {
  stated: StrengthWord;
  supported: StrengthWord | 'unsupported';
  /**
   * Ladder steps of surplus: positive = held harder than the described chain
   * supports; negative = the chain commits harder than the user claims.
   */
  gapSteps: number;
}

export function confidenceGap(
  result: ReduceResult,
  matchedOutcome: OutcomeId,
  stated: StrengthWord,
): ConfidenceGap {
  let credence = 0;
  for (const q of Object.values(result.credences)) {
    if (matchedOutcome in q) credence = q[matchedOutcome]!;
  }
  const supported = supportedStrength(credence);
  const statedIdx = STRENGTH_LADDER.indexOf(stated);
  const supportedIdx = supported === 'unsupported' ? -1 : STRENGTH_LADDER.indexOf(supported);
  return { stated, supported, gapSteps: statedIdx - supportedIdx };
}
