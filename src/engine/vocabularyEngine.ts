import {
  DifficultyLevel,
  MatchQuestion,
  QuestionFormat,
  QuestionRole,
  VocabularyEntry,
  VocabularyLibraryState,
  VocabularySourceConfig,
} from '../types/game';

export interface ParsedBulkRow {
  lineNumber: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  ipa?: string;
  difficulty: DifficultyLevel;
  topic: string;
  existingEntryId?: string;
}

export interface BulkImportParseResult {
  validRows: ParsedBulkRow[];
  duplicates: ParsedBulkRow[];
  invalidLines: Array<{ lineNumber: number; raw: string; reason: string }>;
}

const VALID_DIFFICULTIES: DifficultyLevel[] = ['A2', 'B1', 'B2', 'C1'];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseBulkVocabularyInput(
  rawText: string,
  existingEntries: VocabularyEntry[],
  defaultDifficulty: DifficultyLevel = 'B1',
  defaultTopic = 'General'
): BulkImportParseResult {
  const lines = rawText.split(/\r?\n/);
  const existingMap = new Map<string, VocabularyEntry>();
  for (const entry of existingEntries) {
    existingMap.set(entry.word.trim().toLowerCase(), entry);
  }

  const validRows: ParsedBulkRow[] = [];
  const duplicates: ParsedBulkRow[] = [];
  const invalidLines: Array<{ lineNumber: number; raw: string; reason: string }> = [];
  const seenInBatch = new Set<string>();

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    // Skip CSV header row if detected
    if (
      idx === 0 &&
      /^word\s*[|,]\s*meaning/i.test(trimmed)
    ) {
      return;
    }

    const parts = trimmed.includes('|')
      ? trimmed.split('|').map((s) => s.trim())
      : parseCsvLine(trimmed);

    const word = parts[0]?.trim() ?? '';
    const meaning = parts[1]?.trim() ?? '';
    const partOfSpeech = parts[2]?.trim() || 'noun';
    const example = parts[3]?.trim() || '';
    const maybeDiff = parts[4]?.trim().toUpperCase() as DifficultyLevel | undefined;
    const difficulty: DifficultyLevel =
      maybeDiff && VALID_DIFFICULTIES.includes(maybeDiff) ? maybeDiff : defaultDifficulty;
    const topic = parts[5]?.trim() || defaultTopic;
    const ipa = parts[6]?.trim() || undefined;

    if (!word || !meaning) {
      invalidLines.push({
        lineNumber: idx + 1,
        raw: trimmed,
        reason: 'Requires at least "word | meaning" (or CSV columns word,meaning).',
      });
      return;
    }

    const key = word.toLowerCase();
    if (seenInBatch.has(key)) {
      invalidLines.push({
        lineNumber: idx + 1,
        raw: trimmed,
        reason: `Duplicate word "${word}" repeated within the same import batch.`,
      });
      return;
    }
    seenInBatch.add(key);

    const existing = existingMap.get(key);
    const row: ParsedBulkRow = {
      lineNumber: idx + 1,
      word,
      meaning,
      partOfSpeech,
      example,
      ipa,
      difficulty,
      topic,
      existingEntryId: existing?.id,
    };

    if (existing) {
      duplicates.push(row);
    } else {
      validRows.push(row);
    }
  });

  return { validRows, duplicates, invalidLines };
}

export function exportVocabularyToCsv(entries: VocabularyEntry[]): string {
  const escape = (value: string | undefined) => {
    const str = (value ?? '').replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };
  const header = 'word,meaning,partOfSpeech,example,difficulty,topic,ipa,status,source,notes';
  const rows = entries.map((e) =>
    [
      escape(e.word),
      escape(e.meaning),
      escape(e.partOfSpeech),
      escape(e.example),
      escape(e.difficulty),
      escape(e.topic),
      escape(e.ipa),
      escape(e.status),
      escape(e.source),
      escape(e.notes),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function filterSelectedVocabulary(
  library: VocabularyLibraryState,
  config: VocabularySourceConfig
): VocabularyEntry[] {
  let pool = library.entries.slice();

  switch (config.mode) {
    case 'single_collection':
    case 'multi_collection': {
      const selectedCols = new Set(config.collectionIds);
      pool = pool.filter((e) => e.collectionIds.some((cid) => selectedCols.has(cid)));
      break;
    }
    case 'learning_only': {
      pool = pool.filter((e) => e.status === 'Learning' || e.stats.needsReview);
      break;
    }
    case 'custom_words': {
      const selectedIds = new Set(config.customWordIds);
      pool = pool.filter((e) => selectedIds.has(e.id));
      break;
    }
    case 'all':
    default:
      break;
  }

  if (config.preferredDifficulty && config.preferredDifficulty !== 'ALL') {
    pool = pool.filter((e) => e.difficulty === config.preferredDifficulty);
  }

  return pool;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getEligibleFormatsForEntry(entry: VocabularyEntry): QuestionFormat[] {
  const formats: QuestionFormat[] = [];
  if (entry.word.trim() && entry.meaning.trim()) {
    formats.push('en_to_vi');
    formats.push('vi_to_en');
    if (entry.partOfSpeech.trim()) {
      formats.push('definition_match');
    }
  }
  if (entry.example.trim()) {
    const wordRegex = new RegExp(`\\b${escapeRegExp(entry.word.trim())}\\b`, 'i');
    if (wordRegex.test(entry.example)) {
      formats.push('fill_blank');
      formats.push('context_choice');
    }
  }
  return formats;
}

function shuffleArray<T>(items: T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function buildSingleQuestion(
  entry: VocabularyEntry,
  pool: VocabularyEntry[],
  role: QuestionRole,
  format: QuestionFormat,
  questionIndex: number,
  rng: () => number
): MatchQuestion | null {
  // Distractors MUST come exclusively from the player's selected vocabulary pool
  const otherEntries = pool.filter((e) => e.id !== entry.id);
  const distinctMeaningOthers = otherEntries.filter(
    (e) => e.meaning.trim().toLowerCase() !== entry.meaning.trim().toLowerCase()
  );
  const distinctWordOthers = otherEntries.filter(
    (e) => e.word.trim().toLowerCase() !== entry.word.trim().toLowerCase()
  );

  // Prefer distractors with matching part of speech first for plausibility
  const sortPlausible = (candidates: VocabularyEntry[]) => {
    const samePos = shuffleArray(
      candidates.filter((c) => c.partOfSpeech.toLowerCase() === entry.partOfSpeech.toLowerCase()),
      rng
    );
    const diffPos = shuffleArray(
      candidates.filter((c) => c.partOfSpeech.toLowerCase() !== entry.partOfSpeech.toLowerCase()),
      rng
    );
    return [...samePos, ...diffPos];
  };

  let prompt = '';
  let contextSentence: string | undefined;
  let correctAnswerText = '';
  let distractorTexts: string[] = [];

  if (format === 'en_to_vi') {
    const candidates = sortPlausible(distinctMeaningOthers);
    const uniqueMeanings: string[] = [];
    for (const c of candidates) {
      if (!uniqueMeanings.includes(c.meaning)) uniqueMeanings.push(c.meaning);
      if (uniqueMeanings.length === 3) break;
    }
    if (uniqueMeanings.length < 3) return null;
    prompt = `Choose the Vietnamese meaning of "${entry.word}"`;
    correctAnswerText = entry.meaning;
    distractorTexts = uniqueMeanings;
  } else if (format === 'vi_to_en') {
    const candidates = sortPlausible(distinctWordOthers);
    const uniqueWords: string[] = [];
    for (const c of candidates) {
      if (!uniqueWords.includes(c.word)) uniqueWords.push(c.word);
      if (uniqueWords.length === 3) break;
    }
    if (uniqueWords.length < 3) return null;
    prompt = `Which English word means "${entry.meaning}"?`;
    correctAnswerText = entry.word;
    distractorTexts = uniqueWords;
  } else if (format === 'definition_match') {
    const candidates = sortPlausible(distinctWordOthers);
    const uniqueWords: string[] = [];
    for (const c of candidates) {
      if (!uniqueWords.includes(c.word)) uniqueWords.push(c.word);
      if (uniqueWords.length === 3) break;
    }
    if (uniqueWords.length < 3) return null;
    prompt = `Match this ${entry.partOfSpeech} meaning: "${entry.meaning}"`;
    correctAnswerText = entry.word;
    distractorTexts = uniqueWords;
  } else if (format === 'fill_blank' || format === 'context_choice') {
    const candidates = sortPlausible(distinctWordOthers);
    const uniqueWords: string[] = [];
    for (const c of candidates) {
      if (!uniqueWords.includes(c.word)) uniqueWords.push(c.word);
      if (uniqueWords.length === 3) break;
    }
    if (uniqueWords.length < 3) return null;
    const regex = new RegExp(`\\b${escapeRegExp(entry.word.trim())}\\b`, 'i');
    if (!regex.test(entry.example)) return null;
    contextSentence = entry.example.replace(regex, '______');
    prompt =
      format === 'fill_blank'
        ? 'Fill in the blank with the correct English word:'
        : `Choose the correct word in context (${entry.meaning}):`;
    correctAnswerText = entry.word;
    distractorTexts = uniqueWords;
  }

  const allOptions = shuffleArray([correctAnswerText, ...distractorTexts], rng);
  const correctOptionIndex = allOptions.indexOf(correctAnswerText);

  return {
    id: `q_${questionIndex}_${entry.id}_${format}_${Math.floor(rng() * 1e6)}`,
    entryId: entry.id,
    role,
    format,
    prompt,
    contextSentence,
    options: allOptions,
    correctOptionIndex,
    correctAnswerText,
    word: entry.word,
    meaning: entry.meaning,
    partOfSpeech: entry.partOfSpeech,
    ipa: entry.ipa,
    example: entry.example,
    explanation: `"${entry.word}" (${entry.partOfSpeech}) means "${entry.meaning}".`,
  };
}

export interface QuestionGenerationResult {
  ok: boolean;
  questions: MatchQuestion[];
  poolSize: number;
  requiresReusePermission?: boolean;
  error?: string;
}

export function generateMatchQuestions(
  selectedPool: VocabularyEntry[],
  options: {
    count?: number;
    recentWordIds?: string[];
    allowQuestionReuse?: boolean;
    fixedRoles?: QuestionRole[];
    rng?: () => number;
  } = {}
): QuestionGenerationResult {
  const count = options.count ?? 10;
  const rng = options.rng ?? Math.random;
  const recentRank = new Map<string, number>();
  (options.recentWordIds ?? []).forEach((id, idx) => {
    if (!recentRank.has(id)) {
      recentRank.set(id, idx);
    }
  });

  // Deduplicate entries by ID
  const uniquePool = selectedPool.filter(
    (entry, idx, arr) =>
      entry.word.trim().length > 0 &&
      entry.meaning.trim().length > 0 &&
      arr.findIndex((x) => x.id === entry.id) === idx
  );

  // Need at least 4 distinct entries with unique words/meanings for 4-option multiple choice
  const uniqueWordsCount = new Set(uniquePool.map((e) => e.word.trim().toLowerCase())).size;
  const uniqueMeaningsCount = new Set(uniquePool.map((e) => e.meaning.trim().toLowerCase())).size;

  if (uniquePool.length < 4 || uniqueWordsCount < 4 || uniqueMeaningsCount < 4) {
    return {
      ok: false,
      questions: [],
      poolSize: uniquePool.length,
      error: `Your selected vocabulary source has ${uniquePool.length} valid word(s). Add or select at least 4 distinct words with unique Vietnamese meanings to generate reliable multiple-choice questions.`,
    };
  }

  if (uniquePool.length < count && !options.allowQuestionReuse) {
    return {
      ok: false,
      questions: [],
      poolSize: uniquePool.length,
      requiresReusePermission: true,
      error: `Your selected vocabulary source has ${uniquePool.length} words, which is fewer than the ${count} distinct questions needed for a match. Add more vocabulary or grant permission to reuse words across different question formats.`,
    };
  }

  // Pre-assign random tie-break keys so equal-priority words rotate organically
  const randKey = new Map<string, number>();
  for (const e of uniquePool) {
    randKey.set(e.id, rng());
  }

  const getLastAnsweredMs = (e: VocabularyEntry): number => {
    if (!e.stats.lastAnsweredAt) return 0;
    const t = Date.parse(e.stats.lastAnsweredAt);
    return Number.isNaN(t) ? 0 : t;
  };

  // Separate unmastered (New/Learning) from Mastered words.
  // Mastered words are strictly skipped while enough unmastered words exist,
  // and only used as a last-resort top-up (oldest-answered first) if activePool < count.
  const activePool = uniquePool.filter((e) => e.status !== 'Mastered');
  const masteredPool = uniquePool.filter((e) => e.status === 'Mastered');

  // Tier 1: Completely unseen words (attempts === 0 and not in recentWordIds)
  const tier1Unseen = shuffleArray(
    activePool.filter((e) => e.stats.attempts === 0 && !recentRank.has(e.id)),
    rng
  );

  // Tier 2: Unmastered words needing review (previously missed), not asked in the immediately preceding match
  const tier2NeedsReview = activePool
    .filter(
      (e) =>
        e.stats.attempts > 0 &&
        e.stats.needsReview &&
        (!recentRank.has(e.id) || (recentRank.get(e.id) ?? Infinity) >= 10)
    )
    .sort((a, b) => {
      if (a.stats.correct !== b.stats.correct) return a.stats.correct - b.stats.correct;
      const tDiff = getLastAnsweredMs(a) - getLastAnsweredMs(b);
      if (tDiff !== 0) return tDiff;
      return (randKey.get(a.id) ?? 0) - (randKey.get(b.id) ?? 0);
    });

  const usedInTopTiers = new Set<string>([
    ...tier1Unseen.map((e) => e.id),
    ...tier2NeedsReview.map((e) => e.id),
  ]);

  // Tier 3: Unmastered words answered correctly in older sessions (not in recentWordIds),
  // sorted by fewest correct answers -> oldest lastAnsweredAt so the entire library cycles fairly
  const tier3OlderLearning = activePool
    .filter((e) => !usedInTopTiers.has(e.id) && !recentRank.has(e.id))
    .sort((a, b) => {
      if (a.stats.correct !== b.stats.correct) return a.stats.correct - b.stats.correct;
      const tDiff = getLastAnsweredMs(a) - getLastAnsweredMs(b);
      if (tDiff !== 0) return tDiff;
      return (randKey.get(a.id) ?? 0) - (randKey.get(b.id) ?? 0);
    });

  // Tier 4: Recently asked unmastered words — ordered LEAST-recently-used first (highest recentRank first)
  // so words from the immediately preceding match are dead last
  const tier4RecentActive = activePool
    .filter((e) => !usedInTopTiers.has(e.id) && recentRank.has(e.id))
    .sort((a, b) => {
      const rankA = recentRank.get(a.id) ?? 0;
      const rankB = recentRank.get(b.id) ?? 0;
      const windowA = Math.floor(rankA / 10);
      const windowB = Math.floor(rankB / 10);
      if (windowA !== windowB) return windowB - windowA; // Older match window first
      if (a.stats.needsReview !== b.stats.needsReview) return a.stats.needsReview ? -1 : 1;
      if (rankA !== rankB) return rankB - rankA;
      return (randKey.get(a.id) ?? 0) - (randKey.get(b.id) ?? 0);
    });

  // Tier 5: Mastered words — only tapped if fewer than `count` unmastered words exist
  const tier5MasteredFallback = masteredPool.slice().sort((a, b) => {
    const rankA = recentRank.has(a.id) ? (recentRank.get(a.id) ?? 0) : Number.MAX_SAFE_INTEGER;
    const rankB = recentRank.has(b.id) ? (recentRank.get(b.id) ?? 0) : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankB - rankA; // Not in recent first, then oldest recent
    const tDiff = getLastAnsweredMs(a) - getLastAnsweredMs(b);
    if (tDiff !== 0) return tDiff;
    return (randKey.get(a.id) ?? 0) - (randKey.get(b.id) ?? 0);
  });

  const prioritizedPool = [
    ...tier1Unseen,
    ...tier2NeedsReview,
    ...tier3OlderLearning,
    ...tier4RecentActive,
    ...tier5MasteredFallback,
  ];

  const roles: QuestionRole[] =
    options.fixedRoles ??
    Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 'ATTACK' : 'GOALKEEPER'));

  const questions: MatchQuestion[] = [];
  const usedPairs = new Set<string>(); // `${entryId}:${format}`

  // Pass 1: One distinct entry per question where possible
  const entryQueue: VocabularyEntry[] = [];
  if (prioritizedPool.length >= count) {
    entryQueue.push(...prioritizedPool.slice(0, count));
  } else {
    // Reuse entries cleanly across different formats when explicitly permitted
    let cursor = 0;
    while (entryQueue.length < count) {
      entryQueue.push(prioritizedPool[cursor % prioritizedPool.length]);
      cursor++;
    }
  }

  for (let i = 0; i < count; i++) {
    const entry = entryQueue[i];
    const role = roles[i];
    const eligible = shuffleArray(getEligibleFormatsForEntry(entry), rng);

    let built: MatchQuestion | null = null;
    // Try unused (entry, format) pairs first so we never duplicate the exact same question in a match
    for (const fmt of eligible) {
      const pairKey = `${entry.id}:${fmt}`;
      if (!usedPairs.has(pairKey)) {
        const candidate = buildSingleQuestion(entry, uniquePool, role, fmt, i, rng);
        if (candidate) {
          built = candidate;
          usedPairs.add(pairKey);
          break;
        }
      }
    }

    // Fallback: try any other entry in pool with an unused format
    if (!built) {
      for (const altEntry of prioritizedPool) {
        const altEligible = shuffleArray(getEligibleFormatsForEntry(altEntry), rng);
        for (const fmt of altEligible) {
          const pairKey = `${altEntry.id}:${fmt}`;
          if (!usedPairs.has(pairKey)) {
            const candidate = buildSingleQuestion(altEntry, uniquePool, role, fmt, i, rng);
            if (candidate) {
              built = candidate;
              usedPairs.add(pairKey);
              break;
            }
          }
        }
        if (built) break;
      }
    }

    // Final fallback when reuse is explicitly allowed and pool is tiny (4-5 words)
    if (!built && options.allowQuestionReuse) {
      for (const fmt of eligible) {
        const candidate = buildSingleQuestion(entry, uniquePool, role, fmt, i, rng);
        if (candidate) {
          built = candidate;
          break;
        }
      }
    }

    if (!built) {
      return {
        ok: false,
        questions: [],
        poolSize: uniquePool.length,
        error: 'Could not construct enough reliable questions from the selected vocabulary entries.',
      };
    }

    questions.push(built);
  }

  return {
    ok: true,
    questions,
    poolSize: uniquePool.length,
  };
}

export function generateSingleShootoutQuestion(
  selectedPool: VocabularyEntry[],
  role: QuestionRole,
  usedEntryIds: string[],
  rng: () => number = Math.random
): MatchQuestion | null {
  const result = generateMatchQuestions(selectedPool, {
    count: 1,
    recentWordIds: usedEntryIds,
    allowQuestionReuse: true,
    fixedRoles: [role],
    rng,
  });
  return result.ok && result.questions.length === 1 ? result.questions[0] : null;
}
