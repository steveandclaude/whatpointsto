/**
 * SPIKE — throwaway. Validates the focus-graph feel:
 *   peruse (whole constellation) → focus (one node centered, neighbors ringed,
 *   everything else recedes) → unpack (digression pushes a frame; the origin
 *   keeps a smaller pinned presence + tether) → return (pop with a carryback
 *   strip: what changed while you were away).
 *
 * Deliberately NOT built on a session engine — moves are hardcoded, derived
 * from the schema's edges/rules/triggers. Findings feed the Focus-Engine
 * design doc; this file is expected to be deleted.
 *
 * Seal discipline holds even here: nothing in the scene encodes credence —
 * structure, provenance, liveness only.
 */
import type { FactNode, OutcomeNode, PositionNode } from '../src/schema.js';
import { reduce } from '../src/reducer.js';
import { uapMap } from '../content/uap.js';

// ---------------------------------------------------------------------------
// Short scene labels (spike-only hardcode — finding: schema wants shortLabel)
// ---------------------------------------------------------------------------

const SHORT: Record<string, string> = {
  B1: 'eyewitness kinematics', B2: 'radar: measurement?', B3: 'unexplained = anomalous?',
  B4: 'secrecy leakproofness', B5: 'insider testimony', B6: 'conflicted investigator',
  B7: 'new-physics cost', B8: 'ET here-now prior', B9: 'debunking precedent', B10: 'falsifiability bar',
  F1: 'most cases resolve', F2: 'Grusch: secondhand', F3: 'firsthand? contested',
  F4: 'AARO conflicted', F5: 'the pivot', F6: 'residue exists', F7: 'the correction',
  F8: 'bridge to radar', F9: 'no logged tracks', F10: 'radar residue contested',
  F11: 'ETH conjunction cost', F12: 'near-unfalsifiable', F13: 'debunking precedent',
};

// ---------------------------------------------------------------------------
// Graph model derived from the map
// ---------------------------------------------------------------------------

type Kind = 'outcome' | 'position' | 'fact';

interface GNode {
  id: string;
  kind: Kind;
  short: string;
  standard: boolean;
  x: number; y: number; s: number; o: number;      // current
  tx: number; ty: number; ts: number; to: number;  // targets
  g: SVGGElement;
  nameEl: SVGTextElement;
}

interface GEdge {
  a: string; b: string;
  kind: 'influence' | 'contested' | 'evidence';
  el: SVGPathElement;
  o: number; to: number;
}

const nodes = new Map<string, GNode>();
const edges: GEdge[] = [];
const adj = new Map<string, Set<string>>();

function link(a: string, b: string, kind: GEdge['kind']): void {
  const key = [a, b].sort().join('>') ;
  const existing = edges.find((e) => [e.a, e.b].sort().join('>') === key);
  if (existing) {
    if (kind === 'contested') existing.kind = 'contested';
    return;
  }
  edges.push({ a, b, kind, el: undefined as unknown as SVGPathElement, o: 0.14, to: 0.14 });
  (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
  (adj.get(b) ?? adj.set(b, new Set()).get(b)!).add(a);
}

function buildGraph(): void {
  for (const e of uapMap.edges) {
    const targets = e.contested
      ? e.contested.readings.flatMap((r) => Object.keys(r.effects))
      : Object.keys(e.effects);
    const src = 'fact' in e.from ? e.from.fact : e.from.position;
    for (const t of targets) link(src, t, e.contested ? 'contested' : 'influence');
  }
  for (const r of uapMap.rules) {
    const targets = [...Object.keys(r.effects ?? {}), ...Object.keys(r.redirect?.calibrated ?? {})];
    for (const c of r.when) for (const t of targets) link(c.position, t, 'influence');
  }
  for (const p of uapMap.positions)
    for (const opt of p.options)
      for (const f of opt.triggersFacts ?? []) link(p.id, f, 'evidence');
  for (const f of uapMap.facts)
    for (const b of f.bearsOn ?? []) link(f.id, b, 'evidence');
}

// ---------------------------------------------------------------------------
// Layouts (deterministic; stable geography is the point)
// ---------------------------------------------------------------------------

const W = 1400, H = 920;

function peruseLayout(): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const qI = uapMap.outcomes.filter((o) => o.question === 'I');
  const qII = uapMap.outcomes.filter((o) => o.question === 'II');
  qI.forEach((o, i) => pos.set(o.id, { x: 110 + i * 92, y: 120 + (i - 3) ** 2 * 7 }));
  qII.forEach((o, i) => pos.set(o.id, { x: 830 + i * 112, y: 115 + (i - 2) ** 2 * 9 }));

  const spots: Record<string, { x: number; y: number }> = {
    B1: { x: 250, y: 430 }, B2: { x: 250, y: 585 }, B7: { x: 430, y: 430 }, B8: { x: 430, y: 585 },
    B3: { x: 700, y: 340 }, B4: { x: 700, y: 455 }, B6: { x: 700, y: 570 }, B9: { x: 700, y: 685 },
    B10: { x: 860, y: 640 }, B5: { x: 1060, y: 490 },
  };
  for (const [id, p] of Object.entries(spots)) pos.set(id, p);

  // Facts: pulled toward the positions they connect to, then spread evenly.
  const desired = uapMap.facts.map((f) => {
    const near = [...(adj.get(f.id) ?? [])]
      .map((n) => pos.get(n))
      .filter((p): p is { x: number; y: number } => p !== undefined && p.y > 300);
    const x = near.length ? near.reduce((s, p) => s + p.x, 0) / near.length : 170;
    return { id: f.id, x };
  });
  desired.sort((a, b) => a.x - b.x);
  desired.forEach((d, i) => pos.set(d.id, { x: 130 + i * (1140 / 12), y: i % 2 === 0 ? 800 : 866 }));
  return pos;
}

const HOME = new Map<string, { x: number; y: number }>();

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface Snap { answers: Record<string, string>; live: string[] }

const state = {
  focus: null as string | null,
  stack: [] as { id: string; snap: Snap }[],
  answers: {} as Record<string, string>,
  reactions: {} as Record<string, string>,
  carryback: null as string | null,
  log: [] as string[],
};

const liveFacts = (): string[] => reduce(uapMap, state.answers).activeFacts;
const snapshot = (): Snap => ({ answers: { ...state.answers }, live: liveFacts() });

function logMove(s: string): void {
  state.log.push(s);
  if (state.log.length > 10) state.log.shift();
}

// ---------------------------------------------------------------------------
// Scene construction
// ---------------------------------------------------------------------------

const scene = document.getElementById('scene')!;
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
scene.appendChild(svg);

const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
bg.setAttribute('width', String(W));
bg.setAttribute('height', String(H));
bg.setAttribute('fill', 'transparent');
svg.appendChild(bg);

const edgeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
const tetherLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
const nodeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
const captionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
svg.append(edgeLayer, tetherLayer, nodeLayer, captionLayer);

function wrap(text: string): string[] {
  if (text.length <= 15) return [text];
  const mid = Math.floor(text.length / 2);
  let cut = text.lastIndexOf(' ', mid);
  if (cut < 4) cut = text.indexOf(' ', mid);
  if (cut === -1) return [text];
  return [text.slice(0, cut), text.slice(cut + 1)];
}

function makeNode(id: string, kind: Kind, short: string, standard = false): void {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `node ${kind}${standard ? ' standard' : ''}`);

  let shape: SVGElement;
  if (kind === 'outcome') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shape.setAttribute('r', '26');
  } else if (kind === 'position') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shape.setAttribute('x', '-24'); shape.setAttribute('y', '-24');
    shape.setAttribute('width', '48'); shape.setAttribute('height', '48');
    shape.setAttribute('rx', '12');
  } else {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', 'M0,-20 L20,0 L0,20 L-20,0 Z');
  }
  shape.setAttribute('class', 'shape');
  g.appendChild(shape);

  const idl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  idl.setAttribute('class', 'idlabel');
  idl.setAttribute('text-anchor', 'middle');
  idl.setAttribute('dy', '5');
  idl.textContent = id;
  g.appendChild(idl);

  const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  name.setAttribute('class', 'name');
  name.setAttribute('text-anchor', 'middle');
  const lines = wrap(short);
  lines.forEach((ln, i) => {
    const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    ts.setAttribute('x', '0');
    ts.setAttribute('y', String(44 + i * 14));
    ts.textContent = ln;
    name.appendChild(ts);
  });
  g.appendChild(name);

  g.addEventListener('click', (ev) => {
    ev.stopPropagation();
    focusNode(id, 'wander');
  });

  nodeLayer.appendChild(g);
  const home = HOME.get(id)!;
  nodes.set(id, {
    id, kind, short, standard,
    x: home.x, y: home.y, s: 1, o: 1,
    tx: home.x, ty: home.y, ts: 1, to: 1,
    g, nameEl: name,
  });
}

function buildScene(): void {
  for (const e of edges) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', `edge ${e.kind}`);
    p.setAttribute('stroke-width', '1.4');
    e.el = p;
    edgeLayer.appendChild(p);
  }
  for (const o of uapMap.outcomes) makeNode(o.id, 'outcome', o.name.length > 22 ? o.name.slice(0, 21) + '…' : o.name);
  for (const p of uapMap.positions) makeNode(p.id, 'position', SHORT[p.id] ?? p.id, p.kind === 'epistemic-standard');
  for (const f of uapMap.facts) makeNode(f.id, 'fact', SHORT[f.id] ?? f.id);
}

// ---------------------------------------------------------------------------
// Layout targeting (the camera)
// ---------------------------------------------------------------------------

const FOCUS_PT = { x: 620, y: 440 };

/** How a neighbor relates to the focus, in words a user can hold. */
type Relation = 'rests-on' | 'feeds' | 'evidence' | 'speaks-to';

function relationOf(focusKind: Kind, neighborKind: Kind): Relation {
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

/** Angle bands (degrees; -90 = straight up): feeds above, foundations below, evidence to the left. */
const RELATION_BAND: Record<Relation, [number, number]> = {
  feeds: [-150, -30],
  'rests-on': [30, 150],
  'speaks-to': [30, 150],
  evidence: [162, 252],
};

function caption(text: string, x: number, y: number): void {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', String(x));
  t.setAttribute('y', String(y));
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('fill', '#8d99b8');
  t.setAttribute('font-size', '15');
  t.setAttribute('letter-spacing', '3');
  t.textContent = text;
  captionLayer.appendChild(t);
}

function retarget(): void {
  const live = new Set(liveFacts());
  const stackIds = state.stack.map((f) => f.id);
  captionLayer.replaceChildren();

  if (state.focus === null) {
    for (const n of nodes.values()) {
      const home = HOME.get(n.id)!;
      n.tx = home.x; n.ty = home.y; n.ts = 1;
      n.to = n.kind === 'fact' && !live.has(n.id) ? 0.45 : 1;
    }
    for (const e of edges) e.to = e.kind === 'evidence' ? 0.06 : e.kind === 'contested' ? 0.3 : 0.14;
  } else {
    const fid = state.focus;
    const focusKind = nodes.get(fid)!.kind;
    const neighbors = [...(adj.get(fid) ?? [])].filter((n) => !stackIds.includes(n) && n !== fid);

    // Group neighbors by their relation to the focus; place each group in its band.
    const groups = new Map<Relation, string[]>();
    for (const nid of neighbors) {
      const rel = relationOf(focusKind, nodes.get(nid)!.kind);
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
      const si = stackIds.indexOf(n.id);
      const p = placed.get(n.id);
      if (n.id === fid) {
        n.tx = FOCUS_PT.x; n.ty = FOCUS_PT.y; n.ts = 2.3; n.to = 1;
      } else if (si >= 0) {
        n.tx = 130; n.ty = 120 + si * 100; n.ts = 0.8; n.to = 0.95;
      } else if (p) {
        n.tx = p.x; n.ty = p.y; n.ts = 1.1; n.to = 1;
      } else {
        n.tx = home.x * 0.92 + FOCUS_PT.x * 0.08;
        n.ty = home.y * 0.92 + FOCUS_PT.y * 0.08;
        n.ts = 0.5; n.to = 0.1;
      }
    }
    for (const e of edges) {
      const touchesFocus = e.a === fid || e.b === fid;
      const touchesStack = stackIds.includes(e.a) || stackIds.includes(e.b);
      e.to = touchesFocus ? (e.kind === 'contested' ? 0.85 : 0.6) : touchesStack ? 0.2 : 0.04;
    }
  }

  for (const n of nodes.values()) {
    n.g.classList.toggle('live', n.kind === 'fact' && live.has(n.id));
    n.g.classList.toggle('answered', n.kind === 'position' && n.id in state.answers);
    n.g.classList.toggle('focus-ring', n.id === state.focus);
  }

  tetherLayer.replaceChildren();
  const chain = [...stackIds, state.focus].filter((x): x is string => x !== null);
  for (let i = 0; i + 1 < chain.length; i++) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    t.setAttribute('class', 'tether');
    t.dataset['a'] = chain[i]!;
    t.dataset['b'] = chain[i + 1]!;
    tetherLayer.appendChild(t);
  }
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------

function tick(): void {
  const k = 0.16;
  for (const n of nodes.values()) {
    n.x += (n.tx - n.x) * k; n.y += (n.ty - n.y) * k;
    n.s += (n.ts - n.s) * k; n.o += (n.to - n.o) * k;
    n.g.setAttribute('transform', `translate(${n.x},${n.y}) scale(${n.s})`);
    n.g.setAttribute('opacity', n.o.toFixed(3));
    n.nameEl.setAttribute('opacity', n.o < 0.35 ? '0' : '1');
  }
  for (const e of edges) {
    const a = nodes.get(e.a)!, b = nodes.get(e.b)!;
    e.o += (e.to - e.o) * k;
    e.el.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y}`);
    e.el.setAttribute('opacity', e.o.toFixed(3));
  }
  for (const t of tetherLayer.children) {
    const a = nodes.get((t as SVGPathElement).dataset['a']!)!;
    const b = nodes.get((t as SVGPathElement).dataset['b']!)!;
    t.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y}`);
  }
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Moves
// ---------------------------------------------------------------------------

function focusNode(id: string, how: 'wander' | 'unpack'): void {
  if (state.focus === id) return;
  if (how === 'unpack' && state.focus !== null) {
    state.stack.push({ id: state.focus, snap: snapshot() });
    logMove(`unpacked ${id} — return to ${state.focus} promised`);
  } else {
    logMove(`focused ${id}`);
  }
  state.focus = id;
  state.carryback = null;
  retarget();
  renderPanel();
}

function popBack(): void {
  const frame = state.stack.pop();
  if (!frame) return;
  const nowLive = liveFacts();
  const newAnswers = Object.entries(state.answers)
    .filter(([p, o]) => frame.snap.answers[p] !== o)
    .map(([p, o]) => {
      const pos = uapMap.positions.find((x) => x.id === p)!;
      return `you took a position — “${pos.options.find((x) => x.id === o)?.label ?? o}”`;
    });
  const newLive = nowLive.filter((f) => !frame.snap.live.includes(f));
  const parts = [
    ...newAnswers,
    ...(newLive.length ? [`new evidence is live: ${newLive.map((f) => humanLabel(f, 42)).join(' · ')}`] : []),
  ];
  state.carryback = parts.length ? parts.join(' · ') : 'nothing changed while you were away';
  state.focus = frame.id;
  logMove(`returned to ${frame.id}`);
  retarget();
  renderPanel();
}

function peruse(): void {
  if (state.stack.length) logMove('zoomed out — stack cleared');
  state.focus = null;
  state.stack = [];
  state.carryback = null;
  retarget();
  renderPanel();
}

bg.addEventListener('click', peruse);

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const panel = document.getElementById('panel')!;

function esc(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

/** Full human phrasing for a node — no ids, no shorthand (spike feedback #1). */
function humanLabel(id: string, max = 80): string {
  const n = nodes.get(id)!;
  if (n.kind === 'outcome') return uapMap.outcomes.find((o) => o.id === id)!.name;
  if (n.kind === 'position') return trunc(uapMap.positions.find((p) => p.id === id)!.prompt, max);
  return trunc(uapMap.facts.find((f) => f.id === id)!.text, max);
}

/** The plain-language story of the connection between two nodes (edge whyCopy). */
function edgeWhy(a: string, b: string): string {
  const stories: string[] = [];
  for (const e of uapMap.edges) {
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

function chip(id: string, act: string, label?: string): string {
  const n = nodes.get(id)!;
  const kindClass = n.standard ? 'kind-standard' : `kind-${n.kind}`;
  const why = state.focus ? edgeWhy(state.focus, id) : '';
  return `<span class="chip ${kindClass}" data-act="${act}" data-id="${esc(id)}"${why ? ` title="${esc(why)}"` : ''}>${esc(label ?? humanLabel(id))}</span>`;
}

function crumbs(): string {
  if (!state.stack.length) return '';
  return `<div class="crumbs">${state.stack
    .map((f, i) => `<span class="crumb" data-act="pop-to" data-i="${i}">⏎ we’ll come back to: ${esc(humanLabel(f.id, 60))}</span>`)
    .join('')}</div>`;
}

function toolbar(): string {
  return `<div class="toolbar">
    ${state.stack.length ? `<button data-act="pop">◀ return (${state.stack.length})</button>` : ''}
    <button data-act="peruse">zoom out</button>
  </div>`;
}

function carrybackStrip(): string {
  return state.carryback
    ? `<div class="carryback">While you were away: ${esc(state.carryback)}</div>`
    : '';
}

function gatingPositions(oid: string): string[] {
  return [...(adj.get(oid) ?? [])].filter((n) => nodes.get(n)!.kind === 'position');
}

/**
 * The ASSUMPTION FACE (spike feedback #4): for an outcome, each gating position
 * renders as the proposition that would have to be true — the option whose
 * edges/rules push this outcome up — not as the elicitation question.
 * Rule-mediated gates whose conditions only hurt the outcome render as a
 * range: "anything but <the damaging option>".
 */
function neededAssumption(oid: string, pid: string): { text: string; needsOption: string | null } {
  const p = uapMap.positions.find((x) => x.id === pid)!;
  const score = new Map<string, number>();
  for (const e of uapMap.edges) {
    if ('position' in e.from && e.from.position === pid && !e.contested) {
      const eff = e.effects[oid] ?? 0;
      if (eff !== 0) score.set(e.from.option, (score.get(e.from.option) ?? 0) + eff);
    }
  }
  for (const r of uapMap.rules) {
    const eff = (r.effects?.[oid] ?? 0) + (r.redirect?.calibrated[oid] ?? 0);
    const cond = r.when.find((c) => c.position === pid);
    if (cond && eff !== 0) score.set(cond.option, (score.get(cond.option) ?? 0) + eff);
  }
  if (score.size === 0) return { text: trunc(p.prompt, 80), needsOption: null };
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const best = ranked[0]!;
  if (best[1] > 0) {
    return { text: p.options.find((o) => o.id === best[0])!.label, needsOption: best[0] };
  }
  // Everything scored hurts this outcome — it needs the damaging option avoided.
  const damaging = ranked[ranked.length - 1]!;
  const others = p.options.filter((o) => o.id !== damaging[0]);
  return {
    text: others.length === 1 ? others[0]!.label : `anything but: ${p.options.find((o) => o.id === damaging[0])!.label}`,
    needsOption: others.length === 1 ? others[0]!.id : null,
  };
}

function panelForOutcome(o: OutcomeNode): string {
  const gates = gatingPositions(o.id);
  const facts = [...(adj.get(o.id) ?? [])].filter((n) => nodes.get(n)!.kind === 'fact');
  const rows = gates
    .map((g) => {
      const need = neededAssumption(o.id, g);
      const held = state.answers[g];
      let status = '';
      if (held !== undefined && need.needsOption !== null) {
        if (held === need.needsOption) {
          status = `<div class="muted" style="color:#7dffb0">✓ you grant this</div>`;
        } else {
          const heldLabel = uapMap.positions.find((x) => x.id === g)!.options.find((x) => x.id === held)!.label;
          status = `<div class="muted" style="color:#ff9f9f">✗ you currently hold: ${esc(heldLabel)}</div>`;
        }
      }
      return `${chip(g, 'unpack', need.text)}${status}`;
    })
    .join('');
  return `
    <span class="badge">outcome · asks ${'●'.repeat(o.assumptionCost)}${'○'.repeat(5 - o.assumptionCost)}</span>
    <h2>${esc(o.name)}</h2>
    ${o.blurb ? `<div class="muted">${esc(o.blurb)}</div>` : ''}
    <h3>What would have to be true — unpack one</h3>
    ${rows}
    ${facts.length ? `<h3>Evidence touching this</h3>${facts.map((f) => chip(f, 'unpack')).join('')}` : ''}
    <h3>Ways people say this</h3>
    <div class="muted">${o.claims.map(esc).join(' · ')}</div>`;
}

function panelForPosition(p: PositionNode): string {
  const chosen = state.answers[p.id];
  const feeds = [...(adj.get(p.id) ?? [])].filter((n) => nodes.get(n)!.kind === 'outcome');
  const facts = [...(adj.get(p.id) ?? [])].filter((n) => nodes.get(n)!.kind === 'fact');
  return `
    <span class="badge">${p.kind === 'epistemic-standard' ? `standard · ${esc(p.kind === 'epistemic-standard' ? p.standardId : '')}` : p.kind}</span>
    <h2>${esc(p.prompt)}</h2>
    <h3>Take a position</h3>
    ${p.options
      .map(
        (opt) =>
          `<span class="chip ${chosen === opt.id ? 'selected' : ''}" data-act="answer" data-id="${esc(p.id)}" data-opt="${esc(opt.id)}">${esc(opt.label)}</span>`,
      )
      .join('')}
    ${facts.length ? `<h3>Evidence that speaks to this</h3>${facts.map((f) => chip(f, 'unpack')).join('')}` : ''}
    <h3>Where this points</h3>
    ${feeds.map((f) => chip(f, 'unpack')).join('')}`;
}

function panelForFact(f: FactNode): string {
  const reaction = state.reactions[f.id];
  const rbtn = (r: string, label: string) =>
    `<span class="chip ${reaction === r ? 'selected' : ''}" data-act="react" data-id="${esc(f.id)}" data-r="${r}">${label}</span>`;
  const routing =
    reaction === 'dispute' && f.bearsOn?.length
      ? `<div class="carryback">That dispute is itself an assumption this map knows about — ${f.bearsOn
          .map((b) => chip(b, 'unpack', `take a position on ${b}`))
          .join(' ')}</div>`
      : '';
  return `
    <span class="badge">evidence · ${f.strength.toLowerCase()} · ${esc(f.provenance)}</span>
    <h2 style="font-size:0.95rem; font-weight:500;">${esc(f.text)}</h2>
    <div class="muted">${f.sources.map((s) => esc(s.authority)).join(' · ')}</div>
    <h3>Your reaction</h3>
    ${rbtn('accept', 'makes sense')} ${rbtn('dispute', 'I dispute this')} ${rbtn('more', 'tell me more')}
    ${reaction === 'more' ? `<div class="carryback">In the real build the LLM drafts an expansion here — a typed, linted artifact.</div>` : ''}
    ${routing}`;
}

function renderPanel(): void {
  let body: string;
  if (state.focus === null) {
    body = `
      <h2>Peruse mode</h2>
      <div class="muted">This is the whole map as a place. Shapes: <br>
        <div class="legend">
          <span><span class="dot" style="background:var(--outcome)"></span>outcome (circle)</span>
          <span><span class="dot" style="background:var(--position)"></span>belief fork (square)</span>
          <span><span class="dot" style="background:var(--standard)"></span>epistemic standard</span>
          <span><span class="dot" style="background:var(--fact)"></span>evidence (diamond)</span>
        </div>
        Glowing diamonds are evidence live in your traversal. Green-ringed squares are forks you’ve answered.
        Click any node to focus it. Nothing here encodes credence — the seal holds until commit.
      </div>`;
  } else {
    const n = nodes.get(state.focus)!;
    const inner =
      n.kind === 'outcome'
        ? panelForOutcome(uapMap.outcomes.find((o) => o.id === n.id)!)
        : n.kind === 'position'
          ? panelForPosition(uapMap.positions.find((p) => p.id === n.id)!)
          : panelForFact(uapMap.facts.find((f) => f.id === n.id)!);
    body = `${crumbs()}${toolbar()}${carrybackStrip()}${inner}`;
  }
  panel.innerHTML = `${body}
    <div id="log"><h3>Move log (the session, eventually)</h3>${state.log
      .slice()
      .reverse()
      .map((l) => `<div>· ${esc(l)}</div>`)
      .join('')}</div>`;
}

panel.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el) return;
  const act = el.dataset['act']!;
  const id = el.dataset['id'] ?? '';
  if (act === 'unpack') focusNode(id, 'unpack');
  else if (act === 'answer') {
    const opt = el.dataset['opt']!;
    if (state.answers[id] === opt) delete state.answers[id];
    else state.answers[id] = opt;
    logMove(`${id} = ${state.answers[id] ?? '(cleared)'}`);
    retarget();
    renderPanel();
  } else if (act === 'react') {
    state.reactions[id] = el.dataset['r']!;
    logMove(`reaction on ${id}: ${el.dataset['r']}`);
    renderPanel();
  } else if (act === 'pop') popBack();
  else if (act === 'pop-to') {
    // Pop everything above the clicked crumb, then land on it.
    const i = Number(el.dataset['i']);
    while (state.stack.length > i + 1) state.stack.pop();
    popBack();
  } else if (act === 'peruse') peruse();
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

buildGraph();
for (const [id, p] of peruseLayout()) HOME.set(id, p);
buildScene();
retarget();
renderPanel();
tick();
