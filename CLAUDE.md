# Area-Flow

Epitech Tek3 AREA (G-YEP-500): an IFTTT-like automation platform. Server (all business logic), web client (builds workflows), Android client (monitors them). Team: Nexlein, Saitamadupauvre (M = 2).

## Current state

Milestone 1 (Plan). **Stack not chosen**: no server, web or mobile code, and no technology named as chosen, until `docs/plan/tech-*.md` conclude and their ADRs are accepted.

## Read when needed

| Before you…            | Read                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| search or open code    | `.claude/codemap.md`: generated map of every file and its purpose                              |
| touch a requirement    | `docs/subject/SUBJECT.md`; a feature: its section of `docs/subject/FEATURES.md`. The PDFs win. |
| look for a deliverable | `docs/README.md`                                                                               |
| re-open a choice       | `docs/adr/`: accepted ADRs are settled unless the user asks                                    |
| branch, commit, doc    | `HOWTOCONTRIBUTE.md`                                                                           |

## Rules

- Business logic in the server only; clients and server are separate codebases.
- The OpenAPI description changes with its endpoint, errors included.
- Key path substitution replaces data, never evaluates input; undeclared keys are rejected at save.
- Third-party tokens never reach a client, a log or the repository. Never read `.env` files.
- Every Service, Action and REAction serves a real use case, never a count.
- TypeScript only, no JavaScript files. Every source file starts with a comment whose first sentence is its purpose.
- Never `--no-verify`, never force-push, never push without being asked. Ask before adding a dependency.
- Never edit `.claude/codemap.md` by hand: `npm run codemap` (it reads the git index).

## Commands

`npm run check` (format, typecheck, tests; pre-push and CI run it) · `npm run format` · `npm run codemap` · `npm test`

Done = `npm run check` passes, and the docs and ADRs the change touches are updated.
