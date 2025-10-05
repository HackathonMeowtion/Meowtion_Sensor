#!/bin/bash
# deploy.sh — simpler deploy that reads .env directly

set -e

# Resolve repo root (script lives in repo/src)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Load environment variables from either src/.env or repo-root/.env
ENV_FILE=""
if [ -f "${REPO_ROOT}/src/.env" ]; then
  ENV_FILE="${REPO_ROOT}/src/.env"
elif [ -f "${REPO_ROOT}/.env" ]; then
  ENV_FILE="${REPO_ROOT}/.env"
fi

if [ -z "$ENV_FILE" ]; then
  echo "❌ Could not find an .env file in src/.env or .env"
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

# Verify critical env vars exist
if [ -z "$VITE_GEMINI_API_KEY" ] || [ -z "$VITE_AUTH0_DOMAIN" ] || [ -z "$VITE_AUTH0_CLIENT_ID" ]; then
  echo "❌ Missing required vars: VITE_GEMINI_API_KEY, VITE_AUTH0_DOMAIN, or VITE_AUTH0_CLIENT_ID"
  exit 1
fi

# Deploy to Cloud Run (builds from your src/ folder)
gcloud run deploy meowtion-sensor \
  --source src \
  --region us-south1 \
  --allow-unauthenticated \
  --build-arg VITE_GEMINI_API_KEY="${VITE_GEMINI_API_KEY}" \
  --build-arg VITE_AUTH0_DOMAIN="${VITE_AUTH0_DOMAIN}" \
  --build-arg VITE_AUTH0_CLIENT_ID="${VITE_AUTH0_CLIENT_ID}" \
  --set-env-vars="GEMINI_API_KEY=${VITE_GEMINI_API_KEY},VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN},VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}"
