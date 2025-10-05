// src/services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import type { CatBreedAnalysis, MatchResult } from '../types';
import { knownCats, KnownCat } from '../data/knownCats';
import { urlToBase64 } from '../utils/imageUtils';

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

const breedSchema = {
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
        responseSchema: breedSchema,
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString) as CatBreedAnalysis;

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

const matchSchema = {
  type: Type.OBJECT,
  properties: {
    isMatch: {
      type: Type.BOOLEAN,
      description: "Confirms if the primary user-submitted image is a match for any of the provided known cat images."
    },
    matchedCatName: {
      type: Type.STRING,
      description: "If a match is found, this is the name of the matching cat. Otherwise, it should be an empty string."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0.0 to 1.0 for the match. If not a match, this should be 0."
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief, one-sentence explanation for the decision, mentioning specific visual features like fur color, patterns, or facial structure."
    }
  },
  required: ["isMatch", "matchedCatName", "confidence", "reasoning"]
};

export const findMatchingCat = async (userImageBase64: string, userImageMimeType: string): Promise<MatchResult> => {
  const prompt = `You are a visual comparison expert. Your task is to determine if the primary user-submitted image is the exact same cat as any of the provided "known cat" images. Focus on unique identifying features like fur patterns, eye color, and facial structure, not just the breed. The user's cat is the first image. The subsequent images are known cats with their names provided. Return your analysis in the specified JSON format.`;

  try {
    const client = getClient();

    const userImagePart = {
      inlineData: { data: userImageBase64, mimeType: userImageMimeType },
    };

    const knownCatParts = await Promise.all(
      knownCats.map(async (cat: KnownCat) => {
        const { base64, mimeType } = await urlToBase64(cat.imageSrc);
        return [
          { text: `Known Cat Name: ${cat.name}` },
          { inlineData: { data: base64, mimeType } }
        ];
      })
    );
    
    const allKnownCatParts = knownCatParts.flat();

    const contentParts = [
      { text: prompt },
      { text: "--- User's Cat Image ---" },
      userImagePart,
      { text: "--- Known Cat Images for Comparison ---" },
      ...allKnownCatParts
    ];

    const response = await client.models.generateContent({
      model: model,
      contents: { parts: contentParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: matchSchema,
      }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as MatchResult;

  } catch (error) {
    console.error("Error calling Gemini API for matching:", error);
    throw new Error("Could not get a valid match response from the AI model.");
  }
};