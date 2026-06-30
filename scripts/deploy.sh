#!/usr/bin/env bash
# Deploy AI-tidslinjen til sitedokai.com (GitHub Pages, branch: gh-pages).
# Bygger site og publicerer dist/ til gh-pages. Kør: npm run deploy
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
WT="$(mktemp -d)/ghp"

echo "› Bygger siden…"
npm run build

echo "› Henter gh-pages…"
git fetch origin gh-pages --quiet
git worktree prune
git worktree add --quiet "$WT" gh-pages

echo "› Lægger nyt build på gh-pages…"
find "$WT" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$ROOT/dist/." "$WT"/

cd "$WT"
git add -A
if git diff --cached --quiet; then
  echo "✓ Ingen ændringer — siden er allerede opdateret."
else
  git commit -q -m "Deploy AI-tidslinjen $(date +%F)"
  git push origin gh-pages
  echo "✓ Deployet. Live på https://sitedokai.com om 1-2 minutter."
fi

cd "$ROOT"
git worktree remove --force "$WT"
