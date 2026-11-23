# Workflow model and failure semantics

**Status:** To design. The workflow engine deserves an ADR (required by ENG-ADR if selected).

## Fixed by the subject

[`../subject/SUBJECT.md`](../subject/SUBJECT.md#workflows), in short: one trigger, a linear chain of reactions, at most one condition (not nested) with two branches that end the workflow and never merge; no structural maximum on reactions (the demo needs at least four); validity checked at save; key paths reference declared keys only, are checked at save, and substitution never evaluates code; missing values handled deterministically.

## Our decisions

Each row is a rule the engine applies everywhere; tests cover it.

| Question                                                                 | Decision | Why | ADR |
| ------------------------------------------------------------------------ | -------- | --- | --- |
| Is an empty branch valid?                                                |          |     |     |
| Can a condition be the last node, or the first after the trigger?        |          |     |     |
| Key path syntax and allowed characters                                   |          |     |     |
| Condition operators and the types they compare                           |          |     |     |
| A value missing at run time: fail the run, empty value, or skip the node |          |     |     |
| A reaction fails: stop the run, continue, or retry                       |          |     |     |
| Run states and their transitions                                         |          |     |     |
| Two occurrences of the same Action arrive together: order, concurrency   |          |     |     |
| Validation errors returned at save: format, one or all errors            |          |     |     |
| A workflow is edited while one of its runs is in progress                |          |     |     |

## Node types

| Kind      | Configuration | Published keys | Validation at save |
| --------- | ------------- | -------------- | ------------------ |
| trigger   |               |                |                    |
| reaction  |               |                |                    |
| condition |               |                |                    |

## Run lifecycle

State diagram (Mermaid) once the run states are decided.

## Failure semantics

What the user sees for each failure (in the web and mobile clients), what is recorded, what is retried.
