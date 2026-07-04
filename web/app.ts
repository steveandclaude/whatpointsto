/**
 * First renderer — a layered, menu-like surface over the pure reducer.
 *
 * Design constraints carried in from docs/Platform-Design-2026-07.md:
 * - §2.5: menu surface. No open channel; every content string the user reads
 *   comes from a typed field on the map (prompt, label, whyCopy, lessonCopy,
 *   tension.copy, blurb, claims). Chrome copy below is renderer furniture.
 * - §5 the seal: arrival (claim, strength) is captured first and visibly set
 *   aside; elicitation runs with NO credence display; bars exist only after
 *   the user commits.
 * - §2.6 / hybrid mechanic: bars and strength words only — no numerals reach
 *   the user's face anywhere in this file.
 * - §2.3: draft-tier maps (all model-drafted) get an unmistakable register;
 *   an empty fact family renders as "unresearched", never as blank space.
 * - R3 ghost-vs-solid: redirect rules show the reflex update as a ghost next
 *   to the calibrated one that moved.
 */
import type {
  BeliefMap,
  FactNode,
  OutcomeId,
  OutcomeNode,
  PositionNode,
  StrengthWord,
} from '../src/schema.js';
import { reduce, counterfactual, confidenceGap, sensitivity } from '../src/reducer.js';
import type { ReduceResult } from '../src/reducer.js';
import { uapMap } from '../content/uap.js';
import { singularityMap } from '../content/singularity.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const MAPS: BeliefMap[] = [uapMap, singularityMap];

type Phase = 'arrival' | 'elicit' | 'payoff';

interface Arrival {
  outcomeId: OutcomeId;
  claim: string;
}

const state = {
  map: MAPS[0]!,
  phase: 'arrival' as Phase,
  arrival: null as Arrival | null,
  strength: null as StrengthWord | null,
  skipped: false,
  answers: {} as Record<string, string>,
  openOutcome: null as OutcomeId | null,
  whatIf: null as { position: string; option: string } | null,
};

const STRENGTH_LABEL: Record<StrengthWord, string> = {
  lean: 'I lean this way',
  think: 'I think so',
  confident: 'I’m confident',
  certain: 'I’m certain',
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

function isDraft(map: BeliefMap): boolean {
  const nodes = [...map.positions, ...map.facts, ...map.outcomes];
  return nodes.every((n) => n.provenance === 'model-drafted');
}

function kindBadge(p: PositionNode): string {
  if (p.kind === 'epistemic-standard') return '<span class="badge standard">standard</span>';
  if (p.kind === 'value') return '<span class="badge value">value</span>';
  return '<span class="badge">belief</span>';
}

function provBadge(prov: string): string {
  return `<span class="badge prov-${prov}">${esc(prov)}</span>`;
}

function costDots(cost: number): string {
  return `<span class="cost" title="assumption cost — how much new must be true for this to hold">asks ${'●'.repeat(cost)}${'○'.repeat(5 - cost)}</span>`;
}

function truncate(s: string, n = 72): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function outcomeById(id: OutcomeId): OutcomeNode {
  return state.map.outcomes.find((o) => o.id === id)!;
}

function draftBanner(): string {
  if (!isDraft(state.map)) return '';
  return `<div class="draftwrap"><span class="stamp">DRAFT</span>
    Model-drafted scaffold. No research pass has run and no human has reviewed a word of it —
    treat every fork and landing below as a sketch of what a checked map would ask.</div>`;
}

function sealChip(): string {
  if (state.phase === 'payoff' && state.arrival) {
    return `<div class="seal open">🔓 Unsealed — you arrived saying “${esc(state.arrival.claim)}”, held at “${STRENGTH_LABEL[state.strength!]}”.</div>`;
  }
  if (state.arrival) {
    return `<div class="seal">🔒 Your stated view is sealed. We’ll come back to it after your assumptions have spoken.</div>`;
  }
  if (state.skipped) {
    return `<div class="seal">You’re walking the map without a stated claim — the payoff will show where your assumptions land.</div>`;
  }
  return '';
}

function factCard(f: FactNode): string {
  const bears = f.bearsOn?.length
    ? `<div class="small muted">speaks to ${f.bearsOn.map(esc).join(', ')}</div>`
    : '';
  const sources = f.sources.length
    ? `<div class="sources">${f.sources
        .map((s) => `<code${s.citation ? ` title="${esc(s.citation)}"` : ''}>${esc(s.authority)}</code>`)
        .join('')}</div>`
    : '';
  return `<div class="card factcard ${f.strength}">
    <span class="badge strength">${f.strength.toLowerCase()}</span> ${provBadge(f.provenance)}
    <span class="idchip">${esc(f.id)}</span>
    <div style="margin-top:6px">${esc(f.text)}</div>
    ${bears}${sources}
  </div>`;
}

function unresearchedPanel(): string {
  return `<div class="unresearched"><b>Unresearched.</b> This map has no checked evidence yet —
    every fork you see is scaffold. A research pass would fill this layer with strength-tagged,
    sourced facts.</div>`;
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function arrivalView(): string {
  const claims = state.map.questions
    .map((q) => {
      const rows = state.map.outcomes
        .filter((o) => o.question === q.id)
        .flatMap((o) =>
          o.claims.map((c, i) => {
            const sel = state.arrival?.outcomeId === o.id && state.arrival?.claim === c;
            return `<button data-act="pick-claim" data-a="${esc(o.id)}" data-b="${i}"
              class="${sel ? 'selected' : ''}">${esc(c)}</button>`;
          }),
        )
        .join('');
      return `<h2>${esc(q.title)}</h2>${q.blurb ? `<div class="muted small">${esc(q.blurb)}</div>` : ''}<div class="chiprow">${rows}</div>`;
    })
    .join('');

  const strengths = (Object.keys(STRENGTH_LABEL) as StrengthWord[])
    .map(
      (w) =>
        `<button data-act="pick-strength" data-a="${w}" class="${state.strength === w ? 'selected' : ''}">${STRENGTH_LABEL[w]}</button>`,
    )
    .join('');

  const ready = state.arrival !== null && state.strength !== null;

  return `
    ${draftBanner()}
    <h1>${esc(state.map.title)}</h1>
    <p class="muted">Start where you actually are: pick the statement closest to what you currently think.</p>
    ${claims}
    <h2>How strongly do you hold it?</h2>
    <div class="chiprow">${strengths}</div>
    <div style="margin-top:22px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="primary" data-act="seal" ${ready ? '' : 'disabled'}>Seal it — we’ll come back to this</button>
      <button class="ghostbtn" data-act="skip">None of these fits — walk the map without a stated claim</button>
    </div>`;
}

function elicitView(): string {
  const live = reduce(state.map, state.answers);

  const positions = state.map.positions
    .map((p) => {
      const chosen = state.answers[p.id];
      const opts = p.options
        .map(
          (o) =>
            `<button data-act="answer" data-a="${esc(p.id)}" data-b="${esc(o.id)}"
              class="${chosen === o.id ? 'selected' : ''}">${esc(o.label)}</button>`,
        )
        .join('');
      return `<div class="card">
        <span class="idchip">${esc(p.id)}</span> ${kindBadge(p)} ${provBadge(p.provenance)}
        <h3 style="margin-top:6px">${esc(p.prompt)}</h3>
        <div class="option-btns">${opts}</div>
      </div>`;
    })
    .join('');

  let evidence: string;
  if (state.map.facts.length === 0) {
    evidence = unresearchedPanel();
  } else {
    const active = state.map.facts.filter((f) => live.activeFacts.includes(f.id));
    evidence = active.length
      ? active.map(factCard).join('')
      : `<div class="card muted">Evidence appears here as your answers touch it.</div>`;
  }

  const outcomes = state.map.outcomes
    .map(
      (o) => `<div class="card">
        <span class="idchip">${esc(o.id)}</span> ${provBadge(o.provenance)}
        <h3 style="margin-top:6px">${esc(o.name)} ${costDots(o.assumptionCost)}</h3>
        ${o.blurb ? `<div class="muted small">${esc(o.blurb)}</div>` : ''}
      </div>`,
    )
    .join('');

  const answered = Object.keys(state.answers).length;
  const total = state.map.positions.length;

  return `
    ${draftBanner()}
    ${sealChip()}
    <div class="layers">
      <div class="layer">
        <div class="layerhead">Layer 1 — your assumptions</div>
        ${positions}
      </div>
      <div class="layer">
        <div class="layerhead">Layer 2 — evidence in your traversal</div>
        ${evidence}
        <div class="layerhead" style="margin-top:18px">Layer 3 — where it can land</div>
        <div class="locked">🔒 Credence stays sealed until you commit your answers.</div>
        ${outcomes}
      </div>
    </div>
    <div style="margin-top:18px; display:flex; gap:12px; align-items:center;">
      <button class="primary" data-act="commit">Commit answers &amp; unseal</button>
      <span class="muted small">${'●'.repeat(answered)}${'○'.repeat(total - answered)} answered — commit whenever you’re ready; untouched forks stay at default.</span>
    </div>`;
}

function movementList(result: ReduceResult, oid: OutcomeId): string {
  const moves = result.movements.filter((m) => m.outcome === oid);
  if (moves.length === 0) return `<div class="muted small">This sits at its starting prior.</div>`;
  return moves
    .map(
      (m) => `<div class="movement">
        <span class="dir ${m.delta > 0 ? 'up' : 'down'}">${m.delta > 0 ? '↑' : '↓'}</span>
        <span>${esc(m.whyCopy)}</span>
      </div>`,
    )
    .join('');
}

function payoffView(): string {
  const effective = state.whatIf
    ? { ...state.answers, [state.whatIf.position]: state.whatIf.option }
    : state.answers;
  const result = reduce(state.map, effective);

  // --- gaps ---
  let gaps = '';
  if (state.arrival && state.strength) {
    const arrivalOutcome = outcomeById(state.arrival.outcomeId);
    const q = arrivalOutcome.question;
    const cred = result.credences[q]!;
    const topId = Object.keys(cred).reduce((a, b) => (cred[a]! >= cred[b]! ? a : b));
    const top = outcomeById(topId);

    const direction =
      topId === state.arrival.outcomeId
        ? `Your assumptions land where you stand: <b>${esc(top.name)}</b>.`
        : `You arrived at “${esc(state.arrival.claim)}”. Your assumptions land on <b>${esc(top.name)}</b>.`;

    const gap = confidenceGap(result, state.arrival.outcomeId, state.strength);
    const supportedWord = gap.supported === 'unsupported' ? 'less than lean' : gap.supported;
    let confidence: string;
    if (gap.gapSteps > 0) {
      confidence = `Your answers support “${esc(arrivalOutcome.name)}” at about <b>${supportedWord}</b> — you hold it at <b>${gap.stated}</b>. The surplus is coming from somewhere this map doesn’t show.`;
    } else if (gap.gapSteps < 0) {
      confidence = `Your own answers commit you to more than you claim — they support <b>${supportedWord}</b>, and you say <b>${gap.stated}</b>. You believe this harder than you let on.`;
    } else {
      confidence = `Your held strength matches what your answers support: <b>${supportedWord}</b>.`;
    }

    gaps = `
      <div class="card gap"><h3>Direction</h3>${direction}</div>
      <div class="card gap"><h3>Confidence</h3>${confidence}</div>`;
  }

  // --- credence bars per question ---
  const questions = state.map.questions
    .map((q) => {
      const cred = result.credences[q.id];
      if (!cred) return '';
      const members = state.map.outcomes
        .filter((o) => o.question === q.id)
        .sort((a, b) => cred[b.id]! - cred[a.id]!);
      const topId = members[0]!.id;
      const bars = members
        .map((o) => {
          const open = state.openOutcome === o.id;
          const detail = open
            ? `<div class="card" style="margin-top:6px">
                ${o.blurb ? `<div class="muted small">${esc(o.blurb)}</div>` : ''}
                <div class="small" style="margin-top:6px"><b>Ways people say this:</b> ${o.claims.map(esc).join(' · ')}</div>
                <div style="margin-top:8px">${movementList(result, o.id)}</div>
              </div>`
            : '';
          return `<div class="obar ${o.id === topId ? 'top' : ''}">
            <div class="oname">
              <button class="linkish" data-act="open-outcome" data-a="${esc(o.id)}">${esc(o.name)}</button>
              ${costDots(o.assumptionCost)}
            </div>
            <div class="track"><div class="fill" style="width:${(cred[o.id]! * 100).toFixed(1)}%"></div></div>
            ${detail}
          </div>`;
        })
        .join('');
      return `<h2>${esc(q.title)}</h2>${bars}`;
    })
    .join('');

  // --- fired rules, ghost vs solid ---
  const rules = result.firedRules
    .map((r) => {
      const nameList = (effects: Record<string, number>) =>
        Object.entries(effects)
          .map(([oid, d]) => `<li>${esc(outcomeById(oid).name)} ${d > 0 ? '↑' : '↓'}</li>`)
          .join('');
      const redirect = r.naive
        ? `<div class="redirect">
            <div class="update ghost"><div class="uhead">The reflex update — a ghost, for comparison</div><ul>${nameList(r.naive)}</ul></div>
            <div class="update solid"><div class="uhead">The calibrated update — what moved</div><ul>${nameList(r.applied)}</ul></div>
          </div>`
        : '';
      return `<div class="card"><b>${esc(r.id)}</b> — ${esc(r.lessonCopy)}${redirect}</div>`;
    })
    .join('');

  // --- contested evidence ---
  const contested = result.contested
    .map(
      (c) => `<div class="card contested">
        ${esc(c.whyCopy)}
        <div class="readings">
          ${c.readings
            .map(
              (r) =>
                `<div class="reading"><b>${esc(r.label)}</b><div class="muted small">favors ${Object.keys(
                  r.effects,
                )
                  .map((oid) => esc(outcomeById(oid).name))
                  .join(', ')}</div></div>`,
            )
            .join('')}
        </div>
        <div class="muted small" style="margin-top:6px">Both readings stay on the table.</div>
      </div>`,
    )
    .join('');

  // --- tensions ---
  const tensions = result.tensions
    .map((t) => `<div class="card tension">${esc(t.copy)}</div>`)
    .join('');

  // --- sensitivity (computed on the committed answers, whatIf aside) ---
  const sens = sensitivity(state.map, state.answers);
  const maxShift = sens[0]?.shift ?? 0;
  const sensRows = sens
    .map((s) => {
      const p = state.map.positions.find((x) => x.id === s.position)!;
      const alt = p.options.find((o) => o.id === s.mostMovingOption)!;
      const cf = counterfactual(state.map, state.answers, s.position, s.mostMovingOption);
      // Show the landing of the question this flip actually moves most.
      const base = reduce(state.map, state.answers);
      const q = p.scope.reduce((best, qid) => {
        const tv = (x: string) =>
          Object.keys(base.credences[x] ?? {}).reduce(
            (t, oid) => t + Math.abs(base.credences[x]![oid]! - (cf.credences[x]?.[oid] ?? 0)),
            0,
          );
        return tv(qid) > tv(best) ? qid : best;
      }, p.scope[0]!);
      const cfCred = cf.credences[q]!;
      const cfTop = outcomeById(
        Object.keys(cfCred).reduce((a, b) => (cfCred[a]! >= cfCred[b]! ? a : b)),
      );
      const active = state.whatIf?.position === s.position;
      return `<div class="sensrow">
        <div class="strack"><div class="sfill" style="width:${maxShift ? (s.shift / maxShift) * 100 : 0}%"></div></div>
        <div class="label"><span class="idchip">${esc(s.position)}</span> ${esc(truncate(p.prompt))}<br>
          <span class="muted small">had you said “${esc(alt.label)}” → lands on <b>${esc(cfTop.name)}</b></span></div>
        <button class="${active ? 'selected' : ''}" data-act="whatif" data-a="${esc(s.position)}" data-b="${esc(s.mostMovingOption)}">see it</button>
      </div>`;
    })
    .join('');

  // --- untouched assumptions ---
  const untouched = state.map.positions.filter((p) => !(p.id in state.answers));
  const untouchedHtml = untouched.length
    ? `<h2>Still at default</h2><div class="card">
        <div class="muted small" style="margin-bottom:8px">Your landing formed while these sat untouched. Answer them to test it.</div>
        ${untouched.map((p) => `<div class="small">• ${esc(p.prompt)}</div>`).join('')}
      </div>`
    : '';

  // --- evidence recap ---
  const evidenceRecap =
    state.map.facts.length === 0
      ? unresearchedPanel()
      : state.map.facts.filter((f) => result.activeFacts.includes(f.id)).map(factCard).join('') ||
        `<div class="card muted">Your traversal touched no evidence.</div>`;

  const whatIfBanner = state.whatIf
    ? `<div class="whatif">What-if view: <b>${esc(state.whatIf.position)}</b> answered “${esc(
        state.map.positions
          .find((p) => p.id === state.whatIf!.position)!
          .options.find((o) => o.id === state.whatIf!.option)!.label,
      )}” instead. <button class="linkish" data-act="whatif-clear">back to your answers</button></div>`
    : '';

  return `
    ${draftBanner()}
    ${sealChip()}
    ${whatIfBanner}
    ${gaps}
    ${questions}
    ${rules ? `<h2>What moved beneath you</h2>${rules}` : ''}
    ${contested ? `<h2>Genuinely contested</h2>${contested}` : ''}
    ${tensions ? `<h2>Held in tension</h2>${tensions}` : ''}
    ${sens.length ? `<h2>What’s carrying your landing</h2><div class="card">${sensRows}</div>` : ''}
    ${untouchedHtml}
    <h2>Evidence in your traversal</h2>
    ${evidenceRecap}
    <div style="margin-top:20px; display:flex; gap:10px;">
      <button data-act="revise">Revise answers</button>
      <button data-act="reset">Start over</button>
    </div>`;
}

// ---------------------------------------------------------------------------
// Shell + actions
// ---------------------------------------------------------------------------

function render(): void {
  document.body.classList.toggle('draft-mode', isDraft(state.map));
  const picker = MAPS.map(
    (m) =>
      `<button data-act="pick-map" data-a="${esc(m.slug)}" class="${m.slug === state.map.slug ? 'selected' : ''}">/${esc(m.slug)}</button>`,
  ).join('');
  const view =
    state.phase === 'arrival' ? arrivalView() : state.phase === 'elicit' ? elicitView() : payoffView();
  document.getElementById('app')!.innerHTML = `
    <header class="top">
      <div class="brand">whatpoints<span>to</span></div>
      <nav>${picker}</nav>
    </header>
    ${view}`;
}

function resetFor(map: BeliefMap): void {
  state.map = map;
  state.phase = 'arrival';
  state.arrival = null;
  state.strength = null;
  state.skipped = false;
  state.answers = {};
  state.openOutcome = null;
  state.whatIf = null;
}

document.getElementById('app')!.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el || el.hasAttribute('disabled')) return;
  const act = el.dataset['act']!;
  const a = el.dataset['a'] ?? '';
  const b = el.dataset['b'] ?? '';

  switch (act) {
    case 'pick-map':
      resetFor(MAPS.find((m) => m.slug === a)!);
      break;
    case 'pick-claim': {
      const o = outcomeById(a);
      state.arrival = { outcomeId: o.id, claim: o.claims[Number(b)]! };
      break;
    }
    case 'pick-strength':
      state.strength = a as StrengthWord;
      break;
    case 'seal':
      state.phase = 'elicit';
      break;
    case 'skip':
      state.skipped = true;
      state.arrival = null;
      state.strength = null;
      state.phase = 'elicit';
      break;
    case 'answer':
      if (state.answers[a] === b) delete state.answers[a];
      else state.answers[a] = b;
      break;
    case 'commit':
      state.phase = 'payoff';
      state.whatIf = null;
      state.openOutcome = null;
      break;
    case 'revise':
      state.phase = 'elicit';
      state.whatIf = null;
      break;
    case 'open-outcome':
      state.openOutcome = state.openOutcome === a ? null : (a as OutcomeId);
      break;
    case 'whatif':
      state.whatIf = state.whatIf?.position === a ? null : { position: a, option: b };
      break;
    case 'whatif-clear':
      state.whatIf = null;
      break;
    case 'reset':
      resetFor(state.map);
      break;
  }
  render();
});

render();
