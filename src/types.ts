
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

export interface Post {
  id: string;
  user: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likes: number;
  catName?: string | null;
  hashtags?: string[];
  analysisSummary?: string | null;
  matchSummary?: string | null;
  aiConfidence?: number | null;
}

export interface CreatePostInput {
  id?: string;
  user: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  likes?: number;
  catName?: string | null;
  hashtags?: string[];
  analysisSummary?: string | null;
  matchSummary?: string | null;
  aiConfidence?: number | null;
}
