#!/bin/bash
# deploy.sh — simpler deploy that reads .env directly

set -e

# Load .env variables from src/.env
set -a
. src/.env
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
  --set-build-env-vars="VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY},VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN},VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}" \
  --set-env-vars="GEMINI_API_KEY=${VITE_GEMINI_API_KEY},VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN},VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}"
