# Area-Flow — AREA (Epitech Tek3)

Epitech Tek3 software architecture project (G-YEP-500): an automation platform inspired by IFTTT and Zapier. An application server holds all business logic (accounts, OAuth2 subscriptions to Services, a workflow engine, hooks that detect Actions and run REActions); a web client builds workflows; an Android client monitors them. Group: Nexlein, Saitamadupauvre (M = 2).

---

## Start here (save tokens)

@.claude/codemap.md
@docs/subject/SUBJECT.md

- `.claude/codemap.md`: generated map of every tracked file with its purpose. Read it before searching; open only the files it points to.
- `docs/subject/SUBJECT.md`: the condensed subject (what is graded). `docs/subject/FEATURES.md`: the 24 additional features and their acceptance criteria; read only the section you need. The PDFs next to them are the originals and win over the Markdown.
- `docs/README.md`: which file holds each deliverable, per milestone. `docs/plan/README.md`: Milestone 1 checklist and status.
- `docs/adr/`: decisions. Accepted ones are settled: do not re-open them unless the user asks.

---

## Current state

Milestone 1 (Plan), due 2026-11-30 (assumed start 2026-11-23). The stack is **not chosen**: do not scaffold server, web or mobile code, nor name a technology as chosen, before the selection documents in `docs/plan/` conclude and their ADRs are accepted. The repository holds only tooling and documentation skeletons.

---

## Rules that must not break

- Business logic lives in the server only; clients present and interact. Client and server are separate codebases: the subject strongly discourages full-stack frameworks, and we follow it.
- The OpenAPI description covers every endpoint the clients call, errors included. Change it in the same change as the endpoint; a test checks they agree.
- The builder is web only. The Android client lists, enables and disables workflows and shows their runs; it never builds them.
- Key path substitution replaces data only, never evaluates user input. References to undeclared keys are rejected at save.
- Third-party tokens are never sent to a client, never logged, never committed. No secret or personal data in the repository; secrets come from the environment only, never read `.env` files.
- Every Service, Action and REAction must serve a real use case: never add one only to reach a count.
- A feature counts only when every acceptance criterion is observable: track them in `docs/features/README.md`.

---

## Commands

- `npm install`: repo tooling (Husky, lint-staged, Prettier) and git hooks.
- `npm run check`: formatting and tooling tests; `pre-push` and CI run it. `npm run format`, `npm test`, `npm run codemap`.
- Done means: `npm run check` passes, docs and ADRs touched by the change are updated. Stack commands are added here once chosen.

---

## Conventions

- Code, comments, commits and docs: English.
- Git: `main` + short branches (`feat/…`, `fix/…`, `docs/…`, `chore/…`) and pull requests into `main`; CI green, then the mirror pushes `main` to `EpitechPGE3-2026/G-YEP-500-MPL-5-1-area-1`. Conventional Commits (enforced by `.husky/commit-msg`). Never `--no-verify`, never force-push, never push without being asked.
- Hooks: pre-commit runs the secret scan, lint-staged and the code map; `.claude/hooks/format-on-edit.sh` runs Prettier on every file Claude edits (exit 2 means an error is left to fix).
- Decisions: new ADR from `docs/adr/0000-template.md`; a refined decision edits its ADR, a reversed one gets a new ADR. SEC features: evidence note from `docs/security/0000-template.md`. Plan changes: table in `docs/plan/README.md`.
- Every source file starts with a comment whose first sentence states its purpose: the code map shows it.
- Generated, never edit by hand: `.claude/codemap.md`. It reads the git index: `git add` changes before `npm run codemap`; on a merge conflict in it, regenerate it.
- Ask before adding a dependency, with a one-line justification.
