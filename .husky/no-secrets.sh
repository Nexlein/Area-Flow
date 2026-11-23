#!/bin/sh
# Blocks commits that stage .env files or secrets. Uses gitleaks when installed (mise: gitleaks),
# otherwise falls back to a short regex list so the hook still protects a machine without it.
status=0
# One path per line, so names with spaces stay whole; quotePath off so non-ASCII names are not quoted.
staged=$(git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR)
while IFS= read -r f; do
  case "$(basename "$f")" in
    "" | .env.example) ;;
    .env | .env.*) echo "no-secrets: $f must not be committed" >&2; status=1 ;;
  esac
done <<EOF
$staged
EOF
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks git --pre-commit --staged --redact --no-banner --verbose || status=1
else
  echo "no-secrets: gitleaks not found, using the fallback regex (run: mise install, in the repo)" >&2
  # Added lines only. Patterns: Google OAuth client secrets, GitHub, Slack, AWS, OpenAI/Anthropic keys, PEM private keys.
  hits=$(git diff --cached -U0 --no-color --diff-filter=ACMR \
    | grep '^+' | grep -v '^+++' \
    | grep -nE 'GOCSPX-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|sk-(ant-|proj-)?[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----' || true)
  if [ -n "$hits" ]; then
    echo "no-secrets: staged changes contain what looks like a secret (values hidden). Unstage it, or use .env." >&2
    status=1
  fi
fi
exit $status
