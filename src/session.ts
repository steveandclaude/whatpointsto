/**
 * The session engine: a pure reducer over typed moves.
 *
 * A session IS its move log — SessionState is a fold over that log, exactly as
 * a landing is a fold over answers. One decision, four payoffs (Interaction
 * Design §7): the reducer is testable like the belief reducer; the move log is
 * the factory demand signal; the log is the persistence unit for longitudinal
 * diffs; engineered insight moments become authored move sequences.
 *
 * Backstage rule, third application (Interaction Design §2): the guided
 * experience feels like being led by someone who never loses the thread. The
 * thread is not model memory — it is the digression stack below, which cannot
 * forget. The LLM (later) narrates moves; it never navigates.
 *
 * Purity is load-bearing, same as reducer.ts: every soft input (answers,
 * stances, thoughts, reactions) enters as explicit move payloads, never as
 * hidden modifiers. Carryback diffs are re-runs of the belief reducer, not
 * bookkeeping. reduceSession(map, state, move) returns a fresh state and
 * mutates nothing.
 *
 * Semantics made exact by writing this file (the "schema audits content"
 * effect, predicted in Interaction Design §8.1 — recorded back into that doc):
 * - `commit` is a 12th move: the canonical 11 had no move that unseals, yet
 *   Mirror's walk ends with an explicit "commit answers & unseal" act
 *   (web/app.ts). Reveal is monotone: a session unseals once, never re-seals.
 * - `react` (soft signal, no engine effect) is now distinct from `stance`
 *   (reducer input, engine v0.2) — the spike's reaction chips conflated them.
 * - Suppose runs on a sandbox workspace cloned from the record at entry and
 *   dropped at exit with a loud notice — suppositions never leak silently.
 *   Entering Suppose during a sealed Mirror walk throws: live sandbox bars
 *   would un-blind the walk through the side door.
 * - Carryback diffs the RECORD only (suppositions are not your record), and
 *   carries a credence delta only when the session is unsealed.
 */

import type {
  BeliefMap,
  FactId,
  OutcomeId,
  PositionId,
  StrengthWord,
} from './schema.js';
import { STRENGTH_LADDER } from './schema.js';
import { divergence, reduce, sensitivity } from './reducer.js';

// ---------------------------------------------------------------------------
// Modes — one engine, one scene, several contracts (Interaction Design §3)
// ---------------------------------------------------------------------------

export type Mode = 'peruse' | 'mirror' | 'suppose' | 'contribute';

// ---------------------------------------------------------------------------
// Focus targets — not only nodes. Relational payoff moments (a tension, a
// contested edge, the confidence gap) need frames of their own or they regress
// into side panels (Interaction Design §4.2).
// ---------------------------------------------------------------------------

export type FocusKind =
  | 'position'
  | 'fact'
  | 'outcome'
  | 'edge'
  | 'rule'
  | 'tension'
  | 'question'
  | 'gap';

export interface FocusTarget {
  kind: FocusKind;
  /**
   * Map id for map-backed kinds (validated against the map). For 'gap' — a
   * derived frame with no map node — the id names the frame ('direction',
   * 'confidence').
   */
  id: string;
}

export function targetKey(t: FocusTarget): string {
  return `${t.kind}:${t.id}`;
}

export function sameTarget(a: FocusTarget | null, b: FocusTarget | null): boolean {
  if (a === null || b === null) return a === b;
  return a.kind === b.kind && a.id === b.id;
}

// ---------------------------------------------------------------------------
// Soft inputs carried by moves
// ---------------------------------------------------------------------------

/**
 * Stance toward a fact — a first-class reducer input (engine v0.2), never
 * inferred from behavior (Interaction Design §6.2).
 */
export type FactStance = 'accept' | 'suppose' | 'want-more' | 'dispute';

/**
 * A reaction is a demand signal, NOT an engine input — the spike's chips
 * conflated the two; the session engine separates them. Vocabulary is a v0
 * working set; extend in code (code wins).
 */
export type Reaction = 'makes-sense' | 'surprising' | 'unconvinced' | 'hadnt-considered';

/** The arrival pair — the belief-first door. A session has at most one. */
export interface Arrival {
  /** The claim in the user's words (or the picked claims-index entry). */
  claim: string;
  /** The outcome the router matched the claim to. */
  outcome: OutcomeId;
  /** Held strength, in ladder words — never numbers. */
  strength: StrengthWord;
}

// ---------------------------------------------------------------------------
// Moves — the typed grammar. The session is a log of these and nothing else.
// ---------------------------------------------------------------------------

export const MOVE_TYPES = [
  'focus',
  'push',
  'pop',
  'expand',
  'present-fact',
  'react',
  'stance',
  'answer',
  'knowledge-check',
  'record-thought',
  'mode-switch',
  'commit',
] as const;

export type MoveType = (typeof MOVE_TYPES)[number];

export type Move =
  /** Wander: plain focus shift. Makes no promise; leaves the stack alone.
   *  target null = zoom out to overview — clears the stack LOUDLY (notice). */
  | { type: 'focus'; target: FocusTarget | null }
  /** Digression: the origin keeps a pinned presence and a visible promise. */
  | { type: 'push'; target: FocusTarget; reason: string }
  /** Return to the promised origin, with a carryback strip. */
  | { type: 'pop' }
  /** Unfold detail around a target (demand signal + renderer state). */
  | { type: 'expand'; target: FocusTarget }
  /** The guide (or user) surfaces a fact into the frame. Authored structure — seal-safe. */
  | { type: 'present-fact'; fact: FactId }
  /** Soft reaction to a frame. Logged, exerts nothing. */
  | { type: 'react'; target: FocusTarget; reaction: Reaction }
  /** Stance toward a fact (engine v0.2 input). null revokes — stances are reversible. */
  | { type: 'stance'; fact: FactId; stance: FactStance | null }
  /** Take a position. null clears. Routed to record or sandbox by the mode contract. */
  | { type: 'answer'; position: PositionId; option: string | null }
  /** "Do you know who Grusch is?" — gates copy variants; nothing is asked twice. */
  | { type: 'knowledge-check'; entity: string; known: boolean }
  /** The CONFIRMED restatement (mediation happens before the move exists — §2.5 gate). */
  | { type: 'record-thought'; text: string; about?: FocusTarget }
  /** Mode transitions are moves and therefore logged. An arrival pair may enter
   *  only on a switch into Mirror, and only once per session. */
  | { type: 'mode-switch'; mode: Mode; arrival?: Arrival }
  /** Commit answers & unseal — Mirror only, monotone. The 12th move: the
   *  canonical list had no move that ends the sealed walk. */
  | { type: 'commit' };

// ---------------------------------------------------------------------------
// Mode contracts as data — which moves the guide may offer × what the surface
// wears × what the seal requires (the §3 table, executable).
// ---------------------------------------------------------------------------

export interface ModeContract {
  job: string;
  register: string;
  /**
   * What the renderer may show of user-credence-derived output. The seal is
   * enforced here (one source of truth), in carryback (credence delta only
   * when unsealed), and in the Suppose entry guard.
   */
  credenceRender: 'never' | 'after-commit' | 'live';
  /** Where answer/stance moves land. Suppose writes to the sandbox, explicitly not your record. */
  workspace: 'record' | 'sandbox';
  allowedMoves: readonly MoveType[];
}

const WAYFINDING: readonly MoveType[] = [
  'focus',
  'push',
  'pop',
  'expand',
  'present-fact',
  'react',
  'knowledge-check',
  'record-thought',
  'mode-switch',
];

export const MODE_CONTRACTS: Record<Mode, ModeContract> = {
  peruse: {
    job: 'learn the territory; read primers; wayfinding',
    register: 'calm, low-commitment',
    credenceRender: 'never',
    workspace: 'record',
    allowedMoves: WAYFINDING,
  },
  mirror: {
    job: 'the product moment: arrival pair → sealed walk → payoff',
    register: 'guided, one focus at a time',
    credenceRender: 'after-commit',
    workspace: 'record',
    allowedMoves: [...WAYFINDING, 'answer', 'stance', 'commit'],
  },
  suppose: {
    job: 'sandbox: provisional stances, counterfactual flips',
    register: 'clearly watermarked as play',
    credenceRender: 'live',
    workspace: 'sandbox',
    allowedMoves: [...WAYFINDING, 'answer', 'stance'],
  },
  contribute: {
    job: 'record reasoning, contribute facts, structured dispute',
    register: 'every artifact through mediator + confirm gate',
    credenceRender: 'never',
    workspace: 'record',
    allowedMoves: [...WAYFINDING, 'stance'],
  },
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** The soft inputs a workspace holds. The record is the user's; the sandbox is play. */
export interface Workspace {
  answers: Readonly<Record<PositionId, string>>;
  stances: Readonly<Record<FactId, FactStance>>;
}

/**
 * A promise on the digression stack. The snapshot holds RAW INPUTS only —
 * every derived quantity (facts gone live, credence shift) is a reducer
 * re-run at pop time. Purity pays: no derived state to drift.
 */
export interface StackFrame {
  /** Where pop returns to — the focus at push time. */
  origin: FocusTarget;
  /** Why we digressed ('unpack', 'dispute-route', guide-authored…). Demand signal. */
  reason: string;
  snapshot: {
    answers: Readonly<Record<PositionId, string>>;
    stances: Readonly<Record<FactId, FactStance>>;
    thoughtCount: number;
  };
}

/**
 * "While you were away: …" — attached to the resumed frame by pop, cleared by
 * the next focus-changing move. Structural always; the credence delta appears
 * ONLY when the session is unsealed (Interaction Design §4.3).
 */
export interface Carryback {
  resumed: FocusTarget;
  /** Answers taken, changed, or cleared (option null) since the promise was made. */
  answersChanged: Array<{ position: PositionId; option: string | null }>;
  stancesChanged: Array<{ fact: FactId; stance: FactStance | null }>;
  /** Facts live now that were not live at push time (a reducer re-run diff). */
  factsWentLive: FactId[];
  thoughtsRecorded: number;
  /** Total-variation shift of the landing while away. Present only post-commit. */
  credenceShift?: number;
}

/** One-shot loud events — set by the move that caused them, cleared by the next move. */
export type Notice =
  | { kind: 'promises-abandoned'; abandoned: FocusTarget[] }
  | { kind: 'suppositions-dropped'; answers: number; stances: number };

export interface SessionState {
  mode: Mode;
  arrival: Arrival | null;
  /** Monotone: false until the commit move, then true for the session's life. */
  revealed: boolean;
  focus: FocusTarget | null;
  stack: readonly StackFrame[];
  /** Your record — what the belief reducer will be fed. */
  record: Workspace;
  /** Present exactly while mode === 'suppose'. Dropped loudly on exit. */
  sandbox: Workspace | null;
  /** Facts surfaced into frames, in presentation order (no repeats). */
  presented: readonly FactId[];
  reactions: ReadonlyArray<{ target: FocusTarget; reaction: Reaction }>;
  thoughts: ReadonlyArray<{ text: string; about?: FocusTarget }>;
  /** Knowledge-check results — so nothing is asked twice (§5.3). */
  knownEntities: Readonly<Record<string, boolean>>;
  /** targetKeys unfolded at least once this session. */
  expanded: readonly string[];
  carryback: Carryback | null;
  notice: Notice | null;
  /** Count of applied moves — a cheap replay-integrity check. */
  moves: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type SessionErrorCode =
  | 'MODE_CONTRACT'
  | 'UNKNOWN_TARGET'
  | 'UNKNOWN_OPTION'
  | 'NO_FOCUS'
  | 'EMPTY_STACK'
  | 'SEALED_WALK'
  | 'ALREADY_REVEALED'
  | 'ARRIVAL_EXISTS'
  | 'BAD_ARRIVAL';

export class SessionError extends Error {
  constructor(
    readonly code: SessionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateTarget(map: BeliefMap, t: FocusTarget): void {
  const ok = (() => {
    switch (t.kind) {
      case 'position':
        return map.positions.some((p) => p.id === t.id);
      case 'fact':
        return map.facts.some((f) => f.id === t.id);
      case 'outcome':
        return map.outcomes.some((o) => o.id === t.id);
      case 'edge':
        return map.edges.some((e) => e.id === t.id);
      case 'rule':
        return map.rules.some((r) => r.id === t.id);
      case 'tension':
        return map.tensions.some((x) => x.id === t.id);
      case 'question':
        return map.questions.some((q) => q.id === t.id);
      case 'gap':
        return true; // derived frame — no map node to check against
    }
  })();
  if (!ok) throw new SessionError('UNKNOWN_TARGET', `no ${t.kind} "${t.id}" in map "${map.slug}"`);
}

function validateArrival(map: BeliefMap, a: Arrival): void {
  if (!map.outcomes.some((o) => o.id === a.outcome)) {
    throw new SessionError('BAD_ARRIVAL', `arrival outcome "${a.outcome}" is not in map "${map.slug}"`);
  }
  if (!STRENGTH_LADDER.includes(a.strength)) {
    throw new SessionError('BAD_ARRIVAL', `arrival strength "${a.strength}" is not on the ladder`);
  }
}

function emptyWorkspace(): Workspace {
  return { answers: {}, stances: {} };
}

function cloneWorkspace(ws: Workspace): Workspace {
  return { answers: { ...ws.answers }, stances: { ...ws.stances } };
}

/** Keys whose values differ between two flat records (union of both key sets). */
function diffKeys<V>(a: Readonly<Record<string, V>>, b: Readonly<Record<string, V>>): string[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].filter((k) => a[k] !== b[k]);
}

// ---------------------------------------------------------------------------
// Session construction
// ---------------------------------------------------------------------------

/**
 * The arrival pair is the door, not a move: it exists before the session's
 * first move (or enters later on a switch into Mirror). Mode is required —
 * whether a fresh visitor lands in Peruse or Mirror is deliberately open
 * (Interaction Design §9.4), so the caller must choose.
 */
export function createSession(map: BeliefMap, mode: Mode, arrival: Arrival | null = null): SessionState {
  if (arrival) validateArrival(map, arrival);
  if (arrival && mode === 'suppose') {
    throw new SessionError('SEALED_WALK', 'an arrival opens a sealed walk — Suppose opens after its answers commit');
  }
  return {
    mode,
    arrival,
    revealed: false,
    focus: null,
    stack: [],
    record: emptyWorkspace(),
    sandbox: mode === 'suppose' ? emptyWorkspace() : null,
    presented: [],
    reactions: [],
    thoughts: [],
    knownEntities: {},
    expanded: [],
    carryback: null,
    notice: null,
    moves: 0,
  };
}

// ---------------------------------------------------------------------------
// The reducer
// ---------------------------------------------------------------------------

function snapshotOf(state: SessionState): StackFrame['snapshot'] {
  return {
    answers: { ...state.record.answers },
    stances: { ...state.record.stances },
    thoughtCount: state.thoughts.length,
  };
}

/**
 * Carryback is structural, computed from raw inputs by re-running the belief
 * reducer on the record as-it-was and as-it-is. It diffs the RECORD only:
 * suppositions are explicitly not your record, so sandbox play never appears
 * in a "while you were away" strip.
 */
function carrybackFrom(map: BeliefMap, frame: StackFrame, state: SessionState): Carryback {
  const before = frame.snapshot;
  const now = state.record;

  const answersChanged = diffKeys(before.answers, now.answers).map((position) => ({
    position,
    option: now.answers[position] ?? null,
  }));
  const stancesChanged = diffKeys(before.stances, now.stances).map((fact) => ({
    fact,
    stance: now.stances[fact] ?? null,
  }));

  const was = reduce(map, before.answers);
  const is = reduce(map, now.answers);
  const factsWentLive = is.activeFacts.filter((f) => !was.activeFacts.includes(f));

  return {
    resumed: frame.origin,
    answersChanged,
    stancesChanged,
    factsWentLive,
    thoughtsRecorded: state.thoughts.length - before.thoughtCount,
    // The seal, enforced in the engine: credence deltas exist only post-commit.
    ...(state.revealed ? { credenceShift: divergence(was, is) } : {}),
  };
}

export function reduceSession(map: BeliefMap, state: SessionState, move: Move): SessionState {
  const contract = MODE_CONTRACTS[state.mode];
  if (!contract.allowedMoves.includes(move.type)) {
    throw new SessionError('MODE_CONTRACT', `"${move.type}" is not a ${state.mode}-mode move`);
  }

  // Notices are one-shot: whatever the previous move announced, this move clears.
  const next: SessionState = { ...state, notice: null, moves: state.moves + 1 };

  switch (move.type) {
    case 'focus': {
      if (move.target === null) {
        // Zoom out: the stack clears LOUDLY, never silently.
        if (state.stack.length > 0) {
          next.notice = { kind: 'promises-abandoned', abandoned: state.stack.map((f) => f.origin) };
        }
        next.stack = [];
        next.focus = null;
      } else {
        // Wandering leaves the stack alone — only push makes a promise.
        validateTarget(map, move.target);
        next.focus = move.target;
      }
      next.carryback = null;
      break;
    }

    case 'push': {
      validateTarget(map, move.target);
      if (state.focus === null) {
        throw new SessionError('NO_FOCUS', 'push needs a current focus to promise a return to — use focus from overview');
      }
      next.stack = [...state.stack, { origin: state.focus, reason: move.reason, snapshot: snapshotOf(state) }];
      next.focus = move.target;
      next.carryback = null;
      break;
    }

    case 'pop': {
      const frame = state.stack[state.stack.length - 1];
      if (!frame) throw new SessionError('EMPTY_STACK', 'pop with no promise on the stack');
      next.stack = state.stack.slice(0, -1);
      next.focus = frame.origin;
      next.carryback = carrybackFrom(map, frame, state);
      break;
    }

    case 'expand': {
      validateTarget(map, move.target);
      const key = targetKey(move.target);
      if (!state.expanded.includes(key)) next.expanded = [...state.expanded, key];
      break;
    }

    case 'present-fact': {
      validateTarget(map, { kind: 'fact', id: move.fact });
      if (!state.presented.includes(move.fact)) next.presented = [...state.presented, move.fact];
      break;
    }

    case 'react': {
      validateTarget(map, move.target);
      next.reactions = [...state.reactions, { target: move.target, reaction: move.reaction }];
      break;
    }

    case 'stance': {
      validateTarget(map, { kind: 'fact', id: move.fact });
      const ws = contract.workspace === 'sandbox' ? (state.sandbox ?? emptyWorkspace()) : state.record;
      const stances: Record<FactId, FactStance> = { ...ws.stances };
      if (move.stance === null) delete stances[move.fact];
      else stances[move.fact] = move.stance;
      const updated: Workspace = { ...ws, stances };
      if (contract.workspace === 'sandbox') next.sandbox = updated;
      else next.record = updated;
      break;
    }

    case 'answer': {
      const p = map.positions.find((x) => x.id === move.position);
      if (!p) throw new SessionError('UNKNOWN_TARGET', `no position "${move.position}" in map "${map.slug}"`);
      if (move.option !== null && !p.options.some((o) => o.id === move.option)) {
        throw new SessionError('UNKNOWN_OPTION', `position "${p.id}" has no option "${move.option}"`);
      }
      const ws = contract.workspace === 'sandbox' ? (state.sandbox ?? emptyWorkspace()) : state.record;
      const answers: Record<PositionId, string> = { ...ws.answers };
      if (move.option === null) delete answers[move.position];
      else answers[move.position] = move.option;
      const updated: Workspace = { ...ws, answers };
      if (contract.workspace === 'sandbox') next.sandbox = updated;
      else next.record = updated;
      break;
    }

    case 'knowledge-check': {
      next.knownEntities = { ...state.knownEntities, [move.entity]: move.known };
      break;
    }

    case 'record-thought': {
      if (move.about) validateTarget(map, move.about);
      next.thoughts = [
        ...state.thoughts,
        { text: move.text, ...(move.about ? { about: move.about } : {}) },
      ];
      break;
    }

    case 'mode-switch': {
      if (move.arrival !== undefined) {
        if (move.mode !== 'mirror') {
          throw new SessionError('BAD_ARRIVAL', 'an arrival pair enters only through Mirror');
        }
        if (state.arrival !== null) {
          throw new SessionError('ARRIVAL_EXISTS', 'this session has its arrival pair — a new arrival is a new session');
        }
        validateArrival(map, move.arrival);
        next.arrival = move.arrival;
      }
      if (move.mode === 'suppose' && state.mode !== 'suppose') {
        // Live sandbox bars during a sealed walk would un-blind it sideways.
        if (state.arrival !== null && !state.revealed) {
          throw new SessionError('SEALED_WALK', 'the walk is sealed — Suppose opens after your answers commit');
        }
        next.sandbox = cloneWorkspace(state.record);
      }
      if (state.mode === 'suppose' && move.mode !== 'suppose') {
        const sandbox = state.sandbox ?? emptyWorkspace();
        next.notice = {
          kind: 'suppositions-dropped',
          answers: diffKeys(sandbox.answers, state.record.answers).length,
          stances: diffKeys(sandbox.stances, state.record.stances).length,
        };
        next.sandbox = null;
      }
      next.mode = move.mode;
      break;
    }

    case 'commit': {
      if (state.revealed) throw new SessionError('ALREADY_REVEALED', 'the session is already unsealed');
      next.revealed = true;
      break;
    }
  }

  return next;
}

/** A session is its move log: replaying the log reproduces the state, byte-exact. */
export function replaySession(map: BeliefMap, initial: SessionState, moves: readonly Move[]): SessionState {
  return moves.reduce((s, m) => reduceSession(map, s, m), initial);
}

// ---------------------------------------------------------------------------
// Guide policy v0 — a pure, inspectable ranking of candidate next moves.
// Deterministic on purpose: ordering and selection is where manufactured
// emphasis could hide (Interaction Design §7); v0 keeps it a function anyone
// can read. Scores are backstage only; `why` is the lintable offer copy.
// ---------------------------------------------------------------------------

export interface GuideOffer {
  move: Move;
  /** Lintable copy — PROTOCOL v1.2 applies: describe what the map is doing. */
  why: string;
  /** Backstage ranking weight. Never rendered. */
  score: number;
}

/**
 * Structural weight of an unanswered fork: how much of the map hangs on it.
 * Rule gates, edge magnitudes, and fact triggers are authored structure —
 * seal-safe by Interaction Design §4.1.
 */
function gateWeight(map: BeliefMap, positionId: PositionId): number {
  let w = 0;
  for (const r of map.rules) if (r.when.some((c) => c.position === positionId)) w += 2;
  for (const e of map.edges) {
    if ('position' in e.from && e.from.position === positionId && !e.contested) {
      for (const d of Object.values(e.effects)) w += Math.abs(d);
    }
  }
  const p = map.positions.find((x) => x.id === positionId);
  for (const o of p?.options ?? []) if (o.triggersFacts?.length) w += 0.5;
  return w;
}

export function guideOffers(map: BeliefMap, state: SessionState): GuideOffer[] {
  const contract = MODE_CONTRACTS[state.mode];
  const ws = contract.workspace === 'sandbox' ? (state.sandbox ?? emptyWorkspace()) : state.record;
  const current = reduce(map, ws.answers);
  const offers: GuideOffer[] = [];

  // 1. Dispute routing (validated in the spike): a disputed fact whose bearsOn
  //    fork is unanswered — the dispute IS a fork the map knows.
  for (const [factId, stance] of Object.entries(ws.stances)) {
    if (stance !== 'dispute') continue;
    const fact = map.facts.find((f) => f.id === factId);
    for (const pid of fact?.bearsOn ?? []) {
      if (ws.answers[pid] !== undefined) continue;
      const target: FocusTarget = { kind: 'position', id: pid };
      offers.push({
        move: state.focus ? { type: 'push', target, reason: 'dispute-route' } : { type: 'focus', target },
        why: 'Your dispute is itself a fork this map knows about — you can take a position on it directly.',
        score: 100,
      });
    }
  }

  // 2. Unanswered forks, ranked by structural gate weight.
  for (const p of map.positions) {
    if (ws.answers[p.id] !== undefined) continue;
    const target: FocusTarget = { kind: 'position', id: p.id };
    if (sameTarget(state.focus, target)) continue;
    offers.push({
      move: { type: 'focus', target },
      why: 'Several of this map’s movements hinge on where you stand here.',
      score: gateWeight(map, p.id),
    });
  }

  // 3. Evidence for the focused fork: live, unpresented facts that speak to it.
  if (state.focus?.kind === 'position') {
    const pid = state.focus.id;
    for (const f of map.facts) {
      if (!f.bearsOn?.includes(pid)) continue;
      if (!current.activeFacts.includes(f.id)) continue;
      if (state.presented.includes(f.id)) continue;
      offers.push({
        move: { type: 'present-fact', fact: f.id },
        why: 'Evidence in your traversal speaks to the fork you’re looking at.',
        score: f.strength === 'STRONG' ? 5 : f.strength === 'MODERATE' ? 4 : 3,
      });
    }
  }

  // 4. The open promise: gentle, rising with depth (no hard cap — §9.6 wants
  //    observation, not theory).
  if (state.stack.length > 0) {
    offers.push({
      move: { type: 'pop' },
      why: 'An open promise is waiting — we said we’d come back to it.',
      score: 1 + 0.5 * state.stack.length,
    });
  }

  // 5. Payoff frames — Mirror, post-commit only. Everything above is authored
  //    structure; everything below derives from the user's credences.
  if (state.mode === 'mirror' && state.revealed) {
    if (state.arrival) {
      offers.push(
        {
          move: { type: 'focus', target: { kind: 'gap', id: 'direction' } },
          why: 'Where your answers land, next to where you arrived.',
          score: 50,
        },
        {
          move: { type: 'focus', target: { kind: 'gap', id: 'confidence' } },
          why: 'How strongly your answers support the view you arrived with.',
          score: 49,
        },
      );
    }
    for (const t of current.tensions) {
      offers.push({
        move: { type: 'focus', target: { kind: 'tension', id: t.id } },
        why: 'Two of your answers pull against each other here.',
        score: 45,
      });
    }
    for (const c of current.contested) {
      offers.push({
        move: { type: 'focus', target: { kind: 'edge', id: c.edgeId } },
        why: 'Genuinely two-sided evidence in your traversal — both readings stay on the table.',
        score: 42,
      });
    }
    for (const s of sensitivity(map, ws.answers)) {
      const target: FocusTarget = { kind: 'position', id: s.position };
      if (sameTarget(state.focus, target)) continue;
      offers.push({
        move: { type: 'focus', target },
        why: 'This answer is carrying your landing — see what moves if it flips.',
        score: 10 * s.shift,
      });
    }
  }

  // Contract filter (belt and braces — components above emit wayfinding moves,
  // legal in every mode) and a deterministic order: score, then a stable key.
  const legal = offers.filter((o) => contract.allowedMoves.includes(o.move.type));
  const keyOf = (o: GuideOffer): string => {
    const m = o.move;
    if (m.type === 'focus') return `focus:${m.target ? targetKey(m.target) : ''}`;
    if (m.type === 'push') return `push:${targetKey(m.target)}`;
    if (m.type === 'present-fact') return `present-fact:${m.fact}`;
    return m.type;
  };
  return legal.sort((a, b) => b.score - a.score || (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0));
}
