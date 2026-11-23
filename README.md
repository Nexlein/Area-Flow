# Area-Flow

[![CI](https://github.com/Nexlein/Area-Flow/actions/workflows/ci.yml/badge.svg)](https://github.com/Nexlein/Area-Flow/actions/workflows/ci.yml)
[![Epitech Mirror](https://github.com/Nexlein/Area-Flow/actions/workflows/mirror.yml/badge.svg)](https://github.com/Nexlein/Area-Flow/actions/workflows/mirror.yml)

> **Epitech Tek3 AREA project.** An automation platform inspired by IFTTT and Zapier: users connect their accounts on third-party Services and build workflows in which an Action detected in one Service triggers REActions in others, with an optional condition.

**Status:** Milestone 1 (Plan). The stack is being chosen: [`docs/plan/`](docs/plan/README.md).

---

## Components

| Component          | Role                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Application server | Business logic: accounts, Service subscriptions, workflow engine, hooks, OpenAPI          |
| Web client         | Uses the server from a browser; hosts the workflow builder                                |
| Android client     | Lists workflows, enables and disables them, shows their runs; server address configurable |

## Setup

To be written with the stack. Target: one Docker Compose command builds and runs the whole product.

```bash
git clone git@github.com:Nexlein/Area-Flow.git && cd Area-Flow
# cp .env.example .env, then docker compose up --build (once the stack exists)
```

| Endpoint or artifact             | Where |
| -------------------------------- | ----- |
| Server API                       | TBD   |
| OpenAPI description and UI       | TBD   |
| Service catalogue (`about.json`) | TBD   |
| Web client                       | TBD   |
| Android APK                      | TBD   |

## Operation

How to create an account, subscribe to a Service, build a workflow and follow its runs: TBD.

## Public API

Served by the server as an OpenAPI description with a browsable interface (URL TBD). It covers every endpoint the clients call, error responses included, and a test checks it against the implementation.

## Services, Actions and REActions

| Service | Auth | Actions | REActions |
| ------- | ---- | ------- | --------- |

**Counts**, on the less complete client (subject minimums for M = 2): S = 0 / 3, of which via OAuth2 0 / 2; A + R = 0 / 6. Feature difficulty D: [`docs/plan/features-selection.md`](docs/plan/features-selection.md).

## Documentation

- [`HOWTOCONTRIBUTE.md`](HOWTOCONTRIBUTE.md): development setup, conventions, and how to add Services, Actions, REActions and workflow nodes.
- [`docs/`](docs/README.md): plan, architecture, decisions (ADRs), selected features, security evidence, accessibility audit.
- [`docs/subject/`](docs/subject/README.md): the Epitech subject.

## Project structure

```
├── .claude/       # Agent settings, formatting hook, generated code map
├── .github/       # CI, Epitech mirror, Dependabot, PR and issue templates
├── .husky/        # Git hooks: secret scan, formatting, commit format, pre-push check
├── docs/          # Subject, plan, architecture, ADRs, features, security, accessibility
├── scripts/       # Code map generator and its test
├── CLAUDE.md      # Agent instructions and project rules
└── HOWTOCONTRIBUTE.md
```

## Team

Nexlein, Saitamadupauvre.
