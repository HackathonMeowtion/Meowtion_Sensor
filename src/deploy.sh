#!/usr/bin/env bash
set -euo pipefail
PROJECT=gen-lang-client-0990174030
REGION=us-south1
SERVICE=meowtion-sensor

gcloud config set project "$PROJECT"
GEMINI_KEY=$(gcloud secrets versions access latest --secret=VITE_GEMINI_API_KEY)
AUTH0_DOMAIN=$(gcloud secrets versions access latest --secret=VITE_AUTH0_DOMAIN)
AUTH0_CLIENT_ID=$(gcloud secrets versions access latest --secret=VITE_AUTH0_CLIENT_ID)
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-build-env-vars "VITE_GEMINI_API_KEY=${GEMINI_KEY},VITE_AUTH0_DOMAIN=${AUTH0_DOMAIN},VITE_AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}"

