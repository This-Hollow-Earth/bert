# BERT — Bert's Enterprise Readiness Templates

BERT operationalizes three principles (tested, documented, automated) as a
scored checklist, organized by business-function module, to help an
organization assess and improve its enterprise readiness. Stage-agnostic:
does not require knowing where an org sits on the Cons2SaaS maturity curve
to be useful (that mapping is a deliberate v1+ fast-follow, not v1 scope).

## Language

**Principle**:
One of BERT's three fixed evaluation dimensions: Tested, Documented,
Automated ("if it's not tested, it doesn't work" / "if it's not
documented, it doesn't exist" / "if it's not automated, it doesn't
happen"). Every Checklist Item is scored across all three; a Principle is
never marked not-applicable for an item — if it seems inapplicable,
reframe the item's definition of that Principle rather than exempting it.
_Avoid_: dimension, pillar, axis (reserve "axis" for the deferred
evaluation-concept lens, a different thing — see Concept below).

**Module**:
A business-function area BERT assesses (e.g. HR, Sales, Marketing, Legal,
Engineering, Ops). Each Module owns its own list of Checklist Items and
can sit at its own Cons2SaaS maturity stage, independent of other
Modules. v1 starts with a small default set of Modules and adds more via
progressive disclosure; a Module may later split into finer-grained
Modules as an org grows (mechanism undecided — see map's fog).
_Avoid_: function, department, team (Module is BERT's own vocabulary for
this; "function" is fine in prose describing the real org, not as a BERT
term).

**Checklist Item**:
A single concrete, checkable thing within a Module (e.g., for
Engineering: "on-call runbook exists"). Each Checklist Item is graded on
all three Principles independently, producing three Grades per item.
_Avoid_: criterion, check (used loosely elsewhere; "Checklist Item" is
the canonical term inside BERT docs).

**Grade**:
The 0-3 score given to one Checklist Item on one Principle. Same 4-level
scale for every Principle and every Module: `0 Absent`, `1 Ad-hoc/manual`,
`2 Partial/inconsistent`, `3 Systematic`. Deliberately generic wording so
Tested, Documented, and Automated stay comparable across Modules.
_Avoid_: score, rating (reserve for output/reporting language, not the
per-item unit itself).

**Concept** (stub, not yet designed):
A cross-cutting evaluation lens applied within a Module (candidates:
API-first, connected-by-default, Greiner-curve-by-company-size). Distinct
from a Principle (fixed, always-applied) — a Concept is an optional lens,
design deferred. See map THI-9, "Not yet specified".

## Source essays

- "From Consultancy to SaaS; a maturity model" — 5-stage Cons2SaaS curve
  (Consultancy, Automated Consultancy 2a/2b, Hybrid, Big Head SaaS, Long
  Tail SaaS), source of the per-module-stage idea and the "typical
  signals" language BERT's assessment questionnaire reuses.
- "Audit Ready Data" — coherent/consistent/audit-ready before accuracy;
  informs why BERT's checklist output (not just a summary) is the
  artifact of record.

Both essays live in the Obsidian vault under
`1 - Projects/ThisHollowEarth Products/BERT/`.
