# Area-Flow

Epitech Tek3 AREA (G-YEP-500): an IFTTT-like automation platform. Server (all business logic), web client (builds workflows), Android client (monitors them). Team: Nexlein, Saitamadupauvre, TeddyBertrand, Quinceyyyy (M = 4).

## Current state

Milestone 1 (Plan). **Stack not chosen**: no server, web or mobile code, and no technology named as chosen, until `docs/plan/tech-*.md` conclude and their ADRs are accepted.

## Read when needed

| Before you…            | Read                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| search or open code    | `.claude/codemap.md`: generated map of tracked files, with line count and purpose when known   |
| touch a requirement    | `docs/subject/SUBJECT.md`; a feature: its section of `docs/subject/FEATURES.md`. The PDFs win. |
| look for a deliverable | `docs/README.md`                                                                               |
| re-open a choice       | `docs/adr/`: accepted ADRs are settled unless the user asks                                    |
| branch, commit, PR     | `HOWTOCONTRIBUTE.md`                                                                           |

## Rules

- Business logic in the server only; clients and server are separate codebases.
- The OpenAPI description changes with its endpoint, errors included.
- Key path substitution replaces data, never evaluates input; undeclared keys are rejected at save.
- Third-party tokens never reach a client, a log or the repository. Never read `.env` files.
- Every Service, Action and REAction serves a real use case, never a count.
- TypeScript only, no JavaScript files. Every source file starts with a comment whose first sentence is its purpose.
- Branch from `dev`, pull requests into `dev`; `main` only takes release PRs from `dev`.
- Never `--no-verify`, never force-push, never push without being asked. Ask before adding a dependency.
- Never add a `Co-Authored-By` trailer or any generated-by attribution line to a commit message or a pull request description.
- ADR choices are the team's: propose options with trade-offs, never mark an ADR `Accepted` yourself.
- Never edit `.claude/codemap.md` by hand: `npm run codemap` (it reads the git index).
- Every member defends the project orally, so what you write must be explainable by the user who asked for it.

Personal preferences for your own agent (style, level of detail) go in `CLAUDE.local.md`, which is gitignored and not shared.

## Commands

`npm run check` (format, typecheck, tests; pre-push and CI run it) · `npm run format` · `npm run codemap` · `npm test`

Done = `npm run check` passes, and the docs and ADRs the change touches are updated.
