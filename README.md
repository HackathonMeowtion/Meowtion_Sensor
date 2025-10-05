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
