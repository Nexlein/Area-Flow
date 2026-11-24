# Architecture Decision Records

One short file per significant choice: why it deserved a record, context, alternatives, decision, consequences, later revisions. Built to answer a defense question in under a minute.

| Situation         | Do                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| New decision      | Copy [`0000-template.md`](0000-template.md), take the next number, add a row to the index                 |
| Decision refined  | Edit its ADR, add a History line                                                                          |
| Decision reversed | New ADR; the old one becomes `Superseded by ADR NNNN`; log it in [`../plan/README.md`](../plan/README.md) |

- Lines marked **Fact:** link their source; the rest is our reasoning.
- Alternatives are rejected **for this project**, never declared bad in general.
- Records so far: the stack (0001 to 0004, [`../plan/`](../plan/README.md)). Next: the open questions of [`../architecture/`](../architecture/README.md).

## Index

| ADR                                      | Topic                 | Status   | Decision                                       | Questions it answers                                                      |
| ---------------------------------------- | --------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| [0001](0001-backend-fastify.md)          | Back-end framework    | Proposed | Fastify 5.12.x, TypeScript                     | Why this server framework, and what do we accept with it?                 |
| [0002](0002-frontend-solid-capacitor.md) | Front-end             | Proposed | Solid 1.9.x and Capacitor 8.x (6.2.x fallback) | Why this UI framework and mobile approach, and what do we accept with it? |
| [0003](0003-persistence-postgresql.md)   | Persistence           | Proposed | PostgreSQL 18.x                                | Why this database, and what do we accept with it?                         |
| [0004](0004-access-layer-prisma.md)      | Database access layer | Proposed | Prisma 7.10.x                                  | Why this ORM over plain SQL, and what do we accept with it?               |
