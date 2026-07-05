/**
 * The generative journey — deterministic core (Interaction-Design §11, phase J1).
 *
 * A journey is not a script: it is rules over structure. This module derives,
 * from (map, session) alone, everything the walk needs:
 *
 * - `disclosure` — R1, the map is drawn by walking it: what the scene may show.
 * - `journeyOffers` — guide policy v0 wrapped in two journey rules (no offer
 *   leaks undrawn territory; read beats interleave ahead of far-frontier
 *   decide beats), emitted through the same typed-offer channel (§10.5).
 * - `journeyHorizon` — R2, the fade horizon: a status-quo FORECAST of the next
 *   few stops, recomputed per move, stored nowhere.
 * - `readiness` — R3, commit readiness in load words, never counts.
 *
 * Purity is load-bearing (same contract as reducer.ts / session.ts): every
 * function here is a derivation over explicit inputs; calling one mutates
 * nothing and two identical calls return deep-equal results.
 *
 * The seal, engine-enforced: pre-commit these functions read answers, stances,
 * presented facts, the stack/focus, and AUTHORED STRUCTURE (edges, rules,
 * triggers, gate weight — seal-safe per §4.1), plus the structural traversal
 * (`activeFacts`). They never read credences or sensitivity before the reveal;
 * the basePrior-variant test in test/journey.test.ts pins this.
 *
 * J3 seam (probe beats, rhythm rule, `surprises` tags) is deliberately absent —
 * see the marked seam in `journeyOffers`.
 */

import type { BeliefMap, FactId, PositionId } from './schema.js';
import type { FocusKind, FocusTarget, GuideOffer, SessionState } from './session.js';
import { MODE_CONTRACTS, guideOffers, reduceSession, targetKey } from './session.js';
import type { FactStances, ReduceResult } from './reducer.js';
import { reduce } from './reducer.js';

// ---------------------------------------------------------------------------
// Structural adjacency — the engine-side twin of web/scene.ts buildGraph.
// Same four relation families, undirected. One day the renderer should consume
// this; until then the two are kept in sync by hand.
// ---------------------------------------------------------------------------

export function neighbors(map: BeliefMap): ReadonlyMap<string, ReadonlySet<string>> {
  const nb = new Map<string, Set<string>>();
  const link = (a: string, b: string): void => {
    (nb.get(a) ?? nb.set(a, new Set()).get(a)!).add(b);
    (nb.get(b) ?? nb.set(b, new Set()).get(b)!).add(a);
  };
  for (const e of map.edges) {
    const src = 'fact' in e.from ? e.from.fact : e.from.position;
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    for (const t of targets) link(src, t);
  }
  for (const r of map.rules) {
    const targets = [...Object.keys(r.effects ?? {}), ...Object.keys(r.redirect?.calibrated ?? {})];
    for (const c of r.when) for (const t of targets) link(c.position, t);
  }
  for (const p of map.positions)
    for (const o of p.options) for (const f of o.triggersFacts ?? []) link(p.id, f);
  for (const f of map.facts) for (const b of f.bearsOn ?? []) link(f.id, b);
  return nb;
}

/**
 * Structural weight of an unanswered fork — how much of the map hangs on it.
 * MIRRORS src/session.ts gateWeight (module-private there; this build may not
 * touch session.ts beyond presented-tracking, which proved unnecessary).
 * Keep the two in lockstep; consolidating into one export is queued cleanup.
 */
function structuralGateWeight(map: BeliefMap, positionId: PositionId): number {
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

/** The active workspace's soft inputs (record; sandbox only in Suppose). */
function workspaceOf(session: SessionState): {
  answers: Readonly<Record<PositionId, string>>;
  stances: FactStances;
} {
  const contract = MODE_CONTRACTS[session.mode];
  return contract.workspace === 'sandbox' ? (session.sandbox ?? session.record) : session.record;
}

/** Scene nodes a non-node focus target rests on — structure only, no credence. */
function participants(map: BeliefMap, t: FocusTarget, arrival: string | null): string[] {
  switch (t.kind) {
    case 'position':
    case 'fact':
    case 'outcome':
      return [t.id];
    case 'edge': {
      const e = map.edges.find((x) => x.id === t.id);
      if (!e) return [];
      const src = 'fact' in e.from ? e.from.fact : e.from.position;
      const targets = e.contested
        ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
        : Object.keys(e.effects);
      return [src, ...targets];
    }
    case 'rule': {
      const r = map.rules.find((x) => x.id === t.id);
      if (!r) return [];
      return [
        ...r.when.map((c) => c.position),
        ...Object.keys(r.effects ?? {}),
        ...Object.keys(r.redirect?.calibrated ?? {}),
      ];
    }
    case 'tension': {
      const x = map.tensions.find((y) => y.id === t.id);
      return (x?.between ?? []).map((c) => c.position);
    }
    case 'question':
      return map.outcomes.filter((o) => o.question === t.id).map((o) => o.id);
    case 'gap':
      return arrival ? [arrival] : [];
  }
}

// ---------------------------------------------------------------------------
// R1 — disclosure: the map is drawn by walking it.
// ---------------------------------------------------------------------------

export interface Disclosure {
  /** True when the fog is lifted: revealed session, or any non-Mirror mode. */
  full: boolean;
  /** Node ids (positions, facts, outcomes) the scene may show. */
  drawn: ReadonlySet<string>;
  /**
   * The thread's growing tip: top-K unanswered forks adjacent to drawn
   * territory, ranked by structural gate weight. Always ⊆ drawn.
   */
  frontier: readonly PositionId[];
}

const FRONTIER_K = 2;

function everyNodeId(map: BeliefMap): Set<string> {
  return new Set<string>([
    ...map.positions.map((p) => p.id),
    ...map.facts.map((f) => f.id),
    ...map.outcomes.map((o) => o.id),
  ]);
}

export function disclosure(map: BeliefMap, session: SessionState, res?: ReduceResult): Disclosure {
  // The fog is Mirror's pre-commit register only. Peruse's job is the whole
  // territory; Suppose/Contribute open post-commit or outside sealed walks.
  if (session.revealed || session.mode !== 'mirror') {
    return { full: true, drawn: everyNodeId(map), frontier: [] };
  }

  const ws = workspaceOf(session);
  const r = res ?? reduce(map, ws.answers, ws.stances);
  const nb = neighbors(map);
  const drawn = new Set<string>();

  // Seed: the arrival outcome — the claim's landing, no siblings (R1).
  if (session.arrival) drawn.add(session.arrival.outcome);

  // Answers draw their consequences: the fork, the chosen option's edge
  // targets (contested edges move nothing and draw nothing), and the targets
  // of rules the current answers fully satisfy.
  for (const [pid, chosen] of Object.entries(ws.answers)) {
    drawn.add(pid);
    for (const e of map.edges) {
      if (!('position' in e.from) || e.from.position !== pid || e.from.option !== chosen) continue;
      if (e.contested) continue;
      for (const oid of Object.keys(e.effects)) drawn.add(oid);
    }
  }
  for (const rule of map.rules) {
    if (!rule.when.every((c) => ws.answers[c.position] === c.option)) continue;
    for (const oid of Object.keys(rule.effects ?? {})) drawn.add(oid);
    for (const oid of Object.keys(rule.redirect?.calibrated ?? {})) drawn.add(oid);
  }

  // The user's own touches persist: stanced and presented facts.
  for (const fid of Object.keys(ws.stances)) drawn.add(fid);
  for (const fid of session.presented) drawn.add(fid);

  // Open promises and the current frame stay on the sheet.
  for (const frame of session.stack) {
    for (const id of participants(map, frame.origin, session.arrival?.outcome ?? null)) drawn.add(id);
  }
  if (session.focus) {
    for (const id of participants(map, session.focus, session.arrival?.outcome ?? null)) drawn.add(id);
  }

  // Frontier: unanswered forks adjacent to the drawn sheet, ranked by the same
  // structural weight guide policy v0 uses. A blank sheet (skip-arrival, no
  // answers) falls back to the global ranking so the walk always has a tip.
  const unanswered = map.positions.filter((p) => ws.answers[p.id] === undefined);
  const adjacent = unanswered.filter((p) => [...(nb.get(p.id) ?? [])].some((n) => drawn.has(n)));
  const pool = adjacent.length > 0 ? adjacent : unanswered;
  const frontier = pool
    .map((p) => ({ id: p.id, w: structuralGateWeight(map, p.id) }))
    .sort((a, b) => b.w - a.w || (a.id < b.id ? -1 : 1))
    .slice(0, FRONTIER_K)
    .map((x) => x.id);
  for (const pid of frontier) drawn.add(pid);

  // A skip-arrival walk seeds from the first fork's fed outcomes (plan J1.2).
  if (!session.arrival && frontier.length > 0) {
    for (const n of nb.get(frontier[0]!) ?? []) {
      if (map.outcomes.some((o) => o.id === n)) drawn.add(n);
    }
  }

  // Live evidence joins the sheet where it touches the walk. Deliberately
  // narrower than "all activeFacts": baseline facts (live from move zero)
  // would flood R1's near-blank arrival, so a live fact draws only once the
  // territory it touches does. Presented/stanced facts are already in.
  for (const fid of r.activeFacts) {
    if (drawn.has(fid)) continue;
    if ([...(nb.get(fid) ?? [])].some((n) => drawn.has(n))) drawn.add(fid);
  }

  return { full: false, drawn, frontier };
}

// ---------------------------------------------------------------------------
// Journey offers — policy v0 wrapped in the two journey rules.
// ---------------------------------------------------------------------------

/**
 * Guide policy v0's ranking, journey-wrapped:
 * 1. No offer may target undrawn, non-frontier territory — the guide never
 *    leaks the map. (`present-fact` is exempt BY DESIGN: read beats are how
 *    evidence enters the sheet. Dispute routing is exempt because the routed
 *    fork is the user's own dispute made walkable — plan J1.3.)
 * 2. Read beats interleave: decide offers for frontier forks other than the
 *    primary are clamped below the weakest evidence score, so live evidence
 *    on the current fork is read before the walk jumps ahead.
 *
 * ---- J3 SEAM (not built): probe beats fire here — when the user holds an
 * option a strength-qualified fact declares it `surprises`, a present-fact
 * offer with probe copy outranks the frontier; a rhythm rule spaces them. ----
 */
export function journeyOffers(map: BeliefMap, session: SessionState): GuideOffer[] {
  const base = guideOffers(map, session);
  const d = disclosure(map, session);
  if (d.full) return base;

  const primary = d.frontier[0];
  const DISPUTE_SCORE = 100; // policy v0's dispute-routing band

  const visible = (o: GuideOffer): boolean => {
    const m = o.move;
    if (m.type === 'present-fact') return true;
    if (o.score >= DISPUTE_SCORE) return true;
    const target = m.type === 'focus' || m.type === 'push' ? m.target : null;
    if (!target) return true; // pop, zoom-out, non-targeted moves
    return participants(map, target, session.arrival?.outcome ?? null).every((id) => d.drawn.has(id));
  };

  const interleaved = base.filter(visible).map((o) => {
    const m = o.move;
    const pid =
      (m.type === 'focus' || m.type === 'push') && m.target?.kind === 'position' ? m.target.id : null;
    if (pid !== null && pid !== primary && o.score < DISPUTE_SCORE && workspaceOf(session).answers[pid] === undefined) {
      // Far-frontier decide beat: read what's on the table first (plan J1.3).
      return { ...o, score: Math.min(o.score, 2.9) };
    }
    return o;
  });

  const keyOf = (o: GuideOffer): string => {
    const m = o.move;
    if (m.type === 'focus') return `focus:${m.target ? targetKey(m.target) : ''}`;
    if (m.type === 'push') return `push:${targetKey(m.target)}`;
    if (m.type === 'present-fact') return `present-fact:${m.fact}`;
    return m.type;
  };
  return interleaved.sort(
    (a, b) => b.score - a.score || (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0),
  );
}

// ---------------------------------------------------------------------------
// R2 — the horizon: a forecast, not a plan.
// ---------------------------------------------------------------------------

export interface HorizonStop {
  target: FocusTarget;
  kind: FocusKind;
  /** Only the nearest stop is named; later stops render shaped-not-named. */
  named: boolean;
}

/**
 * Status-quo forecast of the next k stops: take the top offer, pretend it was
 * taken WITHOUT new answers, re-rank, repeat. Pure lookahead over the pure
 * session reducer — recomputed every move, stored nowhere, so the visible
 * horizon reroutes the moment an answer changes what's worth asking (§11 R2).
 */
export function journeyHorizon(map: BeliefMap, session: SessionState, k = 3): HorizonStop[] {
  const out: HorizonStop[] = [];
  const seen = new Set<string>();
  let sim = session;

  for (let i = 0; i < k; i++) {
    const offers = journeyOffers(map, sim);
    let taken = false;
    for (const o of offers) {
      const m = o.move;
      let target: FocusTarget | null = null;
      if (m.type === 'focus' || m.type === 'push') target = m.target;
      else if (m.type === 'present-fact') target = { kind: 'fact', id: m.fact };
      else if (m.type === 'pop') target = sim.stack[sim.stack.length - 1]?.origin ?? null;
      if (!target || seen.has(targetKey(target))) continue;

      out.push({ target, kind: target.kind, named: out.length === 0 });
      seen.add(targetKey(target));
      try {
        sim = reduceSession(map, sim, m);
      } catch {
        return out; // defensive: a forecast must never throw at the caller
      }
      taken = true;
      break;
    }
    if (!taken) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// R3 — readiness in words. Counts never render (Platform §2.6; §11 R3).
// ---------------------------------------------------------------------------

export type ReadinessTier = 'low' | 'mid' | 'high';

export interface Readiness {
  tier: ReadinessTier;
  /** Lintable copy — assertion-shaped, no numerals, PROTOCOL-bound. */
  copy: string;
}

const READINESS_COPY: Record<ReadinessTier, string> = {
  low: 'Most of what your claim rests on is still unasked.',
  mid: 'You’ve weighed some of what carries this — more remains.',
  high: 'You’ve spoken to the load-bearing forks — committing now would mean something.',
};

/**
 * Relative, not absolute (Platform §8.5 honesty): the fraction of this map's
 * total structural gate weight the user has answered. Authored structure only.
 */
export function readiness(map: BeliefMap, session: SessionState): Readiness {
  const ws = workspaceOf(session);
  let total = 0;
  let done = 0;
  for (const p of map.positions) {
    const w = structuralGateWeight(map, p.id);
    total += w;
    if (ws.answers[p.id] !== undefined) done += w;
  }
  const answeredCount = Object.keys(ws.answers).length;
  const frac = total > 0 ? done / total : answeredCount / Math.max(1, map.positions.length);
  const tier: ReadinessTier = frac < 1 / 3 ? 'low' : frac < 3 / 4 ? 'mid' : 'high';
  return { tier, copy: READINESS_COPY[tier] };
}
