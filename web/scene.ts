/**
 * Scene renderer — the real app surface, built on the session engine.
 *
 * Replaces both the first renderer's wall (web/app.ts) and the focus-graph
 * spike (web/spike.ts). Spec: Interaction-Design §8.4 — Mirror mode first:
 * arrival → set-aside → guided focus walk → commit → relight reveal.
 *
 * Constraints carried in:
 * - Every interaction is a typed Move dispatched through reduceSession —
 *   renderer state IS SessionState plus the current map; nothing navigational
 *   lives outside the session (backstage rule, Interaction §2).
 * - The guide rail renders guideOffers verbatim: ranked moves + lintable why
 *   copy. The renderer never invents an ordering of its own (curation risk,
 *   Interaction §7).
 * - Vocabulary: no seal words, no padlocks (Interaction §5.5) — the surface
 *   speaks promise ("set it aside — we'll come back to this") and reveal
 *   ("where you land appears after you commit"). SessionError messages are
 *   dev-facing and never reach this surface.
 * - No node IDs in the user's face (§5.1): authored shortLabel everywhere,
 *   prompt/text truncation as fallback. No numerals for credence — bars,
 *   strength words, magnitude words only (Platform §2.6).
 * - Everything credence-derived renders only when session.revealed — and the
 *   engine already refuses to construct carryback deltas before then.
 * - Scene geometry is deterministic from the map (stable geography, §4.1);
 *   the relation-sector focus layout is the spike's validated geometry.
 */
import type {
  BeliefMap,
  FactNode,
  FactStance,
  OutcomeNode,
  PositionNode,
  Question,
  StrengthWord,
} from '../src/schema.js';
import { STRENGTH_LADDER } from '../src/schema.js';
import { confidenceGap, reduce, sensitivity } from '../src/reducer.js';
import type { ReduceResult } from '../src/reducer.js';
import type {
  Arrival,
  FocusTarget,
  GuideOffer,
  Move,
  Reaction,
  SessionState,
} from '../src/session.js';
import {
  MODE_CONTRACTS,
  createSession,
  reduceSession,
  sameTarget,
  targetKey,
} from '../src/session.js';
import { uapMap } from '../content/uap.js';
import { singularityMap } from '../content/singularity.js';
import { disclosure, journeyHorizon, journeyOffers, readiness } from '../src/journey.js';
import type { Disclosure } from '../src/journey.js';

// ---------------------------------------------------------------------------
// App state — the session is the state; the rest is the door and the log.
// ---------------------------------------------------------------------------

const MAPS: BeliefMap[] = [uapMap, singularityMap];

const S = {
  map: MAPS[0]!,
  session: null as SessionState | null,
  log: [] as Move[],
  // The door's picks, before a session exists (the arrival pair is the door,
  // not a move — src/session.ts).
  pickOutcome: null as string | null,
  pickClaim: null as string | null,
  pickStrength: null as StrengthWord | null,
};

/** Offers rendered this frame, so a click can dispatch the ranked move verbatim. */
let currentOffers: GuideOffer[] = [];
/** Last reduce over the active workspace — retarget and frames read from it. */
let lastResult: ReduceResult | null = null;
/** R1 disclosure for the current state — recomputed every sync, stored nowhere else. */
let lastDisclosure: Disclosure | null = null;
/** Post-commit: the territory the walk actually drew (a pure re-derivation, §11 R3). */
let walkedSet: ReadonlySet<string> | null = null;

/** May the scene show this node? (No session / full disclosure ⇒ everything.) */
function isDrawn(id: string): boolean {
  return !lastDisclosure || lastDisclosure.full || lastDisclosure.drawn.has(id);
}

const STRENGTH_LABEL: Record<StrengthWord, string> = {
  lean: 'I lean this way',
  think: 'I think so',
  confident: 'I’m confident',
  certain: 'I’m certain',
};

const STANCE_LABEL: Record<FactStance, string> = {
  accept: 'I accept this',
  suppose: 'grant it for now',
  'want-more': 'not yet — I want more',
  dispute: 'I dispute this',
};

const REACTION_LABEL: Record<Reaction, string> = {
  'makes-sense': 'makes sense',
  surprising: 'surprising',
  unconvinced: 'unconvinced',
  'hadnt-considered': 'hadn’t considered that',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function isDraft(map: BeliefMap): boolean {
  return [...map.positions, ...map.facts, ...map.outcomes].every(
    (n) => n.provenance === 'model-drafted',
  );
}

function positionOf(id: string): PositionNode | undefined {
  return S.map.positions.find((p) => p.id === id);
}
function factOf(id: string): FactNode | undefined {
  return S.map.facts.find((f) => f.id === id);
}
function outcomeOf(id: string): OutcomeNode | undefined {
  return S.map.outcomes.find((o) => o.id === id);
}

/** Authored short scene label; prompt/text truncation as fallback (§5.1). */
function shortOf(id: string): string {
  const p = positionOf(id);
  if (p) return p.shortLabel ?? trunc(p.prompt, 56);
  const f = factOf(id);
  if (f) return f.shortLabel ?? trunc(f.text, 56);
  const o = outcomeOf(id);
  if (o) return o.name;
  return id;
}

/** Full human phrase for any focus target — crumbs, offers, notices. Panel
 *  text wraps instead of hiding behind an ellipsis; pass max only where a
 *  surface genuinely cannot wrap. */
function targetLabel(t: FocusTarget, max?: number): string {
  const cut = (s: string) => (max === undefined ? s : trunc(s, max));
  switch (t.kind) {
    case 'position':
      return cut(positionOf(t.id)?.prompt ?? t.id);
    case 'fact':
      return cut(factOf(t.id)?.text ?? t.id);
    case 'outcome':
      return outcomeOf(t.id)?.name ?? t.id;
    case 'edge': {
      const e = S.map.edges.find((x) => x.id === t.id);
      return e ? cut(e.whyCopy) : 'a connection in the map';
    }
    case 'rule': {
      const r = S.map.rules.find((x) => x.id === t.id);
      return r ? cut(r.lessonCopy) : 'what moved beneath you';
    }
    case 'tension': {
      const x = S.map.tensions.find((y) => y.id === t.id);
      const names = x?.between.map((c) => shortOf(c.position)).join(' × ');
      return names ? `in friction: ${names}` : 'two of your answers, in friction';
    }
    case 'question':
      return S.map.questions.find((q) => q.id === t.id)?.title ?? t.id;
    case 'gap':
      return t.id === 'direction'
        ? 'where you landed, next to where you arrived'
        : 'how strongly your answers support your view';
  }
}

function isNodeKind(t: FocusTarget): boolean {
  return t.kind === 'position' || t.kind === 'fact' || t.kind === 'outcome';
}

function optionLabel(pid: string, oid: string): string {
  return positionOf(pid)?.options.find((o) => o.id === oid)?.label ?? oid;
}

function magnitudeWord(shift: number): string {
  return shift > 0.25 ? 'substantially' : shift > 0.1 ? 'noticeably' : 'slightly';
}

function costDots(cost: number): string {
  return `<span class="cost" title="assumption cost — how much new must be true for this to hold">asks ${'●'.repeat(cost)}${'○'.repeat(5 - cost)}</span>`;
}

function topOutcome(res: ReduceResult, questionId: string): OutcomeNode | null {
  const cred = res.credences[questionId];
  if (!cred) return null;
  const ids = Object.keys(cred);
  if (ids.length === 0) return null;
  const top = ids.reduce((a, b) => (cred[a]! >= cred[b]! ? a : b));
  return outcomeOf(top) ?? null;
}

/** The active workspace's inputs (record; sandbox when a Suppose mode ships). */
function workspace(): { answers: Readonly<Record<string, string>>; stances: Readonly<Record<string, FactStance>> } {
  if (!S.session) return { answers: {}, stances: {} };
  const contract = MODE_CONTRACTS[S.session.mode];
  const ws = contract.workspace === 'sandbox' ? (S.session.sandbox ?? { answers: {}, stances: {} }) : S.session.record;
  return ws;
}

function revealed(): boolean {
  return S.session?.revealed ?? false;
}

// ---------------------------------------------------------------------------
// Graph model — derived from the map, deterministic (stable geography §4.1)
// ---------------------------------------------------------------------------

type NodeKind = 'outcome' | 'position' | 'fact';

interface GNode {
  id: string;
  kind: NodeKind;
  standard: boolean;
  x: number; y: number; s: number; o: number;      // current
  tx: number; ty: number; ts: number; to: number;  // targets
  g: SVGGElement;
  nameEl: SVGTextElement;
  barFill: SVGRectElement | null;
}

interface GEdge {
  a: string; b: string;
  kind: 'influence' | 'contested' | 'evidence';
  el: SVGPathElement;
  o: number; to: number;
}

const nodes = new Map<string, GNode>();
let gEdges: GEdge[] = [];
const adj = new Map<string, Set<string>>();
const HOME = new Map<string, { x: number; y: number }>();
/** question id → centroid x of its outcome group (captions + position sort). */
const QX = new Map<string, number>();

function link(a: string, b: string, kind: GEdge['kind']): void {
  const key = [a, b].sort().join('>');
  const existing = gEdges.find((e) => [e.a, e.b].sort().join('>') === key);
  if (existing) {
    if (kind === 'contested') existing.kind = 'contested';
    return;
  }
  gEdges.push({ a, b, kind, el: undefined as unknown as SVGPathElement, o: 0.14, to: 0.14 });
  (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
  (adj.get(b) ?? adj.set(b, new Set()).get(b)!).add(a);
}

function buildGraph(map: BeliefMap): void {
  gEdges = [];
  adj.clear();
  for (const e of map.edges) {
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    const src = 'fact' in e.from ? e.from.fact : e.from.position;
    for (const t of targets) link(src, t, e.contested ? 'contested' : 'influence');
  }
  for (const r of map.rules) {
    const targets = [...Object.keys(r.effects ?? {}), ...Object.keys(r.redirect?.calibrated ?? {})];
    for (const c of r.when) for (const t of targets) link(c.position, t, 'influence');
  }
  for (const p of map.positions)
    for (const opt of p.options)
      for (const f of opt.triggersFacts ?? []) link(p.id, f, 'evidence');
  for (const f of map.facts)
    for (const b of f.bearsOn ?? []) link(f.id, b, 'evidence');
}

const W = 1400, H = 920;

/**
 * Deterministic overview layout, computed from any map: outcomes arc across
 * the top grouped by question, positions hold the middle band ordered by the
 * questions they scope to, facts spread along the bottom pulled toward what
 * they connect to. Same map, same constellation, every visit.
 */
function homeLayout(map: BeliefMap): void {
  HOME.clear();
  QX.clear();

  const totalO = Math.max(1, map.outcomes.length);
  let x0 = 90;
  for (const q of map.questions) {
    const members = map.outcomes.filter((o) => o.question === q.id);
    if (members.length === 0) continue;
    const span = (W - 180) * (members.length / totalO);
    const mid = (members.length - 1) / 2;
    members.forEach((o, i) => {
      HOME.set(o.id, {
        x: x0 + span * ((i + 0.5) / members.length),
        y: 130 + (mid > 0 ? ((i - mid) / mid) ** 2 * 55 : 0),
      });
    });
    QX.set(q.id, x0 + span / 2);
    x0 += span;
  }

  const rankX = (p: PositionNode): number => {
    const xs = p.scope.map((q) => QX.get(q)).filter((x): x is number => x !== undefined);
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : W / 2;
  };
  const sorted = [...map.positions].sort((a, b) => rankX(a) - rankX(b) || (a.id < b.id ? -1 : 1));
  const cols = Math.max(1, Math.ceil(sorted.length / 2));
  sorted.forEach((p, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    HOME.set(p.id, { x: 170 + (W - 340) * ((col + 0.5) / cols), y: row === 0 ? 430 : 590 });
  });

  const desired = map.facts
    .map((f) => {
      const near = [...(adj.get(f.id) ?? [])]
        .map((n) => HOME.get(n))
        .filter((p): p is { x: number; y: number } => p !== undefined && p.y > 300);
      const x = near.length ? near.reduce((s, p) => s + p.x, 0) / near.length : 170;
      return { id: f.id, x };
    })
    .sort((a, b) => a.x - b.x || (a.id < b.id ? -1 : 1));
  const step = desired.length > 1 ? 1140 / (desired.length - 1) : 0;
  desired.forEach((d, i) => HOME.set(d.id, { x: 130 + i * step, y: i % 2 === 0 ? 800 : 866 }));
}

// ---------------------------------------------------------------------------
// Scene construction
// ---------------------------------------------------------------------------

const sceneHost = document.getElementById('scene')!;
let svg: SVGSVGElement;
let edgeLayer: SVGGElement;
let tetherLayer: SVGGElement;
let nodeLayer: SVGGElement;
let captionLayer: SVGGElement;

function el<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

/** Balanced word wrap for scene labels — up to three lines; an ellipsis only
 *  when a label genuinely overflows even that. */
function wrapLabel(text: string, width = 16, maxLines = 3): string[] {
  if (text.length <= width) return [text];
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if (cur !== '' && (cur + ' ' + w).length > width) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur === '' ? w : cur + ' ' + w;
    }
  }
  if (cur !== '') lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines - 1);
  kept.push(trunc(lines.slice(maxLines - 1).join(' '), width + 2));
  return kept;
}

function makeNode(id: string, kind: NodeKind, short: string, standard = false): void {
  const g = el('g');
  g.setAttribute('class', `node ${kind}${standard ? ' standard' : ''}`);

  let shape: SVGElement;
  if (kind === 'outcome') {
    shape = el('circle');
    shape.setAttribute('r', '26');
  } else if (kind === 'position') {
    shape = el('rect');
    shape.setAttribute('x', '-24'); shape.setAttribute('y', '-24');
    shape.setAttribute('width', '48'); shape.setAttribute('height', '48');
    shape.setAttribute('rx', '12');
  } else {
    shape = el('path');
    shape.setAttribute('d', 'M0,-20 L20,0 L0,20 L-20,0 Z');
  }
  shape.setAttribute('class', 'shape');
  g.appendChild(shape);

  // No IDs on the surface (§5.1) — the shape carries the short name below it.
  const name = el('text');
  name.setAttribute('class', 'name');
  name.setAttribute('text-anchor', 'middle');
  wrapLabel(short, 16, 4).forEach((ln, i) => {
    const ts = el('tspan');
    ts.setAttribute('x', '0');
    ts.setAttribute('y', String(44 + i * 14));
    ts.textContent = ln;
    name.appendChild(ts);
  });
  g.appendChild(name);

  // Credence bar — present in the DOM, visible only when the scene relights.
  let barFill: SVGRectElement | null = null;
  if (kind === 'outcome') {
    const track = el('rect');
    track.setAttribute('class', 'bartrack');
    track.setAttribute('x', '-32'); track.setAttribute('y', '-38');
    track.setAttribute('width', '64'); track.setAttribute('height', '6');
    track.setAttribute('rx', '3');
    barFill = el('rect');
    barFill.setAttribute('class', 'barfill');
    barFill.setAttribute('x', '-32'); barFill.setAttribute('y', '-38');
    barFill.setAttribute('width', '0'); barFill.setAttribute('height', '6');
    barFill.setAttribute('rx', '3');
    g.append(track, barFill);
  }

  g.addEventListener('click', (ev) => {
    ev.stopPropagation();
    dispatch({ type: 'focus', target: { kind, id } });
  });

  nodeLayer.appendChild(g);
  const home = HOME.get(id) ?? { x: W / 2, y: H / 2 };
  nodes.set(id, {
    id, kind, standard,
    x: home.x, y: home.y, s: 1, o: 1,
    tx: home.x, ty: home.y, ts: 1, to: 1,
    g, nameEl: name, barFill,
  });
}

function buildScene(map: BeliefMap): void {
  sceneHost.replaceChildren();
  nodes.clear();

  svg = el('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  sceneHost.appendChild(svg);

  const bg = el('rect');
  bg.setAttribute('width', String(W));
  bg.setAttribute('height', String(H));
  bg.setAttribute('fill', 'transparent');
  bg.addEventListener('click', () => dispatch({ type: 'focus', target: null }));
  svg.appendChild(bg);

  edgeLayer = el('g');
  tetherLayer = el('g');
  nodeLayer = el('g');
  captionLayer = el('g');
  svg.append(edgeLayer, tetherLayer, nodeLayer, captionLayer);

  for (const e of gEdges) {
    const p = el('path');
    p.setAttribute('class', `edge ${e.kind}`);
    p.setAttribute('stroke-width', '1.4');
    e.el = p;
    edgeLayer.appendChild(p);
  }
  for (const o of map.outcomes) makeNode(o.id, 'outcome', shortOf(o.id));
  for (const p of map.positions) makeNode(p.id, 'position', shortOf(p.id), p.kind === 'epistemic-standard');
  for (const f of map.facts) makeNode(f.id, 'fact', shortOf(f.id));
}

// ---------------------------------------------------------------------------
// Layout targeting (the camera) — relation sectors are the spike's validated
// geometry: FEEDS above, RESTS ON / SPEAKS TO below, EVIDENCE to the side.
// ---------------------------------------------------------------------------

const FOCUS_PT = { x: 620, y: 440 };

type Relation = 'rests-on' | 'feeds' | 'evidence' | 'speaks-to';

function relationOf(focusKind: NodeKind, neighborKind: NodeKind): Relation {
  if (focusKind === 'outcome') return neighborKind === 'position' ? 'rests-on' : 'evidence';
  if (focusKind === 'position') return neighborKind === 'outcome' ? 'feeds' : 'evidence';
  return neighborKind === 'outcome' ? 'feeds' : 'speaks-to';
}

const RELATION_CAPTION: Record<Relation, string> = {
  'rests-on': 'RESTS ON',
  feeds: 'FEEDS',
  evidence: 'EVIDENCE',
  'speaks-to': 'SPEAKS TO THE ASSUMPTION',
};

/** Degree bands per relation. Kept disjoint on the circle — feeds' left edge
 *  (-135° ≡ 225°) must stay clear of evidence's arc or their labels collide. */
const RELATION_BAND: Record<Relation, [number, number]> = {
  feeds: [-135, -45],
  'rests-on': [30, 150],
  'speaks-to': [30, 150],
  evidence: [155, 205],
};

function caption(text: string, x: number, y: number, cls = 'caption'): void {
  const t = el('text');
  t.setAttribute('class', cls);
  t.setAttribute('text-anchor', 'middle');
  // Long captions wrap onto a second line rather than truncating.
  wrapLabel(text, 64, 2).forEach((ln, i) => {
    const ts = el('tspan');
    ts.setAttribute('x', String(x));
    ts.setAttribute('y', String(y + i * 19));
    ts.textContent = ln;
    t.appendChild(ts);
  });
  captionLayer.appendChild(t);
}

/** Scene nodes a non-node frame relights (tension, edge, rule, question, gap). */
function highlightIdsFor(t: FocusTarget): Set<string> {
  const ids = new Set<string>();
  switch (t.kind) {
    case 'edge': {
      const e = S.map.edges.find((x) => x.id === t.id);
      if (!e) break;
      ids.add('fact' in e.from ? e.from.fact : e.from.position);
      const targets = e.contested
        ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
        : Object.keys(e.effects);
      for (const o of targets) ids.add(o);
      break;
    }
    case 'rule': {
      const r = S.map.rules.find((x) => x.id === t.id);
      if (!r) break;
      for (const c of r.when) ids.add(c.position);
      for (const o of [...Object.keys(r.effects ?? {}), ...Object.keys(r.redirect?.calibrated ?? {})]) ids.add(o);
      break;
    }
    case 'tension': {
      const x = S.map.tensions.find((y) => y.id === t.id);
      for (const c of x?.between ?? []) ids.add(c.position);
      break;
    }
    case 'question': {
      for (const o of S.map.outcomes) if (o.question === t.id) ids.add(o.id);
      break;
    }
    case 'gap': {
      const a = S.session?.arrival;
      if (a) {
        ids.add(a.outcome);
        if (lastResult) {
          const top = topOutcome(lastResult, outcomeOf(a.outcome)?.question ?? '');
          if (top) ids.add(top.id);
        }
      }
      break;
    }
    default:
      break;
  }
  return ids;
}

function overviewTargets(dimTo: number, highlight: ReadonlySet<string>): void {
  for (const n of nodes.values()) {
    const home = HOME.get(n.id)!;
    const lit = highlight.has(n.id);
    const drawn = isDrawn(n.id);
    n.tx = home.x; n.ty = home.y;
    // Undrawn territory sits blank at a condensed scale, so first-draw is a
    // pencil-in (fade + settle at the home position; REDUCED_MOTION snaps).
    n.ts = !drawn ? 0.75 : lit ? 1.3 : 1;
    n.to = !drawn ? 0 : highlight.size === 0 ? 1 : lit ? 1 : dimTo;
  }
  for (const e of gEdges) {
    const lit = highlight.has(e.a) && highlight.has(e.b);
    e.to =
      !isDrawn(e.a) || !isDrawn(e.b)
        ? 0
        : highlight.size > 0 && lit ? 0.55 : e.kind === 'evidence' ? 0.06 : e.kind === 'contested' ? 0.3 : 0.14;
  }
  for (const q of S.map.questions) {
    // A question captions the sheet only once some of its territory is drawn.
    if (!S.map.outcomes.some((o) => o.question === q.id && isDrawn(o.id))) continue;
    const cx = QX.get(q.id);
    if (cx !== undefined) caption(q.title, cx, 42, 'qcaption');
  }
}

function retarget(): void {
  captionLayer.replaceChildren();
  const session = S.session;
  const focus = session?.focus ?? null;
  const stackNodeIds = (session?.stack ?? [])
    .map((f) => f.origin)
    .filter(isNodeKind)
    .map((t) => t.id);

  if (focus === null) {
    overviewTargets(0.35, new Set());
  } else if (!isNodeKind(focus)) {
    overviewTargets(0.28, new Set([...highlightIdsFor(focus)].filter((id) => isDrawn(id))));
  } else {
    const fid = focus.id;
    const focusNode = nodes.get(fid);
    if (!focusNode) { overviewTargets(0.35, new Set()); return; }
    // Sectors are fog-limited too (§11 R1): evidence enters via present-fact.
    const neighbors = [...(adj.get(fid) ?? [])].filter(
      (n) => !stackNodeIds.includes(n) && n !== fid && isDrawn(n),
    );

    const groups = new Map<Relation, string[]>();
    for (const nid of neighbors) {
      const kind = nodes.get(nid)?.kind;
      if (!kind) continue;
      const rel = relationOf(focusNode.kind, kind);
      (groups.get(rel) ?? groups.set(rel, []).get(rel)!).push(nid);
    }
    const placed = new Map<string, { x: number; y: number }>();
    for (const [rel, members] of groups) {
      const [a0, a1] = RELATION_BAND[rel];
      members.forEach((nid, i) => {
        const deg = a0 + ((i + 0.5) * (a1 - a0)) / members.length;
        const rad = (deg * Math.PI) / 180;
        placed.set(nid, {
          x: FOCUS_PT.x + Math.cos(rad) * 275,
          y: FOCUS_PT.y + Math.sin(rad) * 245,
        });
      });
      const mid = ((a0 + a1) / 2) * (Math.PI / 180);
      caption(RELATION_CAPTION[rel], FOCUS_PT.x + Math.cos(mid) * 415, FOCUS_PT.y + Math.sin(mid) * 375);
    }

    for (const n of nodes.values()) {
      const home = HOME.get(n.id)!;
      const si = stackNodeIds.indexOf(n.id);
      const p = placed.get(n.id);
      if (n.id === fid) {
        n.tx = FOCUS_PT.x; n.ty = FOCUS_PT.y; n.ts = 2.3; n.to = 1;
      } else if (si >= 0) {
        // Pinned promise: the origin keeps a smaller presence (§4.3).
        n.tx = 130; n.ty = 120 + si * 100; n.ts = 0.8; n.to = 0.95;
      } else if (p) {
        n.tx = p.x; n.ty = p.y; n.ts = 1.1; n.to = 1;
      } else {
        n.tx = home.x * 0.92 + FOCUS_PT.x * 0.08;
        n.ty = home.y * 0.92 + FOCUS_PT.y * 0.08;
        n.ts = 0.5; n.to = isDrawn(n.id) ? 0.1 : 0;
      }
    }
    for (const e of gEdges) {
      const touchesFocus = e.a === fid || e.b === fid;
      const touchesStack = stackNodeIds.includes(e.a) || stackNodeIds.includes(e.b);
      e.to =
        !isDrawn(e.a) || !isDrawn(e.b)
          ? 0
          : touchesFocus ? (e.kind === 'contested' ? 0.85 : 0.6) : touchesStack ? 0.2 : 0.04;
    }
  }

  // Tethers along the promise chain: pinned origins → focus.
  tetherLayer.replaceChildren();
  const chain = [...stackNodeIds, focus && isNodeKind(focus) ? focus.id : null].filter(
    (x): x is string => x !== null,
  );
  for (let i = 0; i + 1 < chain.length; i++) {
    const t = el('path');
    t.setAttribute('class', 'tether');
    t.dataset['a'] = chain[i]!;
    t.dataset['b'] = chain[i + 1]!;
    tetherLayer.appendChild(t);
  }
}

/** Liveness, answered rings, parked hatching, focus ring, post-commit bars. */
function updateSceneClasses(res: ReduceResult): void {
  const session = S.session;
  svg.classList.toggle('revealed', revealed());
  const ws = workspace();
  const live = new Set(res.activeFacts);
  const parked = new Set(res.parked.map((p) => p.fact));
  const front = new Set<string>();
  if (revealed()) {
    for (const q of S.map.questions) {
      const top = topOutcome(res, q.id);
      if (top) front.add(top.id);
    }
  }
  for (const n of nodes.values()) {
    n.g.classList.toggle('undrawn', !isDrawn(n.id));
    n.g.classList.toggle('unwalked', revealed() && walkedSet !== null && !walkedSet.has(n.id));
    n.g.classList.toggle('live', n.kind === 'fact' && live.has(n.id));
    n.g.classList.toggle('parked', n.kind === 'fact' && parked.has(n.id));
    n.g.classList.toggle('answered', n.kind === 'position' && n.id in ws.answers);
    n.g.classList.toggle('front', front.has(n.id));
    n.g.classList.toggle(
      'focus-ring',
      session?.focus !== null && session !== null && isNodeKind(session.focus!) && session.focus!.id === n.id,
    );
    if (n.barFill && revealed()) {
      const o = outcomeOf(n.id);
      const cred = o ? (res.credences[o.question]?.[o.id] ?? 0) : 0;
      n.barFill.setAttribute('width', String(Math.max(2, cred * 64)));
    }
  }
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick(): void {
  const k = REDUCED_MOTION ? 1 : 0.16;
  for (const n of nodes.values()) {
    n.x += (n.tx - n.x) * k; n.y += (n.ty - n.y) * k;
    n.s += (n.ts - n.s) * k; n.o += (n.to - n.o) * k;
    n.g.setAttribute('transform', `translate(${n.x},${n.y}) scale(${n.s})`);
    n.g.setAttribute('opacity', n.o.toFixed(3));
    n.nameEl.setAttribute('opacity', n.o < 0.35 ? '0' : '1');
  }
  for (const e of gEdges) {
    const a = nodes.get(e.a), b = nodes.get(e.b);
    if (!a || !b) continue;
    e.o += (e.to - e.o) * k;
    e.el.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y}`);
    e.el.setAttribute('opacity', e.o.toFixed(3));
  }
  for (const t of tetherLayer.children) {
    const a = nodes.get((t as SVGPathElement).dataset['a']!);
    const b = nodes.get((t as SVGPathElement).dataset['b']!);
    if (a && b) t.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y}`);
  }
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// The assumption face (§5.2) — for an outcome, each gating position renders as
// the proposition that would have to be true, not as the elicitation question.
// ---------------------------------------------------------------------------

function neededAssumption(oid: string, pid: string): { text: string; needsOption: string | null } {
  const p = positionOf(pid)!;
  const score = new Map<string, number>();
  for (const e of S.map.edges) {
    if ('position' in e.from && e.from.position === pid && !e.contested) {
      const eff = e.effects[oid] ?? 0;
      if (eff !== 0) score.set(e.from.option, (score.get(e.from.option) ?? 0) + eff);
    }
  }
  for (const r of S.map.rules) {
    const eff = (r.effects?.[oid] ?? 0) + (r.redirect?.calibrated[oid] ?? 0);
    const cond = r.when.find((c) => c.position === pid);
    if (cond && eff !== 0) score.set(cond.option, (score.get(cond.option) ?? 0) + eff);
  }
  if (score.size === 0) return { text: p.prompt, needsOption: null };
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const best = ranked[0]!;
  if (best[1] > 0) {
    return { text: p.options.find((o) => o.id === best[0])!.label, needsOption: best[0] };
  }
  const damaging = ranked[ranked.length - 1]!;
  const others = p.options.filter((o) => o.id !== damaging[0]);
  return {
    text: others.length === 1 ? others[0]!.label : `anything but: ${p.options.find((o) => o.id === damaging[0])!.label}`,
    needsOption: others.length === 1 ? others[0]!.id : null,
  };
}

// ---------------------------------------------------------------------------
// Dispatch — every interaction is a typed move through the session reducer.
// ---------------------------------------------------------------------------

function dispatch(move: Move): void {
  if (!S.session) return;
  try {
    S.session = reduceSession(S.map, S.session, move);
    S.log.push(move);
  } catch (err) {
    // SessionError copy is dev-facing (Interaction §5.5) — log, never surface.
    console.error('[session]', err);
    return;
  }
  sync();
}

function sync(): void {
  const ws = workspace();
  lastResult = reduce(S.map, ws.answers, ws.stances);
  lastDisclosure = S.session ? disclosure(S.map, S.session, lastResult) : null;
  // R3's spatial half: post-commit, walked territory is disclosure re-derived
  // as if unrevealed — no snapshot exists anywhere (purity pays again).
  walkedSet = S.session?.revealed
    ? disclosure(S.map, { ...S.session, revealed: false, mode: 'mirror' }).drawn
    : null;
  retarget();
  updateSceneClasses(lastResult);
  renderHeader();
  renderBanner();
  renderRail();
  renderPanel(lastResult);
  renderArrival();
}

// ---------------------------------------------------------------------------
// Frames — one per focus kind. Chips inside a frame PUSH (a promise to come
// back); scene clicks and guide offers wander or follow the offered move.
// ---------------------------------------------------------------------------

function chip(t: FocusTarget, label?: string, extraClass = ''): string {
  const n = nodes.get(t.id);
  const kindClass =
    t.kind === 'position' && positionOf(t.id)?.kind === 'epistemic-standard'
      ? 'kind-standard'
      : `kind-${t.kind}`;
  const why = S.session?.focus && n ? edgeWhy(S.session.focus.id, t.id) : '';
  return `<span class="chip ${kindClass} ${extraClass}" role="button" tabindex="0" data-act="unpack" data-kind="${t.kind}" data-id="${esc(t.id)}"${
    why ? ` title="${esc(why)}"` : ''
  }>${esc(label ?? targetLabel(t))}</span>`;
}

/** The plain-language story of the connection between two scene nodes. */
function edgeWhy(a: string, b: string): string {
  const stories: string[] = [];
  for (const e of S.map.edges) {
    const src = 'fact' in e.from ? e.from.fact : e.from.position;
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    if ((src === a && targets.includes(b)) || (src === b && targets.includes(a))) {
      stories.push(e.whyCopy);
    }
  }
  return stories.join('\n');
}

function reactRow(target: FocusTarget): string {
  const session = S.session!;
  const key = targetKey(target);
  const last = [...session.reactions].reverse().find((r) => targetKey(r.target) === key);
  return `<h3>Your reaction</h3><div class="chiprow">${(Object.keys(REACTION_LABEL) as Reaction[])
    .map(
      (r) =>
        `<span class="chip ${last?.reaction === r ? 'selected' : ''}" role="button" tabindex="0" data-act="react" data-r="${r}">${REACTION_LABEL[r]}</span>`,
    )
    .join('')}</div>`;
}

function frameOverview(res: ReduceResult): string {
  const session = S.session!;
  if (!revealed()) {
    return `
      <h2>${esc(S.map.title)}</h2>
      ${S.map.questions
        .map(
          (q) =>
            `<div class="muted small" style="margin:4px 0">${esc(q.title)}${q.blurb ? ` — ${esc(q.blurb)}` : ''}</div>`,
        )
        .join('')}
      <div class="legend">
        <span><span class="dot round" style="color:var(--outcome)"></span>where it can land</span>
        <span><span class="dot" style="color:var(--position)"></span>belief fork</span>
        <span><span class="dot" style="color:var(--standard)"></span>epistemic standard</span>
        <span><span class="dot diamond" style="color:var(--fact)"></span>evidence</span>
      </div>
      <div class="muted small" style="margin-top:8px">
        The sheet draws itself as you walk — glowing evidence is live in your traversal;
        green-ringed forks are ones you’ve answered. Click anything drawn to look closer.
        ${session.mode === 'mirror' ? `${esc(readiness(S.map, session).copy)} Where you land appears after you commit.` : ''}
      </div>`;
  }

  // Post-commit overview: the reveal, per question.
  const perQuestion = S.map.questions
    .map((q) => {
      const cred = res.credences[q.id];
      if (!cred) return '';
      const members = S.map.outcomes
        .filter((o) => o.question === q.id)
        .sort((a, b) => (cred[b.id] ?? 0) - (cred[a.id] ?? 0));
      const topId = members[0]?.id;
      return `<h3>${esc(q.title)}</h3>${members
        .map(
          (o) => `<div class="obar ${o.id === topId ? 'top' : ''}">
            <div class="oname">
              <span class="chip kind-outcome" role="button" tabindex="0" data-act="unpack" data-kind="outcome" data-id="${esc(o.id)}">${esc(o.name)}</span>
              ${costDots(o.assumptionCost)}
            </div>
            <div class="track"><div class="fill" style="width:${((cred[o.id] ?? 0) * 100).toFixed(1)}%"></div></div>
          </div>`,
        )
        .join('')}`;
    })
    .join('');

  const rules = res.firedRules.length
    ? `<h3>What moved beneath you</h3><div class="chiprow">${res.firedRules
        .map((r) => chip({ kind: 'rule', id: r.id }, r.lessonCopy, 'block'))
        .join('')}</div>`
    : '';

  return `<h2>Where your answers land</h2>${perQuestion}${rules}${suppositionsLine(res)}${parkedLine(res)}`;
}

function suppositionsLine(res: ReduceResult): string {
  if (!revealed() || res.suppositions.length === 0) return '';
  const ws = workspace();
  const withoutStances: Record<string, FactStance> = { ...ws.stances };
  for (const f of res.suppositions) withoutStances[f] = 'want-more';
  const without = reduce(S.map, ws.answers, withoutStances);
  const q = S.session?.arrival ? (outcomeOf(S.session.arrival.outcome)?.question ?? S.map.questions[0]?.id) : S.map.questions[0]?.id;
  const nowTop = q ? topOutcome(res, q) : null;
  const thenTop = q ? topOutcome(without, q) : null;
  const landing =
    nowTop && thenTop && nowTop.id !== thenTop.id
      ? `set them aside and it lands on <b>${esc(thenTop.name)}</b>`
      : 'set them aside and it lands in the same place';
  const names = res.suppositions.map((f) => shortOf(f)).join(' · ');
  return `<div class="card" style="margin-top:10px"><span class="badge">provisional</span>
    Your landing leans on ${res.suppositions.length === 1 ? 'a fact you granted provisionally' : `${res.suppositions.length} facts you granted provisionally`}
    (${esc(names)}) — ${landing}.</div>`;
}

function parkedLine(res: ReduceResult): string {
  if (res.parked.length === 0) return '';
  return `<div class="card" style="margin-top:10px"><span class="badge">parked</span>
    ${res.parked.length === 1 ? 'One fact sits' : `${res.parked.length} facts sit`} parked — visible, weighed by you, exerting nothing:
    <div class="chiprow">${res.parked.map((p) => chip({ kind: 'fact', id: p.fact }, shortOf(p.fact))).join('')}</div></div>`;
}

function framePosition(p: PositionNode, res: ReduceResult): string {
  const session = S.session!;
  const contract = MODE_CONTRACTS[session.mode];
  const ws = workspace();
  const chosen = ws.answers[p.id];

  const kindBadge =
    p.kind === 'epistemic-standard'
      ? `<span class="badge standard">epistemic standard</span>`
      : p.kind === 'value'
        ? `<span class="badge">value</span>`
        : `<span class="badge">belief fork</span>`;

  const options = contract.allowedMoves.includes('answer')
    ? `<h3>Where do you stand?</h3><div class="chiprow">${p.options
        .map(
          (o) =>
            `<span class="chip ${chosen === o.id ? 'selected' : ''}" role="button" tabindex="0" data-act="answer" data-id="${esc(p.id)}" data-opt="${esc(o.id)}">${esc(o.label)}</span>`,
        )
        .join('')}</div>`
    : `<h3>The fork</h3><div class="chiprow">${p.options
        .map((o) => `<span class="chip">${esc(o.label)}</span>`)
        .join('')}</div><div class="muted small">Positions are taken in the walk — this is the looking-around view.</div>`;

  const bearing = S.map.facts.filter(
    (f) => f.bearsOn?.includes(p.id) && res.activeFacts.includes(f.id) && isDrawn(f.id),
  );
  const evidence = bearing.length
    ? `<h3>Evidence that speaks to this</h3><div class="chiprow">${bearing
        .map((f) => chip({ kind: 'fact', id: f.id }, shortOf(f.id)))
        .join('')}</div>`
    : '';

  const feeds = [...(adj.get(p.id) ?? [])].filter((n) => nodes.get(n)?.kind === 'outcome' && isDrawn(n));
  const pointsTo = feeds.length
    ? `<h3>Where this points</h3><div class="chiprow">${feeds
        .map((o) => chip({ kind: 'outcome', id: o }, shortOf(o)))
        .join('')}</div>`
    : '';

  let carrying = '';
  if (revealed() && chosen !== undefined) {
    const entry = sensitivity(S.map, ws.answers, ws.stances).find((s) => s.position === p.id);
    if (entry && entry.shift > 0.001) {
      carrying = `<div class="card" style="margin-top:10px">Had you said “${esc(optionLabel(p.id, entry.mostMovingOption))}”,
        your landing would move ${magnitudeWord(entry.shift)}.</div>`;
    }
  }

  return `${kindBadge}
    <h2>${esc(p.prompt)}</h2>
    ${p.note ? `<div class="muted small">${esc(p.note)}</div>` : ''}
    ${options}
    ${evidence}
    ${pointsTo}
    ${carrying}
    ${reactRow({ kind: 'position', id: p.id })}`;
}

function frameFact(f: FactNode, res: ReduceResult): string {
  const session = S.session!;
  const contract = MODE_CONTRACTS[session.mode];
  const ws = workspace();
  const stance = ws.stances[f.id];
  const parked = res.parked.find((p) => p.fact === f.id);
  const liveNow = res.activeFacts.includes(f.id);

  const originWord: Record<string, string> = {
    'llm-knowledge': 'from model knowledge',
    'web-researched': 'web-researched',
    'author-researched': 'researched for this map',
    'user-contributed': 'contributed by a user',
  };

  const stanceRow = contract.allowedMoves.includes('stance')
    ? `<h3>Where you hold it</h3><div class="chiprow">${(Object.keys(STANCE_LABEL) as FactStance[])
        .map(
          (st) =>
            `<span class="chip ${stance === st ? 'selected' : ''}" role="button" tabindex="0" data-act="stance" data-id="${esc(f.id)}" data-stance="${st}">${STANCE_LABEL[st]}</span>`,
        )
        .join('')}</div>`
    : '';

  const parkedNote = parked
    ? `<div class="carryback">This sits parked — it stays visible and exerts nothing until you weigh it${
        parked.stance === 'dispute' ? '; your dispute is on record' : ''
      }.</div>`
    : '';

  const bearsOn = (f.bearsOn ?? []).filter((pid) => positionOf(pid) && isDrawn(pid));
  const speaks = bearsOn.length
    ? `<h3>This bears on</h3><div class="chiprow">${bearsOn
        .map((pid) => chip({ kind: 'position', id: pid }, shortOf(pid)))
        .join('')}</div>`
    : '';

  return `<span class="badge strength">${f.strength.toLowerCase()} evidence</span>
    ${f.origin ? `<span class="badge">${esc(originWord[f.origin] ?? f.origin)}</span>` : ''}
    ${liveNow ? `<span class="badge">live in your traversal</span>` : `<span class="badge">dormant here</span>`}
    <h2 style="font-weight:500; font-size:0.95rem">${esc(f.text)}</h2>
    ${
      f.sources.length
        ? `<div class="sources">${f.sources
            .map((s) => `<code${s.citation ? ` title="${esc(s.citation)}"` : ''}>${esc(s.authority)}</code>`)
            .join('')}</div>`
        : ''
    }
    ${f.note ? `<div class="muted small" style="margin-top:6px">${esc(f.note)}</div>` : ''}
    ${stanceRow}
    ${parkedNote}
    ${reactRow({ kind: 'fact', id: f.id })}
    ${speaks}`;
}

function frameOutcome(o: OutcomeNode, res: ReduceResult): string {
  const ws = workspace();
  const gates = [...(adj.get(o.id) ?? [])].filter((n) => nodes.get(n)?.kind === 'position' && isDrawn(n));
  const facts = [...(adj.get(o.id) ?? [])].filter((n) => nodes.get(n)?.kind === 'fact' && isDrawn(n));

  const rows = gates
    .map((g) => {
      const need = neededAssumption(o.id, g);
      const held = ws.answers[g];
      let status = '';
      if (held !== undefined && need.needsOption !== null) {
        status =
          held === need.needsOption
            ? `<div class="held-yes">✓ you grant this</div>`
            : `<div class="held-no">✗ you currently hold: ${esc(optionLabel(g, held))}</div>`;
      }
      return `<div style="margin-bottom:7px">${chip({ kind: 'position', id: g }, need.text)}${status}</div>`;
    })
    .join('');

  let landing = '';
  if (revealed()) {
    const cred = res.credences[o.question]?.[o.id] ?? 0;
    const front = topOutcome(res, o.question)?.id === o.id;
    const moves = res.movements.filter((m) => m.outcome === o.id);
    landing = `<h3>Where it stands for you</h3>
      <div class="obar ${front ? 'top' : ''}"><div class="track"><div class="fill" style="width:${(cred * 100).toFixed(1)}%"></div></div></div>
      ${front ? `<div class="small held-yes">Your answers put this in front.</div>` : ''}
      ${
        moves.length
          ? `<h3>What moved it</h3>${moves
              .map(
                (m) => `<div class="movement"><span class="dir ${m.delta > 0 ? 'up' : 'down'}">${m.delta > 0 ? '↑' : '↓'}</span><span>${esc(m.whyCopy)}</span></div>`,
              )
              .join('')}`
          : `<div class="muted small">This sits at its starting prior.</div>`
      }`;
  }

  return `<span class="badge">where it can land</span> ${costDots(o.assumptionCost)}
    <h2>${esc(o.name)}</h2>
    ${o.blurb ? `<div class="muted small">${esc(o.blurb)}</div>` : ''}
    <h3>What would have to be true</h3>
    ${rows || `<div class="muted small">The map draws no forks under this landing yet.</div>`}
    ${facts.length ? `<h3>Evidence touching this</h3><div class="chiprow">${facts.map((f) => chip({ kind: 'fact', id: f }, shortOf(f))).join('')}</div>` : ''}
    <h3>Ways people say this</h3>
    <div class="muted small">${o.claims.map(esc).join(' · ')}</div>
    ${landing}`;
}

function frameEdge(edgeId: string): string {
  const e = S.map.edges.find((x) => x.id === edgeId);
  if (!e) return '';
  const srcId = 'fact' in e.from ? e.from.fact : e.from.position;
  const readings = e.contested
    ? `<div class="readings">${e.contested.readings
        .map(
          (r) => `<div class="reading"><b>${esc(r.label)}</b>
            <div class="muted small">favors ${Object.keys(r.effects)
              .map((oid) => esc(outcomeOf(oid)?.name ?? oid))
              .join(', ')}</div></div>`,
        )
        .join('')}</div>
      <div class="muted small" style="margin-top:6px">Both readings stay on the table.</div>`
    : '';
  return `<span class="badge">${e.contested ? 'genuinely two-sided' : 'a connection'}</span>
    <h2 style="font-weight:500; font-size:0.95rem">${esc(e.whyCopy)}</h2>
    ${readings}
    <h3>It runs from</h3>
    <div class="chiprow">${chip(
      { kind: nodes.get(srcId)?.kind === 'fact' ? 'fact' : 'position', id: srcId },
      shortOf(srcId),
    )}</div>`;
}

function frameRule(ruleId: string): string {
  const r = S.map.rules.find((x) => x.id === ruleId);
  if (!r) return '';
  const nameList = (effects: Record<string, number>) =>
    Object.entries(effects)
      .map(([oid, d]) => `<li>${esc(outcomeOf(oid)?.name ?? oid)} ${d > 0 ? '↑' : '↓'}</li>`)
      .join('');
  const redirect = r.redirect
    ? `<div class="redirect">
        <div class="update ghost"><div class="uhead">The reflex update — a ghost, for comparison</div><ul>${nameList(r.redirect.naive)}</ul></div>
        <div class="update solid"><div class="uhead">The calibrated update — what moved</div><ul>${nameList(r.redirect.calibrated)}</ul></div>
      </div>`
    : '';
  return `<span class="badge">what moved beneath you</span>
    <h2 style="font-weight:500; font-size:0.95rem">${esc(r.lessonCopy)}</h2>
    ${redirect}
    <h3>It fires from</h3>
    <div class="chiprow">${r.when
      .map((c) => chip({ kind: 'position', id: c.position }, `${shortOf(c.position)}: ${optionLabel(c.position, c.option)}`))
      .join('')}</div>`;
}

function frameTension(tensionId: string): string {
  const t = S.map.tensions.find((x) => x.id === tensionId);
  if (!t) return '';
  return `<span class="badge">held in tension</span>
    <h2 style="font-weight:500; font-size:0.95rem">${esc(t.copy)}</h2>
    <h3>The answers in friction</h3>
    <div class="chiprow">${t.between
      .map((c) => chip({ kind: 'position', id: c.position }, optionLabel(c.position, c.option)))
      .join('')}</div>
    ${reactRow({ kind: 'tension', id: t.id })}`;
}

function frameQuestion(q: Question): string {
  const members = S.map.outcomes.filter((o) => o.question === q.id && isDrawn(o.id));
  return `<span class="badge">the question</span>
    <h2>${esc(q.title)}</h2>
    ${q.blurb ? `<div class="muted small">${esc(q.blurb)}</div>` : ''}
    <h3>Where it can land</h3>
    <div class="chiprow">${members.map((o) => chip({ kind: 'outcome', id: o.id }, o.name)).join('')}</div>`;
}

function frameGap(id: string, res: ReduceResult): string {
  const session = S.session!;
  const a = session.arrival;
  if (!revealed() || !a) {
    return `<div class="muted">Where you land appears after you commit your answers.</div>`;
  }
  const arrivalOutcome = outcomeOf(a.outcome)!;
  const top = topOutcome(res, arrivalOutcome.question);

  if (id === 'direction') {
    const line =
      top && top.id === a.outcome
        ? `Your answers land where you stand: <b>${esc(top.name)}</b>.`
        : `You arrived saying “${esc(a.claim)}”. Your answers land on <b>${esc(top?.name ?? '—')}</b>.`;
    return `<span class="badge">the reveal — direction</span>
      <h2 style="font-weight:500; font-size:0.98rem">${line}</h2>
      <div class="chiprow">${chip({ kind: 'outcome', id: a.outcome }, `where you arrived: ${shortOf(a.outcome)}`)}${
        top && top.id !== a.outcome ? chip({ kind: 'outcome', id: top.id }, `where you landed: ${shortOf(top.id)}`) : ''
      }</div>
      ${suppositionsLine(res)}
      ${reactRow({ kind: 'gap', id: 'direction' })}`;
  }

  const gap = confidenceGap(res, a.outcome, a.strength);
  const supportedWord = gap.supported === 'unsupported' ? 'less than lean' : gap.supported;
  let line: string;
  if (gap.gapSteps > 0) {
    line = `Your answers support “${esc(arrivalOutcome.name)}” at about <b>${supportedWord}</b> — you hold it at <b>${gap.stated}</b>. The surplus is coming from somewhere this map doesn’t show.`;
  } else if (gap.gapSteps < 0) {
    line = `Your own answers commit you to more than you claim — they support <b>${supportedWord}</b>, and you say <b>${gap.stated}</b>. You believe this harder than you let on.`;
  } else {
    line = `Your held strength matches what your answers support: <b>${supportedWord}</b>.`;
  }
  return `<span class="badge">the reveal — confidence</span>
    <h2 style="font-weight:500; font-size:0.98rem">${line}</h2>
    ${reactRow({ kind: 'gap', id: 'confidence' })}`;
}

// ---------------------------------------------------------------------------
// Chrome — register banner (session voice), carryback strip, journey rail
// (the walk made visible, Interaction §10.3).
// ---------------------------------------------------------------------------

/** One-line notch label (§10.3 hard cap) — authored shortLabels, never prompts. */
function shortTargetLabel(t: FocusTarget): string {
  if (isNodeKind(t)) return shortOf(t.id);
  switch (t.kind) {
    case 'question':
      return S.map.questions.find((q) => q.id === t.id)?.title ?? 'the question';
    case 'gap':
      return t.id === 'direction' ? 'the direction gap' : 'the confidence gap';
    case 'rule':
      return 'what moved beneath you';
    case 'tension':
      return 'two answers in friction';
    default:
      return 'a connection in the map';
  }
}

/** Forks answered more than once — the user's own wavering, read from the log. */
function waveringIds(): Set<string> {
  const counts = new Map<string, number>();
  for (const m of S.log) {
    if (m.type === 'answer') counts.set(m.position, (counts.get(m.position) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, n]) => n >= 2).map(([id]) => id));
}

/** Latest friction reaction the user left on a fork, if any. */
function flaggedReaction(pid: string): Reaction | null {
  const session = S.session;
  if (!session) return null;
  const key = targetKey({ kind: 'position', id: pid });
  const last = [...session.reactions].reverse().find((r) => targetKey(r.target) === key);
  return last && (last.reaction === 'unconvinced' || last.reaction === 'hadnt-considered')
    ? last.reaction
    : null;
}

/** Post-commit only (§10.3 seal split): the fork whose answer moves the landing most. */
function carryingId(): string | null {
  if (!revealed()) return null;
  const ws = workspace();
  let top: ReturnType<typeof sensitivity>[number] | null = null;
  for (const e of sensitivity(S.map, ws.answers, ws.stances)) {
    if (!top || e.shift > top.shift) top = e;
  }
  return top && top.shift > 0.001 ? top.position : null;
}

function noticeHtml(): string {
  const n = S.session?.notice;
  if (!n) return '';
  if (n.kind === 'promises-abandoned') {
    return `<div class="notice">We stepped back to the whole map — open promises were let go: ${n.abandoned
      .map((t) => esc(targetLabel(t)))
      .join(' · ')}.</div>`;
  }
  return `<div class="notice">Leaving the sandbox set aside ${n.answers} provisional ${n.answers === 1 ? 'answer' : 'answers'} and ${n.stances} provisional ${n.stances === 1 ? 'stance' : 'stances'} — your record is unchanged.</div>`;
}

function carrybackHtml(): string {
  const c = S.session?.carryback;
  if (!c) return '';
  const parts: string[] = [];
  for (const a of c.answersChanged) {
    parts.push(
      a.option === null
        ? `you cleared where you stood on “${esc(shortOf(a.position))}”`
        : `you took a position — “${esc(optionLabel(a.position, a.option))}”`,
    );
  }
  for (const st of c.stancesChanged) {
    parts.push(
      st.stance === null
        ? `you cleared your stance on “${esc(shortOf(st.fact))}”`
        : `on “${esc(shortOf(st.fact))}” you said: ${STANCE_LABEL[st.stance]}`,
    );
  }
  if (c.factsWentLive.length) {
    parts.push(`new evidence is live: ${c.factsWentLive.map((f) => esc(shortOf(f))).join(' · ')}`);
  }
  if (c.thoughtsRecorded > 0) {
    parts.push(`you recorded ${c.thoughtsRecorded} ${c.thoughtsRecorded === 1 ? 'thought' : 'thoughts'}`);
  }
  if (c.credenceShift !== undefined && c.credenceShift > 0.005) {
    parts.push(`your landing moved ${magnitudeWord(c.credenceShift)}`);
  }
  return `<div class="carryback">While you were away: ${parts.length ? parts.join(' · ') : 'nothing changed'}.</div>`;
}

function promiseHtml(): string {
  const session = S.session!;
  if (session.mode !== 'mirror') return '';
  if (revealed()) {
    const a = session.arrival;
    return a
      ? `<div class="reveal-banner">The reveal — you arrived saying “${esc(a.claim)}”, held at “${STRENGTH_LABEL[a.strength]}”.</div>`
      : `<div class="reveal-banner">The reveal — where your answers land, now live below.</div>`;
  }
  return session.arrival
    ? `<div class="promise">Your stated view is set aside — we’ll come back to it after your answers have spoken.</div>`
    : `<div class="promise">You’re walking the map without a stated claim — the payoff shows where your answers land.</div>`;
}

/** Human label for a guide offer's move — the why copy rides underneath. */
function offerLabel(o: GuideOffer): string {
  const m = o.move;
  switch (m.type) {
    case 'focus':
      return m.target ? targetLabel(m.target) : 'step back to the whole map';
    case 'push':
      return targetLabel(m.target);
    case 'present-fact':
      return `look at: ${targetLabel({ kind: 'fact', id: m.fact })}`;
    case 'pop':
      return 'return to the open promise';
    default:
      return m.type;
  }
}

/** One-line offer label for a rail notch; the full phrase + why ride the title. */
function shortOfferLabel(o: GuideOffer): string {
  const m = o.move;
  switch (m.type) {
    case 'focus':
      return m.target ? shortTargetLabel(m.target) : 'step back to the whole map';
    case 'push':
      return shortTargetLabel(m.target);
    case 'present-fact':
      return `look at: ${shortOf(m.fact)}`;
    case 'pop':
      return 'return to the open promise';
    default:
      return m.type;
  }
}

function renderRail(): void {
  const rail = document.getElementById('rail')!;
  const session = S.session;
  if (!session) {
    rail.hidden = true;
    rail.innerHTML = '';
    return;
  }

  // Wayfinding glyphs.
  const tools = [
    session.stack.length
      ? `<button class="notch" data-act="pop" title="return to the open promise"><span class="glyph">◀</span><span class="rlabel">return to the open promise</span></button>`
      : '',
    session.focus
      ? `<button class="notch" data-act="zoom-out" title="step back to the whole map"><span class="glyph">▦</span><span class="rlabel">step back to the whole map</span></button>`
      : '',
    `<button class="notch" data-act="start-over" title="start over"><span class="glyph">↺</span><span class="rlabel">start over</span></button>`,
  ].join('');

  // TRAIL — stops actually made, from the move log (§11 R2: the path behind
  // is only where you have been; there is no census of what remains).
  // Emphasis echoes the user's own signals; mulberry joins post-commit only.
  const ws = workspace();
  const wav = waveringIds();
  const carrying = carryingId();
  const trailTargets: FocusTarget[] = [];
  for (const m of S.log) {
    let t: FocusTarget | null = null;
    if (m.type === 'focus' && m.target) t = m.target;
    else if (m.type === 'push') t = m.target;
    else if (m.type === 'present-fact') t = { kind: 'fact', id: m.fact };
    else if (m.type === 'answer') t = { kind: 'position', id: m.position };
    if (!t) continue;
    const last = trailTargets[trailTargets.length - 1];
    if (last && sameTarget(last, t)) continue;
    trailTargets.push(t);
  }
  const trailNotches = trailTargets
    .slice(-8) // display window only — the log keeps everything
    .map((t) => {
      const isPos = t.kind === 'position';
      const flag = isPos ? flaggedReaction(t.id) : null;
      const cls = [
        'dotmark',
        isPos && t.id in ws.answers ? 'answered' : '',
        isPos && wav.has(t.id) ? 'waver' : '',
        flag ? 'flagged' : '',
        isPos && carrying === t.id ? 'carrying' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const notes: string[] = [];
      if (isPos && wav.has(t.id)) notes.push('you’ve changed this answer');
      if (flag) notes.push(`you marked this: ${REACTION_LABEL[flag]}`);
      if (isPos && carrying === t.id) notes.push('this answer is carrying your landing');
      const title = notes.length ? `${targetLabel(t)} — ${notes.join(' · ')}` : targetLabel(t);
      const glyph = isPos
        ? `<span class="${cls}"></span>`
        : t.kind === 'fact' ? '◇' : t.kind === 'outcome' ? '○' : '·';
      return `<button class="notch" data-act="rail-focus" data-kind="${t.kind}" data-id="${esc(t.id)}" title="${esc(title)}"><span class="glyph">${glyph}</span><span class="rlabel">${esc(shortTargetLabel(t))}</span></button>`;
    })
    .join('');
  const trail = trailNotches ? `<div class="railcap">behind you</div>${trailNotches}` : '';

  // HERE.
  const here = `<div class="notch inert" title="${esc(session.focus ? targetLabel(session.focus) : 'the whole map')}"><span class="glyph">◉</span><span class="rlabel">${esc(
    session.focus ? shortTargetLabel(session.focus) : 'the whole map',
  )}</span></div>`;

  // HORIZON — a forecast, not a plan (§11 R2): the nearest stop is named and
  // clickable (it dispatches the policy's own top offer verbatim — curation
  // risk, §7); later stops are shaped-but-not-named; then the fade. No
  // terminal element, no end-cap — the path continues out of sight.
  currentOffers = journeyOffers(S.map, session)
    .filter((o) => !(o.move.type === 'focus' && o.move.target !== null && sameTarget(session.focus, o.move.target)))
    .slice(0, 3);
  const stopTargetOf = (o: GuideOffer): FocusTarget | null => {
    const m = o.move;
    if (m.type === 'focus' || m.type === 'push') return m.target;
    if (m.type === 'present-fact') return { kind: 'fact', id: m.fact };
    if (m.type === 'pop') return session.stack[session.stack.length - 1]?.origin ?? null;
    return null;
  };
  const SHAPE_WORD: Record<string, string> = {
    position: 'a fork',
    fact: 'a piece of evidence',
    outcome: 'a place it can land',
    edge: 'a connection',
    rule: 'something that moved beneath you',
    tension: 'two answers in friction',
    question: 'a question',
    gap: 'part of the reveal',
  };
  const horizon = journeyHorizon(S.map, session, 3);
  const horizonNotches = horizon
    .map((stop, j) => {
      if (stop.named) {
        const i = currentOffers.findIndex((o) => {
          const t = stopTargetOf(o);
          return t !== null && sameTarget(t, stop.target);
        });
        if (i >= 0) {
          const o = currentOffers[i]!;
          return `<button class="notch" data-act="offer" data-i="${i}" title="${esc(`${offerLabel(o)} — ${o.why}`)}"><span class="glyph">›</span><span class="rlabel">${esc(shortOfferLabel(o))}</span></button>`;
        }
        return `<div class="notch inert"><span class="glyph">›</span><span class="rlabel">${esc(shortTargetLabel(stop.target))}</span></div>`;
      }
      // Shaped, not named — no title either: the fade keeps its secrets (§11 R2).
      return `<div class="notch inert h-shaped fade${j}"><span class="glyph">›</span><span class="rlabel">${SHAPE_WORD[stop.kind] ?? 'a stop on the path'}</span></div>`;
    })
    .join('');
  const ahead = horizonNotches
    ? `<div class="railcap">ahead</div>${horizonNotches}`
    : `<div class="railcap">wander freely</div>`;

  // PROMISES — open digressions; a notch click pops back to that promise.
  const promises = session.stack
    .map(
      (f, i) =>
        `<button class="notch promise-n" data-act="pop-to" data-i="${i}" title="we’ll come back to: ${esc(targetLabel(f.origin))}"><span class="glyph">⏎</span><span class="rlabel">${esc(shortTargetLabel(f.origin))}</span></button>`,
    )
    .join('');

  // FOOT — the walk leads down the trail to the inking moment. Readiness is
  // load words, never counts (§11 R3).
  let foot = '';
  if (session.mode === 'mirror' && !revealed()) {
    const ready = readiness(S.map, session);
    foot = `<div class="railfoot"><button class="notch primary" data-act="commit" title="commit whenever you’re ready; untouched forks stay at default"><span class="glyph">✓</span><span class="rlabel">Commit answers — see where you land</span></button><div class="readiness rlabel">${esc(ready.copy)}</div></div>`;
  } else if (revealed()) {
    foot = `<div class="railfoot"><div class="notch inert" title="the reveal is live"><span class="glyph revealmark">◆</span><span class="rlabel">the reveal is live</span></div></div>`;
  }

  rail.hidden = false;
  rail.innerHTML = `${tools}<div class="railsep"></div>${trail}${here}${ahead}<div class="railsep"></div>${promises}${foot}`;
}

function renderBanner(): void {
  const reg = document.getElementById('register')!;
  if (!S.session) {
    reg.hidden = true;
    reg.innerHTML = '';
    return;
  }
  const draft = isDraft(S.map)
    ? `<span class="draftline"><span class="stamp">DRAFT</span>Model-drafted scaffold. No research pass has run and no human has reviewed a word of it.</span>`
    : '';
  const html = `${noticeHtml()}${promiseHtml()}${draft}`;
  reg.hidden = html === '';
  reg.innerHTML = html;
}

function draftBanner(): string {
  if (!isDraft(S.map)) return '';
  return `<div class="draftwrap"><span class="stamp">DRAFT</span>
    Model-drafted scaffold. No research pass has run and no human has reviewed a word of it —
    treat every fork and landing as a sketch of what a checked map would ask.</div>`;
}

function renderPanel(res: ReduceResult): void {
  const panel = document.getElementById('panel')!;
  const session = S.session;
  if (!session) {
    panel.innerHTML = '';
    return;
  }

  let frame: string;
  const f = session.focus;
  if (f === null) frame = frameOverview(res);
  else if (f.kind === 'position') frame = positionOf(f.id) ? framePosition(positionOf(f.id)!, res) : '';
  else if (f.kind === 'fact') frame = factOf(f.id) ? frameFact(factOf(f.id)!, res) : '';
  else if (f.kind === 'outcome') frame = outcomeOf(f.id) ? frameOutcome(outcomeOf(f.id)!, res) : '';
  else if (f.kind === 'edge') frame = frameEdge(f.id);
  else if (f.kind === 'rule') frame = frameRule(f.id);
  else if (f.kind === 'tension') frame = frameTension(f.id);
  else if (f.kind === 'question')
    frame = frameQuestion(S.map.questions.find((q) => q.id === f.id) ?? { id: f.id, title: f.id });
  else frame = frameGap(f.id, res);

  panel.innerHTML = `
    ${carrybackHtml()}
    <div>${frame}</div>`;
}

function renderHeader(): void {
  const top = document.getElementById('top')!;
  const session = S.session;
  const picker = MAPS.map(
    (m) =>
      `<button data-act="pick-map" data-slug="${esc(m.slug)}" class="${m.slug === S.map.slug ? 'selected' : ''}">/${esc(m.slug)}</button>`,
  ).join('');
  const modeChip = session
    ? `<button data-act="mode" data-mode="${session.mode === 'peruse' ? 'mirror' : 'peruse'}">${
        session.mode === 'peruse' ? 'back to the walk' : 'just look around'
      }</button>`
    : '';
  top.innerHTML = `<span class="brand">whatpoints<span>to</span></span>
    <span>${esc(S.map.title)}</span>
    ${modeChip}
    <nav>${picker}</nav>`;
}

// ---------------------------------------------------------------------------
// The arrival door — claim + strength, then the promise. Mirror-first entry is
// this renderer's provisional choice; §9.4 (Peruse-first?) stays open.
// ---------------------------------------------------------------------------

function renderArrival(): void {
  const host = document.getElementById('arrival')!;
  if (S.session) {
    host.hidden = true;
    return;
  }
  host.hidden = false;

  const claims = S.map.questions
    .map((q) => {
      const rows = S.map.outcomes
        .filter((o) => o.question === q.id)
        .flatMap((o) =>
          o.claims.map((c) => {
            const sel = S.pickOutcome === o.id && S.pickClaim === c;
            return `<button data-act="pick-claim" data-outcome="${esc(o.id)}" data-claim="${esc(c)}"
              class="${sel ? 'selected' : ''}">${esc(c)}</button>`;
          }),
        )
        .join('');
      return `<h2>${esc(q.title)}</h2>${q.blurb ? `<div class="muted small">${esc(q.blurb)}</div>` : ''}<div class="chiprow">${rows}</div>`;
    })
    .join('');

  const strengths = STRENGTH_LADDER.map(
    (w) =>
      `<button data-act="pick-strength" data-w="${w}" class="${S.pickStrength === w ? 'selected' : ''}">${STRENGTH_LABEL[w]}</button>`,
  ).join('');

  const ready = S.pickOutcome !== null && S.pickStrength !== null;

  host.innerHTML = `<div class="door">
    ${draftBanner()}
    <h1>${esc(S.map.title)}</h1>
    <p class="muted">Start where you actually are: pick the statement closest to what you currently think.</p>
    ${claims}
    <h2>How strongly do you hold it?</h2>
    <div class="chiprow">${strengths}</div>
    <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="primary" data-act="arrive" ${ready ? '' : 'disabled'}>Set it aside — we’ll come back to this</button>
      <button class="ghostbtn" data-act="skip-arrival">None of these fits — walk the map without a stated claim</button>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

function startSession(arrival: Arrival | null): void {
  S.session = createSession(S.map, 'mirror', arrival);
  S.log = [];
  sync();
}

function resetToDoor(map: BeliefMap): void {
  const mapChanged = map.slug !== S.map.slug;
  S.map = map;
  S.session = null;
  S.log = [];
  S.pickOutcome = null;
  S.pickClaim = null;
  S.pickStrength = null;
  lastResult = null;
  if (mapChanged) {
    buildGraph(S.map);
    homeLayout(S.map);
    buildScene(S.map);
  }
  retarget();
  renderHeader();
  document.getElementById('panel')!.innerHTML = '';
  renderBanner();
  renderRail();
  renderArrival();
}

// ---------------------------------------------------------------------------
// Event wiring — one delegated listener; every act maps to a move (or the door)
// ---------------------------------------------------------------------------

// Chips and crumbs are spans wearing role="button" — Enter/Space activates them.
document.body.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  const elx = (ev.target as HTMLElement).closest<HTMLElement>('[data-act][role="button"]');
  if (!elx) return;
  ev.preventDefault();
  elx.click();
});

document.body.addEventListener('click', (ev) => {
  const elx = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!elx || elx.hasAttribute('disabled')) return;
  const act = elx.dataset['act']!;

  switch (act) {
    case 'pick-map':
      resetToDoor(MAPS.find((m) => m.slug === elx.dataset['slug']) ?? S.map);
      break;
    case 'pick-claim':
      S.pickOutcome = elx.dataset['outcome']!;
      S.pickClaim = elx.dataset['claim']!;
      renderArrival();
      break;
    case 'pick-strength':
      S.pickStrength = elx.dataset['w'] as StrengthWord;
      renderArrival();
      break;
    case 'arrive':
      if (S.pickOutcome && S.pickClaim && S.pickStrength) {
        startSession({ claim: S.pickClaim, outcome: S.pickOutcome, strength: S.pickStrength });
      }
      break;
    case 'skip-arrival':
      startSession(null);
      break;
    case 'unpack': {
      const target: FocusTarget = { kind: elx.dataset['kind'] as FocusTarget['kind'], id: elx.dataset['id']! };
      if (S.session?.focus === null) dispatch({ type: 'focus', target });
      else if (sameTarget(S.session?.focus ?? null, target)) break;
      else dispatch({ type: 'push', target, reason: 'unpack' });
      break;
    }
    case 'rail-focus': {
      // Rail navigation wanders (plain focus) — it never makes a promise (§10.3).
      const target: FocusTarget = {
        kind: (elx.dataset['kind'] as FocusTarget['kind']) ?? 'position',
        id: elx.dataset['id']!,
      };
      if (!sameTarget(S.session?.focus ?? null, target)) dispatch({ type: 'focus', target });
      break;
    }
    case 'answer': {
      const pid = elx.dataset['id']!;
      const opt = elx.dataset['opt']!;
      const current = workspace().answers[pid];
      dispatch({ type: 'answer', position: pid, option: current === opt ? null : opt });
      break;
    }
    case 'stance': {
      const fid = elx.dataset['id']!;
      const st = elx.dataset['stance'] as FactStance;
      const current = workspace().stances[fid];
      dispatch({ type: 'stance', fact: fid, stance: current === st ? null : st });
      break;
    }
    case 'react': {
      const focus = S.session?.focus;
      if (focus) dispatch({ type: 'react', target: focus, reaction: elx.dataset['r'] as Reaction });
      break;
    }
    case 'offer': {
      const offer = currentOffers[Number(elx.dataset['i'])];
      if (offer) dispatch(offer.move);
      break;
    }
    case 'pop':
      dispatch({ type: 'pop' });
      break;
    case 'pop-to': {
      // Pop everything above the clicked promise, then land on it.
      const i = Number(elx.dataset['i']);
      while (S.session && S.session.stack.length > i + 1) dispatch({ type: 'pop' });
      dispatch({ type: 'pop' });
      break;
    }
    case 'zoom-out':
      dispatch({ type: 'focus', target: null });
      break;
    case 'commit':
      dispatch({ type: 'commit' });
      // The relight is a visual event (§4.1): step back to the whole scene —
      // unless promises are open; abandoning them is the user's call, not ours.
      if (S.session && S.session.stack.length === 0 && S.session.focus !== null) {
        dispatch({ type: 'focus', target: null });
      }
      break;
    case 'mode':
      dispatch({ type: 'mode-switch', mode: elx.dataset['mode'] as 'peruse' | 'mirror' });
      break;
    case 'start-over':
      resetToDoor(S.map);
      break;
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

buildGraph(S.map);
homeLayout(S.map);
buildScene(S.map);
retarget();
renderHeader();
renderArrival();
tick();
