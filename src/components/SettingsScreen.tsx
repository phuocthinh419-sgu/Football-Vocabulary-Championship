import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  RotateCcw,
  Upload,
} from 'lucide-react';
import {
  AppSettings,
  CareerSave,
  PlayerProfile,
  VocabularyLibraryState,
} from '../types/game';
import { COMPETITIONS, getTeamById, TEAMS } from '../data/competitions';
import { exportAllSaveData, parseImportedSaveData } from '../utils/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  careerSave: CareerSave | null;
  library: VocabularyLibraryState;
  profile: PlayerProfile;
  onBack: () => void;
  onUpdateSettings: (next: AppSettings) => void;
  onResetCareer: () => void;
  onImportFullBundle: (bundle: {
    vocabularyLibrary: VocabularyLibraryState;
    careerSave: CareerSave | null;
    playerProfile: PlayerProfile;
    settings: AppSettings;
  }) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  careerSave,
  library,
  profile,
  onBack,
  onUpdateSettings,
  onResetCareer,
  onImportFullBundle,
}) => {
  const [confirmResetCareer, setConfirmResetCareer] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [selectedDatasetComp, setSelectedDatasetComp] = useState(COMPETITIONS[0].id);

  const handleExportJson = () => {
    const json = exportAllSaveData(library, careerSave, profile, settings);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-vocab-championship-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportedSaveData(String(reader.result ?? ''));
      if (!parsed.ok) {
        setImportStatus({ type: 'err', text: parsed.error });
        return;
      }
      onImportFullBundle(parsed.data);
      setImportStatus({
        type: 'ok',
        text: `Imported ${parsed.data.vocabularyLibrary.entries.length} vocabulary words and saved progress successfully.`,
      });
    };
    reader.readAsText(file);
  };

  const inspectedComp = COMPETITIONS.find((c) => c.id === selectedDatasetComp) ?? COMPETITIONS[0];
  const datasetTeams = inspectedComp.participantTeamIds.map((id) => getTeamById(id));

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 hover:border-white/25 hover:text-white whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4" />
            Main Menu
          </button>
          <div>
            <p className="text-xs text-slate-400">Audio · Animations · Backups · Verified Datasets</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Settings & Save Management
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio & Presentation */}
          <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <h2 className="font-display text-xl font-bold text-white">Audio & Animations</h2>
            <div className="mt-4 divide-y divide-white/8">
              <label className="flex cursor-pointer items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold text-white">Sound Effects</div>
                  <div className="text-xs text-slate-400">
                    Referee whistle, penalty kick, goal celebration, save, and UI feedback.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold text-white">Stadium Crowd Ambience</div>
                  <div className="text-xs text-slate-400">
                    Subtle synthesized stadium atmosphere during active matches.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.crowdAmbience}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, crowdAmbience: e.target.checked })
                  }
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold text-white">Penalty & Goalkeeper Animations</div>
                  <div className="text-xs text-slate-400">
                    Disable for faster turn-by-turn study sessions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, animationsEnabled: e.target.checked })
                  }
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>
            </div>
          </section>

          {/* Export / Import Save Data */}
          <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <h2 className="font-display text-xl font-bold text-white">Export & Import Save Data</h2>
            <p className="mt-1 text-xs text-slate-400">
              Back up your personal vocabulary library, active career save, statistics, and trophies as a local JSON file for offline portability.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Download className="h-4 w-4" />
                Export Save Data (.json)
              </button>

              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-[#0A1120] px-5 py-2.5 text-sm font-semibold text-white hover:border-emerald-400/50">
                <Upload className="h-4 w-4 text-sky-400" />
                Import Save Data (.json)
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportJsonFile}
                  className="sr-only"
                />
              </label>
            </div>

            {importStatus && (
              <div
                className={`mt-3 rounded-lg border px-4 py-2.5 text-xs font-medium ${
                  importStatus.type === 'ok'
                    ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200'
                    : 'border-red-500/40 bg-red-500/12 text-red-200'
                }`}
              >
                {importStatus.text}
              </div>
            )}
          </section>

          {/* Reset Career Confirmation */}
          <section className="rounded-xl border border-red-500/25 bg-[#10192D] p-6">
            <h2 className="font-display text-xl font-bold text-white">Career Reset</h2>
            <p className="mt-1 text-xs text-slate-400">
              Resetting your active career clears the current tournament schedule and in-progress match. Your personal vocabulary library and earned trophies are preserved.
            </p>

            {!confirmResetCareer ? (
              <button
                type="button"
                disabled={!careerSave}
                onClick={() => setConfirmResetCareer(true)}
                className="mt-4 inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-red-500/45 bg-red-500/12 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Active Career
              </button>
            ) : (
              <div className="mt-4 rounded-lg border border-red-500/45 bg-red-500/15 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Confirm Career Reset
                </div>
                <p className="mt-1 text-xs text-red-100">
                  This will permanently remove your current {careerSave?.competitionName} career save. Are you sure?
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetCareer();
                      setConfirmResetCareer(false);
                    }}
                    className="rounded-md bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-400"
                  >
                    Yes, Reset Career
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetCareer(false)}
                    className="rounded-md border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Verified Competition Datasets Inspector */}
          <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Competition Team Datasets
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Inspect curated real-world participant lists and seasons ({Object.keys(TEAMS).length} verified teams total).
                </p>
              </div>
              <select
                aria-label="Inspect competition dataset"
                value={selectedDatasetComp}
                onChange={(e) => setSelectedDatasetComp(e.target.value)}
                className="h-10 rounded-lg border border-white/12 bg-[#0A1120] px-3 text-xs font-semibold text-white"
              >
                {COMPETITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.season})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 text-xs">
              {datasetTeams.map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-white/8 bg-[#0A1120] px-3 py-2 text-slate-200 truncate"
                >
                  <span className="font-mono-num font-bold text-emerald-400 mr-1.5">
                    {t.shortName}
                  </span>
                  {t.name}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
