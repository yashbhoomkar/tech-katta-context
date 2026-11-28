#!/usr/bin/env bash
# Print the MongoDB ledger rows for merged app PRs, ready to paste into insert-many.
# Usage (run inside a clone of yashbhoomkar/tech-katta):  bash ledger-rows.sh 417 418
# For each PR: every branch commit (from GitHub's pull/N/head ref) and the squash on main.
# Output: one JSON row per commit for frontend_git_commits, and a second list with only the
# commits that touch backend/ or content/ for backend_git_commits.
# Always check that each key is absent before inserting (find with {"key": {"$in": [...]}}).
set -euo pipefail
git fetch -q origin main
front=(); back=()
for n in "$@"; do
  git fetch -q origin "pull/$n/head:refs/tmp/pr$n"
  squash=$(git log origin/main --format='%H %s' | grep -E "\(#$n\)\$" | head -1 | cut -d' ' -f1)
  [ -z "$squash" ] && { echo "PR #$n: no squash on main (not merged?)" >&2; continue; }
  d=$(git log -1 --format=%ad --date=short "$squash")
  for h in $(git log --reverse --format=%H "origin/main..refs/tmp/pr$n") "$squash"; do
    s=$(git log -1 --format=%s "$h" | sed 's/"/\\"/g; s/ (#[0-9]*)$//')
    [ "$h" = "$squash" ] && s="Squash: $s"
    row="{\"key\": \"$h\", \"value\": \"$s (PR #$n, $d)\"}"
    front+=("$row")
    if git diff-tree --no-commit-id --name-only -r -m "$h" | grep -qE '^(backend|content)/'; then
      [ "$(git rev-list --parents -n1 "$h" | wc -w)" -le 2 ] && back+=("$row")   # merges stay frontend-only
    fi
  done
done
echo "frontend_git_commits:"; printf '%s\n' "${front[@]}" | paste -sd, | sed 's/^/[/; s/$/]/'
echo "backend_git_commits:";  printf '%s\n' "${back[@]:-}"  | grep . | paste -sd, | sed 's/^/[/; s/$/]/' || echo "[]"
