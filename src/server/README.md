# Cat Persona Microservice

This lightweight Express service powers the Auth0 Post-Login Action by creating "Purr-sona" cards with Gemini.

## Quick start

1. Install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Copy the environment template and fill in your secrets:

   ```bash
   cp .env.example .env
   ```

   Required values:
   - `GEMINI_API_KEY` – a Google AI Studio key with access to the Gemini model.
   - `PERSONA_API_KEY` – a shared secret that Auth0 Actions will send as the `Authorization: Bearer` token.

3. Run the service locally:

   ```bash
   npm start
   ```

   By default the API listens on `http://localhost:8787` and exposes:

   - `POST /persona` – Generates a persona. Requires the bearer token to match `PERSONA_API_KEY`.
   - `GET /health` – Returns `{ status: 'ok' }` for monitoring.

4. Deploy

   The service is portable – you can deploy it to Cloud Run, Render, Fly.io, Railway or any platform that can run Node 18+.
   Remember to set the same environment variables in production and update your Auth0 Action secret with the public URL.

## Request/response contract

`POST /persona`

```jsonc
{
  "userId": "auth0|123",      // required
  "email": "meow@example.com",
  "name": "Taylor",
  "nickname": "tay"
}
```

Response payload:

```jsonc
{
  "persona": {
    "displayName": "Luna the Mischievous Tabby",
    "summary": "Playful prowler of moonlit hallways...",
    "traits": ["Shadow stalker", "Laser-pointer chaser", "Secret napper"],
    "favoriteActivities": ["Hoarding crinkle toys", "Organising midnight zoomies", "Guarding houseplants"],
    "originStory": "Legend says Luna first appeared...",
    "motto": "Trust the whiskers.",
    "generatedAt": "2024-01-01T12:00:00.000Z",
    "accentColor": "#F5A623"
  }
}
```

The Auth0 Action stores the entire `persona` object in `app_metadata` and mirrors it into a custom ID token claim so the React app can render the persona card.
