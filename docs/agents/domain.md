# Domain Docs

How the engineering skills should consume this project's domain documentation.

## Context lives in Obsidian, not in this repo

This repo holds **code** plus the agent-wiring docs in `docs/agents/`. All
project context — domain vocabulary, spec artifacts, decisions, research — lives
in the Obsidian vault:

```
/home/arjen/Desktop/obsidian/Arjen_S11/1 - Projects/ThisHollowEarth Products/BERT/
├── PROJECT_CONTEXT.md     ← read this first
├── spec/
│   ├── BERT - Domain Language.md
│   ├── BERT - Assessment Questionnaire v1.md
│   └── BERT - Research - Greiner curve and connected-by-default.md
└── <source essays>
```

## Before exploring, read these

1. **`PROJECT_CONTEXT.md`** in the vault BERT folder — summary, key decisions,
   current state, Linear issues, artifact index. Always start here.
2. **`spec/BERT - Domain Language.md`** — the canonical glossary.
3. Any `spec/` note relevant to the area you're about to work in.

There is **no `CONTEXT.md` at this repo's root and no `docs/adr/`**. Decisions
are recorded in the vault's `PROJECT_CONTEXT.md` under "Key decisions" and on
the Linear map (THI-9), not as ADR files. Don't create either; don't flag their
absence.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal,
a hypothesis, a test name), use the term as defined in
`spec/BERT - Domain Language.md`. Don't drift to the synonyms it explicitly
avoids — `Principle`, `Module`, `Checklist Item`, `Grade`, `Concept` are
load-bearing terms.

If the concept you need isn't in the glossary yet, that's a signal: either
you're inventing language the project doesn't use (reconsider) or there's a real
gap (note it, and add it to the glossary note when it's actually resolved).

## Flag decision conflicts

If your output contradicts a decision recorded in `PROJECT_CONTEXT.md` or on the
Linear map, surface it explicitly rather than silently overriding:

> _Contradicts the THI-73 decision that v1 ships stage-placement only, but worth
> reopening because…_

## Writing back

When you finish project work, update the vault's `PROJECT_CONTEXT.md` and the
Linear issue — see `AGENTS.md` and `docs/agents/issue-tracker.md`. Don't leave
decisions recorded only in a Linear comment; the vault is the durable home.
