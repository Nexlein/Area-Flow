# Project management: method and tools

**Status:** Draft

## Method

| Option considered | Fits a two-person team over a few weeks because | Does not fit because |
| ----------------- | ----------------------------------------------- | -------------------- |
|                   |                                                 |                      |

**Chosen:** method and why, in two or three lines.

| Ritual | When | Length |
| ------ | ---- | ------ |

## Tools

| Need                     | Tool                                                                           | Status    |
| ------------------------ | ------------------------------------------------------------------------------ | --------- |
| Task tracking            | GitHub Issues ("Task" template), milestones Plan / MVP / Final                 | Set up    |
| Board view               |                                                                                | To choose |
| Code review              | GitHub pull requests: template, CI required, 1 approval                        | Set up    |
| Automation               | GitHub Actions (CI, Epitech mirror), Dependabot, Renovate (`mise.toml`)        | Set up    |
| Local quality gates      | Husky hooks: secret scan, Prettier, typecheck and tests on push, commit format | Set up    |
| Documentation, decisions | Markdown in `docs/`, ADRs in `docs/adr/`                                       | Set up    |
| Communication            |                                                                                | To choose |
| Mock-ups                 |                                                                                | To choose |

## Working agreement

Every task is an issue; every change is a pull request that closes it. Done = the issue's "Done when" is observable, checks pass, docs and ADRs updated. Git flow: [`../../HOWTOCONTRIBUTE.md`](../../HOWTOCONTRIBUTE.md).
