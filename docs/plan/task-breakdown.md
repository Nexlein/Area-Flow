# Task breakdown

Source of truth: the GitHub issues of [Nexlein/Area-Flow](https://github.com/Nexlein/Area-Flow/issues), one per task, opened from the "Task" template: goal, "Done when", owner, due date, estimate, dependencies (also set as "blocked by"). Each issue belongs to a GitHub milestone (Plan, MVP, Final) and to an epic. This file gives the overview and the critical path; the issues hold the detail.

## Milestones

| Milestone | Due        | Must contain                                                                                   |
| --------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Plan      | 2026-11-30 | The subject's five deliverables (7 files, [`README.md`](README.md))                            |
| MVP       | 2026-12-21 | Deployable product, one workflow with trigger + 2 reactions + condition, CI, OpenAPI, 1/3 of D |
| Final     | to set     | Everything, docs, audit, post-mortem, defense                                                  |

Dates assume a start on 2026-11-23: confirm on the intranet.

## Epics

Starting structure drawn from the subject (our proposal, to adjust once the stack is chosen):

| Epic                | Covers                                                                             | Owner | Issue |
| ------------------- | ---------------------------------------------------------------------------------- | ----- | ----- |
| Plan                | Technology selections, features selection, architecture questions, management      |       |       |
| Tooling and CI      | Repository, CI (lint, tests, build), Docker Compose stack, automated deployment    |       |       |
| Server core         | HTTP API and OpenAPI contract, accounts, local and OIDC login                      |       |       |
| Workflow engine     | Model, validation at save, key paths, execution, failure semantics                 |       |       |
| Services and hooks  | Service subscriptions (OAuth2), Actions, REActions, hooks, `about.json`            |       |       |
| Web client          | Login, subscriptions, builder, runs, i18n, WCAG AA                                 |       |       |
| Mobile client       | Server address, login, workflow list, enable and disable, runs, i18n, WCAG AA, APK |       |       |
| Additional features | One sub-epic per selected feature                                                  |       |       |
| Docs and defense    | README, HOWTOCONTRIBUTE, architecture docs, accessibility audit, post-mortem, demo |       |       |

## Critical path

The chain of dependent tasks that sets the MVP date, once the issues exist.

## Assignment balance

Share of tasks and estimated effort per member, checked at each milestone.

| Member          | Tasks | Estimate |
| --------------- | ----- | -------- |
| Nexlein         |       |          |
| Saitamadupauvre |       |          |
