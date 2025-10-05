
import { GoogleGenAI, Type } from "@google/genai";
import type { CatBreedAnalysis } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the VITE_GEMINI_API_KEY environment variable.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }

  return aiClient;
};

const model = 'gemini-2.5-flash';

const schema = {
  type: Type.OBJECT,
  properties: {
    isCat: {
      type: Type.BOOLEAN,
      description: "Confirms if a cat is present in the image."
    },
    breed: {
      type: Type.STRING,
      description: "The identified cat breed. If not a cat, this should be 'Not a cat'."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0.0 to 1.0. If not a cat, this should be 0."
    },
    description: {
      type: Type.STRING,
      description: "A short, engaging paragraph describing the breed's characteristics and temperament. If not a cat, briefly describe what is in the image."
    }
  },
  required: ["isCat", "breed", "confidence", "description"]
};


export const identifyCatBreed = async (base64Image: string, mimeType: string): Promise<CatBreedAnalysis> => {
  const prompt = `You are an expert in cat breeds. Analyze this image and identify the breed of the cat.
  - If a cat is clearly visible, identify its breed.
  - Provide a confidence score for your identification.
  - Give a brief, one-paragraph description of the breed's key traits.
  - If the image does not contain a cat, please state that clearly in the result.
  - Return the analysis in the specified JSON format.`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };
  
  try {
    const client = getClient();

    const response = await client.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString) as CatBreedAnalysis;

    // Validate the result structure
    if (typeof result.isCat !== 'boolean' || typeof result.breed !== 'string' || typeof result.confidence !== 'number' || typeof result.description !== 'string') {
        throw new Error("Invalid response structure from AI");
    }

    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);

    if (error instanceof Error && error.message.includes("Gemini API key is not configured")) {
      throw error;
    }

    throw new Error("Could not get a valid response from the AI model.");
  }
};
