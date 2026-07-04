/**
 * Conformance test #2 (rule of two): a second, structurally different topic —
 * forecast type, scenario outcomes, single question, EMPTY fact family, every
 * node draft-tier — must express in Schema v0 and compute through the same
 * reducer unchanged. This is the test that the schema is topic-general and
 * that draft mode is a data condition, never an engine mode.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { singularityMap } from '../content/singularity.js';
import { uapMap } from '../content/uap.js';
import { confidenceGap, reduce, sensitivity, validateMap } from '../src/index.js';
import type { BeliefMap } from '../src/index.js';

const FULL_BELIEVER = {
  P1: 'extrapolate',
  P2: 'compounds',
  P3: 'inside',
  P4: 'loose',
  P5: 'route-around',
};

test('the second topic type: forecast map with scenario outcomes, single question', () => {
  assert.equal(singularityMap.topicType, 'forecast');
  assert.equal(singularityMap.questions.length, 1);
  for (const o of singularityMap.outcomes) assert.equal(o.kind, 'scenario');
});

test('validates with zero errors and zero topic-kind warnings', () => {
  const violations = validateMap(singularityMap);
  assert.deepEqual(violations.filter((v) => v.severity === 'error'), []);
  assert.deepEqual(violations.filter((v) => v.code === 'I8'), []);
});

test('thin scaffold is genuinely draft-tier: fact family empty, every node model-drafted', () => {
  assert.equal(singularityMap.facts.length, 0);
  for (const p of singularityMap.positions) assert.equal(p.provenance, 'model-drafted');
  for (const o of singularityMap.outcomes) assert.equal(o.provenance, 'model-drafted');
});

test('draft-mode degradation: a factless traversal computes — no active facts, position/rule movements only, credences normalize', () => {
  const r = reduce(singularityMap, FULL_BELIEVER);
  assert.deepEqual(r.activeFacts, []);
  assert.ok(r.movements.length > 0);
  for (const m of r.movements) {
    if (m.source.type === 'edge') {
      const edge = singularityMap.edges.find((e) => e.id === m.source.id)!;
      assert.ok('position' in edge.from, `movement ${m.source.id} must be position-sourced`);
    }
  }
  const sum = Object.values(r.credences['S']!).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test('assumption cost orders the empty traversal: plateau (cost 1) starts ahead of takeoff (cost 4)', () => {
  const r = reduce(singularityMap, {});
  const q = r.credences['S']!;
  assert.ok(q['S1']! > q['S2']! && q['S2']! > q['S3']! && q['S3']! > q['S4']!);
});

test('R1, the conjunction reveal: takeoff leads only when all three payments are made', () => {
  const conjunction = { P1: 'extrapolate', P2: 'compounds', P5: 'route-around' };
  const r = reduce(singularityMap, conjunction);
  assert.ok(r.firedRules.some((f) => f.id === 'R1'));
  const q = r.credences['S']!;
  assert.ok(q['S4']! > q['S1']!, 'the full conjunction puts takeoff on top');

  // Withhold any one payment and the rule stays silent, takeoff stays behind.
  for (const dropped of Object.keys(conjunction)) {
    const partial: Record<string, string> = { ...conjunction };
    delete partial[dropped];
    const p = reduce(singularityMap, partial);
    assert.ok(!p.firedRules.some((f) => f.id === 'R1'), `R1 must not fire without ${dropped}`);
    assert.ok(p.credences['S']!['S4']! < p.credences['S']!['S1']!, `takeoff trails without ${dropped}`);
  }
});

test('R2, the standard-not-evidence reveal: strict falsifiability prices down both extremes', () => {
  const base = reduce(singularityMap, {});
  const r = reduce(singularityMap, { P4: 'strict' });
  assert.ok(r.firedRules.some((f) => f.id === 'R2'));
  assert.ok(r.scores['S4']! < base.scores['S4']!, 'takeoff pays');
  assert.ok(r.scores['S3']! < base.scores['S3']!, 'the in-principle ceiling pays too');
  assert.equal(r.scores['S1'], base.scores['S1']);
  assert.equal(r.scores['S2'], base.scores['S2']);
});

test('cross-map fingerprint: falsifiability-requirement is the same standardId in both maps', () => {
  const standardIds = (m: BeliefMap) =>
    new Set(m.positions.flatMap((p) => (p.kind === 'epistemic-standard' ? [p.standardId] : [])));
  const shared = [...standardIds(uapMap)].filter((s) => standardIds(singularityMap).has(s));
  assert.deepEqual(shared, ['falsifiability-requirement']);
});

test('the engine is provenance-blind: promoting every node to human-reviewed changes nothing', () => {
  const promoted: BeliefMap = {
    ...singularityMap,
    positions: singularityMap.positions.map((p) => ({ ...p, provenance: 'human-reviewed' as const })),
    outcomes: singularityMap.outcomes.map((o) => ({ ...o, provenance: 'human-reviewed' as const })),
  };
  assert.deepEqual(reduce(promoted, FULL_BELIEVER).scores, reduce(singularityMap, FULL_BELIEVER).scores);
});

test('T1 tension: compounding returns held alongside strict falsifiability is surfaced', () => {
  const r = reduce(singularityMap, { P2: 'compounds', P4: 'strict' });
  assert.ok(r.tensions.some((t) => t.id === 'T1'));
  assert.equal(reduce(singularityMap, { P2: 'compounds' }).tensions.length, 0);
});

test('derived analyses run on a forecast map: sensitivity ranks, confidence gap shows surplus', () => {
  const s = sensitivity(singularityMap, FULL_BELIEVER);
  assert.equal(s.length, 5, 'every answered position is ranked');
  assert.ok(s[0]!.shift > 0);
  assert.ok(s[0]!.shift >= s[s.length - 1]!.shift);

  // Arrival: "the singularity is near, I'm certain" → S4, held at certain.
  const gap = confidenceGap(reduce(singularityMap, FULL_BELIEVER), 'S4', 'certain');
  assert.ok(gap.gapSteps > 0, 'even the full believer holds takeoff harder than the chain supports');
});

test('router index: every scenario is reachable by at least one claim', () => {
  for (const o of singularityMap.outcomes) {
    assert.ok(o.claims.length > 0, `${o.id} has claims`);
  }
});
