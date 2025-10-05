<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UEt0ap-0kQPwTD-hZVxubYmB5Tq5YgdP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Create the environment files with the required credentials:

   - `.env.local` for frontend configuration

     ```bash
     VITE_AUTH0_DOMAIN="your-tenant-region.auth0.com"
     VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
     # Optional. Set when your API runs on a different origin.
     VITE_API_BASE_URL="https://your-api-host" 
     ```

   - `.env` for server-only secrets

     ```bash
     GEMINI_API_KEY="your-gemini-api-key"
     ```

   Replace each value with the credentials from your Gemini project and Auth0 application. The Auth0 domain and client ID are created in the Auth0 dashboard under **Applications → Applications → [Your App]**.

3. Run the servers:
   - Start the Gemini proxy API: `npm run server`
   - Start the Vite dev server (in a separate terminal): `npm run dev`

## Deploy to Cloud Run

The repository includes two deployment flows (a helper script and a Cloud Build pipeline). Both expect the same configuration:

- `VITE_GEMINI_API_KEY`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`

### One-command deploy (`src/deploy.sh`)

1. Create an `.env` file **either** in the repository root **or** inside `src/` with the three variables above. The script will automatically pick whichever file exists.
2. Run `bash src/deploy.sh`. The script sources your `.env`, validates the variables, forwards them to the Cloud Build step with `--build-env-vars`, and sets the same values on the Cloud Run service for the runtime Gemini proxy.

If you keep secrets in `src/.env`, remember to add it to your local `.gitignore` so you do not commit credentials.

### Cloud Build pipeline (`src/cloudbuild.yaml`)

The provided pipeline accepts two additional substitutions so Auth0 settings make it into the production bundle:

- `_VITE_AUTH0_DOMAIN`
- `_VITE_AUTH0_CLIENT_ID`

Set them when you create the trigger (alongside the existing `_REGION`, `_REPO`, `_IMAGE_NAME`, and secret for `VITE_GEMINI_API_KEY`). The pipeline passes these substitutions to `docker build --build-arg ...` and configures the Cloud Run service with the same runtime variables.
