#!/usr/bin/env bash
# Deploy eller promover en QA-godkendt SiteDokAI-version i Google App Engine.
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT_ID="sitedok"
DEPLOY_MODE="${1:-staging}"
DEPLOY_VERSION="${2:-qa-$(date -u +%Y%m%d-%H%M%S)}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud mangler. Deploy stoppet." >&2
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
if [[ -z "$ACTIVE_ACCOUNT" ]]; then
  echo "Ingen aktiv Google Cloud-konto. Deploy stoppet." >&2
  exit 1
fi

echo "› Bygger og tester SiteDokAI…"
npm run build
npm test
npm audit --omit=dev

APP_HOST="$(gcloud app describe --project "$PROJECT_ID" --format='value(defaultHostname)')"

case "$DEPLOY_MODE" in
  staging)
    echo "› Deployer $DEPLOY_VERSION uden at promovere trafik…"
    gcloud app deploy app.yaml \
      --project "$PROJECT_ID" \
      --version "$DEPLOY_VERSION" \
      --no-promote \
      --quiet
    VERIFY_URL="https://$DEPLOY_VERSION-dot-$APP_HOST"
    ;;
  production)
    if [[ $# -ne 2 ]]; then
      echo "Angiv den QA-godkendte version: npm run deploy:production -- VERSION" >&2
      exit 1
    fi
    gcloud app versions describe "$DEPLOY_VERSION" \
      --project "$PROJECT_ID" \
      --service default \
      --format='value(id)' >/dev/null
    echo "› Promoverer den eksisterende, QA-godkendte version ${DEPLOY_VERSION}…"
    gcloud app services set-traffic default \
      --project "$PROJECT_ID" \
      --splits "$DEPLOY_VERSION=1" \
      --quiet
    VERIFY_URL="https://$APP_HOST"
    ;;
  *)
    echo "Ukendt mode: $DEPLOY_MODE. Brug staging eller production." >&2
    exit 1
    ;;
esac

echo "› Verificerer ${VERIFY_URL}…"
curl --fail --silent --show-error --head "$VERIFY_URL/" >/dev/null

echo "✓ $DEPLOY_MODE afsluttet for $DEPLOY_VERSION af $ACTIVE_ACCOUNT."
echo "✓ Endpoint: $VERIFY_URL"
