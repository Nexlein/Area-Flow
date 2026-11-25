# Plan

Milestone 1 deliverables ([subject](../subject/SUBJECT.md#1-plan)), then the plan updates. Dates: [`task-breakdown.md`](task-breakdown.md).

## Milestone 1 checklist

| Deliverable                                               | File                                                     | Owner         | Status                             |
| --------------------------------------------------------- | -------------------------------------------------------- | ------------- | ---------------------------------- |
| Front-end technology selection                            | [`tech-frontend.md`](tech-frontend.md)                   | TeddyBertrand | Draft, ADR 0002 proposed           |
| Back-end technology selection                             | [`tech-backend.md`](tech-backend.md)                     | TeddyBertrand | Draft, ADR 0001 proposed           |
| Back-end language comparison (evidence only, no decision) | [`tech-backend-languages.md`](tech-backend-languages.md) | TeddyBertrand | Draft, no ADR                      |
| Persistence technology selection                          | [`tech-persistence.md`](tech-persistence.md)             | Nexlein       | Draft, ADRs 0003 and 0004 proposed |
| Features selection, rationale and ownership               | [`features-selection.md`](features-selection.md)         |               | To do                              |
| One architecture question per member                      | [`architecture-questions.md`](architecture-questions.md) |               | 1 of 4 (Nexlein)                   |
| Task breakdown                                            | [`task-breakdown.md`](task-breakdown.md), GitHub issues  |               | To do                              |
| Management method and tools                               | [`management.md`](management.md)                         |               | To do                              |

### Before the stack ADRs are accepted

| Step                                                                                               | Owner         | Issue                                                 |
| -------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------- |
| Each member scores the four matrices alone ([`scores.md`](scores.md)) and records prior experience | All four      | [#34](https://github.com/Nexlein/Area-Flow/issues/34) |
| Rerun the Android probe (F6) on Capacitor 8, commit the front-end brief and logs                   | TeddyBertrand | [#35](https://github.com/Nexlein/Area-Flow/issues/35) |
| Run the back-end cold-read questions                                                               | TeddyBertrand | [#36](https://github.com/Nexlein/Area-Flow/issues/36) |
| Settle the front-end disagreement, accept ADRs 0001 to 0004                                        | All four      | [#37](https://github.com/Nexlein/Area-Flow/issues/37) |

The three `tech-*.md` follow the shape of [`tech-backend.md`](tech-backend.md): what we compared, tests made, weighted matrix, decision (then an ADR).

Evaluators check:

- [ ] The main lines of the project are understood.
- [ ] Every member took part in the exploration.
- [ ] Stack, methods, tools and features are professionally justified.
- [ ] The plan covers the common base, the features, documentation, verification and the MVP deadline.

## Changes since the plan

Filled at the MVP and the Final.

| Date | Change | Evidence | Cost | ADR |
| ---- | ------ | -------- | ---- | --- |
