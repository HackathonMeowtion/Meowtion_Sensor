import type { CatBreedAnalysis, MatchResult } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'Unable to reach the Gemini service.';
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        errorMessage = errorBody.error;
      }
    } catch {
      // Ignore JSON parsing errors and fall back to default message.
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
};

export const identifyCatBreed = async (base64Image: string, mimeType: string): Promise<CatBreedAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/api/gemini/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  return handleResponse<CatBreedAnalysis>(response);
};

export const findMatchingCat = async (
  userImageBase64: string,
  userImageMimeType: string,
): Promise<MatchResult> => {
  const response = await fetch(`${API_BASE_URL}/api/gemini/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userImageBase64, userImageMimeType }),
  });

  return handleResponse<MatchResult>(response);
};
