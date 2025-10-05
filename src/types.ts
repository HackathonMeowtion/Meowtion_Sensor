
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

export interface CatPersona {
  /**
   * Display-ready name such as "Luna the Mischievous Tabby".
   */
  displayName: string;
  /**
   * Short paragraph (ideally < 280 chars) summarising the persona's vibe.
   */
  summary: string;
  /**
   * Bullet-point traits like "Laser-pointer enthusiast".
   */
  traits: string[];
  /**
   * Fun activities this persona enjoys (for UI display chips).
   */
  favoriteActivities: string[];
  /**
   * Slightly longer flavour text that reads like an origin story.
   */
  originStory: string;
  /**
   * Optional motto/catch phrase to display as a badge or footer quote.
   */
  motto?: string;
  /**
   * When the persona was generated (ISO timestamp string).
   */
  generatedAt?: string;
  /**
   * Optional hex colour string that can be used for UI chrome.
   */
  accentColor?: string;
}
