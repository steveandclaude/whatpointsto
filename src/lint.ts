/**
 * The voice linter — mechanical QA over finished, user-facing copy.
 *
 * lintMap is pure ((map) → findings) and runs once per artifact: in `npm test`
 * over content/, and later at artifact admission — every tier of the BYO
 * architecture admits content through schema validation + this linter
 * (docs/BYO-Inference-2026-07.md §7). It never intercepts live LLM narration:
 * lexical bans fail against a steered model but work on finished artifacts
 * (experiments/tone/RESULTS.md §6 → PROTOCOL v1.2).
 *
 * Rule sources:
 * - Interaction-Design §5.5 — seal-words and padlock glyphs never reach the
 *   user surface; the surface speaks promise and reveal. Mechanical ERROR.
 * - Interaction-Design §5.4 — every option label stands alone as an assertible
 *   proposition (mechanical ERROR); prompts are single-barreled (heuristic
 *   WARNING — conjunction signals need a human eye, so they never hard-fail).
 * - PROTOCOL v1.2 rule 11 — the frame ban (never describe a map action by what
 *   it is not; denying a frame imports the frame) and the prosecutorial
 *   vocabulary ban. Both heuristic WARNINGS.
 * - Schema I9 (authorities) stays in validateMap: admission is
 *   validateMap + lintMap; the linter re-checks no schema invariant.
 *
 * Severity model (decided 2026-07-04): 'error' findings fail `npm test`;
 * 'warning' findings print for human review and never fail. Findings are
 * data — an admission gate applies its own policy over the same list.
 *
 * Scope notes:
 * - `note` fields are author-facing and deliberately unlinted.
 * - Fact text reports the WORLD ("AARO admitted…" describes an actor, not the
 *   user), so facts are exempt from the prosecutorial scan; the seal and
 *   frame scans still apply to them.
 * - Router claims are the USER's phrasings, so they get only the seal scan.
 * - "gap" is absent from the prosecutorial list on purpose: the direction and
 *   confidence gaps are core descriptive product vocabulary (Interaction
 *   Design §4.2 makes 'gap' a focus kind); PROTOCOL bans it only as a charge
 *   in the conversational guide's voice.
 */

import type { BeliefMap } from './schema.js';

export type LintRule =
  | 'seal-vocabulary'
  | 'option-label-assertible'
  | 'frame-negation'
  | 'prosecutorial-vocabulary'
  | 'double-barrel';

export type LintSeverity = 'error' | 'warning';

export interface LintFinding {
  rule: LintRule;
  severity: LintSeverity;
  /** Human path to the offending field ("uap: position B5a option strong label"). */
  where: string;
  /** The matched text with a little surrounding context. */
  excerpt: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Patterns. All /g regexes are consumed via matchAll (which clones its regex),
// so module-level definitions carry no lastIndex state between scans.
// ---------------------------------------------------------------------------

/** seal/sealed/unseal(ed|ing)/reseal… as whole words. "conceal" stays legal. */
const SEAL_WORDS = /\b(?:un|re)?seal(?:s|ed|ing)?\b/giu;

/** The padlock family: 🔏 🔐 🔒 🔓. */
const PADLOCKS = /[\u{1F50F}\u{1F510}\u{1F512}\u{1F513}]/gu;

/**
 * A negation token followed, within the same clause, by a frame noun —
 * "this isn't a trap", "no verdict here". Clause boundaries (.!?;—) stop the
 * match so a negation can't reach a noun in the next thought.
 */
const FRAME_NEGATION =
  /\b(?:not|no|isn['’]t|aren['’]t|wasn['’]t|won['’]t|never|nothing|neither)\b[^.!?;—]{0,60}?\b(?:score|trap|charge|verdict|judgment|judgement|gotcha|trick|accusation|interrogation|tally|exam|quiz|test)s?\b/giu;

/** PROTOCOL v1.2 rule 11's banned vocabulary, minus 'gap' (see header note). */
const PROSECUTORIAL =
  /\b(?:caught|admitted|admissions?|exposed|tall(?:y|ies|ied)|scor(?:es?|ed|ing)|crack(?:s|ed)?|knock(?:s|ed)?\s+over|trip(?:s|ped)?\s+(?:you|up))\b/giu;

/**
 * A conjunction that starts a second clause or question — "…and on what
 * timescale", "and how much does it…". Noun lists ("speed, distance, and
 * acceleration") do not match: the conjunction must be followed by a
 * wh-word/auxiliary, optionally through one short preposition.
 */
const CLAUSE_JOINER =
  /\b(?:and|or)\s+(?:(?:on|in|at|for|to|of)\s+)?(?:whether|how|what|who|whom|why|when|which|does|do|did|is|are|was|were|should|would|could|can|will|must)\b/giu;

/** A bare polar/hedge word cannot stand alone as an assertible proposition. */
const BARE_POLAR = /^(?:yes|no|maybe|true|false)[.!]?$/iu;

// ---------------------------------------------------------------------------
// Scan helpers
// ---------------------------------------------------------------------------

function excerptAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 24);
  const end = Math.min(text.length, index + length + 24);
  const pre = start > 0 ? '…' : '';
  const post = end < text.length ? '…' : '';
  return (pre + text.slice(start, end) + post).replace(/\s+/g, ' ');
}

function matchesOf(
  text: string,
  pattern: RegExp,
  make: (excerpt: string) => LintFinding,
): LintFinding[] {
  const out: LintFinding[] = [];
  for (const m of text.matchAll(pattern)) {
    out.push(make(excerptAround(text, m.index ?? 0, m[0].length)));
  }
  return out;
}

function scanSeal(text: string, where: string): LintFinding[] {
  const finding = (excerpt: string): LintFinding => ({
    rule: 'seal-vocabulary',
    severity: 'error',
    where,
    excerpt,
    message:
      'seal-vocabulary on the user surface — the surface speaks promise and reveal (Interaction-Design §5.5)',
  });
  return [...matchesOf(text, SEAL_WORDS, finding), ...matchesOf(text, PADLOCKS, finding)];
}

function scanFrameNegation(text: string, where: string): LintFinding[] {
  return matchesOf(text, FRAME_NEGATION, (excerpt) => ({
    rule: 'frame-negation',
    severity: 'warning',
    where,
    excerpt,
    message:
      'describes a map action by what it is not — denying a frame imports the frame (PROTOCOL v1.2 rule 11)',
  }));
}

function scanProsecutorial(text: string, where: string): LintFinding[] {
  return matchesOf(text, PROSECUTORIAL, (excerpt) => ({
    rule: 'prosecutorial-vocabulary',
    severity: 'warning',
    where,
    excerpt,
    message: 'prosecutorial vocabulary in the product’s voice (PROTOCOL v1.2 rule 11)',
  }));
}

function scanDoubleBarrel(text: string, where: string): LintFinding[] {
  const out: LintFinding[] = [];
  const flag = (excerpt: string, signal: string) =>
    out.push({
      rule: 'double-barrel',
      severity: 'warning',
      where,
      excerpt,
      message: `possible double-barrel (${signal}) — one fork, one proposition (Interaction-Design §5.4)`,
    });
  if ((text.match(/\?/g)?.length ?? 0) > 1) flag(excerptAround(text, 0, Math.min(text.length, 48)), 'two questions in one prompt');
  for (const m of text.matchAll(CLAUSE_JOINER)) {
    flag(excerptAround(text, m.index ?? 0, m[0].length), 'a conjunction joins a second clause');
  }
  const semi = text.indexOf(';');
  if (semi !== -1) flag(excerptAround(text, semi, 1), 'a semicolon joins two propositions');
  return out;
}

function checkAssertible(label: string, where: string): LintFinding[] {
  const finding = (message: string): LintFinding[] => [
    {
      rule: 'option-label-assertible',
      severity: 'error',
      where,
      excerpt: excerptAround(label, 0, Math.min(label.length, 48)),
      message,
    },
  ];
  const trimmed = label.trim();
  if (trimmed === '') return finding('option label is empty — it must stand alone as an assertible proposition (Interaction-Design §5.4)');
  if (trimmed.endsWith('?')) return finding('option label is a question — it must stand alone as an assertible proposition (Interaction-Design §5.4)');
  if (BARE_POLAR.test(trimmed)) return finding('bare yes/no cannot stand alone as an assertible proposition — say what is being asserted (Interaction-Design §5.4)');
  return [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Lint one narration-voice string — guide `why` copy, offer text, any copy the
 * product speaks in its own voice. Seal is an error; frame and prosecutorial
 * hits are warnings.
 */
export function lintNarration(text: string, where: string): LintFinding[] {
  return [
    ...scanSeal(text, where),
    ...scanFrameNegation(text, where),
    ...scanProsecutorial(text, where),
  ];
}

/** Lint every user-facing copy field of a map artifact. Pure; call once per artifact. */
export function lintMap(map: BeliefMap): LintFinding[] {
  const out: LintFinding[] = [];
  const at = (path: string) => `${map.slug}: ${path}`;

  for (const q of map.questions) {
    out.push(...lintNarration(q.title, at(`question ${q.id} title`)));
    if (q.blurb) out.push(...lintNarration(q.blurb, at(`question ${q.id} blurb`)));
  }

  for (const p of map.positions) {
    const promptAt = at(`position ${p.id} prompt`);
    out.push(...lintNarration(p.prompt, promptAt), ...scanDoubleBarrel(p.prompt, promptAt));
    if (p.shortLabel) out.push(...lintNarration(p.shortLabel, at(`position ${p.id} shortLabel`)));
    for (const o of p.options) {
      const labelAt = at(`position ${p.id} option ${o.id} label`);
      out.push(
        ...lintNarration(o.label, labelAt),
        ...checkAssertible(o.label, labelAt),
        ...scanDoubleBarrel(o.label, labelAt),
      );
    }
  }

  for (const f of map.facts) {
    // World-reporting voice: seal + frame scans, no prosecutorial scan.
    out.push(...scanSeal(f.text, at(`fact ${f.id} text`)), ...scanFrameNegation(f.text, at(`fact ${f.id} text`)));
    if (f.shortLabel) {
      out.push(
        ...scanSeal(f.shortLabel, at(`fact ${f.id} shortLabel`)),
        ...scanFrameNegation(f.shortLabel, at(`fact ${f.id} shortLabel`)),
      );
    }
    f.sources.forEach((s, i) => {
      out.push(...scanSeal(s.authority, at(`fact ${f.id} source[${i}] authority`)));
      if (s.citation) out.push(...scanSeal(s.citation, at(`fact ${f.id} source[${i}] citation`)));
    });
  }

  for (const o of map.outcomes) {
    out.push(...lintNarration(o.name, at(`outcome ${o.id} name`)));
    if (o.blurb) out.push(...lintNarration(o.blurb, at(`outcome ${o.id} blurb`)));
    // Claims are the user's own phrasings — only the seal scan applies.
    o.claims.forEach((c, i) => out.push(...scanSeal(c, at(`outcome ${o.id} claim[${i}]`))));
  }

  for (const e of map.edges) {
    out.push(...lintNarration(e.whyCopy, at(`edge ${e.id} whyCopy`)));
    e.contested?.readings.forEach((r, i) =>
      out.push(...lintNarration(r.label, at(`edge ${e.id} contested reading[${i}] label`))),
    );
  }

  for (const r of map.rules) out.push(...lintNarration(r.lessonCopy, at(`rule ${r.id} lessonCopy`)));
  for (const t of map.tensions) out.push(...lintNarration(t.copy, at(`tension ${t.id} copy`)));

  return out;
}

/** One finding, one readable line — for test diagnostics and failure output. */
export function formatLintFinding(f: LintFinding): string {
  return `[${f.severity}] ${f.rule} @ ${f.where}: ${f.message} — “${f.excerpt}”`;
}
