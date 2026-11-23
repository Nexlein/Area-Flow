# Architecture

**Status:** Skeleton. The stack is chosen in [`../plan/`](../plan/README.md); a first version of this documentation is due at the MVP.

## Components

Diagram (Mermaid) and one line per container of the Docker Compose stack, once decided. Boundaries fixed by the subject:

- **Application server**: all business logic: accounts, subscriptions, workflow engine, hooks, `about.json`, OpenAPI.
- **Web client**: presentation, the builder (web only).
- **Android client**: presentation; lists, enables, disables workflows and shows their runs; server address configurable.
- **Docker Compose**: builds and runs everything, server and web reachable locally, Android APK produced.

## API contract

The OpenAPI description is the contract between client and server members.

- Where it lives, and whether it is written first (contract-first) or generated from the code: ADR.
- Where it is served, with its browsable interface: URL.
- The test that fails when implementation and description disagree: file, and what it checks (routes, request and response schemas, error responses).
- Error format shared by every endpoint.

## Documents

| Document                                       | Covers                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`workflow-model.md`](workflow-model.md)       | Nodes, validation at save, key paths, run lifecycle, failure semantics              |
| [`persistence-model.md`](persistence-model.md) | Entities, relations, important data structures, retention                           |
| [`auth.md`](auth.md)                           | Local accounts, OIDC login, identity linking, OAuth2 subscriptions, token lifecycle |
| [`hooks.md`](hooks.md)                         | Action detection, event identity and deduplication, scheduling                      |
| [`service-discovery.md`](service-discovery.md) | `about.json` schema and versioning                                                  |
