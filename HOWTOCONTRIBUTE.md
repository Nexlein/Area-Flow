# How to contribute

Development setup, conventions, and how to extend the product with new Services, Actions, REActions and workflow nodes. Running the product: [`README.md`](README.md).

## 1. Prerequisites

- Git and Node.js 26. With [mise](https://mise.jdx.dev), `mise install` in the repo installs the versions pinned in `mise.toml` (Node, gitleaks, actionlint, shellcheck).
- Docker and Docker Compose v2, once the stack exists.
- gitleaks is optional: without it, the pre-commit hook falls back to a short regex list.

## 2. Setup

```bash
git clone git@github.com:Nexlein/Area-Flow.git && cd Area-Flow
mise install   # optional, see above
npm install    # installs the repo tooling and enables the git hooks
```

## 3. Git flow

- `main` is the delivered branch. Never push to it directly: work on a short branch named `feat/…`, `fix/…`, `docs/…` or `chore/…`, then open a pull request into `main`.
- One issue per task ("Task" template), one pull request per issue, which closes it (`Closes #N`) and fills the PR checklist.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): subject`, with `type` among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. The `commit-msg` hook rejects other messages.
- CI must pass before merging. Never bypass the hooks with `--no-verify`.
- Once CI passes on `main`, the Epitech Mirror workflow pushes `main` to the Epitech repository, which is the one graded. It never force-pushes: never push to the Epitech repository by hand, or the mirror stops (non fast-forward).
- `.claude/codemap.md` is generated: on a merge conflict in it, or after GitHub's "Update branch" button (which runs no hook), run `npm run codemap` and commit the result.

## 4. Git hooks

Installed by `npm install` (Husky):

| Hook         | Runs                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `pre-commit` | Secret scan (gitleaks, `.env` files blocked), Prettier on staged files, code map update |
| `commit-msg` | Conventional Commits check of the first line                                            |
| `pre-push`   | `npm run check`, the same gate as CI                                                    |

## 5. Commands

| Command                | Action                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm run check`        | Formatting check and tooling tests: the gate CI and `pre-push` run           |
| `npm run format`       | Formats every tracked file with Prettier (untracked files are left alone)    |
| `npm run format:check` | Checks the formatting of tracked files without writing                       |
| `npm test`             | Tests of the repo scripts (`node --test`)                                    |
| `npm run codemap`      | Regenerates `.claude/codemap.md` from the git index: `git add` changes first |

Server, web and mobile commands are added here with the stack.

## 6. Documentation and decisions

- A technical choice: an ADR in `docs/adr/` from `0000-template.md`, indexed in its README. A reversed decision gets a new ADR; the old one points to it.
- A behavior change: update `docs/architecture/` and, for a selected feature, the row of its criterion in `docs/features/README.md`.
- A SEC feature: its evidence note in `docs/security/`, from `0000-template.md`.
- An endpoint the clients call: update the OpenAPI description in the same pull request, error responses included.
- Code, comments, commits and docs are in English.

## 7. Epitech mirror

One-time setup, done by a repository admin:

1. Generate a key pair: `ssh-keygen -t ed25519 -C "area-flow-mirror" -f area-mirror -N ""`.
2. On the Epitech repository (`EpitechPGE3-2026/G-YEP-500-MPL-5-1-area-1`), add `area-mirror.pub` as a deploy key with write access.
3. On `Nexlein/Area-Flow`, add the content of `area-mirror` as the Actions secret `SSH_PRIVATE_KEY`.
4. Delete both local files.

## 8. Extending the product

Required by the subject. Each procedure below is written once the engine exists, and must be reproducible as is: a trivial node type is added from it during the defense if ENG-EXT is selected.

### Add a Service

Files to create, how it registers, how its OAuth2 subscription is configured, how it appears in `about.json`, tests to add.

### Add an Action

Interface to implement, how its hook detects and identifies occurrences, the keys it publishes, tests to add.

### Add a REAction

Interface to implement, its parameters and their validation, the keys it publishes, side effects and retries, tests to add.

### Add a workflow node type

Interface to implement (validation and execution), registration at startup, declared keys, tests to add, what must not change in the engine.
