# Area-Flow

Epitech Tek3 AREA (G-YEP-500): an IFTTT-like automation platform. Server (all business logic), web client (builds workflows), Android client (monitors them). Team: Nexlein, Saitamadupauvre, TeddyBertrand, Quinceyyyy (M = 4).

## Current state

Milestone 1 (Plan; dates: [`docs/plan/task-breakdown.md`](docs/plan/task-breakdown.md#timeline)). **Stack proposed, not accepted:** Fastify ([ADR 0001](docs/adr/0001-backend-fastify.md)), Solid with Capacitor ([ADR 0002](docs/adr/0002-frontend-solid-capacitor.md)), PostgreSQL ([ADR 0003](docs/adr/0003-persistence-postgresql.md)) with Prisma ([ADR 0004](docs/adr/0004-access-layer-prisma.md)). Write "proposed", never "chosen". No server, web or mobile code until the team accepts them; what is left before that: [`docs/plan/README.md`](docs/plan/README.md).

## Read when needed

| Before you…            | Read                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| search or open code    | `.claude/codemap.md`: generated map of tracked files, with line count and purpose when known   |
| touch a requirement    | `docs/subject/SUBJECT.md`; a feature: its section of `docs/subject/FEATURES.md`. The PDFs win. |
| look for a deliverable | `docs/README.md`                                                                               |
| re-open a choice       | `docs/adr/`: accepted ADRs are settled unless the user asks                                    |
| branch, commit, PR     | `HOWTOCONTRIBUTE.md`                                                                           |

## Rules

Product and code:

- Business logic in the server only; clients and server are separate codebases.
- The OpenAPI description changes with its endpoint, errors included.
- Key path substitution replaces data, never evaluates input; undeclared keys are rejected at save.
- Third-party tokens never reach a client, a log or the repository. Never read `.env` files.
- Every Service, Action and REAction serves a real use case, never a count.
- TypeScript only, no JavaScript files. Every source file starts with a comment whose first sentence is its purpose (Markdown: its first heading, or a leading `<!-- -->` comment).
- Code, comments, commits and docs in English.

Git:

- Branch from `dev`, pull requests into `dev`. `main` takes release PRs from `dev` and Dependabot security updates only; after a security update, merge `main` back into `dev` (HOWTOCONTRIBUTE.md).
- Commits and pull request titles follow Conventional Commits; the `commit-msg` hook and CI check them.
- Never `--no-verify`, never force-push, never push without being asked, never push to the Epitech repository by hand (the mirror does it). Ask before adding a dependency. The deny list of `.claude/settings.json` is a guard, not a guarantee.
- Never add a `Co-Authored-By` trailer or any generated-by attribution line to a commit message or a pull request description.
- Never edit `.claude/codemap.md` by hand: `npm run codemap` (it reads the git index).

Docs and ADRs:

- Short and table-first: tables, lists, diagrams; prose only where a table would lose the reasoning. One place per fact (dates: `docs/plan/task-breakdown.md`); link it instead of copying it.
- `docs/subject/*.md` restate the PDFs and never add a requirement; only `BOOTSTRAP.md` also maps each bootstrap output to our files, with its status.
- ADR choices are the team's: propose options with trade-offs, never mark an ADR `Accepted` yourself. Each ADR, from `docs/adr/0000-template.md`:
  - one decision per ADR, alternatives rejected "for this project";
  - Consequences as `| Cost or limit | How we survive it |`, with no invented reason ("—" when there is no remedy);
  - `Fact:` lines with a source;
  - a History line for every change; a reversal is a new ADR.
- Every member defends the project orally, so what you write must be explainable by the user who asked for it.

Personal preferences for your own agent (style, level of detail) go in `CLAUDE.local.md`, which is gitignored and not shared.

## Commands

`npm run check` (format, typecheck, tests; pre-push and CI run it) · `npm run format` · `npm run codemap` · `npm test`

Done = the issue's "Done when" is met, `npm run check` passes, and the docs and ADRs the change touches are updated.
