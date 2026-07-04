/**
 * Conformance test #1 (rule of two): the UAP handoff §6 library must express
 * cleanly in Schema v0, and the ported map must reproduce the handoff's
 * engineered behaviors — especially R3 (the pivot), the contested edges, and
 * the two-explananda separation.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { uapMap } from '../content/uap.js';
import { confidenceGap, reduce, sensitivity, validateMap } from '../src/index.js';

test('inventory matches the handoff: 10 positions, 13 facts, 12 outcomes, 5 rules', () => {
  assert.equal(uapMap.positions.length, 10);
  assert.equal(uapMap.facts.length, 13);
  assert.equal(uapMap.outcomes.length, 12);
  assert.equal(uapMap.rules.length, 5);
  assert.equal(uapMap.questions.length, 2);
});

test('map validates with zero errors', () => {
  const violations = validateMap(uapMap);
  assert.deepEqual(violations.filter((v) => v.severity === 'error'), []);
});

test('the two explananda stay separate: each normalizes to 1 independently', () => {
  const r = reduce(uapMap, { B1: 'high', B5: 'strong' });
  for (const q of ['I', 'II']) {
    const sum = Object.values(r.credences[q]!).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `question ${q} should normalize`);
  }
});

test('assumption cost orders the empty-traversal landing (heterogeneity baseline)', () => {
  const r = reduce(uapMap, {});
  const qI = r.credences['I']!;
  assert.ok(qI['H1']! > qI['H5']!, 'prosaic (cost 1) starts ahead of ETH (cost 5)');
  const qII = r.credences['II']!;
  assert.ok(qII['D']! > qII['A']!, 'grift (cost 1) starts ahead of true-recovery (cost 5)');
});

test('R3, the signature moment: "compromised" lifts C/E, leaves A and H5 unlifted', () => {
  const base = reduce(uapMap, {});
  const r = reduce(uapMap, { B6: 'compromised' });
  const fired = r.firedRules.find((f) => f.id === 'R3');
  assert.ok(fired, 'R3 should fire');
  assert.deepEqual(fired!.naive, { A: 0.6, H5: 0.4 });
  assert.deepEqual(fired!.applied, { C: 0.6, E: 0.5 });
  // The naive update is a ghost: A's raw score must not exceed baseline,
  // and H5's score must be untouched.
  assert.ok(r.scores['A']! <= base.scores['A']!, 'A gets no lift from distrusting the debunker');
  assert.equal(r.scores['H5'], base.scores['H5'], 'H5 untouched by the AARO fork');
  assert.ok(r.scores['C']! > base.scores['C']!, 'the lift lands on disinformation');
  assert.ok(r.scores['E']! > base.scores['E']!, 'and on real-but-terrestrial');
});

test('R2, the believer reckoning: radar-as-measurement brightens exotic, then F9 retracts it', () => {
  const r = reduce(uapMap, { B2: 'measurement' });
  assert.ok(r.activeFacts.includes('F9') && r.activeFacts.includes('F10'));
  const lift = r.movements.find((m) => m.source.id === 'e:B2.measurement' && m.outcome === 'H5');
  const retraction = r.movements.find((m) => m.source.id === 'e:F9' && m.outcome === 'H5');
  assert.ok(lift && lift.delta > 0, 'the belief brightens H5');
  assert.ok(retraction && retraction.delta < 0, 'the injected fact walks it back');
  assert.ok(r.firedRules.some((f) => f.id === 'R2'), 'the lesson fires');
});

test('contested evidence is surfaced, never resolved: F3 and F10', () => {
  const r = reduce(uapMap, { B2: 'measurement', B5: 'strong' });
  const ids = r.contested.map((c) => c.edgeId).sort();
  assert.deepEqual(ids, ['e:F10', 'e:F3']);
  // And they exert no influence: strip them and scores are identical.
  const stripped = {
    ...uapMap,
    edges: uapMap.edges.filter((e) => e.id !== 'e:F3' && e.id !== 'e:F10'),
  };
  assert.deepEqual(reduce(stripped, { B2: 'measurement', B5: 'strong' }).scores, r.scores);
});

test('R4, the gating priors: high physics cost + low here-now prior cap ETH', () => {
  const believerElsewhere = reduce(uapMap, { B1: 'high', B2: 'measurement', B3: 'yes', B7: 'high-cost', B8: 'low' });
  assert.ok(believerElsewhere.firedRules.some((f) => f.id === 'R4'));
  const qI = believerElsewhere.credences['I']!;
  assert.ok(qI['H5']! < qI['H1']!, 'the gates hold regardless of sighting-level choices');
});

test('T1 tension: distrusting both AARO and the testimony is surfaced', () => {
  const r = reduce(uapMap, { B5: 'weak', B6: 'compromised' });
  assert.ok(r.tensions.some((t) => t.id === 'T1'));
  assert.equal(reduce(uapMap, { B5: 'weak' }).tensions.length, 0);
});

test('sensitivity on a full traversal produces a ranked, non-trivial readout', () => {
  const answers = {
    B1: 'high', B2: 'measurement', B3: 'yes', B4: 'holds', B5: 'strong',
    B6: 'compromised', B7: 'low-cost', B8: 'high', B9: 'heavy', B10: 'loose',
  };
  const s = sensitivity(uapMap, answers);
  assert.equal(s.length, 10, 'every answered position is ranked');
  assert.ok(s[0]!.shift > 0);
  assert.ok(s[0]!.shift >= s[s.length - 1]!.shift);
});

test('confidence gap: certainty in recovered craft against a skeptical chain shows surplus', () => {
  // Arrival claim "the government has recovered non-human craft" → outcome A.
  const r = reduce(uapMap, { B4: 'leaky', B5: 'weak', B6: 'credible' });
  const gap = confidenceGap(r, 'A', 'certain');
  assert.ok(gap.gapSteps > 0, 'stated certain, chain supports less');
});

test('router index: every outcome is reachable by at least one claim', () => {
  for (const o of uapMap.outcomes) {
    assert.ok(o.claims.length > 0, `${o.id} has claims`);
  }
});
