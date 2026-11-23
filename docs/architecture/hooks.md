# Hooks

**Status:** To design. How events are identified, scheduled and persisted is an architecture decision to document and defend (subject).

Hooks detect Actions and start the matching workflows with no client open, and never treat the same occurrence as new twice.

## Detection

| Mode                     | When we use it | Limits (rate limits, latency, public URL needed) |
| ------------------------ | -------------- | ------------------------------------------------ |
| Polling                  |                |                                                  |
| Webhook from the Service |                |                                                  |
| Push or streaming API    |                |                                                  |

## Event identity and deduplication

- What identifies an occurrence, per Action (Service id, timestamp, hash...).
- Where seen occurrences or cursors are stored, and for how long.
- What happens on the first activation of a workflow: past events ignored or replayed.

## Scheduling

- What runs the hooks, at which interval, and how it survives a server restart.
- Timeouts and behavior when a Service is slow or down.

## Per Action

| Service | Action | Detection | Event identity | Interval |
| ------- | ------ | --------- | -------------- | -------- |
