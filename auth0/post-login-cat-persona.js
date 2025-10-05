/**
 * Auth0 Post-Login Action: attaches a generated cat persona to each user.
 *
 * Required secrets (configure in the Auth0 dashboard under Actions → Settings → Secrets):
 * - PERSONA_API_URL: Base URL of the persona API (e.g. https://persona.example.com/persona).
 * - PERSONA_API_KEY: Shared bearer token that authenticates requests to the persona API.
 * - CAT_PERSONA_CLAIM (optional): Namespaced claim that will carry the persona in the ID/access token.
 */

/**
 * @param {Event} event
 * @param {PostLoginAPI} api
 */
exports.onExecutePostLogin = async (event, api) => {
  const personaClaim = event.secrets.CAT_PERSONA_CLAIM || 'https://meowtion-sensor.com/cat_persona';
  const personaAlreadyExists = event.user.app_metadata?.catPersona;

  let persona = personaAlreadyExists;

  if (!persona) {
    const personaResponse = await fetch(event.secrets.PERSONA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${event.secrets.PERSONA_API_KEY}`,
      },
      body: JSON.stringify({
        userId: event.user.user_id,
        email: event.user.email,
        name: event.user.name,
        nickname: event.user.nickname,
      }),
    });

    if (!personaResponse.ok) {
      const errorText = await personaResponse.text();
      throw new Error(`Persona API responded with ${personaResponse.status}: ${errorText}`);
    }

    const personaPayload = await personaResponse.json();
    persona = personaPayload.persona || personaPayload;

    api.user.setAppMetadata('catPersona', persona);
  }

  api.idToken.setCustomClaim(personaClaim, persona);
  api.accessToken.setCustomClaim(personaClaim, persona);
};

exports.onContinuePostLogin = async (event, api) => {
  api.idToken.setCustomClaim(
    event.secrets.CAT_PERSONA_CLAIM || 'https://meowtion-sensor.com/cat_persona',
    event.user.app_metadata?.catPersona,
  );
};
