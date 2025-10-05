
export interface CatBreedAnalysis {
  isCat: boolean;
  breed: string;
  confidence: number;
  description: string;
}

export interface MatchCandidateEvaluation {
  catName: string;
  similarity: number;
  matchedFeatures: string[];
  mismatchedFeatures: string[];
  summary: string;
}

export interface MatchResult {
  isMatch: boolean;
  matchedCatName: string;
  confidence: number;
  reasoning: string;
  evaluations: MatchCandidateEvaluation[];
}
