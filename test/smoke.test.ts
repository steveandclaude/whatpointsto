/**
 * Smoke test: a minimal two-outcome explanation map exercising every schema
 * feature the UAP port will need — triggers, first-class edges, contested
 * edges (surfaced, never applied), a redirect rule (naive ghosted, calibrated
 * applied), declared tensions, validation invariants, and the derived
 * analyses (sensitivity, counterfactual, confidence gap).
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  type BeliefMap,
  confidenceGap,
  counterfactual,
  reduce,
  sensitivity,
  validateMap,
} from '../src/index.js';

function miniMap(): BeliefMap {
  return {
    slug: 'mini',
    title: 'Minimal conformance map',
    topicType: 'explanation',
    version: '0',
    questions: [{ id: 'Q', title: 'What explains the thing?' }],
    positions: [
      {
        id: 'P1',
        kind: 'world-belief',
        prompt: 'How much do you trust the eyewitness reports?',
        scope: ['Q'],
        provenance: 'human-reviewed',
        options: [
          { id: 'high', label: 'A lot' },
          { id: 'low', label: 'Not much', triggersFacts: ['F1'] },
        ],
      },
      {
        id: 'P2',
        kind: 'epistemic-standard',
        standardId: 'falsifiability-requirement',
        prompt: 'Must a hypothesis make checkable predictions?',
        scope: ['Q'],
        provenance: 'human-reviewed',
        options: [
          { id: 'yes', label: 'Yes, strictly' },
          { id: 'no', label: 'Not necessarily' },
        ],
      },
    ],
    facts: [
      {
        id: 'F1',
        text: 'Most investigated reports resolve to mundane causes.',
        strength: 'STRONG',
        provenance: 'research-backed',
        sources: ['artifact-1'],
        bearsOn: ['P1'],
      },
      {
        id: 'F2',
        text: 'The key testimony is genuinely two-sided.',
        strength: 'STRONG',
        provenance: 'research-backed',
        sources: ['artifact-2'],
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
        claims: ['it is nothing unusual'],
        provenance: 'human-reviewed',
      },
      {
        id: 'O2',
        question: 'Q',
        kind: 'rival-hypothesis',
        name: 'Exotic',
        assumptionCost: 5,
        claims: ['something exotic is going on'],
        provenance: 'human-reviewed',
      },
    ],
    edges: [
      {
        id: 'E1',
        from: { position: 'P1', option: 'high' },
        effects: { O2: 1.0 },
        whyCopy: 'Trusting the eyewitness reports lifts the exotic reading.',
      },
      {
        id: 'E2',
        from: { fact: 'F1' },
        effects: { O1: 1.0, O2: -0.5 },
        whyCopy: 'Most reports resolving mundane shifts weight to the prosaic reading.',
      },
      {
        id: 'E3',
        from: { fact: 'F2' },
        effects: {},
        contested: {
          readings: [
            { label: 'Supports the exotic reading', effects: { O2: 0.5 } },
            { label: 'Supports the skeptical reading', effects: { O1: 0.5 } },
          ],
        },
        whyCopy: 'This testimony is contested — both readings shown, neither applied.',
      },
    ],
    rules: [
      {
        id: 'R1',
        when: [
          { position: 'P1', option: 'high' },
          { position: 'P2', option: 'yes' },
        ],
        redirect: {
          naive: { O2: 1.0 },
          calibrated: { O1: 1.0 },
        },
        lessonCopy:
          'These two settings pull in different directions — the calibrated update lands on the cheaper reading.',
      },
    ],
    tensions: [
      {
        id: 'T1',
        between: [
          { position: 'P1', option: 'high' },
          { position: 'P2', option: 'yes' },
        ],
        copy: 'Trusting testimony while requiring checkable predictions — these pull in opposite directions here.',
      },
    ],
  };
}

test('valid map passes validation', () => {
  const violations = validateMap(miniMap()).filter((v) => v.severity === 'error');
  assert.deepEqual(violations, []);
});

test('I1: a fact bearing on a value or standard node is rejected', () => {
  const map = miniMap();
  map.facts[0]!.bearsOn = ['P2'];
  const codes = validateMap(map).map((v) => v.code);
  assert.ok(codes.includes('I1'));
});

test('I4: silent cross-question influence is rejected; explicit passes', () => {
  const map = miniMap();
  map.questions.push({ id: 'Q2', title: 'Second question' });
  map.outcomes.push({
    id: 'O3',
    question: 'Q2',
    kind: 'rival-hypothesis',
    name: 'Other',
    assumptionCost: 2,
    claims: ['other claim'],
    provenance: 'human-reviewed',
  });
  map.edges.push({
    id: 'EX',
    from: { position: 'P1', option: 'high' },
    effects: { O3: 0.5 },
    whyCopy: 'Spans questions.',
  });
  assert.ok(validateMap(map).some((v) => v.code === 'I4'));
  map.edges[map.edges.length - 1]!.crossQuestion = true;
  assert.ok(!validateMap(map).some((v) => v.code === 'I4'));
});

test('credences normalize to 1 per question; cheap outcome starts ahead', () => {
  const r = reduce(miniMap(), {});
  const q = r.credences['Q']!;
  assert.ok(Math.abs(q['O1']! + q['O2']! - 1) < 1e-9);
  assert.ok(q['O1']! > q['O2']!, 'lower assumption cost should start ahead');
});

test('triggers activate facts and their edges; movements carry whyCopy', () => {
  const r = reduce(miniMap(), { P1: 'low' });
  assert.ok(r.activeFacts.includes('F1'));
  const m = r.movements.find((mv) => mv.source.id === 'E2' && mv.outcome === 'O1');
  assert.ok(m, 'fact edge should have moved O1');
  assert.match(m!.whyCopy, /prosaic/i);
});

test('contested edges are surfaced and exert no influence', () => {
  const withContested = reduce(miniMap(), {});
  assert.equal(withContested.contested.length, 1);
  const map = miniMap();
  map.edges = map.edges.filter((e) => e.id !== 'E3');
  const without = reduce(map, {});
  assert.deepEqual(withContested.scores, without.scores);
});

test('redirect rule: calibrated applied, naive carried as ghost', () => {
  const r = reduce(miniMap(), { P1: 'high', P2: 'yes' });
  const fired = r.firedRules.find((f) => f.id === 'R1');
  assert.ok(fired);
  assert.deepEqual(fired!.naive, { O2: 1.0 });
  assert.deepEqual(fired!.applied, { O1: 1.0 });
  const ruleMoves = r.movements.filter((m) => m.source.id === 'R1');
  assert.deepEqual(ruleMoves.map((m) => m.outcome), ['O1']);
});

test('co-held tension fires; partial answers do not fire it', () => {
  assert.equal(reduce(miniMap(), { P1: 'high', P2: 'yes' }).tensions.length, 1);
  assert.equal(reduce(miniMap(), { P1: 'high' }).tensions.length, 0);
});

test('counterfactual equals reduce with the changed answer', () => {
  const map = miniMap();
  const a = counterfactual(map, { P1: 'high' }, 'P1', 'low');
  const b = reduce(map, { P1: 'low' });
  assert.deepEqual(a.credences, b.credences);
});

test('sensitivity ranks answered positions and reports a real shift', () => {
  const s = sensitivity(miniMap(), { P1: 'high', P2: 'no' });
  assert.equal(s.length, 2);
  assert.ok(s[0]!.shift >= s[1]!.shift);
  assert.ok(s[0]!.shift > 0);
});

test('confidence gap: certainty over a weakly supported outcome shows surplus', () => {
  const r = reduce(miniMap(), { P1: 'low' });
  const gap = confidenceGap(r, 'O2', 'certain');
  assert.equal(gap.stated, 'certain');
  assert.ok(gap.gapSteps > 0, 'stated harder than the chain supports');
});
