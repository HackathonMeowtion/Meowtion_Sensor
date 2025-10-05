import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

const {
  PORT = 8787,
  GEMINI_API_KEY,
  PERSONA_API_KEY,
  PERSONA_ALLOWED_ORIGINS,
  PERSONA_MODEL = 'gemini-2.5-flash',
} = process.env;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required to generate cat personas.');
}

if (!PERSONA_API_KEY) {
  throw new Error('PERSONA_API_KEY is required to authenticate Auth0 actions.');
}

const allowedOrigins = PERSONA_ALLOWED_ORIGINS
  ? PERSONA_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['*'];

const app = express();
app.use(express.json({ limit: '1mb' }));

if (allowedOrigins.includes('*')) {
  app.use(cors());
} else {
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS policy'));
      },
    }),
  );
}

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const personaSchema = {
  type: Type.OBJECT,
  properties: {
    displayName: {
      type: Type.STRING,
      description: 'Whimsical name such as "Luna the Mischievous Tabby".',
    },
    summary: {
      type: Type.STRING,
      description: 'One or two-sentence summary of the cat persona.',
    },
    traits: {
      type: Type.ARRAY,
      description: '3-5 short traits that describe the persona.',
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 5,
    },
    favoriteActivities: {
      type: Type.ARRAY,
      description: 'Fun activities this persona loves doing.',
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 5,
    },
    originStory: {
      type: Type.STRING,
      description: 'Short whimsical backstory (max 3 sentences).',
    },
    motto: {
      type: Type.STRING,
      description: 'Optional motto or catchphrase in 120 characters or less.',
    },
    accentColor: {
      type: Type.STRING,
      description: 'Optional hex color (e.g. #F5A623) to theme UI badges.',
    },
  },
  required: ['displayName', 'summary', 'traits', 'favoriteActivities', 'originStory'],
};

const ensureArray = (value, fallback) => {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }
  return value;
};

const personaPrompt = ({ name, email, userId }) => `You are the keeper of whimsical feline identities for the Meowtion Sensor community.

Craft an imaginative but family-friendly cat persona for the newly signed up human. Use their details as inspiration:
- Auth0 user ID: ${userId}
- Display name (if any): ${name ?? 'Unknown'}
- Email (if any): ${email ?? 'Unknown'}

Guidelines:
- Keep the tone playful yet concise; avoid referencing the human directly after the opening context.
- Deliver JSON that matches the provided schema exactly.
- The persona should feel unique and ready to be displayed as a collectible card.
`;

const generatePersona = async ({ name, email, userId }) => {
  const response = await genAI.models.generateContent({
    model: PERSONA_MODEL,
    contents: {
      role: 'user',
      parts: [
        {
          text: personaPrompt({ name, email, userId }),
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: personaSchema,
    },
  });

  const payload = response.response?.text() ?? response.text ?? '';
  if (!payload) {
    throw new Error('Gemini did not return persona text.');
  }

  const persona = JSON.parse(payload);
  persona.generatedAt = new Date().toISOString();
  return persona;
};

const authenticate = (req, res, next) => {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (token !== PERSONA_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/persona', authenticate, async (req, res) => {
  const { userId, email, name, nickname } = req.body ?? {};

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const persona = await generatePersona({
      userId,
      email: email ?? null,
      name: name ?? nickname ?? null,
    });

    persona.traits = ensureArray(persona.traits, ['Curious whiskerling']);
    persona.favoriteActivities = ensureArray(persona.favoriteActivities, ['Plotting midnight zoomies']);

    res.json({ persona });
  } catch (error) {
    console.error('Failed to generate persona', error);
    res.status(500).json({ error: 'Failed to generate persona', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Cat persona service listening on port ${PORT}`);
});
