/**
 * Journey engine (J1) — Interaction-Design §11 pinned by test.
 *
 * The contracts under test, in the design's words:
 * - R1: the map is drawn by walking it — near-blank arrival thread, answers
 *   draw their consequences, blank beyond the drawn sheet.
 * - R2: the horizon is a forecast, not a plan — recomputed, reroutes on answers.
 * - R3: readiness in words, never counts.
 * - The seal: disclosure derives from answers/stances/structure only — a map
 *   differing ONLY in basePriors (pure credence change) discloses identically.
 * - The guide never leaks the map: no offer targets undrawn non-frontier ids.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { uapMap } from '../content/uap.js';
import { createSession, reduceSession } from '../src/session.js';
import type { Arrival, Move, SessionState } from '../src/session.js';
import { disclosure, journeyHorizon, journeyOffers, neighbors, readiness } from '../src/journey.js';
import { lintNarration } from '../src/lint.js';

const ARRIVAL: Arrival = { claim: 'UAPs are alien craft', outcome: 'H5', strength: 'confident' };

function mirror(): SessionState {
  return createSession(uapMap, 'mirror', ARRIVAL);
}

function apply(s: SessionState, moves: Move[]): SessionState {
  return moves.reduce((x, m) => reduceSession(uapMap, x, m), s);
}

const sorted = (xs: Iterable<string>): string[] => [...xs].sort();

// All eleven forks with a first option each — for readiness sweeps.
const ALL_ANSWERS: Array<[string, string]> = [
  ['B1', 'low'],
  ['B2', 'measurement'],
  ['B3', 'yes'],
  ['B4', 'leaky'],
  ['B5a', 'strong'],
  ['B5b', 'minor'],
  ['B6', 'credible'],
  ['B7', 'high-cost'],
  ['B8', 'low'],
  ['B9', 'heavy'],
  ['B10', 'strict'],
];

test('R1: arrival seeds a near-blank thread — claim outcome + ranked frontier, nothing else', () => {
  const d = disclosure(uapMap, mirror());
  assert.equal(d.full, false);
  assert.ok(d.drawn.has('H5'), 'the arrival outcome is on the sheet');
  assert.ok(d.frontier.length > 0 && d.frontier.length <= 2, 'frontier is top-K');
  assert.ok(d.frontier.includes('B2'), 'the load-bearing radar fork leads the thread');
  for (const pid of d.frontier) {
    assert.ok(d.drawn.has(pid), 'frontier is part of the drawn thread');
  }
  // Blank beyond the thread: far territory, the second question, baseline facts.
  assert.ok(!d.drawn.has('H1'), 'sibling outcomes are not pre-drawn');
  assert.ok(!d.drawn.has('A'), 'the second question is unentered');
  assert.ok(!d.drawn.has('F1'), 'baseline facts do not flood the near-blank sheet');
  assert.ok(d.drawn.size <= 6, `near-blank means near-blank (got ${d.drawn.size})`);
});

test('R1: a skip-arrival walk seeds from the first fork and its fed outcomes', () => {
  const d = disclosure(uapMap, createSession(uapMap, 'mirror', null));
  assert.equal(d.full, false);
  assert.ok(d.frontier.length > 0);
  const first = d.frontier[0]!;
  assert.ok(d.drawn.has(first));
  const nb = neighbors(uapMap).get(first) ?? new Set();
  const fedOutcomes = uapMap.outcomes.filter((o) => nb.has(o.id));
  assert.ok(fedOutcomes.length > 0 && fedOutcomes.every((o) => d.drawn.has(o.id)),
    'the first fork shows where it feeds');
});

test('R1: an answer draws its consequences; the base sheet is monotone', () => {
  const s0 = mirror();
  const d0 = disclosure(uapMap, s0);
  const base0 = sorted(d0.drawn).filter((id) => !d0.frontier.includes(id));

  const s1 = apply(s0, [{ type: 'answer', position: 'B2', option: 'measurement' }]);
  const d1 = disclosure(uapMap, s1);

  for (const id of base0) assert.ok(d1.drawn.has(id), `${id} stays on the sheet`);
  assert.ok(d1.drawn.has('B2'), 'the answered fork is drawn');
  assert.ok(d1.drawn.has('H4'), 'the chosen option’s edge targets draw');
  assert.ok(d1.drawn.has('F9') && d1.drawn.has('F10'),
    'facts the answer set live draw where they touch the walk');
  assert.ok(!d1.frontier.includes('B2'), 'an answered fork leaves the frontier');
});

test('R1: presenting a fact draws it', () => {
  const s = apply(mirror(), [{ type: 'present-fact', fact: 'F1' }]);
  assert.ok(disclosure(uapMap, s).drawn.has('F1'));
});

test('seal: a map differing only in basePriors discloses identically', () => {
  const variant = structuredClone(uapMap);
  variant.outcomes.forEach((o, i) => {
    o.basePrior = i % 2 === 0 ? 4 : -4; // violent credence change, zero structure change
  });
  const walk: Move[] = [
    { type: 'answer', position: 'B2', option: 'measurement' },
    { type: 'answer', position: 'B4', option: 'leaky' },
    { type: 'stance', fact: 'F9', stance: 'want-more' },
  ];
  const sA = apply(mirror(), walk);
  const sB = walk.reduce((x, m) => reduceSession(variant, x, m), createSession(variant, 'mirror', ARRIVAL));

  const dA = disclosure(uapMap, sA);
  const dB = disclosure(variant, sB);
  assert.deepEqual(sorted(dB.drawn), sorted(dA.drawn));
  assert.deepEqual([...dB.frontier], [...dA.frontier]);
});

test('the guide never leaks: offers only target drawn territory', () => {
  const s0 = mirror();
  const d = disclosure(uapMap, s0);
  const offers = journeyOffers(uapMap, s0);
  for (const o of offers) {
    const m = o.move;
    if (m.type === 'focus' && m.target && m.target.kind === 'position') {
      assert.ok(d.drawn.has(m.target.id), `offer leaks undrawn fork ${m.target.id}`);
    }
    if (m.type === 'push' && m.target.kind === 'position') {
      assert.ok(d.drawn.has(m.target.id), `offer leaks undrawn fork ${m.target.id}`);
    }
  }
  // And the wrap actually filters — policy v0 offers every unanswered fork.
  const decideTargets = offers.filter(
    (o) => o.move.type === 'focus' && o.move.target?.kind === 'position',
  ).length;
  assert.ok(decideTargets <= d.frontier.length, 'decide beats are frontier-only pre-answers');
});

test('read beats interleave ahead of far-frontier decide beats', () => {
  const s = apply(mirror(), [
    { type: 'focus', target: { kind: 'position', id: 'B2' } },
    { type: 'answer', position: 'B2', option: 'measurement' },
  ]);
  const d = disclosure(uapMap, s);
  const offers = journeyOffers(uapMap, s);
  const firstRead = offers.findIndex((o) => o.move.type === 'present-fact');
  assert.ok(firstRead >= 0, 'live evidence on the focused fork is offered');
  offers.forEach((o, i) => {
    const m = o.move;
    if (m.type !== 'focus' || m.target?.kind !== 'position') return;
    const pid = m.target.id;
    if (pid === d.frontier[0]) return; // the primary next stop may outrank reads
    assert.ok(i > firstRead, `decide beat for ${pid} jumped the reading queue`);
  });
});

test('R2: the horizon is a deterministic forecast that reroutes on answers', () => {
  const s0 = mirror();
  const h0a = journeyHorizon(uapMap, s0);
  const h0b = journeyHorizon(uapMap, s0);
  assert.deepEqual(h0a, h0b, 'same state, same forecast');
  assert.ok(h0a.length >= 2 && h0a.length <= 3);
  assert.equal(h0a[0]!.named, true);
  for (const stop of h0a.slice(1)) assert.equal(stop.named, false, 'only the nearest stop is named');
  assert.equal(h0a[0]!.target.id, 'B2', 'the forecast opens on the thread tip');

  const s1 = apply(s0, [{ type: 'answer', position: 'B2', option: 'measurement' }]);
  const h1 = journeyHorizon(uapMap, s1);
  assert.notDeepEqual(h1, h0a, 'an answer reroutes the horizon');
  assert.notEqual(h1[0]?.target.id, 'B2', 'the taken stop leaves the forecast');
});

test('R2: pre-commit horizon stops stay on the drawn sheet (facts excepted — they are the draw)', () => {
  const s0 = mirror();
  const d = disclosure(uapMap, s0);
  for (const stop of journeyHorizon(uapMap, s0)) {
    if (stop.kind === 'fact') continue; // read beats introduce evidence by design
    assert.ok(d.drawn.has(stop.target.id), `horizon leaks ${stop.kind} ${stop.target.id}`);
  }
});

test('R3: readiness speaks in words, rises monotonically, and lints clean', (t) => {
  let s = mirror();
  assert.equal(readiness(uapMap, s).tier, 'low');
  assert.match(readiness(uapMap, s).copy, /unasked/);

  const rank = { low: 0, mid: 1, high: 2 } as const;
  let prev = 0;
  for (const [pid, opt] of ALL_ANSWERS) {
    s = reduceSession(uapMap, s, { type: 'answer', position: pid, option: opt });
    const tier = rank[readiness(uapMap, s).tier];
    assert.ok(tier >= prev, 'readiness never regresses as answers grow');
    prev = tier;
  }
  assert.equal(readiness(uapMap, s).tier, 'high');
  assert.match(readiness(uapMap, s).copy, /load-bearing/);

  for (const tier of ['low', 'mid', 'high'] as const) {
    const copy =
      tier === 'low'
        ? readiness(uapMap, mirror()).copy
        : tier === 'high'
          ? readiness(uapMap, s).copy
          : readiness(uapMap, apply(mirror(), ALL_ANSWERS.slice(0, 5).map(([position, option]) => ({ type: 'answer' as const, position, option })))).copy;
    const findings = lintNarration(copy, `readiness.${tier}`);
    for (const f of findings) t.diagnostic(`${f.severity} ${f.rule} @ ${f.where}: ${f.excerpt}`);
    assert.equal(findings.filter((f) => f.severity === 'error').length, 0);
    assert.ok(!/\d/.test(copy), 'no numerals in readiness copy');
  }
});

test('modes: Peruse sees the whole territory; commit lifts the fog; walked re-derives', () => {
  const peruse = disclosure(uapMap, createSession(uapMap, 'peruse'));
  assert.equal(peruse.full, true);
  assert.equal(
    peruse.drawn.size,
    uapMap.positions.length + uapMap.facts.length + uapMap.outcomes.length,
  );

  const walked = apply(mirror(), [
    { type: 'answer', position: 'B2', option: 'measurement' },
    { type: 'commit' },
  ]);
  const after = disclosure(uapMap, walked);
  assert.equal(after.full, true, 'commit lifts the fog');

  // R3's spatial half: walked territory is a pure re-derivation, no snapshot.
  const asUnrevealed: SessionState = { ...walked, revealed: false };
  const w = disclosure(uapMap, asUnrevealed);
  assert.equal(w.full, false);
  assert.ok(w.drawn.size < after.drawn.size, 'the walk drew less than the whole map');
  for (const id of w.drawn) assert.ok(after.drawn.has(id));
});

test('purity: calls mutate nothing and repeat exactly', () => {
  const s = apply(mirror(), [{ type: 'answer', position: 'B2', option: 'measurement' }]);
  const before = JSON.stringify(s);
  const d1 = disclosure(uapMap, s);
  const o1 = journeyOffers(uapMap, s);
  const h1 = journeyHorizon(uapMap, s);
  const r1 = readiness(uapMap, s);
  assert.equal(JSON.stringify(s), before, 'session is untouched');

  assert.deepEqual(sorted(disclosure(uapMap, s).drawn), sorted(d1.drawn));
  assert.deepEqual(journeyOffers(uapMap, s), o1);
  assert.deepEqual(journeyHorizon(uapMap, s), h1);
  assert.deepEqual(readiness(uapMap, s), r1);
});
