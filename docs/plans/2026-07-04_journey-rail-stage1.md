# Build plan — Journey rail, stage 1 (chrome migration)

Date: 2026-07-04 · Design record: `Interaction-Design-2026-07.md` §10 (esp. §10.3, §10.6
stage 1) · Scope decided by the strategist with the user away: **stage 1 only** — §10.6's
own staging says this step lets us feel the direction cheaply; stages 2–3 carry open
sub-questions (ballot geometry, focus-card docking) that want the user's eye after this
ships. Executor: background Fable fork ("rail-builder"). **No commits; no doc edits.**

**Status: executed and validated 2026-07-04** — 76/76; full browser walk on both maps;
deviations + rulings recorded in Interaction-Design §10.6's shipped marker.

## Outcome

The sidebar stops being the app's chrome. Three surfaces take its jobs:

- `#register` — thin banner under the header: one-shot notices · promise/reveal line ·
  compact DRAFT stamp. Hidden at the door (the door keeps its own full stamp).
- `#rail` — the journey rail, left edge: guide offers at the head (rank order), a
  here-marker, open-promise notches, per-fork coverage dots with emphasis, commit at the
  foot.
- `#panel` — narrowed (~360px): ONLY the focus frame + carryback strip. Everything else
  leaves it. (It becomes the proto-focus-card; stages 2–3 finish the job.)

Contracts that must not budge: every interaction stays a typed move through `dispatch()`;
`guideOffers` rank renders verbatim (rail = top 3, top→bottom; renderer may dedup the
on-screen frame, never reorder); no numerals for credence; no seal words or padlocks;
nothing credence-derived renders pre-commit; `REDUCED_MOTION` respected; interactive
notches keep `role="button"` + `tabindex="0"` (the body keydown delegate already handles
Enter/Space).

## web/index.html

- Layout: header `#top` → new `#register` strip → main row becomes `#rail` + `#scene` +
  `#panel`. Panel: `flex: 0 0 470px` → ~360px (keep the max-width viewport guard).
- Rail CSS: collapsed spine ~56px (glyphs/dots only, labels hidden); expands to ~280px on
  `:hover` / `:focus-within` (width transition; disabled under `prefers-reduced-motion` —
  the pattern already exists in this file). Zone separators hairline `var(--line)`.
  **Notch = one line, no wrapping** (§10.3's hard cap; full text lives in the frame the
  notch opens — do not reintroduce ellipsis over long copy: compose notch lines from
  authored `shortLabel`s, which are designed short).
- Emphasis classes within the existing token system: `.waver`, `.flagged` (graphite
  ring / ink treatment — designer's pick), `.carrying` (mulberry — post-commit only).
  Answered dot = filled ink; unanswered = hollow pencil outline. Commit foot reuses
  `.primary`.
- Banner CSS: single row, small type; notice keeps its existing look; promise keeps the
  dashed-graphite register, reveal keeps mulberry (reuse existing classes where possible).

## web/scene.ts

- `sync()`: … `renderHeader(); renderBanner(); renderRail(); renderPanel(res);
  renderArrival();`
- New `renderBanner()`: `noticeHtml()` + `promiseHtml()` + compact draft stamp →
  `#register`; hidden when `S.session` is null.
- New `renderRail()`: sets `currentOffers` (logic moves here from `guideRail`; keep the
  dedup rule and top-3 cap) and renders zones top→bottom:
  1. Toolbar glyphs: return ◀ (stack only) · step back to the whole map (focused only) ·
     start over (ghost).
  2. AHEAD — offers: rank dot + one-line label (`shortOf`-based; `offerLabel` for non-node
     moves); `why` copy via `title` attr (codebase precedent: `chip()`'s `edgeWhy`).
  3. HERE — current-focus marker (inert).
  4. PROMISES — one ⏎ notch per stack entry (`data-act="pop-to" data-i`; same
     pop-to-then-land semantics as the old crumbs). The pinned scene origins + tethers in
     `retarget()` stay untouched (§4.3 validated behavior).
  5. COVERAGE — one dot per `S.map.positions` (authoring order),
     `data-act="rail-focus"` → dispatch a plain `focus` (wander — never a push; rail
     navigation makes no promises). Emphasis, split on the seal (§10.3): pre-commit only
     the user's own signals — `waver` = ≥2 `answer` moves on that fork in `S.log`;
     `flagged` = latest reaction on that position target ∈ {unconvinced,
     hadnt-considered}; one-liners in `title`, e.g. "you've changed this answer" /
     "you marked this: unconvinced". Post-commit adds `carrying` = the top `sensitivity()`
     entry (shift > 0.001): "this answer is carrying your landing".
  6. FOOT (Mirror, pre-commit): commit button + ●○ progress (moved from `commitBar`);
     post-commit: a small inked marker only (the banner carries the reveal line).
- `renderPanel()`: slims to `carrybackHtml()` + the frame. `crumbsHtml`/`commitBar` retire;
  `guideRail`'s logic lives in the rail now.
- `resetToDoor()`: also clear `#rail` / `#register`.
- Events: add case `'rail-focus'` → `dispatch({ type: 'focus', target })`. Every other act
  is reused as-is.
- New user-facing strings follow PROTOCOL v1.2 (describe what is, never a charge; no seal
  vocabulary). Renderer-embedded copy linting is a known open thread — eyeball discipline.

## Verification (all required before reporting done)

1. `npm test` — 76/76 (tsc covers `web/`; keep `scene.ts` strict-clean).
2. Rebuild (`npx tsc`) and browser-validate http://localhost:8137/ (a dev server may
   already be running from an earlier session; restart it if it serves stale dist). Load
   browser MCP tools in ONE ToolSearch call.
3. UAP walk: door → arrive → banner promise + rail (offers/dots/commit) → answer forks
   (dots fill; offers advance; accept one offer) → push a digression from a frame chip
   (promise notch + pinned origin + tether appear) → pop via the rail notch (carryback
   strip on the resumed frame) → change one answer twice (waver emphasis) → react
   "unconvinced" on a focused fork (flagged emphasis) → commit at the rail foot (banner
   flips to reveal; scene inks; carrying emphasis appears; zoom-out overview shows bars) →
   switch to singularity (DRAFT in banner; generic layout sane). Zero console
   errors/warnings.
4. Keyboard: Tab reaches rail notches; Enter/Space activates.
   Automation gotcha: two-line scene tspans concatenate without spaces — strip ALL
   whitespace when matching node labels.
5. Screenshots at each milestone into the scratchpad; final report lists files touched,
   deviations from this plan (with §-references), and validation results.

## Out of scope (do not touch)

Stages 2–3 (ballot, sector payloads, focus-card docking, reveal overlay); seam
invitations; `src/` or `content/` changes; commits; docs edits (the strategist updates
THREADS/§10.6 after review).
