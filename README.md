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

2. Create a `.env.local` file with the required credentials:

   ```bash
   VITE_GEMINI_API_KEY="your-gemini-api-key"
   VITE_AUTH0_DOMAIN="your-tenant-region.auth0.com"
   VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
   VITE_AUTH0_AUDIENCE="https://your-tenant-region.auth0.com/api/v2/" # optional, but needed if you protect backend APIs
   VITE_AUTH0_PERSONA_CLAIM="https://meowtion-sensor.com/cat_persona"
   ```

   Replace each value with the credentials from your Gemini project and Auth0 application. The Auth0 domain and client ID are created in the Auth0 dashboard under **Applications → Applications → [Your App]**.

3. Run the app:
   `npm run dev`

## Purr-sona identity flow

The repository now includes an Auth0 Post-Login Action and a companion microservice that generate bespoke cat personas for every account. Follow the checklist below to light it up end‑to‑end.

### 1. Deploy the cat persona microservice

1. Open [`server/README.md`](server/README.md) for the detailed instructions.
2. From the project root run:

   ```bash
   cd server
   npm install
   cp .env.example .env
   ```

3. Edit `.env` and provide:
   - `GEMINI_API_KEY` – an API key with access to your chosen Gemini model.
   - `PERSONA_API_KEY` – a long, random string. This becomes the bearer token the Auth0 Action must present.
   - Optionally adjust `PERSONA_ALLOWED_ORIGINS`, `PORT`, or `PERSONA_MODEL`.

4. Start the service locally with `npm start` or deploy it to your preferred host (Cloud Run, Render, Fly.io, etc.). Note the public HTTPS URL – you will need it for the Action secret.

### 2. Configure the Auth0 Post-Login Action

1. In the Auth0 dashboard navigate to **Actions → Library → + Create Action**.
2. Choose the **Post Login** trigger, name it e.g. “Generate Cat Persona”, and paste the contents of [`auth0/post-login-cat-persona.js`](auth0/post-login-cat-persona.js) into the editor.
3. Open the **Settings → Secrets** tab for the Action and add:
   - `PERSONA_API_URL` – the full URL to your persona endpoint (e.g. `https://persona.example.com/persona`).
   - `PERSONA_API_KEY` – the same string you configured in the microservice `.env` file.
   - `CAT_PERSONA_CLAIM` (optional) – keep the default `https://meowtion-sensor.com/cat_persona` or set a tenant-specific namespace.
4. Deploy the Action, then drag it into your **Login Flow** so it executes on every authentication.

The Action will:
- Skip calling the API if `app_metadata.catPersona` already exists.
- POST the Auth0 user information to your persona API on first login.
- Store the returned persona in `app_metadata.catPersona` and mirror it into the ID/access token via the custom claim namespace you configured.

### 3. Update Auth0 application settings

To ensure the React client can read the persona claim:

1. In **Applications → [Your SPA] → Settings** add your local dev URL (e.g. `http://localhost:5173`) to **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins**.
2. Under **Advanced Settings → OAuth** enable **Allow Offline Access** (required for refresh tokens) and add the `offline_access` scope to the **Default Directory** if prompted.
3. Under **Advanced Settings → OAuth** ensure **ID Token** lifetime covers your needs and that **OIDC Conformant** remains enabled.
4. (Optional) If you are calling secured APIs, set `VITE_AUTH0_AUDIENCE` to that API identifier. Otherwise leave it blank.

### 4. Verify the experience

1. Restart the Vite dev server if it was running so the new environment variables are loaded.
2. Log out of the app and sign back in with Auth0.
3. On first login the Post-Login Action will call your persona service; after redirect you should see the new **Cat Persona** panel in the profile tab showing the generated card.
4. If you do not see the card, the panel includes actionable troubleshooting tips (check the Action is linked, confirm the claim namespace, log back in).
