/**
 * Voice linter suite — rule mechanics on probe strings, field wiring on a
 * planted-violation fixture, and the two real maps + the guide narration
 * surface under the shipped severity model: ERRORS fail this suite,
 * WARNINGS print as diagnostics for human review and never fail.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { uapMap } from '../content/uap.js';
import { singularityMap } from '../content/singularity.js';
import {
  createSession,
  formatLintFinding,
  guideOffers,
  lintMap,
  lintNarration,
  reduceSession,
} from '../src/index.js';
import type { BeliefMap, LintFinding, SessionState } from '../src/index.js';

const rulesOf = (findings: LintFinding[]) => findings.map((f) => f.rule);

// ---------------------------------------------------------------------------
// Rule mechanics
// ---------------------------------------------------------------------------

test('seal-vocabulary: seal words and padlocks are errors; conceal/sealant stay legal', () => {
  for (const bad of ['your answers are sealed', 'we unseal at the end', 'Sealing the walk', 'commit 🔒 here', '🔓 reveal']) {
    const f = lintNarration(bad, 'probe');
    assert.ok(f.some((x) => x.rule === 'seal-vocabulary' && x.severity === 'error'), `expected seal error on: ${bad}`);
  }
  for (const fine of ['they conceal the source', 'sealant on the window', 'where you land appears after you commit']) {
    assert.deepEqual(lintNarration(fine, 'probe'), [], `expected clean: ${fine}`);
  }
});

test('option-label-assertible: questions, empties, and bare polar words are errors', () => {
  const dirty: BeliefMap = fixtureWith({
    options: [
      { id: 'q', label: 'Is radar reliable?' },
      { id: 'e', label: '   ' },
      { id: 'y', label: 'Yes' },
      { id: 'ok', label: 'Yes — the curves have held' },
      { id: 'ok2', label: 'Not much — people misjudge kinematics without instruments' },
    ],
  });
  const errors = lintMap(dirty).filter((f) => f.rule === 'option-label-assertible');
  assert.equal(errors.length, 3);
  assert.ok(errors.every((f) => f.severity === 'error'));
  assert.ok(errors.some((f) => f.where.includes('option q ')));
  assert.ok(errors.some((f) => f.where.includes('option e ')));
  assert.ok(errors.some((f) => f.where.includes('option y ')));
});

test('frame-negation: denying a frame warns; negation without a frame noun stays clean', () => {
  for (const bad of ['This isn’t a trap.', 'no verdict lands here', 'nothing here is a score']) {
    const f = lintNarration(bad, 'probe');
    assert.ok(f.some((x) => x.rule === 'frame-negation' && x.severity === 'warning'), `expected frame warning on: ${bad}`);
  }
  for (const fine of [
    'The map shows what moved.',
    'analogy, not evidence of intent',
    'Not much — people misjudge kinematics. The test of a standard is elsewhere.', // negation and noun in different clauses
  ]) {
    assert.equal(lintNarration(fine, 'probe').length, 0, `expected clean: ${fine}`);
  }
});

test('prosecutorial-vocabulary: rule-11 words warn; "gap" is product vocabulary and exempt', () => {
  for (const bad of ['you admitted the point', 'we caught a mismatch', 'your revisions were tallied', 'that tripped you']) {
    const f = lintNarration(bad, 'probe');
    assert.ok(f.some((x) => x.rule === 'prosecutorial-vocabulary' && x.severity === 'warning'), `expected warning on: ${bad}`);
  }
  assert.equal(lintNarration('the direction gap widened while you were away', 'probe').length, 0);
});

test('double-barrel: clause-joining conjunctions, stacked questions, and semicolons warn; noun lists stay clean', () => {
  const probe = (prompt: string) => lintMap(fixtureWith({ prompt })).filter((f) => f.rule === 'double-barrel');
  assert.ok(probe('Does a singularity arrive — and on what timescale?').length > 0);
  assert.ok(probe('Do you trust the record, and how much does it admit?').length > 0);
  assert.ok(probe('How much? And why?').length > 0);
  assert.ok(probe('The curves have held; extrapolation is the default').length > 0);
  assert.equal(probe('Do you trust eyewitness estimates of speed, distance, and acceleration?').length, 0);
  assert.equal(probe('Do you treat radar tracks as measurements, or as possibly artifacts?').length, 0);
  assert.equal(probe('Credentials carry real weight — rank and oath vouch for the content').length, 0);
});

// ---------------------------------------------------------------------------
// Field wiring — one planted violation per field class
// ---------------------------------------------------------------------------

test('lintMap wiring: every copy field is scanned with its documented scanner set', () => {
  const dirty: BeliefMap = {
    slug: 'dirty',
    title: 'Fixture',
    topicType: 'explanation',
    version: '0',
    questions: [{ id: 'Q', title: 'What is going on?', blurb: 'This is not a test of you.' }],
    positions: [
      {
        id: 'P1',
        kind: 'world-belief',
        scope: ['Q'],
        prompt: 'Do you trust the record, and how much does it show?',
        provenance: 'model-drafted',
        note: 'sealed — notes are author-facing and must never be linted',
        options: [
          { id: 'a', label: 'Is it reliable?' },
          { id: 'b', label: 'The record is sealed' },
        ],
      },
    ],
    facts: [
      {
        id: 'F1',
        text: 'The archive was sealed in 1947. Officials admitted the file exists.',
        strength: 'STRONG',
        provenance: 'model-drafted',
        sources: [{ authority: 'Sealed Records Office', citation: 'vol. 🔒' }],
        baseline: true,
      },
    ],
    outcomes: [
      {
        id: 'O1',
        question: 'Q',
        kind: 'rival-hypothesis',
        name: 'Null',
        assumptionCost: 1,
        provenance: 'model-drafted',
        blurb: 'We caught the mismatch and scored it.',
        claims: ['nothing 🔒 here', 'they caught aliens and scored'],
      },
    ],
    edges: [
      {
        id: 'e1',
        from: { position: 'P1', option: 'a' },
        effects: { O1: 0.1 },
        whyCopy: 'This isn’t a trap — it unseals your answer.',
      },
      {
        id: 'e2',
        from: { position: 'P1', option: 'b' },
        effects: {},
        contested: {
          readings: [
            { label: 'Reading with 🔓 attached', effects: { O1: 0.1 } },
            { label: 'A clean reading', effects: { O1: -0.1 } },
          ],
        },
        whyCopy: 'Genuinely two-sided.',
      },
    ],
    rules: [
      {
        id: 'r1',
        when: [{ position: 'P1', option: 'a' }],
        effects: { O1: 0.1 },
        lessonCopy: 'No verdict here; you tripped up nowhere.',
      },
    ],
    tensions: [
      {
        id: 't1',
        between: [{ position: 'P1', option: 'a' }],
        copy: 'Your answers were exposed and tallied.',
      },
    ],
  };

  const findings = lintMap(dirty);
  const has = (rule: string, whereSub: string) =>
    findings.some((f) => f.rule === rule && f.where.includes(whereSub));

  assert.ok(has('frame-negation', 'question Q blurb'), 'question blurb gets the frame scan');
  assert.ok(has('double-barrel', 'position P1 prompt'), 'prompt gets the double-barrel scan');
  assert.ok(has('option-label-assertible', 'option a label'), 'labels get the assertibility check');
  assert.ok(has('seal-vocabulary', 'option b label'), 'labels get the seal scan');
  assert.ok(has('seal-vocabulary', 'fact F1 text'), 'fact text gets the seal scan');
  assert.ok(has('seal-vocabulary', 'source[0] authority'), 'authorities get the seal scan');
  assert.ok(has('seal-vocabulary', 'source[0] citation'), 'citations get the seal scan');
  assert.ok(has('prosecutorial-vocabulary', 'outcome O1 blurb'), 'outcome blurbs get the prosecutorial scan');
  assert.ok(has('seal-vocabulary', 'claim[0]'), 'claims get the seal scan');
  assert.ok(has('seal-vocabulary', 'edge e1 whyCopy'), 'whyCopy gets the seal scan');
  assert.ok(has('frame-negation', 'edge e1 whyCopy'), 'whyCopy gets the frame scan');
  assert.ok(has('seal-vocabulary', 'contested reading[0] label'), 'contested reading labels are scanned');
  assert.ok(has('frame-negation', 'rule r1 lessonCopy'), 'lessonCopy gets the frame scan');
  assert.ok(has('prosecutorial-vocabulary', 'rule r1 lessonCopy'), 'lessonCopy gets the prosecutorial scan');
  assert.ok(has('prosecutorial-vocabulary', 'tension t1 copy'), 'tension copy gets the prosecutorial scan');

  // Documented exemptions hold.
  assert.ok(!findings.some((f) => f.where.includes('note')), 'author-facing notes are never linted');
  assert.ok(
    !findings.some((f) => f.rule === 'prosecutorial-vocabulary' && f.where.includes('fact F1')),
    'fact text reports the world — exempt from the prosecutorial scan',
  );
  assert.ok(
    !findings.some((f) => f.rule === 'prosecutorial-vocabulary' && f.where.includes('claim')),
    'claims are the user’s phrasings — seal scan only',
  );
});

// ---------------------------------------------------------------------------
// The real maps + the narration surface, under the severity model
// ---------------------------------------------------------------------------

function reportWarnings(t: { diagnostic: (msg: string) => void }, findings: LintFinding[]): void {
  const warnings = findings.filter((f) => f.severity === 'warning');
  t.diagnostic(`${warnings.length} lint warning(s) for human review`);
  for (const w of warnings) t.diagnostic(formatLintFinding(w));
}

function assertNoErrors(findings: LintFinding[]): void {
  const errors = findings.filter((f) => f.severity === 'error');
  assert.deepEqual(errors.map(formatLintFinding), [], 'lint errors must fail the build');
}

test('uap map lints with zero errors (warnings print for review)', (t) => {
  const findings = lintMap(uapMap);
  reportWarnings(t, findings);
  assertNoErrors(findings);
});

test('singularity map lints with zero errors (warnings print for review)', (t) => {
  const findings = lintMap(singularityMap);
  reportWarnings(t, findings);
  assertNoErrors(findings);
});

test('guide narration: every why the policy emits across a full UAP walk lints clean', (t) => {
  const whys = new Set<string>();
  const collect = (state: SessionState) => {
    for (const o of guideOffers(uapMap, state)) whys.add(o.why);
  };

  let s = createSession(uapMap, 'mirror', {
    claim: 'UAPs are alien craft',
    outcome: 'H5',
    strength: 'confident',
  });
  collect(s); // unanswered-fork offers
  s = reduceSession(uapMap, s, { type: 'focus', target: { kind: 'position', id: 'B2' } });
  s = reduceSession(uapMap, s, { type: 'answer', position: 'B2', option: 'measurement' });
  collect(s); // evidence offers (F9/F10 bear on the focused fork)
  s = reduceSession(uapMap, s, { type: 'stance', fact: 'F2', stance: 'dispute' });
  collect(s); // dispute-routing offer (B5b unanswered)
  s = reduceSession(uapMap, s, { type: 'push', target: { kind: 'fact', id: 'F9' }, reason: 'unpack' });
  collect(s); // pop reminder
  s = reduceSession(uapMap, s, { type: 'pop' });
  const walk: Array<[string, string]> = [
    ['B1', 'low'],
    ['B3', 'yes'],
    ['B4', 'leaky'],
    ['B5a', 'weak'],
    ['B5b', 'steep'],
    ['B6', 'compromised'],
    ['B7', 'high-cost'],
    ['B8', 'low'],
    ['B9', 'heavy'],
    ['B10', 'strict'],
  ];
  for (const [position, option] of walk) {
    s = reduceSession(uapMap, s, { type: 'answer', position, option });
  }
  s = reduceSession(uapMap, s, { type: 'commit' });
  collect(s); // payoff offers: gaps, tensions (T1+T2 held), contested (F3/F10), sensitivity

  assert.ok(whys.size >= 9, `the walk should surface the policy’s full why vocabulary, saw ${whys.size}`);
  const findings = [...whys].flatMap((w) => lintNarration(w, `guide narration “${w.slice(0, 44)}…”`));
  reportWarnings(t, findings);
  assertNoErrors(findings);
});

// ---------------------------------------------------------------------------
// Fixture helper — a minimal valid map with an overridable position
// ---------------------------------------------------------------------------

function fixtureWith(override: {
  prompt?: string;
  options?: Array<{ id: string; label: string }>;
}): BeliefMap {
  return {
    slug: 'fixture',
    title: 'Fixture',
    topicType: 'explanation',
    version: '0',
    questions: [{ id: 'Q', title: 'What explains it?' }],
    positions: [
      {
        id: 'P1',
        kind: 'world-belief',
        scope: ['Q'],
        prompt: override.prompt ?? 'Do you trust the record?',
        provenance: 'model-drafted',
        options: override.options ?? [{ id: 'a', label: 'The record holds' }],
      },
    ],
    facts: [],
    outcomes: [
      {
        id: 'O1',
        question: 'Q',
        kind: 'rival-hypothesis',
        name: 'Null',
        assumptionCost: 1,
        provenance: 'model-drafted',
        claims: ['nothing unusual'],
      },
    ],
    edges: [],
    rules: [],
    tensions: [],
  };
}
