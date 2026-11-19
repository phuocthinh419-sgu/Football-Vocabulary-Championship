import React, { useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CareerSave } from '../types/game';
import { getTeamById } from '../data/competitions';
import { formatStageName } from '../engine/tournamentEngine';
import { TeamBadge } from './TeamBadge';

interface MainMenuProps {
  careerSave: CareerSave | null;
  vocabCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewCareer: () => void;
  onContinueCareer: () => void;
  onSelectInternational: () => void;
  onSelectClubLeagues: () => void;
  onOpenVocabLibrary: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  careerSave,
  vocabCount,
  soundEnabled,
  onToggleSound,
  onNewCareer,
  onContinueCareer,
  onSelectInternational,
  onSelectClubLeagues,
  onOpenVocabLibrary,
  onOpenStatistics,
  onOpenSettings,
}) => {
  const savedTeam = careerSave ? getTeamById(careerSave.playerTeamId) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (careerSave) {
          onContinueCareer();
        } else {
          onNewCareer();
        }
      } else if (e.key.toLowerCase() === 'm') {
        onToggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [careerSave, onContinueCareer, onNewCareer, onToggleSound]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#080E1A] flex flex-col justify-between">
      {/* Full-viewport atmospheric stadium key-art backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/stadium_hero_bg_1795091126727.jpg"
          alt="Floodlit night football stadium pitch"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center"
        />
        {/* Measured scrim preserving the illuminated stadium on the right while keeping left negative space ultra-legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060B16] via-[#080E1A]/85 to-[#080E1A]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B16] via-transparent to-[#060B16]/60" />
      </div>

      {/* Top utility corner (sound toggle only, no website navbar) */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 sm:px-10">
        <div className="flex items-center gap-3 text-xs text-slate-300/90">
          <span className="font-mono-num text-emerald-400 font-semibold">{vocabCount}</span>
          <span>words in your personal library</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleSound();
          }}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-[#0D1628]/90 text-slate-200 transition-colors hover:border-emerald-400/50 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
        </button>
      </div>

      {/* Main focal lockup & stadium menu in left negative space */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-8 sm:px-10">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Bespoke SVG Championship Crest & Title Lockup */}
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-3.5">
                <svg
                  viewBox="0 0 56 60"
                  className="h-14 w-13 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M28 3 L51 11 V29 C51 43 40 52 28 57 C16 52 5 43 5 29 V11 Z"
                    fill="#0D182C"
                    stroke="#EAB308"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M28 8 L46 14.5 V29 C46 40 37.5 47.5 28 51.5 C18.5 47.5 10 40 10 29 V14.5 Z"
                    fill="#0F5132"
                    opacity="0.92"
                  />
                  <circle cx="28" cy="27" r="10.5" fill="none" stroke="#F8FAFC" strokeWidth="1.8" />
                  <polygon points="28,19 34,24 31.8,31 24.2,31 22,24" fill="#EAB308" />
                  <path d="M18 42 H38" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-xs font-medium tracking-wider text-emerald-400">
                    English Vocabulary · Penalty Simulation · Tournament Career
                  </p>
                  <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl text-balance">
                    FOOTBALL VOCABULARY CHAMPIONSHIP
                  </h1>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Lead a real national team or domestic club through authentic tournaments. Answer vocabulary questions from your own study library to earn penalties and make crucial saves.
              </p>
            </div>

            {/* Primary Career Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <button
                type="button"
                data-start="true"
                onClick={onNewCareer}
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg bg-emerald-500 px-7 py-3.5 text-base font-bold text-slate-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-[0.99] whitespace-nowrap"
              >
                <Play className="h-4 w-4 fill-current" />
                New Career
              </button>

              <button
                type="button"
                disabled={!careerSave}
                onClick={onContinueCareer}
                className={`inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg border px-6 py-3.5 text-base font-semibold transition-colors whitespace-nowrap ${
                  careerSave
                    ? 'border-amber-400/50 bg-[#131E33]/95 text-white hover:border-amber-300 hover:bg-[#192844]'
                    : 'cursor-not-allowed border-white/10 bg-[#0D1628]/70 text-slate-500'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                Continue Career
              </button>
            </div>

            {/* Active Career Save Summary (only if save exists) */}
            {careerSave && savedTeam && (
              <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-white/10 bg-[#0E172A]/90 px-4 py-3 max-w-xl">
                <TeamBadge team={savedTeam} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white truncate">
                    <span>{savedTeam.name}</span>
                    <span className="text-slate-500" aria-hidden="true">·</span>
                    <span className="text-amber-400 truncate">{careerSave.competitionName}</span>
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">
                    {formatStageName(careerSave.currentStage)} · Matchday {careerSave.currentMatchday}/{careerSave.totalMatchdays}
                    {careerSave.activeMatch ? ' · Match in progress' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Football Navigation Grid */}
            <nav
              aria-label="Championship Navigation"
              className="mt-7 grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              <button
                type="button"
                onClick={onSelectInternational}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-400/50 hover:bg-[#14223B]"
              >
                <Trophy className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="truncate">Tournament Selection</span>
              </button>

              <button
                type="button"
                onClick={onSelectClubLeagues}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-400/50 hover:bg-[#14223B]"
              >
                <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate">Club Competitions</span>
              </button>

              <button
                type="button"
                onClick={onOpenVocabLibrary}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-400/50 hover:bg-[#14223B]"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-sky-400" />
                <span className="truncate">Vocabulary Settings</span>
              </button>

              <button
                type="button"
                onClick={onOpenStatistics}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-400/50 hover:bg-[#14223B]"
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-amber-300" />
                <span className="truncate">Statistics</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-400/50 hover:bg-[#14223B] sm:col-span-2"
              >
                <Settings className="h-4 w-4 shrink-0 text-slate-300" />
                <span className="truncate">Settings & Save Data</span>
              </button>
            </nav>
          </div>

          {/* Right column intentionally left open to showcase the illuminated stadium & pitch */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6" aria-hidden="true" />
        </div>
      </main>

      {/* Single flat control hint line in bottom safe margin */}
      <div className="relative z-10 px-6 pb-5 sm:px-10">
        <p className="text-xs text-slate-400">
          Enter Start · 1–4 Answer Questions · Left / Center / Right Aim Penalty · M Mute Audio
        </p>
      </div>
    </div>
  );
};
