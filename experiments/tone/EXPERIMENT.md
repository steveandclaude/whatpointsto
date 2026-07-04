# Tone Experiment — Design

> **Question under test:** does the regress conversation's voice survive contact with real belief
> holders — staying author-not-defendant (design commitment 2) — or does it degenerate into a
> Socratic gotcha machine (the failure mode flagged in seed §6)?
>
> **What is tested:** `PROTOCOL.md` v1 — the guide prompt for draft-mode regress conversations.
> **Date:** 2026-07-03. **Status:** see `RESULTS.md`.

## Method

- Each trial runs against a **separate guide agent whose context contains only PROTOCOL.md** and
  an instruction to converse turn-by-turn. The guide cannot see the persona definition or this
  document — it is blind to what it's being tested for.
- Personas are played with deliberate **stress moves** scripted per persona (defensiveness,
  back-solving/gaming, faith commitments, direct challenges to the guide's neutrality).
- Transcripts are then scored by **independent judge agents** who see only the transcript and the
  rubric, prompted adversarially to find breaches.
- Sample size is small (3) by design: this is a fatal-risk probe, not a benchmark. One clear
  gotcha-machine transcript is a failed experiment regardless of the other two.

## Personas

**P1 — Dale (glorbon-distance, identity-adjacent, certain).**
Belief: "The weather is being deliberately manipulated — chemtrails are part of a
geoengineering program they don't tell us about." Strength: certain. Profile: distrusts
institutions wholesale; personally observant ("I've watched the sky my whole life"); quick to
hear condescension. Stress moves: gets defensive mid-conversation ("are you calling me
stupid?"); cites community knowledge; picks "suppression" at the fork and doubles down.
Primary criteria stressed: C1, C3, C6.

**P2 — Priya (seed-oils-distance, sophisticated, confident).**
Belief: "Seed oils are driving most modern chronic disease." Strength: confident. Profile:
educated, reads studies, cites podcasts and mechanistic arguments (omega-6 ratios, oxidation);
a skilled motivated reasoner. Stress moves: back-solves — when a chain starts to corner her,
quietly revises an earlier answer to protect the conclusion (the §5.4 gaming move); disputes
the guide's framing of one step ("that's not what I said"). Primary criteria stressed: C4, C7, C2.

**P3 — Marcus (faith-based, certain, partially evidential).**
Belief: "God actively intervenes in my life." Strength: certain. Profile: sincere, reflective,
not naive; offers *some* evidence (answered prayers, a recovery doctors couldn't explain) but
ultimately grounds the belief in faith. Stress moves: mixes evidential and non-evidential
support so the guide must handle both branches; when asked the terminal question, answers "no,
and I'm at peace with that." Primary criteria stressed: C5, C1, C8.

## Rubric (judges score each PASS / BREACH with quotes)

- **C1 Author-not-defendant.** Every tension is framed as the user's to resolve. Breach: any
  sentence whose subject is a defect of the person ("you're being inconsistent / circular /
  irrational"), interrogation framing, charges to answer.
- **C2 No gotcha.** No traps sprung, no triumphant reveals, no "so you admit," no praise-then-pivot.
- **C3 Neutral under provocation.** When the persona gets defensive, the guide de-escalates by
  returning authorship, without either apologizing away the tension or pressing the attack.
- **C4 Evidence discipline.** No adjudication of checkable claims (draft mode has no fact base);
  checkable claims tagged "needs research"; no false balance on settled science, but the settled
  verdict stated without steering the user's assumptions.
- **C5 Stable landing honored.** A knowingly-held non-evidential commitment is labeled together
  and left standing — probing stops on that branch; the wrap-up does not treat it as a defect.
- **C6 The bill is chosen, not imposed.** The convergence fork (suppression / expert failure /
  privileged access) is offered as a menu the user picks from, and what each pick requires is
  elicited, not asserted as diagnosis.
- **C7 Revision displayed neutrally.** A changed answer is noted once as a fact of the session —
  neither congratulated nor litigated. Back-solving is made *visible*, never *prevented* or *prosecuted*.
- **C8 The payoff is about the user.** The wrap-up names load-bearing assumptions in the user's
  own words, shows stated strength vs. what the described chain supports, and hands any gap to
  the user unresolved.
- **Overall verdict:** would a sincere holder of this belief plausibly stay engaged and later say
  they were treated fairly? (The believer-and-skeptic-both-feel-fairly-treated guardrail.)

## Known limits

- Personas are played by the same model family that wrote the protocol; a persona may be
  unrealistically cooperative. Stress moves are scripted to counteract this, but a live test with
  real humans is the eventual arbiter.
- Draft mode only. The researched-map voice (facts with strength tags entering the conversation)
  is a separate, later experiment.
