#!/bin/sh
# Claude Code PostToolUse hook: formats each file Claude edits with the repo's Prettier.
# Exit 2 sends the remaining errors back to Claude so it fixes them; other files are left alone.
# Add the stack's linters here (one case per language) once they are chosen.
# Paths use forward slashes from here on: on Windows, Claude Code passes backslashes, which the case patterns never match.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write((JSON.parse(s).tool_input?.file_path??"").replace(/\\/g,"/"))}catch{}})')
[ -f "$file" ] || exit 0
root=$(printf '%s' "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" | tr '\134' '/')
bin="$root/node_modules/.bin"
[ -x "$bin/prettier" ] || exit 0

case "$file" in
  "$root"/node_modules/* | "$root"/.claude/codemap.md) exit 0 ;;
  "$root"/*.ts | "$root"/*.tsx | "$root"/*.js | "$root"/*.jsx | "$root"/*.mjs | "$root"/*.json | "$root"/*.json5 | "$root"/*.md | \
  "$root"/*.css | "$root"/*.scss | "$root"/*.html | "$root"/*.yml | "$root"/*.yaml)
    out=$(cd "$root" && "$bin/prettier" --write --log-level warn "$file" 2>&1) ;;
  *) exit 0 ;;
esac || { printf '%s\n' "$out" >&2; exit 2; }
exit 0
