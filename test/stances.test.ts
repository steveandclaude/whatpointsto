/**
 * Engine v0.2 — fact stances as reducer inputs (Interaction Design §6.2).
 *
 * accept (or no stance): edges apply as before. suppose: edges apply and the
 * fact is surfaced as a supposition. want-more / dispute: the fact exerts
 * nothing and is surfaced as parked — visible, never silently counted.
 * Stances gate participation only; activation (traversal presence) is
 * untouched.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { uapMap } from '../content/uap.js';
import {
  type BeliefMap,
  counterfactual,
  divergence,
  reduce,
  sensitivity,
  validateMap,
} from '../src/index.js';

/**
 * FT is triggered by P1:b and carries plain effects; FB is baseline with
 * plain effects; FC is baseline and genuinely contested. P1:a carries its
 * own edge so sensitivity has something to flip onto.
 */
function stanceMap(): BeliefMap {
  return {
    slug: 'stance-mini',
    title: 'Stance mechanics fixture',
    topicType: 'explanation',
    version: '0',
    questions: [{ id: 'Q', title: 'What explains the thing?' }],
    positions: [
      {
        id: 'P1',
        kind: 'world-belief',
        prompt: 'Do you trust the reports?',
        scope: ['Q'],
        provenance: 'human-reviewed',
        options: [
          { id: 'a', label: 'Yes, broadly' },
          { id: 'b', label: 'Not much', triggersFacts: ['FT'] },
        ],
      },
    ],
    facts: [
      {
        id: 'FT',
        text: 'Most reports resolve to mundane causes.',
        strength: 'STRONG',
        provenance: 'research-backed',
        sources: ['a1'],
        bearsOn: ['P1'],
      },
      {
        id: 'FB',
        text: 'A residue of credible cases exists.',
        strength: 'MODERATE',
        provenance: 'research-backed',
        sources: ['a2'],
        baseline: true,
      },
      {
        id: 'FC',
        text: 'The key testimony is genuinely two-sided.',
        strength: 'STRONG',
        provenance: 'research-backed',
        sources: ['a3'],
        baseline: true,
      },
    ],
    outcomes: [
      {
        id: 'O1',
        question: 'Q',
        kind: 'rival-hypothesis',
        name: 'Prosaic',
        assumptionCost: 1,
        claims: ['nothing unusual'],
        provenance: 'human-reviewed',
      },
      {
        id: 'O2',
        question: 'Q',
        kind: 'rival-hypothesis',
        name: 'Exotic',
        assumptionCost: 5,
        claims: ['something exotic'],
        provenance: 'human-reviewed',
      },
    ],
    edges: [
      {
        id: 'EP',
        from: { position: 'P1', option: 'a' },
        effects: { O2: 1.0 },
        whyCopy: 'Trusting the reports lifts the exotic reading.',
      },
      {
        id: 'ET',
        from: { fact: 'FT' },
        effects: { O1: 1.0, O2: -0.5 },
        whyCopy: 'Reports resolving mundane shifts weight to the prosaic reading.',
      },
      {
        id: 'EB',
        from: { fact: 'FB' },
        effects: { O2: 0.8 },
        whyCopy: 'The residue keeps the exotic reading in play.',
      },
      {
        id: 'EC',
        from: { fact: 'FC' },
        effects: {},
        contested: {
          readings: [
            { label: 'Supports the exotic reading', effects: { O2: 0.5 } },
            { label: 'Supports the skeptical reading', effects: { O1: 0.5 } },
          ],
        },
        whyCopy: 'Contested — both readings shown, neither applied.',
      },
    ],
    rules: [],
    tensions: [],
  };
}

test('fixture validates; no stance and explicit accept compute identically', () => {
  const m = stanceMap();
  assert.deepEqual(validateMap(m).filter((v) => v.severity === 'error'), []);
  const bare = reduce(m, { P1: 'b' });
  const explicit = reduce(m, { P1: 'b' }, { FT: 'accept', FB: 'accept', FC: 'accept' });
  assert.deepEqual(bare.scores, explicit.scores);
  assert.deepEqual(bare.suppositions, []);
  assert.deepEqual(bare.parked, []);
  assert.deepEqual(explicit.suppositions, []);
  assert.deepEqual(explicit.parked, []);
});

test('dispute parks the fact: still active, exerts nothing, reason on its face', () => {
  const m = stanceMap();
  const r = reduce(m, { P1: 'b' }, { FT: 'dispute' });
  assert.ok(r.activeFacts.includes('FT'), 'a parked fact stays in the traversal');
  assert.ok(!r.movements.some((mv) => mv.source.id === 'ET'), 'its edge moves nothing');
  assert.deepEqual(r.parked, [{ fact: 'FT', stance: 'dispute' }]);
  // Scores equal a map with the edge removed outright.
  const stripped = { ...m, edges: m.edges.filter((e) => e.id !== 'ET') };
  assert.deepEqual(r.scores, reduce(stripped, { P1: 'b' }).scores);
});

test('want-more parks identically, with its own reason', () => {
  const m = stanceMap();
  const r = reduce(m, { P1: 'b' }, { FT: 'want-more' });
  assert.deepEqual(r.parked, [{ fact: 'FT', stance: 'want-more' }]);
  assert.deepEqual(r.scores, reduce(m, { P1: 'b' }, { FT: 'dispute' }).scores);
  assert.deepEqual(r.suppositions, []);
});

test('suppose applies the edges and surfaces the lean; the re-run shows it without them', () => {
  const m = stanceMap();
  const supposed = reduce(m, { P1: 'b' }, { FT: 'suppose' });
  assert.deepEqual(supposed.scores, reduce(m, { P1: 'b' }).scores, 'suppose counts like accept');
  assert.deepEqual(supposed.suppositions, ['FT']);
  // "Your landing leans on 1 supposition — see it without it": one reduce call.
  const without = reduce(m, { P1: 'b' }, { FT: 'want-more' });
  assert.ok(divergence(supposed, without) > 0, 'the supposition is really carrying weight');
});

test('a parked fact takes its contested readings off the table; a supposed one is no supposition', () => {
  const m = stanceMap();
  assert.equal(reduce(m, {}).contested.length, 1);
  const parked = reduce(m, {}, { FC: 'dispute' });
  assert.equal(parked.contested.length, 0, 'the user set the fact aside, upstream of its readings');
  assert.deepEqual(parked.scores, reduce(m, {}).scores, 'contested edges never applied anyway');
  assert.deepEqual(parked.parked, [{ fact: 'FC', stance: 'dispute' }]);
  // Supposing a fact whose only edge is contested: surfaced, but the landing
  // leans on nothing — honestly absent from suppositions.
  const supposed = reduce(m, {}, { FC: 'suppose' });
  assert.equal(supposed.contested.length, 1);
  assert.deepEqual(supposed.suppositions, []);
});

test('stances on inactive or unknown facts are inert, like unanswered positions', () => {
  const m = stanceMap();
  const bare = reduce(m, {});
  assert.deepEqual(reduce(m, {}, { FT: 'dispute' }), bare, 'FT is not in this traversal');
  assert.deepEqual(reduce(m, {}, { ZZ: 'dispute' }), bare, 'unknown ids exert nothing');
});

test('counterfactual and sensitivity thread the stances through their re-runs', () => {
  const m = stanceMap();
  const cf = counterfactual(m, { P1: 'a' }, 'P1', 'b', { FT: 'dispute' });
  assert.deepEqual(cf.credences, reduce(m, { P1: 'b' }, { FT: 'dispute' }).credences);

  const withStance = sensitivity(m, { P1: 'b' }, { FT: 'dispute' });
  const without = sensitivity(m, { P1: 'b' });
  assert.equal(withStance.length, 1);
  assert.ok(
    withStance[0]!.shift < without[0]!.shift,
    'with the triggered fact disputed, flipping its trigger moves the landing less',
  );
});

test('UAP: disputing the radar hinge (F9) releases its penalty on the exotic readings', () => {
  const answers = { B2: 'measurement' } as const;
  const accepted = reduce(uapMap, answers);
  const disputed = reduce(uapMap, answers, { F9: 'dispute' });
  assert.ok(
    disputed.credences['I']!['H5']! > accepted.credences['I']!['H5']!,
    'H5 rises when F9 exerts nothing',
  );
  assert.deepEqual(disputed.parked, [{ fact: 'F9', stance: 'dispute' }]);
  assert.ok(!disputed.movements.some((mv) => mv.source.id === 'e:F9'));
  // F10 is contested: parking it clears the two-sided surface too.
  assert.equal(reduce(uapMap, answers, { F10: 'want-more' }).contested.length, 0);
  assert.equal(accepted.contested.length, 1);
});

test('the reducer stays provenance-blind under stances', () => {
  const promoted = structuredClone(uapMap);
  for (const p of promoted.positions) p.provenance = 'human-reviewed';
  for (const f of promoted.facts) f.provenance = 'human-reviewed';
  for (const o of promoted.outcomes) o.provenance = 'human-reviewed';
  const answers = { B2: 'measurement', B5: 'weak' };
  const stances = { F9: 'dispute', F2: 'suppose' } as const;
  assert.deepEqual(reduce(promoted, answers, stances).scores, reduce(uapMap, answers, stances).scores);
});
