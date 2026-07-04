/**
 * Session engine tests — the move grammar, the digression stack, exact
 * carryback, the Suppose sandbox, seal discipline, and guide policy v0.
 *
 * The walk fixtures use the UAP map: B6 (the AARO fork, triggers F4/F5),
 * B5 (insider testimony, triggers F2/F3, borne on by both), B4 (secrecy
 * prior, no triggers) — chosen so answer/trigger/stance diffs are all
 * exercised by short move sequences.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { uapMap } from '../content/uap.js';
import {
  createSession,
  guideOffers,
  MODE_CONTRACTS,
  MOVE_TYPES,
  reduceSession,
  replaySession,
  SessionError,
  targetKey,
} from '../src/index.js';
import type { Arrival, FocusTarget, Move, SessionState } from '../src/index.js';

const ARRIVAL: Arrival = {
  claim: 'the government has recovered non-human craft',
  outcome: 'A',
  strength: 'certain',
};

const t = (kind: FocusTarget['kind'], id: string): FocusTarget => ({ kind, id });

const code = (want: string) => (err: unknown) =>
  err instanceof SessionError && err.code === want;

/** Fold a move list from a fresh session. */
function run(state: SessionState, ...moves: Move[]): SessionState {
  return moves.reduce((s, m) => reduceSession(uapMap, s, m), state);
}

function deepFreeze<T>(x: T): T {
  if (x !== null && typeof x === 'object') {
    for (const v of Object.values(x)) deepFreeze(v);
    Object.freeze(x);
  }
  return x;
}

// ---------------------------------------------------------------------------
// Construction & mode contracts
// ---------------------------------------------------------------------------

test('createSession: fresh state, arrival validated, Suppose refuses a sealed arrival', () => {
  const s = createSession(uapMap, 'mirror', ARRIVAL);
  assert.equal(s.mode, 'mirror');
  assert.deepEqual(s.arrival, ARRIVAL);
  assert.equal(s.revealed, false);
  assert.equal(s.focus, null);
  assert.deepEqual(s.stack, []);
  assert.deepEqual(s.record, { answers: {}, stances: {} });
  assert.equal(s.sandbox, null);
  assert.equal(s.moves, 0);

  // Suppose sessions get a sandbox from birth.
  assert.deepEqual(createSession(uapMap, 'suppose').sandbox, { answers: {}, stances: {} });

  assert.throws(
    () => createSession(uapMap, 'mirror', { ...ARRIVAL, outcome: 'ZZZ' }),
    code('BAD_ARRIVAL'),
  );
  assert.throws(() => createSession(uapMap, 'suppose', ARRIVAL), code('SEALED_WALK'));
});

test('mode contracts as data: the §3 table is complete and executable', () => {
  const modes = Object.keys(MODE_CONTRACTS).sort();
  assert.deepEqual(modes, ['contribute', 'mirror', 'peruse', 'suppose']);
  for (const c of Object.values(MODE_CONTRACTS)) {
    for (const m of c.allowedMoves) assert.ok(MOVE_TYPES.includes(m), `${m} is a real move type`);
  }
  // commit is Mirror's alone; answers stay out of Peruse and Contribute;
  // only Suppose writes to the sandbox.
  for (const [mode, c] of Object.entries(MODE_CONTRACTS)) {
    assert.equal(c.allowedMoves.includes('commit'), mode === 'mirror', `commit in ${mode}`);
    assert.equal(c.allowedMoves.includes('answer'), mode === 'mirror' || mode === 'suppose');
    assert.equal(c.workspace === 'sandbox', mode === 'suppose');
  }
  assert.equal(MODE_CONTRACTS.peruse.credenceRender, 'never');
  assert.equal(MODE_CONTRACTS.mirror.credenceRender, 'after-commit');
  assert.equal(MODE_CONTRACTS.suppose.credenceRender, 'live');
});

test('mode contract enforcement: disallowed moves throw MODE_CONTRACT', () => {
  const peruse = createSession(uapMap, 'peruse');
  assert.throws(() => run(peruse, { type: 'answer', position: 'B1', option: 'low' }), code('MODE_CONTRACT'));
  assert.throws(() => run(peruse, { type: 'stance', fact: 'F1', stance: 'accept' }), code('MODE_CONTRACT'));
  assert.throws(() => run(peruse, { type: 'commit' }), code('MODE_CONTRACT'));
  assert.throws(() => run(createSession(uapMap, 'suppose'), { type: 'commit' }), code('MODE_CONTRACT'));
  // Contribute takes stances (structured dispute) but not answers.
  const contribute = createSession(uapMap, 'contribute');
  assert.equal(run(contribute, { type: 'stance', fact: 'F2', stance: 'dispute' }).record.stances['F2'], 'dispute');
  assert.throws(() => run(contribute, { type: 'answer', position: 'B1', option: 'low' }), code('MODE_CONTRACT'));
});

// ---------------------------------------------------------------------------
// Focus, wander, push, pop, zoom-out
// ---------------------------------------------------------------------------

test('wander vs digression: focus shifts leave the stack alone, only push promises', () => {
  let s = createSession(uapMap, 'peruse');
  s = run(s, { type: 'focus', target: t('position', 'B6') });
  assert.deepEqual(s.focus, t('position', 'B6'));
  assert.equal(s.stack.length, 0);

  s = run(s, { type: 'push', target: t('fact', 'F4'), reason: 'unpack' });
  assert.deepEqual(s.focus, t('fact', 'F4'));
  assert.equal(s.stack.length, 1);
  assert.deepEqual(s.stack[0]!.origin, t('position', 'B6'));

  // Wandering while a promise is open keeps the promise.
  s = run(s, { type: 'focus', target: t('outcome', 'A') });
  assert.equal(s.stack.length, 1);

  // Focus targets beyond nodes: rules, tensions, questions, gaps all frame.
  for (const target of [t('rule', 'R3'), t('tension', 'T1'), t('question', 'II'), t('edge', 'e:F3'), t('gap', 'confidence')]) {
    assert.deepEqual(run(s, { type: 'focus', target }).focus, target);
  }
});

test('target and payload validation throws typed errors', () => {
  const s = createSession(uapMap, 'mirror');
  assert.throws(() => run(s, { type: 'focus', target: t('position', 'B99') }), code('UNKNOWN_TARGET'));
  assert.throws(() => run(s, { type: 'push', target: t('fact', 'F4'), reason: 'x' }), code('NO_FOCUS'));
  assert.throws(() => run(s, { type: 'pop' }), code('EMPTY_STACK'));
  assert.throws(() => run(s, { type: 'answer', position: 'B1', option: 'nope' }), code('UNKNOWN_OPTION'));
  assert.throws(() => run(s, { type: 'answer', position: 'B99', option: 'low' }), code('UNKNOWN_TARGET'));
  assert.throws(() => run(s, { type: 'stance', fact: 'F99', stance: 'accept' }), code('UNKNOWN_TARGET'));
  assert.throws(() => run(s, { type: 'react', target: t('fact', 'F99'), reaction: 'surprising' }), code('UNKNOWN_TARGET'));
});

test('zoom-out clears the stack loudly, never silently', () => {
  let s = createSession(uapMap, 'peruse');
  s = run(
    s,
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('fact', 'F4'), reason: 'unpack' },
    { type: 'push', target: t('fact', 'F5'), reason: 'unpack' },
  );
  s = run(s, { type: 'focus', target: null });
  assert.equal(s.focus, null);
  assert.equal(s.stack.length, 0);
  assert.deepEqual(s.notice, {
    kind: 'promises-abandoned',
    abandoned: [t('position', 'B6'), t('fact', 'F4')],
  });
  // Notices are one-shot: the next move clears it.
  s = run(s, { type: 'focus', target: t('position', 'B6') });
  assert.equal(s.notice, null);
  // Zoom-out with nothing promised is quiet.
  assert.equal(run(s, { type: 'focus', target: null }).notice, null);
});

// ---------------------------------------------------------------------------
// Carryback — the exact semantics
// ---------------------------------------------------------------------------

test('carryback: structural diff of the record while away, sealed (no credence delta)', () => {
  let s = createSession(uapMap, 'mirror', ARRIVAL);
  s = run(
    s,
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('fact', 'F4'), reason: 'unpack' },
    { type: 'answer', position: 'B6', option: 'compromised' },
    { type: 'stance', fact: 'F4', stance: 'accept' },
    { type: 'record-thought', text: 'the conflict cuts against authority, either way', about: t('fact', 'F4') },
    { type: 'pop' },
  );
  assert.deepEqual(s.focus, t('position', 'B6'));
  assert.equal(s.stack.length, 0);
  const cb = s.carryback!;
  assert.deepEqual(cb.resumed, t('position', 'B6'));
  assert.deepEqual(cb.answersChanged, [{ position: 'B6', option: 'compromised' }]);
  assert.deepEqual(cb.stancesChanged, [{ fact: 'F4', stance: 'accept' }]);
  // B6=compromised triggers F4 and F5 into the traversal.
  assert.deepEqual(cb.factsWentLive, ['F4', 'F5']);
  assert.equal(cb.thoughtsRecorded, 1);
  // The seal: no credence delta before commit.
  assert.ok(!('credenceShift' in cb), 'sealed carryback carries no credence delta');
});

test('carryback: post-commit the credence delta appears; a quiet trip diffs empty', () => {
  let s = createSession(uapMap, 'mirror', ARRIVAL);
  s = run(
    s,
    { type: 'answer', position: 'B6', option: 'compromised' },
    { type: 'commit' },
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('rule', 'R3'), reason: 'lesson' },
    { type: 'answer', position: 'B4', option: 'leaky' },
    { type: 'pop' },
  );
  const cb = s.carryback!;
  assert.deepEqual(cb.answersChanged, [{ position: 'B4', option: 'leaky' }]);
  assert.equal(typeof cb.credenceShift, 'number');
  assert.ok(cb.credenceShift! > 0, 'flipping the secrecy prior moves the landing');

  // A digression in which nothing changed comes back honest.
  s = run(s, { type: 'push', target: t('fact', 'F1'), reason: 'unpack' }, { type: 'pop' });
  const quiet = s.carryback!;
  assert.deepEqual(quiet.answersChanged, []);
  assert.deepEqual(quiet.stancesChanged, []);
  assert.deepEqual(quiet.factsWentLive, []);
  assert.equal(quiet.thoughtsRecorded, 0);
  assert.equal(quiet.credenceShift, 0);

  // An answer cleared while away comes back as option: null.
  s = run(
    s,
    { type: 'push', target: t('fact', 'F1'), reason: 'unpack' },
    { type: 'answer', position: 'B4', option: null },
    { type: 'pop' },
  );
  assert.deepEqual(s.carryback!.answersChanged, [{ position: 'B4', option: null }]);
});

test('carryback: a stance taken while away moves the unsealed credence delta (engine v0.2)', () => {
  let s = createSession(uapMap, 'mirror');
  s = run(
    s,
    { type: 'answer', position: 'B2', option: 'measurement' }, // F9, F10 live
    { type: 'commit' },
    { type: 'focus', target: t('fact', 'F9') },
    { type: 'push', target: t('fact', 'F10'), reason: 'unpack' },
    { type: 'stance', fact: 'F9', stance: 'dispute' },
    { type: 'pop' },
  );
  const cb = s.carryback!;
  assert.deepEqual(cb.answersChanged, []);
  assert.deepEqual(cb.stancesChanged, [{ fact: 'F9', stance: 'dispute' }]);
  assert.deepEqual(cb.factsWentLive, []);
  assert.ok(cb.credenceShift! > 0, 'parking the radar hinge moves the landing');
});

test('carryback attaches to the resumed frame and clears on the next focus change', () => {
  let s = createSession(uapMap, 'peruse');
  s = run(
    s,
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('fact', 'F4'), reason: 'unpack' },
    { type: 'pop' },
  );
  assert.ok(s.carryback);
  // Non-focus moves keep the strip on the frame.
  s = run(s, { type: 'react', target: t('position', 'B6'), reaction: 'makes-sense' });
  assert.ok(s.carryback);
  // A focus shift leaves the frame — the strip goes with it.
  s = run(s, { type: 'focus', target: t('outcome', 'A') });
  assert.equal(s.carryback, null);
});

// ---------------------------------------------------------------------------
// Answers, stances, soft inputs
// ---------------------------------------------------------------------------

test('answers and stances are reversible explicit inputs; soft inputs accumulate', () => {
  let s = createSession(uapMap, 'mirror');
  s = run(s, { type: 'answer', position: 'B1', option: 'low' }, { type: 'answer', position: 'B1', option: 'high' });
  assert.equal(s.record.answers['B1'], 'high');
  s = run(s, { type: 'answer', position: 'B1', option: null });
  assert.equal(s.record.answers['B1'], undefined);

  s = run(s, { type: 'stance', fact: 'F2', stance: 'want-more' }, { type: 'stance', fact: 'F2', stance: null });
  assert.equal(s.record.stances['F2'], undefined);

  s = run(
    s,
    { type: 'present-fact', fact: 'F1' },
    { type: 'present-fact', fact: 'F1' },
    { type: 'expand', target: t('outcome', 'A') },
    { type: 'expand', target: t('outcome', 'A') },
    { type: 'knowledge-check', entity: 'grusch', known: false },
    { type: 'knowledge-check', entity: 'grusch', known: true },
    { type: 'react', target: t('fact', 'F1'), reaction: 'hadnt-considered' },
  );
  assert.deepEqual(s.presented, ['F1']);
  assert.deepEqual(s.expanded, [targetKey(t('outcome', 'A'))]);
  assert.equal(s.knownEntities['grusch'], true);
  assert.deepEqual(s.reactions, [{ target: t('fact', 'F1'), reaction: 'hadnt-considered' }]);
});

// ---------------------------------------------------------------------------
// Modes: the sandbox, the seal, the arrival
// ---------------------------------------------------------------------------

test('Suppose: sandbox isolation, loud drop on exit, record untouched', () => {
  let s = createSession(uapMap, 'mirror'); // no arrival — walk is not sealed
  s = run(s, { type: 'answer', position: 'B1', option: 'low' });
  s = run(s, { type: 'mode-switch', mode: 'suppose' });
  assert.deepEqual(s.sandbox!.answers, { B1: 'low' }, 'sandbox starts as a copy of the record');

  s = run(
    s,
    { type: 'answer', position: 'B1', option: 'high' },
    { type: 'answer', position: 'B2', option: 'measurement' },
    { type: 'stance', fact: 'F9', stance: 'suppose' },
  );
  assert.deepEqual(s.sandbox!.answers, { B1: 'high', B2: 'measurement' });
  assert.deepEqual(s.record.answers, { B1: 'low' }, 'the record never sees suppositions');
  assert.deepEqual(s.record.stances, {});

  s = run(s, { type: 'mode-switch', mode: 'mirror' });
  assert.equal(s.sandbox, null);
  assert.deepEqual(s.notice, { kind: 'suppositions-dropped', answers: 2, stances: 1 });
  assert.deepEqual(s.record.answers, { B1: 'low' });
});

test('the sealed walk: Suppose is barred until commit; commit is Mirror-only and monotone', () => {
  let s = createSession(uapMap, 'mirror', ARRIVAL);
  assert.throws(() => run(s, { type: 'mode-switch', mode: 'suppose' }), code('SEALED_WALK'));

  s = run(s, { type: 'answer', position: 'B6', option: 'compromised' }, { type: 'commit' });
  assert.equal(s.revealed, true);
  assert.throws(() => run(s, { type: 'commit' }), code('ALREADY_REVEALED'));

  // Unsealed: Suppose opens, and reveal survives mode round-trips.
  s = run(s, { type: 'mode-switch', mode: 'suppose' }, { type: 'mode-switch', mode: 'mirror' });
  assert.equal(s.revealed, true);
});

test('the arrival pair: one per session, enters only through Mirror', () => {
  let s = createSession(uapMap, 'peruse');
  assert.throws(
    () => run(s, { type: 'mode-switch', mode: 'peruse', arrival: ARRIVAL }),
    code('BAD_ARRIVAL'),
  );
  s = run(s, { type: 'mode-switch', mode: 'mirror', arrival: ARRIVAL });
  assert.deepEqual(s.arrival, ARRIVAL);
  assert.throws(
    () => run(s, { type: 'mode-switch', mode: 'mirror', arrival: ARRIVAL }),
    code('ARRIVAL_EXISTS'),
  );
});

// ---------------------------------------------------------------------------
// Purity & replay
// ---------------------------------------------------------------------------

test('purity: a frozen state and a frozen map reduce without mutation', () => {
  const frozenMap = deepFreeze(structuredClone(uapMap));
  let s = createSession(frozenMap, 'mirror', ARRIVAL);
  s = reduceSession(frozenMap, s, { type: 'focus', target: t('position', 'B6') });
  s = reduceSession(frozenMap, s, { type: 'push', target: t('fact', 'F4'), reason: 'unpack' });
  const frozen = deepFreeze(s);
  const after = reduceSession(frozenMap, frozen, { type: 'answer', position: 'B6', option: 'compromised' });
  assert.notEqual(after, frozen);
  assert.equal(frozen.record.answers['B6'], undefined, 'input state untouched');
  assert.equal(after.record.answers['B6'], 'compromised');
  assert.ok(guideOffers(frozenMap, after).length > 0, 'policy reads the frozen map without mutating it');
});

test('a session is its move log: replay reproduces the state byte-exact', () => {
  const log: Move[] = [
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('fact', 'F4'), reason: 'unpack' },
    { type: 'answer', position: 'B6', option: 'compromised' },
    { type: 'stance', fact: 'F4', stance: 'accept' },
    { type: 'pop' },
    { type: 'answer', position: 'B5', option: 'weak' },
    { type: 'commit' },
    { type: 'focus', target: t('gap', 'direction') },
    { type: 'mode-switch', mode: 'suppose' },
    { type: 'answer', position: 'B5', option: 'strong' },
    { type: 'mode-switch', mode: 'mirror' },
  ];
  const a = replaySession(uapMap, createSession(uapMap, 'mirror', ARRIVAL), log);
  const b = replaySession(uapMap, createSession(uapMap, 'mirror', ARRIVAL), log);
  assert.deepEqual(a, b);
  assert.equal(a.moves, log.length);
  assert.equal(a.revealed, true);
  assert.deepEqual(a.notice, { kind: 'suppositions-dropped', answers: 1, stances: 0 });
});

// ---------------------------------------------------------------------------
// Guide policy v0
// ---------------------------------------------------------------------------

test('policy: deterministic, structure-only while sealed, ranked non-trivially', () => {
  const s = createSession(uapMap, 'mirror', ARRIVAL);
  const offers = guideOffers(uapMap, s);
  assert.deepEqual(offers, guideOffers(uapMap, s), 'same state, same offers');

  // Ten unanswered forks, nothing else on the table: exactly ten focus offers.
  assert.equal(offers.length, uapMap.positions.length);
  for (const o of offers) {
    assert.equal(o.move.type, 'focus');
    assert.ok(o.move.type === 'focus' && o.move.target?.kind === 'position');
  }
  // Sealed: nothing credence-derived may be offered.
  for (const o of offers) {
    if (o.move.type === 'focus' && o.move.target) {
      assert.notEqual(o.move.target.kind, 'gap');
      assert.notEqual(o.move.target.kind, 'tension');
    }
  }
  // The ranking is real: weights differ and never increase down the list.
  for (let i = 1; i < offers.length; i++) assert.ok(offers[i - 1]!.score >= offers[i]!.score);
  assert.ok(offers[0]!.score > offers[offers.length - 1]!.score);
});

test('policy: a dispute routes to the fork it is (bearsOn), as the top offer', () => {
  let s = createSession(uapMap, 'mirror', ARRIVAL);
  s = run(
    s,
    { type: 'focus', target: t('fact', 'F2') },
    { type: 'stance', fact: 'F2', stance: 'dispute' },
  );
  const top = guideOffers(uapMap, s)[0]!;
  assert.equal(top.move.type, 'push');
  assert.ok(top.move.type === 'push' && top.move.target.id === 'B5');
  assert.ok(top.move.type === 'push' && top.move.reason === 'dispute-route');
});

test('policy: live evidence bearing on the focused fork is offered until presented', () => {
  let s = createSession(uapMap, 'mirror');
  s = run(
    s,
    { type: 'answer', position: 'B5', option: 'weak' }, // triggers F2, F3 live
    { type: 'focus', target: t('position', 'B5') },
  );
  const factOffers = (state: SessionState) =>
    guideOffers(uapMap, state)
      .filter((o) => o.move.type === 'present-fact')
      .map((o) => (o.move.type === 'present-fact' ? o.move.fact : ''));
  assert.deepEqual(factOffers(s).sort(), ['F2', 'F3']);
  s = run(s, { type: 'present-fact', fact: 'F2' });
  assert.deepEqual(factOffers(s), ['F3']);
});

test('policy: post-commit the payoff frames open — gaps first, tensions and contested present', () => {
  let s = createSession(uapMap, 'mirror', ARRIVAL);
  s = run(
    s,
    { type: 'answer', position: 'B6', option: 'compromised' },
    { type: 'answer', position: 'B5', option: 'weak' }, // T1 fires; F3 contested goes live
    { type: 'commit' },
  );
  const offers = guideOffers(uapMap, s);
  const first = offers[0]!.move;
  assert.ok(first.type === 'focus' && first.target?.kind === 'gap' && first.target.id === 'direction');
  const keys = offers.map((o) =>
    o.move.type === 'focus' && o.move.target ? targetKey(o.move.target) : o.move.type,
  );
  assert.ok(keys.includes('gap:confidence'));
  assert.ok(keys.includes('tension:T1'));
  assert.ok(keys.includes('edge:e:F3'));
  assert.ok(keys.some((k) => k.startsWith('position:')), 'sensitivity revisits are offered');
});

test('policy: an open promise is always among the offers', () => {
  let s = createSession(uapMap, 'peruse');
  s = run(
    s,
    { type: 'focus', target: t('position', 'B6') },
    { type: 'push', target: t('fact', 'F4'), reason: 'unpack' },
  );
  const offers = guideOffers(uapMap, s);
  assert.ok(offers.some((o) => o.move.type === 'pop'));
  // Peruse offers stay inside the Peruse contract.
  for (const o of offers) assert.ok(MODE_CONTRACTS.peruse.allowedMoves.includes(o.move.type));
});
