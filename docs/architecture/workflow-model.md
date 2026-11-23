# Workflow model and failure semantics

What the subject fixes (6 bounds, validation at save, data between nodes): [`../subject/SUBJECT.md`](../subject/SUBJECT.md#workflows). Below, what we decide; each row is a rule the engine applies everywhere and a test covers.

## Our decisions

| Question                                                      | Decision | Why | ADR |
| ------------------------------------------------------------- | -------- | --- | --- |
| Is an empty branch valid?                                     |          |     |     |
| Can a condition come first, or last?                          |          |     |     |
| Key path syntax, allowed characters                           |          |     |     |
| Condition operators, and the types they compare               |          |     |     |
| Value missing at run time: fail the run, empty value, or skip |          |     |     |
| A reaction fails: stop, continue, or retry                    |          |     |     |
| Run states and transitions                                    |          |     |     |
| Two occurrences of an Action at once: order, concurrency      |          |     |     |
| Save errors returned: format, first or all                    |          |     |     |
| Workflow edited while one of its runs is in progress          |          |     |     |

## Node types

| Kind      | Configuration | Published keys | Checked at save |
| --------- | ------------- | -------------- | --------------- |
| trigger   |               |                |                 |
| reaction  |               |                |                 |
| condition |               |                |                 |

## Run lifecycle

State diagram (Mermaid `stateDiagram-v2`) once the run states are decided.

## Failure semantics

| Failure | What the user sees (web, mobile) | Recorded | Retried |
| ------- | -------------------------------- | -------- | ------- |
