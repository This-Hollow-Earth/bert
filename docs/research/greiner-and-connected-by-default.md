# Research: Greiner curve & "connected by default" notes mined for BERT's Concept axis

**Ticket:** THI-14, `[wayfinder:research] Mine Greiner curve and 'connected by default' notes`
**Map:** THI-9 (`[wayfinder:map] BERT v1 spec`), "Not yet specified" section:
> Evaluation-concept axis (API-first, connected-by-default, Greiner-curve-by-size,
> etc.) as a cross-cutting lens applied within modules — kept as a stub, not
> designed yet.

**Scope of this doc:** extraction only. This is raw material for the future
design of BERT's `Concept` axis (see `CONTEXT.md`'s "Concept (stub, not yet
designed)" entry). **No decisions are made here** about which ideas (if any)
BERT should adopt, how they'd be scored, or how they relate to the fixed
Tested/Documented/Automated Principles.

## Sources read

| Note | Path (relative to `1 - Projects/ThisHollowEarth Products/BERT/` in Obsidian vault `Arjen_S11`) | Content |
|---|---|---|
| "Cons2Saas Maturity Model" (the "Greiner curve myths" note) | `Cons2Saas Maturity Model.md` | 14 lines, mostly a scratch draft of BERT's pitch; last line is a bare pointer: "Greiner curve myths" |
| "connected by default" | `connected by default.md` | 54 lines, squad/GTM brainstorm with a CBD section and a longer "Principles ideas" list |
| "Cons2Saas GTM and its discontents" | `Cons2Saas GTM and its discontents.md` | 4 lines, two pasted reader comments on the Cons2SaaS essay (no original content) |

Two adjacent notes in the same folder were also skimmed because they're the
direct source material the three target notes point back to, and they contain
passages more directly reusable for the Concept axis than the target notes
themselves:

- `From Consultancy to SaaS, from Projects to Products.md` — the full "Cons2SaaS"
  maturity essay (already cited in `CONTEXT.md` as a Source essay for the
  Principle/Module vocabulary; re-read here specifically for Greiner-adjacent
  material).
- Vault-wide grep for "connected by default" / "API first" surfaced two more
  hits outside the BERT folder that use nearly identical wording to the BERT
  note, suggesting CBD is a recycled concept from an earlier venture (S11),
  not BERT-original:
  - `3 - Resources/Memos/Memo_ innovation.docx.md` (lines ~97-120, "Appendix:
    Service building blocks & principles")
  - `4 - Archives/S11/Contract 2026.md` (lines ~51-55, "Concepts I came up with")

A vault-wide grep for "Greiner" also found two entries in
`0 - Inbox/Management & Leadership/` (`Strategy.md`, `Tools & Models.md`) that
are just bookmarks to the generic Greiner growth-stage model (toolshero.com),
plus one entry in `4 - Archives/ThisHollowEarth Bootstrap/PROJECT_CONTEXT.md`
("Clarify Greiner curve positioning — myths vs. real growth-stage
transitions") that flags the "myths" framing but has no content behind it.

## What's actually in "Greiner curve myths" (`Cons2Saas Maturity Model.md`)

There is no content under this heading — it's a single trailing line ("Greiner
curve myths") at the end of a short scratch note, with no elaboration of what
the "myths" are. The rest of the note (lines 1-13) is an early draft of BERT's
own pitch: "BERT is shift left enterprise readiness... based on principles and
evolving... not set in stone... simple... automated... progressive
disclosure," followed by the three Principles almost verbatim as they now
appear in `CONTEXT.md`, and a note to "use context from the consultancy to
saas essay." **Extraction verdict: the note title promises Greiner-curve
myth-busting content that does not exist yet in the vault.** The only
substantive Greiner-adjacent material is the classic Greiner growth-stage
model itself (bookmarked, not written up) in the Inbox notes above, and the
Cons2SaaS 5-stage maturity essay that BERT's `CONTEXT.md` already cites.

## Ideas surfaced for the Concept axis

### From "connected by default" (`connected by default.md`)

- **CBD ↔ modularity link** (line 4): "Service Builder modularity fits
  perfectly with CBD concept" — ties connected-by-default to a
  build/buy/use, modular-orthogonal design philosophy ("Keep Doors open:
  build, buy, use", line 2). Relevant if BERT's Module split mechanism
  (flagged as fogged on THI-9) ever wants to reuse a "modularity" framing.
- **Growth framing** (line 6): "the new product in a new market: be scalable
  while remaining flexible" — paired with CBD as a design goal, not a
  checklist item.
- **Squad-level checklist-shaped questions** (lines 8-22), written as a bullet
  list of things a "Squad" (cross-functional team) should be evaluated
  against — several of these read like candidate Concept-axis lenses rather
  than Principles, because they're optional/cross-cutting rather than
  always-scored:
  - "API first?" (line 12) — one of the three named Concept candidates in
    `CONTEXT.md`.
  - "Design for growth?" (line 13) — Greiner-curve-adjacent language (growth
    stage as a lens), distinct from the named "Greiner-curve-by-company-size"
    candidate but conceptually overlapping.
  - "Afhankelijkheden" (dependencies, line 11) and "Coordination costs"
    (line 16) — cross-squad coupling, could inform a future "how
    interconected is this Module" lens.
  - "TNFD, welke Squad gaat dat bouwen? Of csddd? Waar zien we de overlap
    tussen die frameworks?" (line 14) — external compliance-framework overlap
    as a lens, specific to the environmental/supply-chain domain S11 operated
    in; likely too domain-specific to port directly into BERT's
    business-function Modules (HR/Sales/Legal/Engineering/etc.) but flagged
    here as source material.
  - "Autonoom maar hoe kan dat met de afhankelijkheden" (line 18) — autonomy
    vs. dependency tension, phrased as an open question, not a criterion.
- **"Principles ideas" list** (lines 34-47) — a grab-bag from an *S11*
  context (not BERT), several of which reuse BERT's own Principle language
  almost verbatim and one of which explicitly names CBD as a completeness
  criterion:
  - "if it's not automated, it doesn't work" (line 40) — near-duplicate of
    BERT's "if it's not automated, it doesn't happen" Principle.
  - "there are no afterthoughts or add-ons, everything is integrated / CBD"
    (line 47) — the clearest explicit definition-by-example of
    connected-by-default in this note: CBD ≈ "nothing bolted on after the
    fact, everything integrated from the start." This is the most directly
    reusable phrasing for a future CBD Concept definition.
  - "a new layer must be implemented in 1 week" (line 36) and "the FBL is
    automatically released and deployed every month" (line 37) — cadence/flow
    commitments, S11-specific (FBL = their data product), not generically
    portable, but illustrate what a "systematic" (Grade 3) automation signal
    looked like in a sibling effort.
  - "data as a product, data as code" (line 38) — recurs verbatim in the
    `Memo_ innovation.docx.md` CBD definition below; a recognizable
    sub-component of CBD across notes.
  - "design for flow" (line 39) — recurs as "Strategic Principle: Design for
    flow, not features" in `Contract 2026.md` (see below), tied there to an
    infinite-game/adaptability philosophy rather than a checklist.
- **Mental models list** (lines 49-53) — generic thinking tools ("every
  organisation problem is a communication problem", "extrapolate to
  extremes", "inverse", "real world analogy"); not Concept-axis material,
  noted only for completeness since they're in the same note.

### From the two adjacent S11 notes (found via vault-wide grep, same author/vocabulary)

These aren't the three notes named in the ticket, but they're where "API
first" and "connected by default" actually get *defined* rather than just
listed, so they're the more useful extraction targets for anyone designing
the Concept axis later:

- `Memo_ innovation.docx.md`, "Appendix: Service building blocks & principles"
  (lines ~97-120) gives CBD a parenthetical definition: **"connected by
  default (data as code, data as product, API first, partners)"** (line 103)
  — i.e., in this author's usage, API-first is treated as a *sub-component*
  of connected-by-default, not a sibling concept, which conflicts with how
  `CONTEXT.md`'s Concept stub currently lists "API-first" and
  "connected-by-default" as separate candidate lenses. Also in this list,
  adjacent to CBD: "sensible defaults," "continuous compliance," "service
  builder (modular orthogonal design: flexible AND scalable)," "coherent,
  consistent & comprehensive," and a "scales over: commodities / geographies
  / time / frameworks / environmental landscape indicators" axis — the last
  of which is a *different* kind of scaling axis than company-size
  (Greiner), namely scaling over domain breadth. The memo also explicitly
  flags (line 120): "we *are* doing these things... but not structured,
  consequently and relentless... They should become routine, discipline" —
  i.e. the original author frames CBD/API-first/etc. as maturity aspirations
  BERT-style, not yet operationalized, which is exactly the gap BERT's
  Concept axis would need to fill if it adopts them.
- `Contract 2026.md`, "Concepts I came up with" (lines ~51-60): a flat list —
  "Continuous compliance," "API first," "Service builder," "Connected by
  default," "Scope 3 + removals approach," "Biodiversity MVP," ..., "S11
  hypothesis: big head f&b -> long tail -> other markets" (line 60) — this
  last line is a direct, independent reuse of the Cons2SaaS stage names
  ("big head," "long tail") applied to a market-sequencing strategy, showing
  the essay's stage vocabulary was already being reused metaphorically
  outside the strict company/module maturity context that `CONTEXT.md`
  currently scopes it to.
- Same file, lines ~70-78: a "Philosophy → Strategic Principle → Operational
  Requirement → Tactical Implementation" cascade ("Play the infinite game" →
  "Design for flow, not features" → "Systems must change quickly and safely"
  → "Monthly releases, week-long integrations") with a self-test: **"Can we
  respond to regulatory changes in weeks? Can we onboard new commodities in
  days? If not, we're still playing finite."** This is a reusable *pattern*
  (principle → requirement → concrete test) rather than Concept-axis content
  per se, but it's structurally similar to how BERT's Principles get
  operationalized into checkable criteria (THI-10), and could be a template
  for how a Concept gets operationalized too.

### From "Cons2Saas GTM and its discontents" (`Cons2Saas GTM and its discontents.md`)

No original material — the note is two pasted reader comments responding to
the Cons2SaaS essay draft, not notes by the BERT author:

1. A question about whether "everything can be SaaS" post-LLM, and whether
   partial productization can capture SaaS-like margins without full
   plug-and-play — relevant context for *why* a stage-agnostic tool like BERT
   might not want to assume every org module is heading toward Long Tail
   SaaS, but not itself a Concept-axis idea.
2. A comment that GTM perfection-seeking fails for smaller companies and that
   "agile GTM" / fail-fast is more important than a polished plan — general
   startup advice, not Concept-axis material.

**Extraction verdict: nothing reusable for the Concept axis in this note.**
It's tangential commentary on the parent essay, already superseded by the
essay itself (which `CONTEXT.md` already cites as a Source essay).

## Cross-note observations (still extraction, not a recommendation)

- **Naming inconsistency across notes**: `CONTEXT.md`'s Concept stub lists
  "API-first" and "connected-by-default" as two separate candidate lenses,
  but the source material (`Memo_ innovation.docx.md`) defines API-first as
  one of four sub-components *inside* connected-by-default (alongside "data
  as code," "data as product," "partners"). Anyone designing the Concept axis
  will need to resolve whether these are siblings or one nests in the other.
- **"Greiner curve myths" has no written content anywhere in the vault** —
  only the bare title/pointer in `Cons2Saas Maturity Model.md` and a
  restated-but-unexplored flag in the S11 Bootstrap archive
  ("myths vs. real growth-stage transitions"). If BERT's Concept axis wants a
  Greiner-by-company-size lens, the source material to build it from is (a)
  the generic Greiner growth-stage model (bookmarked externally, not
  authored in-vault) and (b) the Cons2SaaS 5-stage essay already cited in
  `CONTEXT.md` — not a myths-debunking essay, which doesn't exist yet.
- **The Cons2SaaS essay's stage vocabulary is already being reused
  metaphorically** outside its original per-module-maturity scope (e.g. "big
  head f&b -> long tail -> other markets" as a market-sequencing strategy in
  `Contract 2026.md`), suggesting the stage names carry currency as a general
  narrative device beyond BERT's specific per-Module scoring use.
- **A recurring "principle → operational test" pattern** shows up across
  notes (BERT's own three Principles; the Philosophy→Tactical cascade in
  `Contract 2026.md`; the "should become routine, discipline" framing in
  `Memo_ innovation.docx.md`) — all frame aspirational qualities (CBD,
  flow, automation) as things that need a concrete, checkable test before
  they count. This mirrors BERT's Principle→Checklist Item→Grade structure
  and may be useful structurally when designing how a Concept gets applied
  within a Module, independent of which specific Concepts get chosen.

## Explicit non-decision

This document does **not** recommend whether BERT should adopt API-first,
connected-by-default, Greiner-curve-by-size, or any sub-component thereof
(data-as-code, data-as-product, partners, service-builder modularity, etc.)
as part of its Concept axis, nor how such a Concept would be scored or
whether it should be per-Module or global. That design work remains with
whoever picks up the Concept-axis ticket referenced on map THI-9.
