#!/usr/bin/env bash
#
# Build the game and publish dist/ to the gh-pages branch for GitHub Pages.
#
# Usage: ./deploy.sh [--push]
#
# Leaves you on your original branch. With --push, also pushes gh-pages to origin.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

DEPLOY_BRANCH="gh-pages"
SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
STAGING=""
SHOULD_PUSH=false

if [[ "${1:-}" == "--push" ]]; then
    SHOULD_PUSH=true
elif [[ -n "${1:-}" ]]; then
    echo "Usage: ./deploy.sh [--push]" >&2
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Warning: you have uncommitted changes on $SOURCE_BRANCH." >&2
    echo "         Deploy will still run; only the built dist/ output is published." >&2
    echo "" >&2
fi

restore_source_branch() {
    if [[ -n "$STAGING" && -d "$STAGING" ]]; then
        rm -rf "$STAGING"
        STAGING=""
    fi

    local current
    current="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
    if [[ -n "$current" && "$current" != "$SOURCE_BRANCH" ]]; then
        git checkout "$SOURCE_BRANCH"
    fi
}

trap restore_source_branch EXIT

echo "🎮 Building..."
bun run build

STAGING="$(mktemp -d)"
cp -a dist/. "$STAGING/"

echo "📦 Staged build in temporary directory"

echo "🌿 Switching to $DEPLOY_BRANCH..."
git fetch origin "$DEPLOY_BRANCH" 2>/dev/null || true

if git show-ref --verify --quiet "refs/heads/$DEPLOY_BRANCH"; then
    git checkout "$DEPLOY_BRANCH"
    git pull --ff-only origin "$DEPLOY_BRANCH" 2>/dev/null || true
elif git show-ref --verify --quiet "refs/remotes/origin/$DEPLOY_BRANCH"; then
    git checkout -B "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
else
    git checkout --orphan "$DEPLOY_BRANCH"
fi

echo "🧹 Replacing site files..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -a "$STAGING/." .

git add -A

if git diff --staged --quiet; then
    echo "✅ No changes to deploy."
else
    git commit -m "chore: deploy to GitHub Pages"
    echo "✅ Created deployment commit on $DEPLOY_BRANCH"
fi

if [[ "$SHOULD_PUSH" == true ]]; then
    echo "🚀 Pushing $DEPLOY_BRANCH to origin..."
    git push origin "$DEPLOY_BRANCH"
fi

git checkout "$SOURCE_BRANCH"
trap - EXIT
rm -rf "$STAGING"

echo ""
echo "Done. Returned to $SOURCE_BRANCH."
if [[ "$SHOULD_PUSH" != true ]]; then
    echo "Publish with: git push origin $DEPLOY_BRANCH"
fi
