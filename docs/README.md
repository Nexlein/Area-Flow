# Documentation

Where each deliverable of the subject lives. Subject: [`subject/SUBJECT.md`](subject/SUBJECT.md) (condensed) and the PDFs next to it.

Dates (assumed: project start on 2026-11-23, the subject download date; confirm on the intranet): **Plan** 2026-11-30, **MVP** 2026-12-21, **Final** to be set.

## Milestone 1: Plan

| Deliverable                                                     | File                                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technology selection: front-end, back-end, persistence          | [`plan/tech-frontend.md`](plan/tech-frontend.md), [`plan/tech-backend.md`](plan/tech-backend.md), [`plan/tech-persistence.md`](plan/tech-persistence.md) |
| Additional features selection, learning rationale and ownership | [`plan/features-selection.md`](plan/features-selection.md)                                                                                               |
| One significant architecture question per member                | [`plan/architecture-questions.md`](plan/architecture-questions.md)                                                                                       |
| Task breakdown: actionable, scheduled, assigned, dependencies   | [`plan/task-breakdown.md`](plan/task-breakdown.md) and the GitHub issues                                                                                 |
| Project management method and tools                             | [`plan/management.md`](plan/management.md)                                                                                                               |

Checklist and status: [`plan/README.md`](plan/README.md).

## Milestone 2: MVP

| Deliverable                                            | File                                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Reproducibly deployable product                        | [`../README.md`](../README.md), section Setup                                                                  |
| Workflow end to end: trigger, 2 reactions, 1 condition | [`../README.md`](../README.md), section Operation, and [`defense.md`](defense.md), section Demos               |
| Lint, tests and build on every contribution            | [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`../HOWTOCONTRIBUTE.md`](../HOWTOCONTRIBUTE.md) |
| OpenAPI served, covering the MVP endpoints             | [`architecture/README.md`](architecture/README.md#api-contract)                                                |
| First technical documentation of the core              | [`architecture/`](architecture/README.md)                                                                      |
| Updated plan and analysis of meaningful changes        | [`plan/`](plan/README.md), section "Changes since the plan"                                                    |
| Progress on at least 1/3 of the catalogue points       | [`features/README.md`](features/README.md)                                                                     |
| Last revision of the feature selection                 | [`plan/features-selection.md`](plan/features-selection.md), section "Revision at milestone 2"                  |

## Milestone 3: Final

| Deliverable                                         | File                                                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Setup, operation, public API                        | [`../README.md`](../README.md)                                                                 |
| Extending Services, Actions, REActions and nodes    | [`../HOWTOCONTRIBUTE.md`](../HOWTOCONTRIBUTE.md)                                               |
| Workflow model and failure semantics                | [`architecture/workflow-model.md`](architecture/workflow-model.md)                             |
| Persistence model and data structures               | [`architecture/persistence-model.md`](architecture/persistence-model.md)                       |
| Selected features, where each criterion is observed | [`features/README.md`](features/README.md)                                                     |
| SEC evidence                                        | [`security/`](security/README.md)                                                              |
| Architecture decisions                              | [`adr/`](adr/README.md)                                                                        |
| Accessibility audit of both clients                 | [`accessibility/audit.md`](accessibility/audit.md)                                             |
| Two languages over the whole main flow              | [`accessibility/audit.md`](accessibility/audit.md), section Languages                          |
| Quantities S, A + R (D: features selection)         | [`../README.md`](../README.md), section Services, Actions and REActions                        |
| Final planning artifacts                            | [`plan/`](plan/README.md) and the GitHub issues and milestones                                 |
| Post-mortem                                         | [`postmortem.md`](postmortem.md)                                                               |
| Presentation, live demo, fallback recordings        | [`defense.md`](defense.md)                                                                     |
| Individual defense: one decision per member         | [`plan/architecture-questions.md`](plan/architecture-questions.md), [`defense.md`](defense.md) |

## Other technical documents

- [`architecture/auth.md`](architecture/auth.md): accounts, OIDC login, OAuth2 subscriptions, delegated credentials lifecycle.
- [`architecture/hooks.md`](architecture/hooks.md): how Actions are detected, deduplicated and scheduled.
- [`architecture/service-discovery.md`](architecture/service-discovery.md): the `about.json` catalogue schema.
