import {
  AppSettings,
  CareerSave,
  FullExportBundle,
  PlayerProfile,
  VocabularyLibraryState,
} from '../types/game';

const KEYS = {
  VOCAB_LIBRARY: 'fvc_vocab_library_v1',
  CAREER_SAVE: 'fvc_career_save_v1',
  PLAYER_PROFILE: 'fvc_player_profile_v1',
  SETTINGS: 'fvc_settings_v1',
} as const;

export const DEFAULT_VOCAB_LIBRARY: VocabularyLibraryState = {
  entries: [],
  collections: [
    {
      id: 'col_personal',
      name: 'Personal Collection',
      description: 'Your personal custom English vocabulary list.',
      createdAt: new Date().toISOString(),
    },
  ],
};

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsScored: 0,
  goalsConceded: 0,
  penaltiesTaken: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  saves: 0,
  vocabAnswered: 0,
  vocabCorrect: 0,
  trophies: [],
  matchHistory: [],
  bestWinMargin: 0,
  bestAccuracyMatch: 0,
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  crowdAmbience: false,
  animationsEnabled: true,
  customCompetitionTeams: {},
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore quota errors cleanly
  }
}

export function loadVocabLibrary(): VocabularyLibraryState {
  const data = safeRead<VocabularyLibraryState>(KEYS.VOCAB_LIBRARY, DEFAULT_VOCAB_LIBRARY);
  if (!data || !Array.isArray(data.entries) || !Array.isArray(data.collections)) {
    return DEFAULT_VOCAB_LIBRARY;
  }
  return data;
}

export function saveVocabLibrary(library: VocabularyLibraryState): void {
  safeWrite(KEYS.VOCAB_LIBRARY, library);
}

export function loadCareerSave(): CareerSave | null {
  const data = safeRead<CareerSave | null>(KEYS.CAREER_SAVE, null);
  if (!data || !data.id || !data.competitionId || !data.playerTeamId) {
    return null;
  }
  return data;
}

export function saveCareerSave(career: CareerSave | null): void {
  safeWrite(KEYS.CAREER_SAVE, career);
}

export function loadPlayerProfile(): PlayerProfile {
  const data = safeRead<PlayerProfile>(KEYS.PLAYER_PROFILE, DEFAULT_PLAYER_PROFILE);
  return {
    ...DEFAULT_PLAYER_PROFILE,
    ...data,
    trophies: Array.isArray(data?.trophies) ? data.trophies : [],
    matchHistory: Array.isArray(data?.matchHistory) ? data.matchHistory : [],
  };
}

export function savePlayerProfile(profile: PlayerProfile): void {
  safeWrite(KEYS.PLAYER_PROFILE, profile);
}

export function loadSettings(): AppSettings {
  const data = safeRead<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    customCompetitionTeams: data?.customCompetitionTeams ?? {},
  };
}

export function saveSettings(settings: AppSettings): void {
  safeWrite(KEYS.SETTINGS, settings);
}

export function exportAllSaveData(
  vocabularyLibrary: VocabularyLibraryState,
  careerSave: CareerSave | null,
  playerProfile: PlayerProfile,
  settings: AppSettings
): string {
  const bundle: FullExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    vocabularyLibrary,
    careerSave,
    playerProfile,
    settings,
  };
  return JSON.stringify(bundle, null, 2);
}

export function parseImportedSaveData(rawJson: string): {
  ok: true;
  data: FullExportBundle;
} | {
  ok: false;
  error: string;
} {
  try {
    const parsed = JSON.parse(rawJson) as Partial<FullExportBundle>;
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'Invalid JSON file.' };
    }
    if (!parsed.vocabularyLibrary || !Array.isArray(parsed.vocabularyLibrary.entries)) {
      return { ok: false, error: 'Save file is missing vocabularyLibrary data.' };
    }
    return {
      ok: true,
      data: {
        version: 1,
        exportedAt: parsed.exportedAt ?? new Date().toISOString(),
        vocabularyLibrary: {
          entries: parsed.vocabularyLibrary.entries,
          collections: Array.isArray(parsed.vocabularyLibrary.collections)
            ? parsed.vocabularyLibrary.collections
            : DEFAULT_VOCAB_LIBRARY.collections,
        },
        careerSave: parsed.careerSave ?? null,
        playerProfile: {
          ...DEFAULT_PLAYER_PROFILE,
          ...(parsed.playerProfile ?? {}),
        },
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings ?? {}),
        },
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to parse save JSON.',
    };
  }
}
