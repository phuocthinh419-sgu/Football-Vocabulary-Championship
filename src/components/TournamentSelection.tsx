import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Shield, Trophy } from 'lucide-react';
import { COMPETITIONS } from '../data/competitions';
import { Competition, CompetitionCategory } from '../types/game';

interface TournamentSelectionProps {
  initialCategory?: CompetitionCategory;
  onBack: () => void;
  onSelectCompetition: (competition: Competition, formatId: string) => void;
}

export const TournamentSelection: React.FC<TournamentSelectionProps> = ({
  initialCategory = 'international',
  onBack,
  onSelectCompetition,
}) => {
  const [category, setCategory] = useState<CompetitionCategory>(initialCategory);
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const c of COMPETITIONS) {
      initial[c.id] = c.defaultFormatId;
    }
    return initial;
  });

  const filtered = COMPETITIONS.filter((c) => c.category === category);

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Menu
            </button>
            <div>
              <p className="text-xs text-slate-400">Step 1 of 3 · Career Setup</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Select Competition
              </h1>
            </div>
          </div>

          {/* Interactive category segmented control */}
          <div
            role="tablist"
            aria-label="Competition Category"
            className="inline-flex items-center gap-1 rounded-lg bg-[#111B30] p-1 border border-white/10"
          >
            <button
              type="button"
              role="tab"
              aria-selected={category === 'international'}
              onClick={() => setCategory('international')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                category === 'international'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="h-4 w-4" />
              International Competitions
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={category === 'league'}
              onClick={() => setCategory('league')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                category === 'league'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" />
              Domestic Leagues
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((comp) => {
            const activeFormatId = selectedFormats[comp.id] ?? comp.defaultFormatId;
            const activeFormat =
              comp.formats.find((f) => f.id === activeFormatId) ?? comp.formats[0];

            return (
              <div
                key={comp.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#10192D] p-6 transition-colors hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        {comp.identity} · {comp.season}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-white">
                        {comp.name}
                      </h2>
                    </div>
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#080E1A] border border-white/10"
                      aria-hidden="true"
                    >
                      {comp.category === 'international' ? (
                        <Trophy className="h-5 w-5" style={{ color: comp.accentColor }} />
                      ) : (
                        <Shield className="h-5 w-5" style={{ color: comp.accentColor }} />
                      )}
                    </div>
                  </div>

                  {/* Format selector when multiple editions/formats exist (e.g. FIFA World Cup 32 vs 48) */}
                  {comp.formats.length > 1 && (
                    <div className="mt-5">
                      <span className="block text-xs font-medium text-slate-400 mb-2">
                        Competition Format
                      </span>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {comp.formats.map((fmt, idx) => {
                          const isSelected = fmt.id === activeFormat.id;
                          const spanFull = comp.formats.length === 3 && idx === 0;
                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() =>
                                setSelectedFormats((prev) => ({
                                  ...prev,
                                  [comp.id]: fmt.id,
                                }))
                              }
                              className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                                spanFull ? 'sm:col-span-2' : ''
                              } ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                  : 'border-white/10 bg-[#0A1120] text-slate-300 hover:border-white/25'
                              }`}
                            >
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400">Participating Teams</span>
                      <span className="font-mono-num text-lg font-bold text-white">
                        {activeFormat.teamCount} {comp.category === 'international' ? 'Nations' : 'Clubs'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Trophy</span>
                      <span className="font-semibold text-amber-300">{comp.trophyName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs text-slate-400">Structure</span>
                      <span className="text-slate-200">{activeFormat.description}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end border-t border-white/8 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectCompetition(comp, activeFormat.id)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap"
                  >
                    Select {comp.shortName}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
