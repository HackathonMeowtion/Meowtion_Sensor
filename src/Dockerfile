# src/cloudbuild.yaml — safe Cloud Build pipeline for Cloud Run
substitutions:
    _REGION: "us-south1"
    _REPO: "cloud-run-source-deploy"
    _IMAGE_NAME: "meowtion-sensor"
  
  steps:
  # 1️⃣ Fetch secrets from Secret Manager and write them into temp files
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    id: fetch-secrets
    entrypoint: bash
    args:
      - -lc
      - |
        set -eo pipefail
        echo "Fetching secrets..."
        gcloud secrets versions access latest --secret=VITE_GEMINI_API_KEY > /workspace/.geminikey
        gcloud secrets versions access latest --secret=VITE_AUTH0_DOMAIN > /workspace/.auth0domain
        gcloud secrets versions access latest --secret=VITE_AUTH0_CLIENT_ID > /workspace/.auth0clientid
  
  # 2️⃣ Build Docker image with those values
  - name: gcr.io/cloud-builders/docker
    id: build
    entrypoint: bash
    args:
      - -lc
      - |
        set -euo pipefail
        IMG="${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_IMAGE_NAME}"
        docker build \
          --build-arg VITE_GEMINI_API_KEY="$(cat /workspace/.geminikey)" \
          --build-arg VITE_AUTH0_DOMAIN="$(cat /workspace/.auth0domain)" \
          --build-arg VITE_AUTH0_CLIENT_ID="$(cat /workspace/.auth0clientid)" \
          -t "$IMG:$BUILD_ID" -t "$IMG:latest" .
  
  # 3️⃣ Push image
  - name: gcr.io/cloud-builders/docker
    id: push
    args:
      - push
      - "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_IMAGE_NAME}:latest"
  
  # 4️⃣ Deploy image to Cloud Run
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    id: deploy
    args:
      [
        "run", "deploy", "${_IMAGE_NAME}",
        "--image", "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_IMAGE_NAME}:latest",
        "--region", "${_REGION}",
        "--allow-unauthenticated"
      ]
  
  images:
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_IMAGE_NAME}:latest
  