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
   ```

   Replace each value with the credentials from your Gemini project and Auth0 application. The Auth0 domain and client ID are created in the Auth0 dashboard under **Applications → Applications → [Your App]**.

3. Run the app:
   `npm run dev`
