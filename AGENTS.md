## Agent skills

### Issue tracker

Issues and specs live in Linear, team Thishollowearth (THI), project BERT. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Project context lives in the **Obsidian vault**, not in this repo:
`~/Desktop/obsidian/Arjen_S11/1 - Projects/ThisHollowEarth Products/BERT/`.
Read its `PROJECT_CONTEXT.md` first, then `spec/`. There is no root
`CONTEXT.md` and no `docs/adr/` — don't create them. See `docs/agents/domain.md`.

### Where things live

- **Obsidian** — context, thinking, spec artifacts, decisions, persistence.
- **Linear** (team THI, project BERT) — issue tracking only.
- **This repo** — code, plus the `docs/agents/` wiring that tells agents how to
  drive the other two.

When you finish project work, update the vault's `PROJECT_CONTEXT.md` **and**
the Linear issue.
