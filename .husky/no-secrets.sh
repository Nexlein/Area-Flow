#!/bin/sh
# Blocks commits that stage .env files or secrets. Uses gitleaks when installed (mise: gitleaks),
# otherwise falls back to a short regex list so the hook still protects a machine without it.
status=0
# git matches the names itself, so quoted, spaced or non-ASCII paths cannot slip through; .env.example is allowed.
envs=$(git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR -- \
  ':(glob)**/.env' ':(glob)**/.env.*' ':(glob)**/.envrc' ':(exclude,glob)**/.env.example')
if [ -n "$envs" ]; then
  printf '%s\n' "$envs" | sed 's/^/no-secrets: /; s/$/ must not be committed/' >&2
  status=1
fi
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks git --pre-commit --staged --redact --no-banner --verbose || status=1
else
  echo "no-secrets: gitleaks is not on PATH, using the fallback regex (mise install, then activate mise)" >&2
  # Added lines only. Patterns: Google OAuth client secrets, GitHub, Slack, AWS, OpenAI/Anthropic keys, PEM private keys,
  # private JWKs (the same rule as .gitleaks.toml). `sk-` and `d` need a non-word character before them, so words
  # such as "task-list-item" do not match.
  q="'"
  secrets='GOCSPX-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|(^|[^A-Za-z0-9_-])sk-(ant-|proj-)?[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
  jwk="(^|[^A-Za-z0-9_])[\"$q]?d[\"$q]?[[:space:]]*:[[:space:]]*[\"$q][A-Za-z0-9_-]{40,}[\"$q]"
  hits=$(git diff --cached -U0 --no-color --diff-filter=ACMR \
    | grep '^+' | grep -v '^+++' \
    | grep -cE "$secrets|$jwk" || true)
  if [ "$hits" -gt 0 ]; then
    echo "no-secrets: staged changes contain what looks like a secret (values hidden). Unstage it, or use .env:" >&2
    git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR -G"$secrets|$jwk" | sed 's/^/  /' >&2
    status=1
  fi
fi
exit $status
