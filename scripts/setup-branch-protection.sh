#!/usr/bin/env bash
# setup branch protection rules for the main branch
# usage: bash scripts/setup-branch-protection.sh
#
# prerequisites:
#   - gh CLI installed and authenticated (https://cli.github.com/)
#   - admin access to the repository
#
# this script is idempotent — safe to re-run at any time.

set -euo pipefail

REPO="sunnypatell/culturelens"
BRANCH="main"

echo "🔒 setting up branch protection for $REPO ($BRANCH)..."

gh api \
  --method PUT \
  "repos/$REPO/branches/$BRANCH/protection" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "validate",
      "frontend test",
      "frontend lint",
      "frontend format",
      "frontend typecheck"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": {
    "users": ["sunnypatell"],
    "teams": []
  },
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false
}
EOF

echo "✅ branch protection applied successfully!"
echo ""
echo "rules enforced:"
echo "  • PRs required before merging"
echo "  • 1 approval required (CODEOWNERS: @sunnypatell)"
echo "  • stale reviews dismissed on new pushes"
echo "  • status checks: validate, frontend test/lint/format/typecheck"
echo "  • push access restricted to @sunnypatell"
echo "  • force pushes and branch deletion blocked"
