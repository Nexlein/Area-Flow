# Architecture Decision Records

One short file per significant choice: why it deserved a record, context, alternatives, decision, consequences, later revisions. Built to answer a defense question in under a minute.

| Situation         | Do                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| New decision      | Copy [`0000-template.md`](0000-template.md), take the next number, add a row to the index                 |
| Decision refined  | Edit its ADR, add a History line                                                                          |
| Decision reversed | New ADR; the old one becomes `Superseded by ADR NNNN`; log it in [`../plan/README.md`](../plan/README.md) |

- Lines marked **Fact:** link their source; the rest is our reasoning.
- Alternatives are rejected **for this project**, never declared bad in general.
- First records: the three stack choices ([`../plan/`](../plan/README.md)) and the open questions of [`../architecture/`](../architecture/README.md).

## Index

| ADR                                      | Topic     | Status   | Decision                        | Questions it answers                                                      |
| ---------------------------------------- | --------- | -------- | ------------------------------- | ------------------------------------------------------------------------- |
| [0002](0002-frontend-solid-capacitor.md) | Front-end | Proposed | Solid 1.9.x and Capacitor 6.2.x | Why this UI framework and mobile approach, and what do we accept with it? |
