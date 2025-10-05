import type { CatPersona } from '../types';

export const DEFAULT_PERSONA_CLAIM = 'https://meowtion-sensor.com/cat_persona';

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  const coerced = String(value).trim();
  return coerced.length > 0 ? coerced : undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => toNonEmptyString(entry))
    .filter((entry): entry is string => Boolean(entry));
};

const normalisePersona = (raw: Record<string, unknown>): CatPersona | null => {
  const displayName =
    toNonEmptyString(raw.displayName) ||
    toNonEmptyString(raw.name) ||
    toNonEmptyString(raw.title);

  const summary =
    toNonEmptyString(raw.summary) ||
    toNonEmptyString(raw.tagline) ||
    toNonEmptyString(raw.description) ||
    '';

  if (!displayName) {
    return null;
  }

  const persona: CatPersona = {
    displayName,
    summary,
    traits: toStringArray(raw.traits ?? raw.personalityTraits),
    favoriteActivities: toStringArray(raw.favoriteActivities ?? raw.favouriteActivities ?? raw.favorites),
    originStory:
      toNonEmptyString(raw.originStory) ||
      toNonEmptyString(raw.backstory) ||
      toNonEmptyString(raw.story) ||
      '',
    motto: toNonEmptyString(raw.motto ?? raw.catchPhrase),
    generatedAt:
      toNonEmptyString(raw.generatedAt ?? raw.createdAt ?? raw.timestamp),
    accentColor: toNonEmptyString(raw.accentColor ?? raw.badgeColor ?? raw.highlightColor),
  };

  // Ensure arrays always have at least one friendly fallback so the UI has something to show.
  if (persona.traits.length === 0) {
    persona.traits = ['Curious whiskerling'];
  }

  if (persona.favoriteActivities.length === 0) {
    persona.favoriteActivities = ['Plotting midnight zoomies'];
  }

  if (!persona.originStory) {
    persona.originStory = 'This mysterious feline persona is still collecting clues about their past adventures.';
  }

  if (!persona.summary) {
    persona.summary = 'A freshly generated cat adventurer ready to leave paw prints across Meowtion Sensor.';
  }

  return persona;
};

export const getPersonaClaimKey = (): string => {
  const configured = toNonEmptyString(import.meta.env.VITE_AUTH0_PERSONA_CLAIM);
  return configured ?? DEFAULT_PERSONA_CLAIM;
};

export const extractPersonaFromUser = (user: unknown): CatPersona | null => {
  if (!user) {
    return null;
  }

  const claimKey = getPersonaClaimKey();
  const record = user as Record<string, unknown>;
  const rawValue = record?.[claimKey];

  if (!rawValue) {
    return null;
  }

  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue) as Record<string, unknown>;
      return normalisePersona(parsed);
    } catch (error) {
      console.warn('Failed to parse cat persona JSON from Auth0 claim.', error);
      return null;
    }
  }

  if (typeof rawValue === 'object') {
    return normalisePersona(rawValue as Record<string, unknown>);
  }

  return null;
};

export const getPersonaGeneratedAtLabel = (persona: CatPersona): string | undefined => {
  if (!persona.generatedAt) {
    return undefined;
  }

  const parsed = new Date(persona.generatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};
