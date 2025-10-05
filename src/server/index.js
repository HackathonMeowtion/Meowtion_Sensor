import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { getKnownCatContentParts } from './knownCats.js';
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const loadLocalEnv = () => {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContents = fs.readFileSync(envPath, 'utf-8');
  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const [key, ...rest] = line.split('=');
    if (!key) {
      continue;
    }

    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (value && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadLocalEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
}

const aiClient = new GoogleGenAI({ apiKey });
const model = 'gemini-2.5-flash';
const PORT = Number(process.env.PORT ?? 4000);

const breedSchema = {
  type: Type.OBJECT,
  properties: {
    isCat: { type: Type.BOOLEAN, description: 'Confirms if a cat is present in the image.' },
    breed: { type: Type.STRING, description: "The identified cat breed. If not a cat, this should be 'Not a cat'." },
    confidence: { type: Type.NUMBER, description: 'Confidence score from 0.0 to 1.0. If not a cat, this should be 0.' },
    description: {
      type: Type.STRING,
      description:
        "A short, engaging paragraph describing the breed's characteristics and temperament. If not a cat, briefly describe what is in the image.",
    },
  },
  required: ['isCat', 'breed', 'confidence', 'description'],
};

const matchSchema = {
  type: Type.OBJECT,
  properties: {
    isMatch: {
      type: Type.BOOLEAN,
      description: 'Confirms if the primary user-submitted image is a match for any of the provided known cat images.',
    },
    matchedCatName: {
      type: Type.STRING,
      description: 'If a match is found, this is the name of the matching cat. Otherwise, it should be an empty string.',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence score from 0.0 to 1.0 for the match. If not a match, this should be 0.',
    },
    reasoning: {
      type: Type.STRING,
      description:
        'A brief, one-sentence explanation for the decision, mentioning specific visual features like fur color, patterns, or facial structure.',
    },
  },
  required: ['isMatch', 'matchedCatName', 'confidence', 'reasoning'],
};

const parseRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf-8');
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
};

const sendJson = (res, statusCode, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (req.url === '/api/gemini/identify') {
    const body = await parseRequestBody(req);
    const { base64Image, mimeType } = body ?? {};

    if (!base64Image || !mimeType) {
      sendJson(res, 400, { error: 'Image data is required.' });
      return;
    }

    const prompt =
      'You are an expert in cat breeds. Analyze this image and identify the breed of the cat. Return the analysis in the specified JSON format.';

    try {
      const imagePart = { inlineData: { data: base64Image, mimeType } };
      const response = await aiClient.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, imagePart] },
        config: { responseMimeType: 'application/json', responseSchema: breedSchema },
      });

      const parsed = JSON.parse(response.text);
      sendJson(res, 200, parsed);
    } catch (error) {
      console.error('Error calling Gemini API for breed identification:', error);
      sendJson(res, 502, { error: 'Could not get a valid response from the AI model.' });
    }
    return;
  }

  if (req.url === '/api/gemini/match') {
    const body = await parseRequestBody(req);
    const { userImageBase64, userImageMimeType } = body ?? {};

    if (!userImageBase64 || !userImageMimeType) {
      sendJson(res, 400, { error: 'User image data is required.' });
      return;
    }

    const prompt =
      'You are a visual comparison expert. Your task is to determine if the primary user-submitted image is the exact same cat as any of the provided "known cat" image groups. Each known cat may have multiple reference images provided. Focus on unique identifying features. The user\'s cat is the first image. The subsequent images are grouped by the known cat\'s name. Return your analysis in the specified JSON format.';

    try {
      const userImagePart = { inlineData: { data: userImageBase64, mimeType: userImageMimeType } };
      const knownCatParts = await getKnownCatContentParts();

      const contentParts = [
        { text: prompt },
        { text: "--- User's Cat Image ---" },
        userImagePart,
        { text: '--- Known Cat Images for Comparison ---' },
        ...knownCatParts,
      ];

      const response = await aiClient.models.generateContent({
        model,
        contents: { parts: contentParts },
        config: { responseMimeType: 'application/json', responseSchema: matchSchema },
      });

      const parsed = JSON.parse(response.text);
      sendJson(res, 200, parsed);
    } catch (error) {
      console.error('Error calling Gemini API for matching:', error);
      sendJson(res, 502, { error: 'Could not get a valid match response from the AI model.' });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Gemini proxy server listening on port ${PORT}`);
});
