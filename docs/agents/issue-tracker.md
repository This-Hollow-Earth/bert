# Issue tracker: Linear

Issues and specs for this repo live as Linear issues. Use the `linear` CLI
(Hermes's Linear skill, authenticated as Donny) for all operations.

- Team: **Thishollowearth** (key `THI`, id `2cb76ff3-9953-4ab4-a2b9-237e306c82b3`)
- Project: **BERT** (id `97c6a0e0-e2e9-4a57-b6eb-562bdc95ee40`)

## Conventions

- Create: `linear issue create --title "..." --team THI --project-id 97c6a0e0-e2e9-4a57-b6eb-562bdc95ee40 --body "..."`
- View: `linear issue view THI-<n>`
- Comment: `linear comment add THI-<n> --body "..."`
- Update state/assignee: `linear issue update THI-<n> --state "..."` / `--assignee ...`
- There is no `issue list`/`close` subcommand yet in the CLI — use `--state` updates
  (e.g. "Done", "Canceled") in place of closing, and query issues via raw GraphQL
  (`linear.py`'s `_gql` helper) when a list is needed.

## Pull requests as a triage surface

No. This repo's issue tracker is Linear; GitHub PRs (if any) are not treated as
triage input.

## When a skill says "publish to the issue tracker"

Create a Linear issue in project BERT, team Thishollowearth.

## When a skill says "fetch the relevant ticket"

Run `linear issue view THI-<n>`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Linear issue; tickets are its children.

- **Map**: `linear issue create --title "..." --team THI --project-id <BERT id>`.
  Labelling failed: Donny's OAuth app gets `403 not allowed to take action` on
  `issueLabelCreate` (label creation needs workspace-admin scope the app
  doesn't have). **Fallback: body/title convention.** Prefix the map's title
  with `[wayfinder:map]` instead of a label. If Arjen creates the
  `wayfinder:map` / `wayfinder:<type>` labels manually in the Linear UI once,
  switch back to `issueAddLabel` (which only *adding* an existing label may
  permit, even if *creating* one doesn't — untested).
- **Child ticket**: create as a normal issue in the same team/project, then set
  its `parentId` to the map's issue id via raw GraphQL (`issueUpdate(id: ..., input: { parentId: ... })`)
  — the CLI has no `--parent` flag yet. Prefix its title with
  `[wayfinder:<type>]` (`research`/`prototype`/`grilling`/`task`) instead of a
  label, per the same fallback.
- **Blocking**: Linear supports native issue relations (`blocks`/`blocked by`)
  via the `issueRelationCreate` GraphQL mutation (type: `blocks`), which is
  UI-visible. Prefer this over a body convention. Fall back to a
  `Blocked by: THI-<n>` line at the top of the child body only if the mutation
  is unavailable.
- **Frontier query**: via GraphQL, list the map's children (issues with
  `parent.id == <map id>`), filter to `state` not in a "done/canceled" category,
  no blocking relation still open, and no assignee.
- **Claim**: `linear issue update THI-<n> --assignee <driving dev>`.
- **Resolve**: `linear comment add THI-<n> --body "<answer>"`, then
  `linear issue update THI-<n> --state "Done"`, then append a context pointer
  to the map's Decisions-so-far.
