import { GoogleGenAI, Type } from "@google/genai";
import type { CatBreedAnalysis, MatchCandidateEvaluation, MatchResult } from '../types';
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

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    catName: { type: Type.STRING, description: "Name of the known cat being evaluated." },
    similarity: { type: Type.NUMBER, description: "Similarity score between 0 and 1, where 1 means the same cat." },
    matchedFeatures: {
      type: Type.ARRAY,
      description: "Specific visual attributes that match between the user cat and the known cat reference images.",
      items: { type: Type.STRING },
    },
    mismatchedFeatures: {
      type: Type.ARRAY,
      description: "Specific visual attributes that do not match.",
      items: { type: Type.STRING },
    },
    summary: { type: Type.STRING, description: "A concise summary of the comparison citing concrete visual evidence." },
  },
  required: ["catName", "similarity", "matchedFeatures", "mismatchedFeatures", "summary"],
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

const buildComparisonPrompt = (catName: string) => `You are a meticulous visual identification expert. Compare the primary user-submitted cat image to the reference images for the known cat named "${catName}".

Carry out the steps below before you return your decision:
1. Inspect the reference images together and list the distinctive visual features that stay consistent across them (fur color placement, markings, eye colour/shape, body structure, etc.).
2. Inspect the user image and note the same categories of features.
3. Determine which features clearly match and which clearly conflict. Avoid vague statements—cite concrete evidence you can actually observe in the images.
4. Score the similarity on a 0-1 scale where 1 means it is the same individual cat. Penalise conflicts in markings, coat length, or body structure heavily.

Return only JSON that follows the provided schema.`;

const evaluateKnownCat = async (
  client: GoogleGenAI,
  catName: string,
  userImagePart: { inlineData: { data: string; mimeType: string } },
  referenceImageParts: { inlineData: { data: string; mimeType: string } }[],
): Promise<MatchCandidateEvaluation> => {
  const prompt = buildComparisonPrompt(catName);

  const response = await client.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { text: "Primary user-submitted cat image" },
        userImagePart,
        { text: `Reference images for ${catName}` },
        ...referenceImageParts,
      ],
    },
    config: { responseMimeType: "application/json", responseSchema: evaluationSchema },
  });

  const parsed = JSON.parse(response.text) as MatchCandidateEvaluation;

  // Ensure the cat name stays consistent even if the model rephrases it.
  parsed.catName = catName;

  // Clamp similarity values to [0, 1] to avoid API drift.
  parsed.similarity = Math.min(1, Math.max(0, parsed.similarity));

  return parsed;
};

export const findMatchingCat = async (userImageBase64: string, userImageMimeType: string): Promise<MatchResult> => {
  try {
    const client = getClient();
    const userImagePart = { inlineData: { data: userImageBase64, mimeType: userImageMimeType } };

    const evaluations = await Promise.all(
      knownCats.map(async (cat) => {
        const referenceImageParts = await Promise.all(
          cat.imageSrcs.map(async (src) => {
            const { base64, mimeType } = await urlToBase64(src);
            return { inlineData: { data: base64, mimeType } };
          })
        );

        return evaluateKnownCat(client, cat.name, userImagePart, referenceImageParts);
      })
    );

    const sortedEvaluations = evaluations.sort((a, b) => b.similarity - a.similarity);
    const bestEvaluation = sortedEvaluations[0];

    const highSimilarity = bestEvaluation.similarity >= 0.75;
    const fewConflicts = bestEvaluation.mismatchedFeatures.filter(Boolean).length <= 1;
    const isMatch = highSimilarity && fewConflicts;

    const matchResult: MatchResult = {
      isMatch,
      matchedCatName: isMatch ? bestEvaluation.catName : '',
      confidence: bestEvaluation.similarity,
      reasoning: isMatch
        ? bestEvaluation.summary
        : `Closest match is ${bestEvaluation.catName}, but conflicts include: ${bestEvaluation.mismatchedFeatures.join('; ') || 'insufficient distinctive matches.'}`,
      evaluations: sortedEvaluations,
    };

    return matchResult;
  } catch (error) {
    console.error("Error calling Gemini API for matching:", error);
    throw new Error("Could not get a valid match response from the AI model.");
  }
};