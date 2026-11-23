# Project management: method and tools

**Status:** Draft

## Method

| Option considered | Fits a two-person team over a few weeks because | Does not fit because |
| ----------------- | ----------------------------------------------- | -------------------- |
|                   |                                                 |                      |

**Chosen:** method, and why, in two or three lines.

## Rituals

When we sync, plan, review and look back, and how long each takes.

## Tools

Already set up in the repository:

| Need                     | Tool                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| Task tracking            | GitHub Issues ("Task" template), milestones                             |
| Code review              | GitHub pull requests (template with checklist)                          |
| Automation               | GitHub Actions (CI, Epitech mirror), Dependabot, Renovate (`mise.toml`) |
| Documentation, decisions | Markdown in `docs/`, ADRs in `docs/adr/`                                |
| Local quality gates      | Husky hooks: secret scan, Prettier, commit format                       |

To choose: board view (GitHub Projects or other), communication, design mock-ups.

## Working agreement

- Every task is an issue; every change is a pull request that closes its issue.
- Definition of done: the issue's "Done when" is observable, checks pass, docs and ADRs are updated.
- Git flow and conventions: [`../../HOWTOCONTRIBUTE.md`](../../HOWTOCONTRIBUTE.md).
