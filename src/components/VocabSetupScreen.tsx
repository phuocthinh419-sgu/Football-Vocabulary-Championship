import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Download,
  Play,
} from 'lucide-react';
import {
  Competition,
  DifficultyLevel,
  VocabSelectionMode,
  VocabularyLibraryState,
  VocabularySourceConfig,
} from '../types/game';
import { getTeamById } from '../data/competitions';
import { OPTIONAL_SAMPLE_PACKS } from '../data/sampleVocabulary';
import { filterSelectedVocabulary } from '../engine/vocabularyEngine';
import { TeamBadge } from './TeamBadge';

interface VocabSetupScreenProps {
  competition: Competition;
  selectedTeamId: string;
  library: VocabularyLibraryState;
  initialConfig: VocabularySourceConfig;
  hasExistingCareer: boolean;
  onBack: () => void;
  onOpenLibrary: () => void;
  onImportSamplePack: (packId: string) => void;
  onStartCareer: (config: VocabularySourceConfig) => void;
}

const SOURCE_MODES: Array<{ id: VocabSelectionMode; label: string; desc: string }> = [
  { id: 'all', label: 'Entire Personal Library', desc: 'Use all words saved in your personal vocabulary library.' },
  { id: 'single_collection', label: 'One Selected Collection', desc: 'Focus on a single custom collection.' },
  { id: 'multi_collection', label: 'Multiple Collections', desc: 'Combine two or more collections.' },
  { id: 'learning_only', label: 'Learning & Review Only', desc: 'Practice words currently marked as Learning or needing review.' },
  { id: 'custom_words', label: 'Custom Word Selection', desc: 'Hand-pick specific words for your matches.' },
];

const DIFFICULTIES: Array<DifficultyLevel | 'ALL'> = ['ALL', 'A2', 'B1', 'B2', 'C1'];

export const VocabSetupScreen: React.FC<VocabSetupScreenProps> = ({
  competition,
  selectedTeamId,
  library,
  initialConfig,
  hasExistingCareer,
  onBack,
  onOpenLibrary,
  onImportSamplePack,
  onStartCareer,
}) => {
  const team = getTeamById(selectedTeamId);
  const [config, setConfig] = useState<VocabularySourceConfig>(() => ({
    ...initialConfig,
    collectionIds:
      initialConfig.collectionIds.length > 0
        ? initialConfig.collectionIds
        : library.collections[0]
          ? [library.collections[0].id]
          : [],
  }));
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const matchedWords = useMemo(
    () => filterSelectedVocabulary(library, config),
    [library, config]
  );

  const uniqueWordCount = useMemo(
    () => new Set(matchedWords.map((w) => w.word.trim().toLowerCase())).size,
    [matchedWords]
  );

  const activeUnmasteredCount = useMemo(
    () => matchedWords.filter((w) => w.status !== 'Mastered').length,
    [matchedWords]
  );

  const masteredCount = matchedWords.length - activeUnmasteredCount;

  const canStart =
    uniqueWordCount >= 4 && (uniqueWordCount >= 10 || config.allowQuestionReuse);

  const handleToggleCollection = (colId: string) => {
    if (config.mode === 'single_collection') {
      setConfig((prev) => ({ ...prev, collectionIds: [colId] }));
      return;
    }
    setConfig((prev) => {
      const exists = prev.collectionIds.includes(colId);
      return {
        ...prev,
        collectionIds: exists
          ? prev.collectionIds.filter((id) => id !== colId)
          : [...prev.collectionIds, colId],
      };
    });
  };

  const handleToggleCustomWord = (wordId: string) => {
    setConfig((prev) => {
      const exists = prev.customWordIds.includes(wordId);
      return {
        ...prev,
        customWordIds: exists
          ? prev.customWordIds.filter((id) => id !== wordId)
          : [...prev.customWordIds, wordId],
      };
    });
  };

  const handleLaunchClick = () => {
    if (!canStart) return;
    if (hasExistingCareer && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }
    onStartCareer(config);
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              Team Selection
            </button>
            <div>
              <p className="text-xs text-slate-400">
                Step 3 of 3 · {competition.name} · {team.name}
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Choose Match Vocabulary
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/15 bg-[#111B30] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-emerald-400/50 whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Manage Vocabulary Library
          </button>
        </div>

        {/* Empty Personal Vocabulary Library notice */}
        {library.entries.length === 0 && (
          <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-500/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-amber-200">
                  Your Personal Vocabulary Library is Empty
                </h2>
                <p className="mt-1 text-sm text-slate-200 max-w-2xl">
                  This championship strictly uses words you choose to study—no external words are ever injected silently. Add your own English-Vietnamese vocabulary in the Library, or explicitly import an optional sample collection below.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/20 bg-[#0D1628] px-4 py-2 text-sm font-semibold text-white hover:border-emerald-400 whitespace-nowrap"
                >
                  <BookOpen className="h-4 w-4" />
                  Add My Own Words
                </button>
                {OPTIONAL_SAMPLE_PACKS.map((pack) => (
                  <button
                    key={pack.collection.id}
                    type="button"
                    onClick={() => onImportSamplePack(pack.collection.id)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" />
                    Import {pack.collection.name} ({pack.entries.length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Vocabulary source & difficulty selection */}
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
              <h2 className="font-display text-xl font-bold text-white">1. Vocabulary Source</h2>
              <p className="mt-1 text-xs text-slate-400">
                Questions will be generated exclusively from your chosen selection.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SOURCE_MODES.map((m) => {
                  const active = config.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          mode: m.id,
                          collectionIds:
                            m.id === 'single_collection' && prev.collectionIds.length > 1
                              ? [prev.collectionIds[0]]
                              : prev.collectionIds,
                        }))
                      }
                      aria-pressed={active}
                      className={`rounded-lg border p-3.5 text-left transition-colors ${
                        active
                          ? 'border-emerald-400 bg-emerald-500/12 text-white'
                          : 'border-white/10 bg-[#0A1120] text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                        <span>{m.label}</span>
                        {active && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Collection Picker */}
              {(config.mode === 'single_collection' || config.mode === 'multi_collection') && (
                <div className="mt-5 border-t border-white/8 pt-4">
                  <span className="block text-xs font-semibold text-slate-300 mb-2.5">
                    {config.mode === 'single_collection'
                      ? 'Choose One Collection'
                      : 'Choose One or More Collections'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {library.collections.map((col) => {
                      const count = library.entries.filter((e) =>
                        e.collectionIds.includes(col.id)
                      ).length;
                      const selected = config.collectionIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleToggleCollection(col.id)}
                          aria-pressed={selected}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                            selected
                              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                              : 'border-white/10 bg-[#0A1120] text-slate-300 hover:border-white/25'
                          }`}
                        >
                          <span>{col.name}</span>
                          <span className="font-mono-num text-slate-400">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Word Picker */}
              {config.mode === 'custom_words' && (
                <div className="mt-5 border-t border-white/8 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Select Specific Words ({config.customWordIds.length} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          customWordIds: library.entries.map((e) => e.id),
                        }))
                      }
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[#0A1120] divide-y divide-white/6">
                    {library.entries.map((entry) => {
                      const checked = config.customWordIds.includes(entry.id);
                      return (
                        <label
                          key={entry.id}
                          className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-sm hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleCustomWord(entry.id)}
                              className="h-4 w-4 rounded border-white/20 accent-emerald-500"
                            />
                            <span className="font-semibold text-white truncate">{entry.word}</span>
                            <span className="text-xs text-slate-400 truncate">— {entry.meaning}</span>
                          </div>
                          <span className="font-mono-num text-xs text-slate-400 shrink-0">
                            {entry.difficulty}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Difficulty Metadata Filter */}
            <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
              <h2 className="font-display text-xl font-bold text-white">
                2. Preferred Difficulty Level
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Filters words by your assigned difficulty metadata (A2, B1, B2, or C1). Levels are never automatically altered during tournament progression.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {DIFFICULTIES.map((level) => {
                  const active = config.preferredDifficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, preferredDifficulty: level }))
                      }
                      aria-pressed={active}
                      className={`min-h-[42px] min-w-[72px] rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
                        active
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                          : 'border-white/12 bg-[#0A1120] text-slate-200 hover:border-white/30'
                      }`}
                    >
                      {level === 'ALL' ? 'All Levels' : level}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Summary & Start Career */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border border-white/10 bg-[#10192D] p-6">
              <div className="flex items-center gap-3.5 border-b border-white/8 pb-4">
                <TeamBadge team={team} size="md" />
                <div className="min-w-0">
                  <div className="font-display text-xl font-bold text-white truncate">
                    {team.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {competition.name} · {competition.season}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Matching Words</span>
                  <span
                    className={`font-mono-num text-lg font-bold ${
                      uniqueWordCount >= 10
                        ? 'text-emerald-400'
                        : uniqueWordCount >= 4
                          ? 'text-amber-300'
                          : 'text-red-400'
                    }`}
                  >
                    {uniqueWordCount}
                  </span>
                </div>
                {masteredCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Active / Mastered (skipped)</span>
                    <span className="font-mono-num font-semibold text-slate-200">
                      <span className="text-emerald-400">{activeUnmasteredCount}</span>
                      {' / '}
                      <span className="text-slate-400">{masteredCount}</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Questions per Match</span>
                  <span className="font-mono-num font-semibold text-white">10 (5 ATK · 5 GK)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Difficulty Filter</span>
                  <span className="font-semibold text-white">
                    {config.preferredDifficulty === 'ALL'
                      ? 'All Levels'
                      : config.preferredDifficulty}
                  </span>
                </div>
              </div>

              {/* Validation & Reuse Permission */}
              {uniqueWordCount < 4 && (
                <div className="mt-4 rounded-lg border border-red-500/35 bg-red-500/10 p-3.5 text-xs text-red-200">
                  <div className="flex items-center gap-2 font-semibold text-red-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    At least 4 distinct words required
                  </div>
                  <p className="mt-1">
                    Add more entries in your Vocabulary Library or broaden your collection / difficulty filter.
                  </p>
                </div>
              )}

              {uniqueWordCount >= 4 && uniqueWordCount < 10 && (
                <div className="mt-4 rounded-lg border border-amber-400/35 bg-amber-500/10 p-3.5 text-xs text-amber-100">
                  <p className="font-semibold text-amber-300">
                    Small vocabulary pool ({uniqueWordCount} of 10 words)
                  </p>
                  <p className="mt-1 text-slate-200">
                    To play a 10-question match using only these words, either add more words or allow reusing words across different question formats.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs font-medium text-white">
                    <input
                      type="checkbox"
                      checked={config.allowQuestionReuse}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          allowQuestionReuse: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 accent-emerald-500"
                    />
                    <span>Allow reusing selected words in different formats to fill 10 questions</span>
                  </label>
                </div>
              )}

              {/* Overwrite Existing Career Warning */}
              {confirmOverwrite && (
                <div className="mt-4 rounded-lg border border-amber-400/45 bg-amber-500/15 p-3.5 text-xs text-amber-100">
                  <p className="font-bold text-amber-300">Overwrite Existing Career?</p>
                  <p className="mt-1">
                    Starting a new career will replace your currently active saved tournament. Your personal vocabulary library and earned trophies will remain intact.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartCareer(config)}
                      className="rounded-md bg-amber-400 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-300"
                    >
                      Yes, Start New Career
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmOverwrite(false)}
                      className="rounded-md border border-white/15 px-3 py-1.5 text-slate-200 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!confirmOverwrite && (
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={handleLaunchClick}
                  className={`mt-6 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
                    canStart
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'cursor-not-allowed bg-slate-800 text-slate-500'
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  Launch Championship Career
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
