import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Edit3,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DifficultyLevel,
  LearningStatus,
  VocabularyEntry,
  VocabularyLibraryState,
} from '../types/game';
import { OPTIONAL_SAMPLE_PACKS } from '../data/sampleVocabulary';
import {
  BulkImportParseResult,
  exportVocabularyToCsv,
  parseBulkVocabularyInput,
} from '../engine/vocabularyEngine';

interface VocabularyLibraryScreenProps {
  library: VocabularyLibraryState;
  onBack: () => void;
  backLabel?: string;
  onSaveLibrary: (next: VocabularyLibraryState) => void;
  onImportSamplePack: (packId: string) => void;
}

const EMPTY_FORM: {
  id?: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  ipa: string;
  example: string;
  difficulty: DifficultyLevel;
  topic: string;
  source: string;
  notes: string;
  status: LearningStatus;
  collectionIds: string[];
} = {
  word: '',
  meaning: '',
  partOfSpeech: 'noun',
  ipa: '',
  example: '',
  difficulty: 'B1',
  topic: 'General',
  source: '',
  notes: '',
  status: 'New',
  collectionIds: ['col_personal'],
};

export const VocabularyLibraryScreen: React.FC<VocabularyLibraryScreenProps> = ({
  library,
  onBack,
  backLabel = 'Back',
  onSaveLibrary,
  onImportSamplePack,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LearningStatus | 'ALL'>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');

  // Modals / Drawers
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordForm, setWordForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRaw, setBulkRaw] = useState('');
  const [bulkCollectionId, setBulkCollectionId] = useState(
    library.collections[0]?.id ?? 'col_personal'
  );
  const [bulkDifficulty, setBulkDifficulty] = useState<DifficultyLevel>('B1');
  const [bulkTopic, setBulkTopic] = useState('General');
  const [bulkPreview, setBulkPreview] = useState<BulkImportParseResult | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip');

  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewColForm, setShowNewColForm] = useState(false);

  const topics = useMemo(() => {
    return Array.from(new Set(library.entries.map((e) => e.topic).filter(Boolean))).sort();
  }, [library.entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return library.entries.filter((e) => {
      if (selectedCollectionId !== 'ALL' && !e.collectionIds.includes(selectedCollectionId)) {
        return false;
      }
      if (difficultyFilter !== 'ALL' && e.difficulty !== difficultyFilter) return false;
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (topicFilter !== 'ALL' && e.topic !== topicFilter) return false;
      if (
        q &&
        !e.word.toLowerCase().includes(q) &&
        !e.meaning.toLowerCase().includes(q) &&
        !e.topic.toLowerCase().includes(q) &&
        !e.example.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [library.entries, selectedCollectionId, search, difficultyFilter, statusFilter, topicFilter]);

  const openAddWord = () => {
    setFormError('');
    setWordForm({
      ...EMPTY_FORM,
      collectionIds:
        selectedCollectionId !== 'ALL'
          ? [selectedCollectionId]
          : [library.collections[0]?.id ?? 'col_personal'],
    });
    setShowWordModal(true);
  };

  const openEditWord = (entry: VocabularyEntry) => {
    setFormError('');
    setWordForm({
      id: entry.id,
      word: entry.word,
      meaning: entry.meaning,
      partOfSpeech: entry.partOfSpeech,
      ipa: entry.ipa ?? '',
      example: entry.example,
      difficulty: entry.difficulty,
      topic: entry.topic,
      source: entry.source ?? '',
      notes: entry.notes ?? '',
      status: entry.status,
      collectionIds: entry.collectionIds.length ? entry.collectionIds : ['col_personal'],
    });
    setShowWordModal(true);
  };

  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = wordForm.word.trim();
    const trimmedMeaning = wordForm.meaning.trim();
    if (!trimmedWord || !trimmedMeaning) {
      setFormError('Both English word and Vietnamese meaning are required.');
      return;
    }

    const now = new Date().toISOString();
    if (wordForm.id) {
      const updatedEntries = library.entries.map((item) =>
        item.id === wordForm.id
          ? {
              ...item,
              word: trimmedWord,
              meaning: trimmedMeaning,
              partOfSpeech: wordForm.partOfSpeech.trim() || 'noun',
              ipa: wordForm.ipa.trim() || undefined,
              example: wordForm.example.trim(),
              difficulty: wordForm.difficulty,
              topic: wordForm.topic.trim() || 'General',
              source: wordForm.source.trim() || undefined,
              notes: wordForm.notes.trim() || undefined,
              status: wordForm.status,
              collectionIds: wordForm.collectionIds,
              updatedAt: now,
            }
          : item
      );
      onSaveLibrary({ ...library, entries: updatedEntries });
    } else {
      const newEntry: VocabularyEntry = {
        id: `w_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        word: trimmedWord,
        meaning: trimmedMeaning,
        partOfSpeech: wordForm.partOfSpeech.trim() || 'noun',
        ipa: wordForm.ipa.trim() || undefined,
        example: wordForm.example.trim(),
        difficulty: wordForm.difficulty,
        topic: wordForm.topic.trim() || 'General',
        source: wordForm.source.trim() || undefined,
        notes: wordForm.notes.trim() || undefined,
        status: wordForm.status,
        collectionIds: wordForm.collectionIds,
        createdAt: now,
        updatedAt: now,
        stats: {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          needsReview: false,
        },
      };
      onSaveLibrary({ ...library, entries: [newEntry, ...library.entries] });
    }
    setShowWordModal(false);
  };

  const handleDeleteWord = (id: string) => {
    onSaveLibrary({
      ...library,
      entries: library.entries.filter((e) => e.id !== id),
    });
  };

  const handleCycleStatus = (entry: VocabularyEntry) => {
    const order: LearningStatus[] = ['New', 'Learning', 'Mastered'];
    const nextStatus = order[(order.indexOf(entry.status) + 1) % order.length];
    onSaveLibrary({
      ...library,
      entries: library.entries.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              status: nextStatus,
              stats: {
                ...item.stats,
                needsReview: nextStatus === 'Learning' ? true : false,
              },
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    });
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    const id = `col_${Date.now()}`;
    onSaveLibrary({
      ...library,
      collections: [
        ...library.collections,
        {
          id,
          name,
          description: 'Custom vocabulary collection',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setNewCollectionName('');
    setShowNewColForm(false);
    setSelectedCollectionId(id);
  };

  const handleDeleteCollection = (colId: string) => {
    if (colId === 'col_personal') return;
    const remainingCols = library.collections.filter((c) => c.id !== colId);
    const updatedEntries = library.entries.map((entry) => ({
      ...entry,
      collectionIds: entry.collectionIds.filter((id) => id !== colId),
    }));
    onSaveLibrary({
      collections: remainingCols,
      entries: updatedEntries,
    });
    if (selectedCollectionId === colId) {
      setSelectedCollectionId('ALL');
    }
  };

  const handleRunBulkPreview = () => {
    const result = parseBulkVocabularyInput(
      bulkRaw,
      library.entries,
      bulkDifficulty,
      bulkTopic.trim() || 'General'
    );
    setBulkPreview(result);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      setBulkRaw(content);
      setBulkPreview(
        parseBulkVocabularyInput(content, library.entries, bulkDifficulty, bulkTopic || 'General')
      );
    };
    reader.readAsText(file);
  };

  const handleCommitBulkImport = () => {
    if (!bulkPreview) return;
    const now = new Date().toISOString();
    let nextEntries = library.entries.slice();

    // Update duplicates if user chose 'update'
    if (duplicateStrategy === 'update' && bulkPreview.duplicates.length > 0) {
      const dupMap = new Map(bulkPreview.duplicates.map((d) => [d.existingEntryId, d]));
      nextEntries = nextEntries.map((entry) => {
        const dup = dupMap.get(entry.id);
        if (!dup) return entry;
        return {
          ...entry,
          meaning: dup.meaning,
          partOfSpeech: dup.partOfSpeech || entry.partOfSpeech,
          example: dup.example || entry.example,
          ipa: dup.ipa ?? entry.ipa,
          difficulty: dup.difficulty,
          topic: dup.topic || entry.topic,
          collectionIds: Array.from(new Set([...entry.collectionIds, bulkCollectionId])),
          updatedAt: now,
        };
      });
    }

    // Add valid new rows
    const created: VocabularyEntry[] = bulkPreview.validRows.map((row, idx) => ({
      id: `bulk_${Date.now()}_${idx}`,
      word: row.word,
      meaning: row.meaning,
      partOfSpeech: row.partOfSpeech,
      ipa: row.ipa,
      example: row.example,
      difficulty: row.difficulty,
      topic: row.topic,
      status: 'New',
      collectionIds: [bulkCollectionId],
      createdAt: now,
      updatedAt: now,
      stats: { attempts: 0, correct: 0, incorrect: 0, needsReview: false },
    }));

    onSaveLibrary({
      ...library,
      entries: [...created, ...nextEntries],
    });
    setBulkRaw('');
    setBulkPreview(null);
    setShowBulkModal(false);
  };

  const handleExportCsv = () => {
    const csv = exportVocabularyToCsv(filteredEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-vocab-library-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
            <div>
              <p className="text-xs text-slate-400">
                Personal Study Data · Stored Independently From Career Saves
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Personal Vocabulary Library
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setBulkPreview(null);
                setShowBulkModal(true);
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/15 bg-[#111B30] px-4 py-2 text-sm font-semibold text-white hover:border-emerald-400/50 whitespace-nowrap"
            >
              <Upload className="h-4 w-4 text-sky-400" />
              Bulk Import / CSV
            </button>
            <button
              type="button"
              disabled={filteredEntries.length === 0}
              onClick={handleExportCsv}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/15 bg-[#111B30] px-4 py-2 text-sm font-semibold text-white hover:border-emerald-400/50 disabled:opacity-40 whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-amber-400" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={openAddWord}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add Vocabulary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sidebar: Collections & Optional Sample Packs */}
          <aside className="space-y-6 lg:col-span-3">
            <div className="rounded-xl border border-white/10 bg-[#10192D] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-white">Collections</h2>
                <button
                  type="button"
                  onClick={() => setShowNewColForm((v) => !v)}
                  aria-label="Create new collection"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0A1120] text-slate-300 hover:border-emerald-400 hover:text-white"
                >
                  <FolderPlus className="h-4 w-4" />
                </button>
              </div>

              {showNewColForm && (
                <form onSubmit={handleCreateCollection} className="mb-3 flex gap-1.5">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. IELTS Reading"
                    className="h-9 min-w-0 flex-1 rounded-md border border-white/15 bg-[#0A1120] px-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-500 px-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    Add
                  </button>
                </form>
              )}

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCollectionId('ALL')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedCollectionId === 'ALL'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>All Vocabulary</span>
                  <span className="font-mono-num text-xs text-slate-400">
                    {library.entries.length}
                  </span>
                </button>

                {library.collections.map((col) => {
                  const count = library.entries.filter((e) =>
                    e.collectionIds.includes(col.id)
                  ).length;
                  const active = selectedCollectionId === col.id;
                  return (
                    <div key={col.id} className="group flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCollectionId(col.id)}
                        className={`flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{col.name}</span>
                        <span className="font-mono-num text-xs text-slate-400">{count}</span>
                      </button>
                      {col.id !== 'col_personal' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col.id)}
                          aria-label={`Delete collection ${col.name}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Sample Packs */}
            <div className="rounded-xl border border-white/10 bg-[#10192D] p-4">
              <h2 className="font-display text-lg font-bold text-white">Optional Sample Packs</h2>
              <p className="mt-1 text-xs text-slate-400">
                Curated English-Vietnamese collections you can explicitly import into your library.
              </p>
              <div className="mt-3 space-y-2.5">
                {OPTIONAL_SAMPLE_PACKS.map((pack) => {
                  const alreadyImported = library.collections.some(
                    (c) => c.id === pack.collection.id
                  );
                  return (
                    <div
                      key={pack.collection.id}
                      className="rounded-lg border border-white/8 bg-[#0A1120] p-3"
                    >
                      <div className="text-sm font-semibold text-white">
                        {pack.collection.name}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {pack.entries.length} entries · {pack.collection.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => onImportSamplePack(pack.collection.id)}
                        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {alreadyImported ? 'Re-sync Sample Pack' : 'Import Sample Pack'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Main Area: Filters & Entries */}
          <div className="lg:col-span-9">
            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
              <div className="relative sm:col-span-5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <label htmlFor="vocab-search" className="sr-only">
                  Search vocabulary
                </label>
                <input
                  id="vocab-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search English word, Vietnamese meaning..."
                  className="h-10 w-full rounded-lg border border-white/12 bg-[#10192D] pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <select
                aria-label="Filter by difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'ALL')}
                className="h-10 rounded-lg border border-white/12 bg-[#10192D] px-3 text-sm text-white sm:col-span-2 focus:border-emerald-400 focus:outline-none"
              >
                <option value="ALL">All Levels</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>

              <select
                aria-label="Filter by learning status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LearningStatus | 'ALL')}
                className="h-10 rounded-lg border border-white/12 bg-[#10192D] px-3 text-sm text-white sm:col-span-2 focus:border-emerald-400 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="New">New</option>
                <option value="Learning">Learning</option>
                <option value="Mastered">Mastered</option>
              </select>

              <select
                aria-label="Filter by topic"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="h-10 rounded-lg border border-white/12 bg-[#10192D] px-3 text-sm text-white sm:col-span-3 focus:border-emerald-400 focus:outline-none"
              >
                <option value="ALL">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#10192D] p-12 text-center">
                <p className="text-base font-semibold text-white">No vocabulary entries found</p>
                <p className="mt-1.5 text-sm text-slate-400">
                  Add words manually, paste a list via Bulk Import, or import an optional sample collection from the sidebar.
                </p>
                <button
                  type="button"
                  onClick={openAddWord}
                  className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Word
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#10192D] divide-y divide-white/8">
                {filteredEntries.map((entry) => {
                  const accuracy =
                    entry.stats.attempts > 0
                      ? Math.round((entry.stats.correct / entry.stats.attempts) * 100)
                      : null;
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                          <span className="text-base font-bold text-white">{entry.word}</span>
                          {entry.ipa && (
                            <span className="font-mono text-xs text-slate-400">{entry.ipa}</span>
                          )}
                          <span className="text-xs text-emerald-400">{entry.partOfSpeech}</span>
                          <span className="text-xs text-slate-500" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-300">{entry.difficulty}</span>
                          <span className="text-xs text-slate-500" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-400">{entry.topic}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-amber-200">{entry.meaning}</p>
                        {entry.example && (
                          <p className="mt-1 text-xs italic text-slate-300">"{entry.example}"</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 tabular-nums">
                          {entry.stats.attempts > 0 ? (
                            <span>
                              Accuracy: {accuracy}% ({entry.stats.correct}/{entry.stats.attempts})
                            </span>
                          ) : (
                            <span>Not yet tested</span>
                          )}
                          {entry.source && <span>Source: {entry.source}</span>}
                          {entry.notes && <span>Note: {entry.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(entry)}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                            entry.status === 'Mastered'
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                              : entry.status === 'Learning'
                                ? 'border-amber-400/40 bg-amber-500/15 text-amber-300'
                                : 'border-white/15 bg-[#0A1120] text-slate-300'
                          }`}
                        >
                          {entry.status}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditWord(entry)}
                          aria-label={`Edit ${entry.word}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0A1120] text-slate-300 hover:border-white/30 hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWord(entry.id)}
                          aria-label={`Delete ${entry.word}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0A1120] text-slate-400 hover:border-red-400/50 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Single Vocabulary Entry Modal */}
      {showWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="word-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/15 bg-[#10192D] p-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 id="word-modal-title" className="font-display text-2xl font-bold text-white">
                {wordForm.id ? 'Edit Vocabulary Entry' : 'Add New Vocabulary'}
              </h2>
              <button
                type="button"
                onClick={() => setShowWordModal(false)}
                aria-label="Close modal"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-xs font-medium text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-word" className="block text-xs font-semibold text-slate-300 mb-1">
                    English Word or Phrase *
                  </label>
                  <input
                    id="f-word"
                    type="text"
                    required
                    value={wordForm.word}
                    onChange={(e) => setWordForm((p) => ({ ...p, word: e.target.value }))}
                    placeholder="e.g. equalizer"
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-meaning" className="block text-xs font-semibold text-slate-300 mb-1">
                    Vietnamese Meaning *
                  </label>
                  <input
                    id="f-meaning"
                    type="text"
                    required
                    value={wordForm.meaning}
                    onChange={(e) => setWordForm((p) => ({ ...p, meaning: e.target.value }))}
                    placeholder="e.g. bàn thắng gỡ hòa"
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="f-pos" className="block text-xs font-semibold text-slate-300 mb-1">
                    Part of Speech
                  </label>
                  <input
                    id="f-pos"
                    type="text"
                    value={wordForm.partOfSpeech}
                    onChange={(e) => setWordForm((p) => ({ ...p, partOfSpeech: e.target.value }))}
                    placeholder="noun, verb, adj..."
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-ipa" className="block text-xs font-semibold text-slate-300 mb-1">
                    IPA Pronunciation
                  </label>
                  <input
                    id="f-ipa"
                    type="text"
                    value={wordForm.ipa}
                    onChange={(e) => setWordForm((p) => ({ ...p, ipa: e.target.value }))}
                    placeholder="/ˈiː.kwə.laɪ.zər/"
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-diff" className="block text-xs font-semibold text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="f-diff"
                    value={wordForm.difficulty}
                    onChange={(e) =>
                      setWordForm((p) => ({ ...p, difficulty: e.target.value as DifficultyLevel }))
                    }
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="f-example" className="block text-xs font-semibold text-slate-300 mb-1">
                  Example Sentence (enables Fill-in-the-Blank & Context questions)
                </label>
                <input
                  id="f-example"
                  type="text"
                  value={wordForm.example}
                  onChange={(e) => setWordForm((p) => ({ ...p, example: e.target.value }))}
                  placeholder="She scored a dramatic equalizer in stoppage time."
                  className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="f-topic" className="block text-xs font-semibold text-slate-300 mb-1">
                    Topic / Category
                  </label>
                  <input
                    id="f-topic"
                    type="text"
                    value={wordForm.topic}
                    onChange={(e) => setWordForm((p) => ({ ...p, topic: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-source" className="block text-xs font-semibold text-slate-300 mb-1">
                    Source / Reference
                  </label>
                  <input
                    id="f-source"
                    type="text"
                    value={wordForm.source}
                    onChange={(e) => setWordForm((p) => ({ ...p, source: e.target.value }))}
                    placeholder="IELTS Unit 4..."
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-status" className="block text-xs font-semibold text-slate-300 mb-1">
                    Learning Status
                  </label>
                  <select
                    id="f-status"
                    value={wordForm.status}
                    onChange={(e) =>
                      setWordForm((p) => ({ ...p, status: e.target.value as LearningStatus }))
                    }
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Learning">Learning</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="f-notes" className="block text-xs font-semibold text-slate-300 mb-1">
                  Personal Notes
                </label>
                <input
                  id="f-notes"
                  type="text"
                  value={wordForm.notes}
                  onChange={(e) => setWordForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional memory tip or collocation..."
                  className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign to Collections
                </span>
                <div className="flex flex-wrap gap-2">
                  {library.collections.map((col) => {
                    const checked = wordForm.collectionIds.includes(col.id);
                    return (
                      <label
                        key={col.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-[#080E1A] px-3 py-1.5 text-xs text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setWordForm((p) => ({
                              ...p,
                              collectionIds: checked
                                ? p.collectionIds.filter((id) => id !== col.id)
                                : [...p.collectionIds, col.id],
                            }))
                          }
                          className="accent-emerald-500"
                        />
                        <span>{col.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWordModal(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import & CSV Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-modal-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/15 bg-[#10192D] p-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 id="bulk-modal-title" className="font-display text-2xl font-bold text-white">
                Bulk Import Vocabulary
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                aria-label="Close bulk import"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300">
                Paste one entry per line using <code className="text-emerald-300">word | meaning | part of speech | example</code> or upload a CSV file.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="bulk-col" className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Collection
                  </label>
                  <select
                    id="bulk-col"
                    value={bulkCollectionId}
                    onChange={(e) => setBulkCollectionId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white"
                  >
                    {library.collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulk-diff" className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Difficulty
                  </label>
                  <select
                    id="bulk-diff"
                    value={bulkDifficulty}
                    onChange={(e) => setBulkDifficulty(e.target.value as DifficultyLevel)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white"
                  >
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bulk-topic" className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Topic
                  </label>
                  <input
                    id="bulk-topic"
                    type="text"
                    value={bulkTopic}
                    onChange={(e) => setBulkTopic(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-[#080E1A] px-3 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="bulk-text" className="text-xs font-semibold text-slate-300">
                    Paste Lines or Upload CSV
                  </label>
                  <label className="cursor-pointer text-xs font-semibold text-sky-400 hover:text-sky-300">
                    Choose CSV File
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <textarea
                  id="bulk-text"
                  rows={6}
                  value={bulkRaw}
                  onChange={(e) => setBulkRaw(e.target.value)}
                  placeholder={`striker | tiền đạo | noun | The striker scored a hat-trick.\ndefender | hậu vệ | noun | Our central defender cleared the cross.`}
                  className="w-full rounded-lg border border-white/15 bg-[#080E1A] p-3 font-mono text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRunBulkPreview}
                  className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25"
                >
                  Validate & Preview
                </button>
              </div>

              {bulkPreview && (
                <div className="space-y-3 rounded-lg border border-white/10 bg-[#080E1A] p-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tabular-nums">
                    <span className="text-emerald-400">
                      {bulkPreview.validRows.length} new valid entries
                    </span>
                    <span className="text-amber-300">
                      {bulkPreview.duplicates.length} duplicates found
                    </span>
                    <span className="text-red-400">
                      {bulkPreview.invalidLines.length} invalid lines
                    </span>
                  </div>

                  {bulkPreview.duplicates.length > 0 && (
                    <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 text-xs">
                      <p className="font-semibold text-amber-200">
                        Duplicate words detected ({bulkPreview.duplicates.map((d) => d.word).join(', ')})
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="dupStrat"
                            checked={duplicateStrategy === 'skip'}
                            onChange={() => setDuplicateStrategy('skip')}
                            className="accent-emerald-500"
                          />
                          <span>Skip duplicates</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="dupStrat"
                            checked={duplicateStrategy === 'update'}
                            onChange={() => setDuplicateStrategy('update')}
                            className="accent-emerald-500"
                          />
                          <span>Update existing entries</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {bulkPreview.invalidLines.length > 0 && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                      <p className="font-semibold text-red-300 mb-1">Lines requiring attention:</p>
                      <ul className="space-y-1">
                        {bulkPreview.invalidLines.map((err) => (
                          <li key={err.lineNumber}>
                            Line {err.lineNumber}: {err.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {bulkPreview.validRows.length > 0 && (
                    <div className="max-h-40 overflow-y-auto divide-y divide-white/6 text-xs">
                      {bulkPreview.validRows.map((row) => (
                        <div key={row.lineNumber} className="flex justify-between gap-2 py-1.5">
                          <span className="font-semibold text-white">{row.word}</span>
                          <span className="text-amber-200">{row.meaning}</span>
                          <span className="text-slate-400">{row.partOfSpeech}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
                    <button
                      type="button"
                      disabled={
                        bulkPreview.validRows.length === 0 &&
                        !(duplicateStrategy === 'update' && bulkPreview.duplicates.length > 0)
                      }
                      onClick={handleCommitBulkImport}
                      className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
                    >
                      Save Imported Vocabulary
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
