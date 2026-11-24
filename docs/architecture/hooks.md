# Hooks

Hooks detect Actions and start the matching workflows with no client open, never treating the same occurrence as new twice. How events are identified, scheduled and persisted is ours to decide and defend (subject).

## Decisions

| Question                                                           | Answer                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detection modes used: polling, webhooks, push or streaming APIs    |                                                                                                                                                                                                                                                                  |
| What identifies an occurrence (Service id, timestamp, hash...)     |                                                                                                                                                                                                                                                                  |
| Where seen occurrences or cursors are stored, and for how long     | A table with a unique (workflow, occurrence) key, so the database decides what is new (probe P2 of the [persistence brief](../plan/spikes/persistence/brief.md#probes); store: [ADR 0003](../adr/0003-persistence-postgresql.md), proposed); how long: to decide |
| First activation of a workflow: past events ignored or replayed    |                                                                                                                                                                                                                                                                  |
| What runs the hooks, at which interval; surviving a server restart |                                                                                                                                                                                                                                                                  |
| Timeouts; a Service slow or down                                   |                                                                                                                                                                                                                                                                  |

## Per Action

| Service | Action | Detection | Event identity | Interval |
| ------- | ------ | --------- | -------------- | -------- |
