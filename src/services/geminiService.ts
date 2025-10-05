import { GoogleGenAI, Type } from "@google/genai";
import type { CatBreedAnalysis, MatchResult } from '../types';
import { knownCats } from '../data/knownCats';
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
    isCat: { type: Type.BOOLEAN, description: "Confirms if a cat is present in the image." },
    breed: { type: Type.STRING, description: "The identified cat breed. If not a cat, this should be 'Not a cat'." },
    confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0. If not a cat, this should be 0." },
    description: { type: Type.STRING, description: "A short, engaging paragraph describing the breed's characteristics and temperament. If not a cat, briefly describe what is in the image." }
  },
  required: ["isCat", "breed", "confidence", "description"]
};

const matchSchema = {
    type: Type.OBJECT,
    properties: {
      isMatch: { type: Type.BOOLEAN, description: "Confirms if the primary user-submitted image is a match for any of the provided known cat images." },
      matchedCatName: { type: Type.STRING, description: "If a match is found, this is the name of the matching cat. Otherwise, it should be an empty string." },
      confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0 for the match. If not a match, this should be 0." },
      reasoning: { type: Type.STRING, description: "A brief, one-sentence explanation for the decision, mentioning specific visual features like fur color, patterns, or facial structure." }
    },
    required: ["isMatch", "matchedCatName", "confidence", "reasoning"]
};

export const identifyCatBreed = async (base64Image: string, mimeType: string): Promise<CatBreedAnalysis> => {
  const prompt = `You are an expert in cat breeds. Analyze this image and identify the breed of the cat. Return the analysis in the specified JSON format.`;
  const imagePart = { inlineData: { data: base64Image, mimeType: mimeType } };
  
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: { responseMimeType: "application/json", responseSchema: breedSchema }
    });
    return JSON.parse(response.text) as CatBreedAnalysis;
  } catch (error) {
    console.error("Error calling Gemini API for breed identification:", error);
    throw new Error("Could not get a valid response from the AI model.");
  }
};

export const findMatchingCat = async (userImageBase64: string, userImageMimeType: string): Promise<MatchResult> => {
  const prompt = `You are a visual comparison expert. Your task is to determine if the primary user-submitted image is the exact same cat as any of the provided "known cat" image groups. Each known cat may have multiple reference images provided. Focus on unique identifying features. The user's cat is the first image. The subsequent images are grouped by the known cat's name. Return your analysis in the specified JSON format.`;

  try {
    const client = getClient();
    const userImagePart = { inlineData: { data: userImageBase64, mimeType: userImageMimeType } };

    const contentParts = [
      { text: prompt },
      { text: "--- User's Cat Image ---" },
      userImagePart,
      { text: "--- Known Cat Images for Comparison ---" },
    ];

    for (const cat of knownCats) {
      contentParts.push({ text: `Known Cat Name: ${cat.name}` });
      const imageParts = await Promise.all(
        cat.imageSrcs.map(async (src) => {
          const { base64, mimeType } = await urlToBase64(src);
          return { inlineData: { data: base64, mimeType } };
        })
      );
      contentParts.push(...imageParts);
    }
    
    const response = await client.models.generateContent({
      model: model,
      contents: { parts: contentParts },
      config: { responseMimeType: "application/json", responseSchema: matchSchema }
    });

    return JSON.parse(response.text) as MatchResult;
  } catch (error) {
    console.error("Error calling Gemini API for matching:", error);
    throw new Error("Could not get a valid match response from the AI model.");
  }
};