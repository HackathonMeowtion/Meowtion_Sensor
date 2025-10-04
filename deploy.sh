#!/usr/bin/env bash
set -euo pipefail
PROJECT=gen-lang-client-0990174030
REGION=us-south1
SERVICE=meowtion-sensor

gcloud config set project "$PROJECT"
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-build-env-vars VITE_GEMINI_API_KEY="$(gcloud secrets versions access latest --secret=VITE_GEMINI_API_KEY)"

