import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Search } from 'lucide-react';
import { Competition, CompetitionFormatConfig } from '../types/game';
import { getTeamById } from '../data/competitions';
import { TeamBadge } from './TeamBadge';

interface TeamSelectionProps {
  competition: Competition;
  format: CompetitionFormatConfig;
  participatingTeamIds: string[];
  onBack: () => void;
  onConfirmTeam: (teamId: string) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({
  competition,
  format,
  participatingTeamIds,
  onBack,
  onConfirmTeam,
}) => {
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState<string>('ALL');
  // Never auto-assign a team; player must explicitly select ONE team
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teamsWithMeta = useMemo(() => {
    const letters = 'ABCDEFGHIJKLMNOP';
    return participatingTeamIds.map((id, idx) => {
      const team = getTeamById(id);
      const groupName =
        format.groupCount && format.teamsPerGroup
          ? `Group ${letters[Math.floor(idx / format.teamsPerGroup)]}`
          : undefined;
      return { team, groupName };
    });
  }, [participatingTeamIds, format]);

  const filterOptions = useMemo(() => {
    if (format.groupCount) {
      const groups = Array.from(new Set(teamsWithMeta.map((t) => t.groupName).filter(Boolean))) as string[];
      return { label: 'Group', options: groups };
    }
    const confs = Array.from(
      new Set(teamsWithMeta.map((t) => t.team.confederation || t.team.country))
    ).sort();
    return {
      label: format.formatType === 'world_cup_qualifiers' ? 'Confederation' : 'Region',
      options: confs,
    };
  }, [teamsWithMeta, format]);

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teamsWithMeta.filter(({ team, groupName }) => {
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        team.shortName.toLowerCase().includes(q) ||
        team.country.toLowerCase().includes(q);
      const matchesFilter =
        filterKey === 'ALL' ||
        groupName === filterKey ||
        team.confederation === filterKey ||
        team.country === filterKey;
      return matchesSearch && matchesFilter;
    });
  }, [teamsWithMeta, search, filterKey]);

  const selectedEntry = selectedTeamId
    ? teamsWithMeta.find((t) => t.team.id === selectedTeamId)
    : null;

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              Competitions
            </button>
            <div>
              <p className="text-xs text-slate-400">
                Step 2 of 3 · {competition.name} ({competition.season})
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Choose Your Team
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-400 tabular-nums">
            {participatingTeamIds.length} verified participating{' '}
            {competition.category === 'international' ? 'national teams' : 'clubs'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Search, Filter & Team Grid */}
          <div className="lg:col-span-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <label htmlFor="team-search" className="sr-only">
                  Search team by name
                </label>
                <input
                  id="team-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by team name, code, or country..."
                  className="h-11 w-full rounded-lg border border-white/12 bg-[#10192D] pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {filterOptions.options.length > 1 && (
                <div>
                  <label htmlFor="team-filter" className="sr-only">
                    Filter by {filterOptions.label}
                  </label>
                  <select
                    id="team-filter"
                    value={filterKey}
                    onChange={(e) => setFilterKey(e.target.value)}
                    className="h-11 rounded-lg border border-white/12 bg-[#10192D] px-3.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="ALL">All {filterOptions.label}s</option>
                    {filterOptions.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {filteredTeams.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-10 text-center text-sm text-slate-400">
                No participating teams match "{search}". Clear your filter to see all teams.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTeams.map(({ team, groupName }) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedTeamId(team.id)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[68px] items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-white'
                          : 'border-white/10 bg-[#10192D] text-slate-200 hover:border-white/25 hover:bg-[#16233D]'
                      }`}
                    >
                      <TeamBadge team={team} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {team.name}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {groupName
                            ? `${groupName} · ${team.confederation ?? team.country}`
                            : format.formatType === 'world_cup_qualifiers' && team.confederation
                              ? `${team.confederation} Qualifiers · ${team.shortName}`
                              : team.country}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Team Preview & Confirmation */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border border-white/10 bg-[#10192D] p-6">
              <h2 className="font-display text-xl font-bold text-white">Selected Team Preview</h2>

              {!selectedEntry ? (
                <div className="mt-6 rounded-lg border border-dashed border-white/15 bg-[#0A1120] p-6 text-center">
                  <p className="text-sm font-medium text-slate-300">No team selected yet</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Choose exactly one participating team from the list to unlock tournament confirmation.
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex items-center gap-4">
                    <TeamBadge team={selectedEntry.team} size="lg" />
                    <div>
                      <div className="font-display text-2xl font-bold text-white">
                        {selectedEntry.team.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {selectedEntry.team.shortName} · {selectedEntry.team.country}
                      </div>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-2.5 border-t border-white/8 pt-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-400">Competition</dt>
                      <dd className="font-medium text-white text-right">{competition.name}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-400">Season</dt>
                      <dd className="text-slate-200">{competition.season}</dd>
                    </div>
                    {selectedEntry.groupName && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-slate-400">Assigned Group</dt>
                        <dd className="font-semibold text-emerald-400">{selectedEntry.groupName}</dd>
                      </div>
                    )}
                    {format.formatType === 'world_cup_qualifiers' && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-slate-400">Qualifying Path</dt>
                        <dd className="font-semibold text-emerald-400 text-right">
                          {selectedEntry.team.confederation ?? 'AFC'} Group → WC Finals
                        </dd>
                      </div>
                    )}
                    {selectedEntry.team.stadium && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-slate-400">Home Ground</dt>
                        <dd className="text-slate-200 text-right">{selectedEntry.team.stadium}</dd>
                      </div>
                    )}
                    {selectedEntry.team.info && (
                      <div className="pt-1 text-xs text-slate-400">{selectedEntry.team.info}</div>
                    )}
                  </dl>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedTeamId}
                onClick={() => selectedTeamId && onConfirmTeam(selectedTeamId)}
                className={`mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
                  selectedTeamId
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'cursor-not-allowed bg-slate-800 text-slate-500'
                }`}
              >
                Confirm Team & Choose Vocabulary
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
