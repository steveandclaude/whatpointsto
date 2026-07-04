# BYO Inference — running the LLM seams on the user's own subscription

> **Status:** exploratory, user-motivated, no direction locked. This doc consolidates the
> 2026-07-04 design thread (three conversation rounds + verified web research) that began as
> Platform-Design §8.8; that entry now points here. THREADS §3 tracks the thread.
>
> **The goal (user, verbatim in spirit):** the ideal product experience is completely in
> browser — chat, research, the walk — powered by users' Claude *subscriptions*, not API keys,
> and not platform-paid inference.
>
> **Provenance:** design conversation 2026-07-04 + a web-research verification pass the same
> day (sources at the end; platform facts are as of July 2026 and several are explicitly
> in flux — see §6).

---

## 1. Why this product is unusually suited to BYO inference

Three locked decisions, made for other reasons, turn out to be the decisions one would make
when designing for user-supplied models:

1. **The LLM is backstage at gated seams only** (Platform §2.5), and phases 1–4 run with zero
   model calls — the engine is pure TypeScript, maps are data files. The base product
   (arrival → walk → commit → reveal) is free to serve.
2. **Every seam output is a typed, linted, confirm-gated artifact** entering at draft tier
   wearing its origin. Trust is model-agnostic: a primer from a user's model and a primer from
   the factory pass the same schema validation and voice linter. The immune system built for
   our own LLM covers everyone's.
3. **A session is a replayable move log**, so multi-client operation (an agent proposes, a
   scene renders and the human confirms) falls out of the persistence design.

The seams that actually want a model: the router (claim → map/position), mediation/restatement,
primers/expansions, draft-map generation, and (later) the LLM-assisted guide policy.

## 2. The hard constraint (verified)

**A Claude subscription spends only inside Anthropic's own surfaces** (claude.ai, Claude
Desktop, Claude Code). There is no "Sign in with Claude" that lets a third-party website bill
inference to a visitor's Pro/Max plan — at either vendor (OpenAI's "Sign in with ChatGPT" is
identity-only and ships narrowly). The known workaround — third parties using Claude Code
OAuth tokens — is explicitly prohibited and **server-side enforced since ~Jan–Feb 2026**
("Anthropic does not permit third-party developers to offer Claude.ai login or to route
requests through Free, Pro, or Max plan credentials on behalf of their users",
code.claude.com/docs/en/legal-and-compliance). That door is closed; nothing here should ever
touch it.

So "my domain, my UI, their subscription" is unbuildable *directly* — but two verified
mechanisms invert the embedding, and one of them reaches back onto our own domain.

## 3. Verified mechanisms (July 2026)

### 3.1 Artifacts + `window.claude.complete` — viewer-billed, embeddable on OUR site

- Live since June 2025; matured since. An artifact (self-contained HTML/React in Anthropic's
  sandbox) may call `window.claude.complete(prompt)`; **usage bills to the viewing user's
  Claude account**, who is prompted to sign in on first AI use. Non-AI features work without
  any account.
- **External embedding**: a published artifact can be iframe-embedded on a third-party website
  via an "Allowed domains" list + generated embed snippet — viewer-billed inference included.
  This is the closest existing thing to the ideal: our domain, in-page AI, their subscription.
- Capabilities/limits: completion-only (**no tool use, no web search** in the call; "Live
  Artifacts", ~April 2026, can connect to MCP servers as the sanctioned outside-world path);
  strict iframe sandbox/CSP (exact directives undocumented); **20 MB persistent text storage**
  per artifact, split personal/shared stores; no model selection (Anthropic picks what backs
  the call); publishing requires the code-execution capability enabled.

### 3.2 MCP Apps — our UI inside their chat (cross-vendor)

- SEP-1865, announced Nov 2025 (Anthropic + OpenAI + MCP-UI), **ratified 2026-01-26**. An MCP
  server pre-declares `ui://` HTML resources; the chat client renders them in a sandboxed
  iframe; UI↔host messaging is MCP JSON-RPC over postMessage; UI-initiated tool calls are
  consent-gated.
- Support: live in Claude web/desktop (plus Goose, VS Code Insiders); **ChatGPT rolling out**
  (late Jan 2026) alongside its Apps SDK. Beta-grade in practice (open rendering bugs, e.g.
  ext-apps #671). Custom connectors can render UI without directory review; directory listing
  is for discoverability.
- **Billing distinction:** MCP Apps is UI-in-chat, not viewer-billed server inference. The
  inference in this shape is the *native chat itself* — the user's subscription funds the
  conversation and its web search; our server never calls a model.

### 3.3 Custom connectors (remote MCP) on claude.ai

Available on all plans (Free capped at one), added by URL. Server must be publicly reachable.
Still labeled beta.

## 4. The fit: seams sort by shape

- **Completion-shaped seams** (restatement, primer/expansion drafting from map content, router
  matching): runnable *inside an embedded artifact on our own domain*, viewer-billed (§3.1).
- **Tool-shaped work — research** (web search, source evaluation, authoring strength-tagged
  facts): cannot run in the artifact sandbox. It lives where tools live:
  - **native claude.ai chat + our connector** (§3.2) — consumer tier; the user asks Claude to
    research; typed artifacts come back through the connector; or
  - **Claude Code beside the app** — the workbench tier (below).

This split is why the earlier "app + Claude Code side by side" analysis survives the
in-browser ideal rather than being replaced by it.

## 5. The candidate architecture — three tiers, one core

1. **The door — whatpoints.to.** The scene ships as an embedded artifact. Anonymous visitors
   get the complete zero-inference walk (the engine runs client-side in the sandbox); signing
   in with Claude unlocks the completion seams, billed to the viewer. Platform cost: static
   hosting.
2. **The chat tier — inside claude.ai (and plausibly ChatGPT).** Hosted MCP connector: native
   chat with the user's own web search does research; the scene renders as an MCP Apps panel
   (as support matures); the connector receives typed moves and linted draft artifacts.
   Ergonomics: one surface — chat and scene in the same tab.
3. **The workbench — Claude Code + app side by side.** Full interactive agent with tools;
   research at minutes-cadence beside a seconds-cadence walk (the two-window objection
   dissolves when cadences differ). Key mechanic: **the walk generates the research queue** —
   want-more stances ("queues a primer", Interaction §6.2) and disputes in the session log ARE
   the agent's task list. Git-native: maps are TS data files, research lands as commits, git
   history is the provenance trail (human-reviewed = merged). This is the factory's own tier —
   today's development workflow is literally this loop.

**Shared core across tiers:** pure engine, maps as data, sessions as move logs, everything
entering through schema validation + voice linter + draft tier + origin badges.

**The flywheel** (the economic engine): research and drafts produced in tiers 2–3 — or
donated by tier-1 users' completion seams — are cached, linted, reviewed, and promoted to
shared content that improves the free tier. Users donate generation; the platform pays only
curation. (This resolves Interaction §9.3's factory-vs-on-demand primer fork: both, via
cache-and-review.)

**Rejected shapes:** BYOK web (clean but audience-mismatched — consumers hold subscriptions,
not API keys, and Fable at API prices is the bill nobody wants); subscription-token borrowing
(prohibited, enforced, and unnecessary); a long-lived *interactive* agent session left polling
as a seam worker (demo-grade: idle token burn, context drift, abandonment — the tenable local
worker is headless per-request `claude -p`, now demoted to an optional refinement since
research wants the interactive tier anyway).

## 5a. Workbench sync mechanics (sketch, 2026-07-04)

How scene choices reach the agent and agent work reaches the user, in the tier-3 shape
(Claude Code + skill + a CRUD-ish connector):

- **The sync unit is the move log, not graph state.** Sessions are append-only typed-move
  logs with deterministic replay; the agent keeps a cursor and pulls "moves since N" — a
  slice, not a diff computation. (Third payoff of the move-log design, after persistence and
  demand signals.)
- **Pull at agent-turn boundaries, never push.** The skill rule is one line: *before doing
  anything with the map — research, drafting, advice — pull the session delta first.* The
  user is never blocked on the agent; the user turning to the terminal IS the interrupt.
  Long tasks re-pull before writing (staleness guard).
- **The delta tool returns a digest, not raw moves — and it is carryback, re-aimed.** The
  same pure re-run machinery that builds the human's "while you were away" strip builds the
  agent's briefing: answersChanged / stancesChanged / factsWentLive, plus the **queue** —
  want-more and dispute stances as research tickets (walking the map writes the research
  prompts). MCP's prompts primitive can serve this as a filled briefing template — the
  literal "graph constructs prompts" version.
- **Agent → user only through gates:** content artifacts (schema + linter → draft tier with
  origin badges; git-native locally, so commits + file-watch reload; carryback then announces
  "new evidence is live"); a proposal inbox rendered as confirm-gated chips (record
  sovereignty is structural — only the human's click becomes a move); and plain conversation
  in the agent's own jurisdiction.
- **The skill stays thin** ("pull the delta; write only drafts and proposals"); the
  intelligence lives in the connector's pure functions, which are the product's existing ones.

## 6. Edges, risks, and open verifications

- **Platform dependence (the honest big one):** tier 1's economics ride on one Anthropic
  feature (viewer-billed artifact embeds) that could change. Mitigation is architectural: the
  zero-inference walk depends on none of this — worst case loses the seams on our domain, not
  the product.
- **Record sovereignty:** agents and seams are propose-only on soft inputs; a model that
  answers forks produces a mirror of the model, not the user. Confirmation belongs to the
  human, in the scene or an explicit conversational confirm.
- **The seal is advisory against the user's own computing agent** (it can do arithmetic on
  the raw map). Structure-only pre-commit resources make spoiling awkward, not impossible —
  accepted, like reading a novel's last page.
- **Tone jurisdiction:** a third-party agent narrates in its own voice in its own chat;
  PROTOCOL can't lint that live. Product surfaces stay linted; connector ships frame-ban
  instructions best-effort.
- **Injection posture differs by tier:** tier-1 seams are pure text-in/text-out; tier-3
  research necessarily runs tools over untrusted text in the user's own session (user-owned,
  ordinary agent risk). The record stays protected by the artifact gates regardless.
- **Demand signal:** fully local shapes lose the move-log signal; hosted tiers keep it with
  consent.
- **Unverified platform details** (check before building): exact artifact CSP directives;
  `window.claude.complete` rate limits; whether tool-use ever reaches the completion call;
  shared-store write semantics (20 MB stores); MCP Apps iframe network/persistence rules;
  full MCP primitive parity in claude.ai's client. MCP Apps overall: treat as stabilizing.

## 7. What this changes about the build order: nothing yet

The voice linter remains next and gains weight — it is the admission gate for every donated or
agent-produced artifact in every tier. The first genuinely new item this thread implies is
small and rides existing plans: session persistence (Platform §8.7) done as a readable move
log doubles as the agent-visible research queue. Connector/MCP-server work enters the register
only when a direction here is actually chosen.

## Sources (verified 2026-07-04)

- claude.com/blog/claude-powered-artifacts; simonwillison.net/2025/Jun/25/ai-powered-apps-with-claude/
- support.claude.com/en/articles/9487310 (artifacts: storage, capabilities)
- support.claude.com/en/articles/9547008 (publishing, external-domain embedding, viewer billing)
- blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/ and /2026-01-26-mcp-apps/ (SEP-1865)
- developers.openai.com/apps-sdk/mcp-apps-in-chatgpt
- support.claude.com/en/articles/11175166 (custom connectors)
- claude.com/docs/connectors/building/submission
- code.claude.com/docs/en/legal-and-compliance (OAuth restriction, authoritative)
- theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/
- github.com/modelcontextprotocol/ext-apps/issues/671 (MCP Apps maturity flag)
