# Architecture Decision Records

One short file per significant technical choice: what we decided, why, what it costs and what we rejected. Written to answer a defense question in under a minute: find the question below, open the ADR, read Decision and Alternatives.

- Lines marked **Fact:** link their source. Everything else is our own reasoning, to defend at the review.
- New decision: copy [`0000-template.md`](0000-template.md), take the next number, add a row to the index.
- A decision is refined (a new measurement, a clarified limit): edit its ADR and say so in its history.
- A decision is reversed: write a new ADR, set the old one to `Superseded by ADR NNNN`, and explain the change in the plan update ([`../plan/README.md`](../plan/README.md)).
- Alternatives are rejected **for this project**, never declared bad in general (ENG-ADR).

## Index

| ADR | Topic | Status | Decision | Questions it answers |
| --- | ----- | ------ | -------- | -------------------- |

## Expected first records

From the subject, these choices need a record (our list, not the subject's):

- Front-end, back-end and persistence stacks, concluding the three selection documents of [`../plan/`](../plan/README.md).
- Workflow engine: model, validation at save, key path substitution, failure semantics.
- Hooks: detection (polling, webhooks), event identity and deduplication, scheduling.
- Delegated credentials: storage, refresh, revocation.
- API contract: how the OpenAPI description is produced and tested against the implementation.
- Service discovery schema and its versioning.
- Container layout of the Docker Compose stack.
