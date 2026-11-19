import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Play,
  Trophy,
} from 'lucide-react';
import { CareerSave, DashboardTab, Fixture } from '../types/game';
import { getTeamById } from '../data/competitions';
import {
  calculateAllGroupStandings,
  calculateStandings,
  formatStageName,
  getBestThirdCountForFormat,
  getNextPlayerFixture,
} from '../engine/tournamentEngine';
import { TeamBadge } from './TeamBadge';

interface CompetitionDashboardProps {
  career: CareerSave;
  matchLaunchError: string | null;
  onBackToMenu: () => void;
  onPlayNextMatch: () => void;
  onOpenVocabLibrary: () => void;
  onStartNewCareer: () => void;
}

interface FixtureRoundBucket {
  key: string;
  label: string;
  fixtures: Fixture[];
}

function getFixtureRoundMeta(
  fixture: Fixture,
  hasQualifiers: boolean
): { key: string; label: string; sortOrder: number } {
  if (fixture.stage === 'QUALIFIERS') {
    return {
      key: `QUALIFIERS_${fixture.matchday}`,
      label: `Qualifiers · Matchday ${fixture.matchday}`,
      sortOrder: 100 + fixture.matchday,
    };
  }
  if (fixture.stage === 'QUALIFIER_PLAYOFF') {
    return {
      key: 'QUALIFIER_PLAYOFF',
      label: 'Intercontinental Play-off',
      sortOrder: 200,
    };
  }
  if (fixture.stage === 'GROUP') {
    return {
      key: `GROUP_${fixture.matchday}`,
      label: `${hasQualifiers ? 'WC Finals · ' : ''}Matchday ${fixture.matchday}`,
      sortOrder: 300 + fixture.matchday,
    };
  }
  if (fixture.stage === 'LEAGUE') {
    return {
      key: `LEAGUE_${fixture.matchday}`,
      label: `Matchday ${fixture.matchday}`,
      sortOrder: 300 + fixture.matchday,
    };
  }
  const koOrder: Record<string, number> = {
    R32: 410,
    R16: 420,
    QF: 430,
    SF: 440,
    FINAL: 450,
  };
  return {
    key: fixture.stage,
    label: formatStageName(fixture.stage),
    sortOrder: koOrder[fixture.stage] ?? 500 + fixture.matchday,
  };
}

export const CompetitionDashboard: React.FC<CompetitionDashboardProps> = ({
  career,
  matchLaunchError,
  onBackToMenu,
  onPlayNextMatch,
  onOpenVocabLibrary,
  onStartNewCareer,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');

  const playerTeam = getTeamById(career.playerTeamId);
  const nextFixture = useMemo(() => getNextPlayerFixture(career), [career]);
  const isLeague = career.formatType === 'double_round_robin';
  const hasQualifiers = Boolean(career.qualifierGroups && career.qualifierGroups.length > 0);
  const isQualifiersPhase =
    career.currentStage === 'QUALIFIERS' || career.currentStage === 'QUALIFIER_PLAYOFF';
  const bestThirdCount = getBestThirdCountForFormat(career.formatType);

  const leagueTable = useMemo(() => {
    if (!isLeague) return [];
    return calculateStandings(career.participatingTeamIds, career.fixtures);
  }, [isLeague, career.participatingTeamIds, career.fixtures]);

  const qualifierTables = useMemo(() => {
    if (!hasQualifiers || !career.qualifierGroups) return null;
    return calculateAllGroupStandings(career.qualifierGroups, career.fixtures, 0, 'QUALIFIERS');
  }, [hasQualifiers, career.qualifierGroups, career.fixtures]);

  const groupTables = useMemo(() => {
    if (isLeague || career.groups.length === 0) return null;
    return calculateAllGroupStandings(career.groups, career.fixtures, bestThirdCount, 'GROUP');
  }, [isLeague, career.groups, career.fixtures, bestThirdCount]);

  const playerQualifierGroup = useMemo(() => {
    if (!career.qualifierGroups) return null;
    return career.qualifierGroups.find((g) => g.teamIds.includes(career.playerTeamId)) ?? null;
  }, [career.qualifierGroups, career.playerTeamId]);

  const playerGroup = useMemo(() => {
    return career.groups.find((g) => g.teamIds.includes(career.playerTeamId)) ?? null;
  }, [career.groups, career.playerTeamId]);

  const knockoutStages = useMemo(() => {
    const order: Array<Fixture['stage']> = [
      'QUALIFIER_PLAYOFF',
      'R32',
      'R16',
      'QF',
      'SF',
      'FINAL',
    ];
    return order
      .map((stage) => ({
        stage,
        label: formatStageName(stage),
        matches: career.fixtures
          .filter((f) => f.stage === stage)
          .sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0)),
      }))
      .filter((round) => round.matches.length > 0);
  }, [career.fixtures]);

  const roundBuckets = useMemo<FixtureRoundBucket[]>(() => {
    const map = new Map<string, { label: string; sortOrder: number; fixtures: Fixture[] }>();
    for (const f of career.fixtures) {
      const meta = getFixtureRoundMeta(f, hasQualifiers);
      const existing = map.get(meta.key);
      if (existing) {
        existing.fixtures.push(f);
      } else {
        map.set(meta.key, {
          label: meta.label,
          sortOrder: meta.sortOrder,
          fixtures: [f],
        });
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
      .map(([key, val]) => ({
        key,
        label: val.label,
        fixtures: val.fixtures,
      }));
  }, [career.fixtures, hasQualifiers]);

  const defaultRoundKey = useMemo(() => {
    if (nextFixture) {
      return getFixtureRoundMeta(nextFixture, hasQualifiers).key;
    }
    return roundBuckets[roundBuckets.length - 1]?.key ?? '';
  }, [nextFixture, hasQualifiers, roundBuckets]);

  const [selectedRoundKey, setSelectedRoundKey] = useState<string>(defaultRoundKey);

  const activeRoundIndex = useMemo(() => {
    const found = roundBuckets.findIndex((b) => b.key === selectedRoundKey);
    if (found >= 0) return found;
    const defIdx = roundBuckets.findIndex((b) => b.key === defaultRoundKey);
    return defIdx >= 0 ? defIdx : 0;
  }, [roundBuckets, selectedRoundKey, defaultRoundKey]);

  const activeRound = roundBuckets[activeRoundIndex] ?? null;

  const nextOpponent = nextFixture
    ? getTeamById(
        nextFixture.homeTeamId === career.playerTeamId
          ? nextFixture.awayTeamId
          : nextFixture.homeTeamId
      )
    : null;

  const accuracyPct =
    career.careerStats.vocabAnswered > 0
      ? Math.round((career.careerStats.vocabCorrect / career.careerStats.vocabAnswered) * 100)
      : 0;

  const formatNextFixtureHeader = (fix: Fixture): string => {
    if (fix.stage === 'QUALIFIERS') {
      return `Next Fixture · World Cup Qualifiers · ${fix.groupName} · Matchday ${fix.matchday}`;
    }
    if (fix.stage === 'QUALIFIER_PLAYOFF') {
      return 'Next Fixture · Intercontinental Play-off · Winner Advances to FIFA World Cup Finals';
    }
    if (fix.stage === 'GROUP') {
      const prefix = hasQualifiers ? 'FIFA World Cup Finals' : 'Group Stage';
      return `Next Fixture · ${prefix} · Group ${fix.groupName} · Matchday ${fix.matchday}`;
    }
    if (fix.stage === 'LEAGUE') {
      return `Next Fixture · League Season · Matchday ${fix.matchday}`;
    }
    return `Next Fixture · ${formatStageName(fix.stage)}`;
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-7 sm:px-10">
        {/* Top Competition Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Menu
            </button>
            <div className="flex items-center gap-3">
              <TeamBadge team={playerTeam} size="md" />
              <div>
                <p className="text-xs text-slate-400">
                  {career.competitionName} · {career.season}
                </p>
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {playerTeam.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div
            role="tablist"
            aria-label="Competition Views"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#10192D] p-1"
          >
            {(
              [
                { id: 'OVERVIEW', label: 'Overview' },
                {
                  id: 'STANDINGS',
                  label: isLeague
                    ? 'League Table'
                    : isQualifiersPhase
                      ? 'Qualifying Tables'
                      : 'Group Standings',
                },
                { id: 'FIXTURES', label: 'Fixtures' },
                ...(!isLeague ? [{ id: 'BRACKET' as DashboardTab, label: 'Knockout Bracket' }] : []),
              ] as Array<{ id: DashboardTab; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Qualified for FIFA World Cup Finals Milestone Banner */}
            {career.formatType === 'world_cup_qualifiers' &&
              career.qualifiedForFinals &&
              career.currentStage === 'GROUP_STAGE' && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-400/40 bg-amber-500/12 px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        World Cup Qualification Secured
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {playerTeam.name} qualified for the 32-nation FIFA World Cup Finals!
                        {playerGroup ? ` Drawn into Group ${playerGroup.name}.` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Tournament Outcome Banner if Finished */}
            {(career.currentStage === 'COMPLETED' || career.currentStage === 'ELIMINATED') && (
              <div
                className={`rounded-xl border p-6 sm:p-8 ${
                  career.championTeamId === career.playerTeamId
                    ? 'border-amber-400/50 bg-amber-500/12'
                    : 'border-white/15 bg-[#10192D]'
                }`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    {career.championTeamId === career.playerTeamId && (
                      <img
                        src="/src/assets/images/championship_trophy_1795091134675.jpg"
                        alt="Championship Trophy"
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-lg object-cover border border-amber-400/40 shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-amber-300">
                        {career.competitionName} · {career.season}
                      </p>
                      <h2 className="mt-1 font-display text-3xl font-extrabold text-white sm:text-4xl">
                        {career.championTeamId === career.playerTeamId
                          ? `${playerTeam.name} Are Champions!`
                          : career.currentStage === 'ELIMINATED'
                            ? `Eliminated in ${career.playerFinalPlacement}`
                            : `Season Complete · ${career.playerFinalPlacement}`}
                      </h2>
                      {career.championTeamId && (
                        <p className="mt-1 text-sm text-slate-300">
                          Tournament Winner:{' '}
                          <strong className="text-white">
                            {getTeamById(career.championTeamId).name}
                          </strong>
                          {career.runnerUpTeamId
                            ? ` · Runner-Up: ${getTeamById(career.runnerUpTeamId).name}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onStartNewCareer}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap"
                  >
                    <Trophy className="h-4 w-4" />
                    Start New Career
                  </button>
                </div>
              </div>
            )}

            {/* Next Match Focal Card */}
            {nextFixture && nextOpponent && (
              <div className="rounded-xl border border-emerald-400/30 bg-[#10192D] p-6 sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">
                      {formatNextFixtureHeader(nextFixture)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-3">
                        <TeamBadge team={getTeamById(nextFixture.homeTeamId)} size="md" />
                        <span className="font-display text-2xl font-bold text-white">
                          {getTeamById(nextFixture.homeTeamId).name}
                        </span>
                      </div>
                      <span className="font-display text-xl font-bold text-slate-500">VS</span>
                      <div className="flex items-center gap-3">
                        <TeamBadge team={getTeamById(nextFixture.awayTeamId)} size="md" />
                        <span className="font-display text-2xl font-bold text-white">
                          {getTeamById(nextFixture.awayTeamId).name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenVocabLibrary}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-white/15 bg-[#0A1120] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-white/30 whitespace-nowrap"
                    >
                      <BookOpen className="h-4 w-4 text-sky-400" />
                      Vocabulary Library
                    </button>
                    <button
                      type="button"
                      onClick={onPlayNextMatch}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-emerald-500 px-7 py-2.5 text-base font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      {career.activeMatch ? 'Resume Match' : 'Play Match'}
                    </button>
                  </div>
                </div>

                {matchLaunchError && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/12 p-3.5 text-xs text-red-200">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-300">{matchLaunchError}</p>
                      <button
                        type="button"
                        onClick={onOpenVocabLibrary}
                        className="mt-1.5 font-bold text-white underline"
                      >
                        Open Vocabulary Library to add words
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Career Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <span className="text-xs text-slate-400">Current Stage</span>
                <div className="mt-1 font-display text-2xl font-bold text-white">
                  {formatStageName(career.currentStage)}
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {career.currentStage === 'QUALIFIER_PLAYOFF'
                    ? 'Single-match knockout'
                    : `Matchday ${career.currentMatchday} / ${career.totalMatchdays}`}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <span className="text-xs text-slate-400">Record (W-D-L)</span>
                <div className="mt-1 font-mono-num text-2xl font-bold text-white">
                  {career.careerStats.wins}-{career.careerStats.draws}-{career.careerStats.losses}
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {career.careerStats.matchesPlayed} played
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <span className="text-xs text-slate-400">Goals For / Against</span>
                <div className="mt-1 font-mono-num text-2xl font-bold text-emerald-400">
                  {career.careerStats.goalsScored} : {career.careerStats.goalsConceded}
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {career.careerStats.saves} saves
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <span className="text-xs text-slate-400">Vocabulary Accuracy</span>
                <div className="mt-1 font-mono-num text-2xl font-bold text-amber-300">
                  {accuracyPct}%
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {career.careerStats.vocabCorrect}/{career.careerStats.vocabAnswered} correct
                </span>
              </div>
            </div>

            {/* Player's Qualifying Group Preview (during World Cup Qualifiers) */}
            {isQualifiersPhase && playerQualifierGroup && qualifierTables && (
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Your Qualifying Group · {playerQualifierGroup.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      1st &amp; 2nd qualify directly for the FIFA World Cup Finals · 3rd enters the
                      Intercontinental Play-off.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STANDINGS')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    View All Qualifying Groups
                  </button>
                </div>
                <StandingsTable
                  rows={qualifierTables.byGroup[playerQualifierGroup.name] ?? []}
                  playerTeamId={career.playerTeamId}
                />
              </div>
            )}

            {/* Player's Finals Group Quick Preview */}
            {!isLeague && !isQualifiersPhase && playerGroup && groupTables && (
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">
                    Your Group · Group {playerGroup.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STANDINGS')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    View All Groups
                  </button>
                </div>
                <StandingsTable
                  rows={groupTables.byGroup[playerGroup.name] ?? []}
                  playerTeamId={career.playerTeamId}
                />
              </div>
            )}

            {isLeague && (
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">
                    {career.competitionName} Standings
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STANDINGS')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Full League Table
                  </button>
                </div>
                <StandingsTable
                  rows={leagueTable.slice(0, 8)}
                  playerTeamId={career.playerTeamId}
                />
              </div>
            )}
          </div>
        )}

        {/* STANDINGS / LEAGUE TABLE TAB */}
        {activeTab === 'STANDINGS' && (
          <div className="space-y-6">
            {isLeague ? (
              <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                <h2 className="mb-4 font-display text-2xl font-bold text-white">
                  {career.competitionName} Table ({career.season})
                </h2>
                <StandingsTable rows={leagueTable} playerTeamId={career.playerTeamId} />
              </div>
            ) : isQualifiersPhase && qualifierTables && career.qualifierGroups ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-[#10192D] px-5 py-4">
                  <h2 className="font-display text-2xl font-bold text-white">
                    FIFA World Cup Qualifiers ({career.season})
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Top 2 teams in your qualifying group advance directly to the 32-nation FIFA
                    World Cup Finals. 3rd place earns a one-match Intercontinental Play-off.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {career.qualifierGroups.map((g) => (
                    <div
                      key={g.name}
                      className="rounded-xl border border-white/10 bg-[#10192D] p-5"
                    >
                      <h3 className="mb-3 font-display text-xl font-bold text-white">{g.name}</h3>
                      <StandingsTable
                        rows={qualifierTables.byGroup[g.name] ?? []}
                        playerTeamId={career.playerTeamId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              groupTables && (
                <>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {career.groups.map((g) => (
                      <div
                        key={g.name}
                        className="rounded-xl border border-white/10 bg-[#10192D] p-5"
                      >
                        <h3 className="mb-3 font-display text-xl font-bold text-white">
                          Group {g.name}
                        </h3>
                        <StandingsTable
                          rows={groupTables.byGroup[g.name] ?? []}
                          playerTeamId={career.playerTeamId}
                        />
                      </div>
                    ))}
                  </div>

                  {bestThirdCount > 0 && (
                    <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
                      <h3 className="mb-1 font-display text-xl font-bold text-white">
                        Best Third-Placed Teams (Top {bestThirdCount} Qualify)
                      </h3>
                      <p className="mb-3 text-xs text-slate-400">
                        Ranked strictly by Points, Goal Difference, then Goals Scored.
                      </p>
                      <StandingsTable
                        rows={groupTables.thirdPlacedTable}
                        playerTeamId={career.playerTeamId}
                        showGroupColumn
                      />
                    </div>
                  )}

                  {hasQualifiers && qualifierTables && career.qualifierGroups && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h3 className="font-display text-xl font-bold text-slate-300">
                        Completed World Cup Qualifiers
                      </h3>
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {career.qualifierGroups.map((g) => (
                          <div
                            key={g.name}
                            className="rounded-xl border border-white/10 bg-[#10192D] p-5"
                          >
                            <h4 className="mb-3 font-display text-lg font-bold text-white">
                              {g.name}
                            </h4>
                            <StandingsTable
                              rows={qualifierTables.byGroup[g.name] ?? []}
                              playerTeamId={career.playerTeamId}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        )}

        {/* FIXTURES TAB */}
        {activeTab === 'FIXTURES' && activeRound && (
          <div className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <h2 className="font-display text-2xl font-bold text-white">
                  {activeRound.label} · Schedule &amp; Results
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeRoundIndex <= 0}
                  onClick={() =>
                    setSelectedRoundKey(roundBuckets[Math.max(0, activeRoundIndex - 1)].key)
                  }
                  aria-label="Previous round"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#0A1120] text-slate-200 disabled:opacity-35 hover:border-white/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <select
                  aria-label="Select matchday or round"
                  value={activeRound.key}
                  onChange={(e) => setSelectedRoundKey(e.target.value)}
                  className="h-9 rounded-lg border border-white/12 bg-[#0A1120] px-3 text-xs font-semibold text-white"
                >
                  {roundBuckets.map((bucket) => (
                    <option key={bucket.key} value={bucket.key}>
                      {bucket.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={activeRoundIndex >= roundBuckets.length - 1}
                  onClick={() =>
                    setSelectedRoundKey(
                      roundBuckets[Math.min(roundBuckets.length - 1, activeRoundIndex + 1)].key
                    )
                  }
                  aria-label="Next round"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#0A1120] text-slate-200 disabled:opacity-35 hover:border-white/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {activeRound.fixtures.map((f) => {
                const h = getTeamById(f.homeTeamId);
                const a = getTeamById(f.awayTeamId);
                const isPlayerMatch =
                  f.homeTeamId === career.playerTeamId ||
                  f.awayTeamId === career.playerTeamId;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                      isPlayerMatch
                        ? 'border-emerald-400/50 bg-emerald-500/10'
                        : 'border-white/8 bg-[#0A1120]'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                      <span className="truncate font-semibold text-white">{h.name}</span>
                      <TeamBadge team={h} size="xs" />
                    </div>

                    <div className="min-w-[68px] text-center font-mono-num font-bold">
                      {f.result ? (
                        <div>
                          <span className="text-white">
                            {f.result.homeGoals} - {f.result.awayGoals}
                          </span>
                          {f.result.homeShootoutGoals !== undefined && (
                            <div className="text-[10px] text-amber-300">
                              ({f.result.homeShootoutGoals}-{f.result.awayShootoutGoals} p)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">vs</span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <TeamBadge team={a} size="xs" />
                      <span className="truncate font-semibold text-white">{a.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KNOCKOUT BRACKET TAB */}
        {activeTab === 'BRACKET' && !isLeague && (
          <div className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Knockout Stage Bracket
            </h2>
            {knockoutStages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-[#0A1120] p-10 text-center text-sm text-slate-400">
                {isQualifiersPhase
                  ? 'Finish the World Cup Qualifiers and Finals Group Stage to unlock the official knockout bracket.'
                  : 'Complete all 3 Group Stage matchdays to generate the official knockout bracket.'}
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-6 min-w-max">
                  {knockoutStages.map((round) => (
                    <div key={round.stage} className="w-64 shrink-0 space-y-3">
                      <h3 className="font-display text-lg font-bold text-amber-300 border-b border-white/10 pb-2">
                        {round.label}
                      </h3>
                      <div className="space-y-3">
                        {round.matches.map((m) => {
                          const h = getTeamById(m.homeTeamId);
                          const a = getTeamById(m.awayTeamId);
                          const isPlayer =
                            m.homeTeamId === career.playerTeamId ||
                            m.awayTeamId === career.playerTeamId;
                          return (
                            <div
                              key={m.id}
                              className={`rounded-lg border p-3 text-xs ${
                                isPlayer
                                  ? 'border-emerald-400/50 bg-emerald-500/10'
                                  : 'border-white/10 bg-[#0A1120]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 py-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <TeamBadge team={h} size="xs" />
                                  <span
                                    className={`truncate font-semibold ${
                                      m.result?.winnerTeamId === h.id
                                        ? 'text-emerald-300'
                                        : 'text-white'
                                    }`}
                                  >
                                    {h.name}
                                  </span>
                                </div>
                                <span className="font-mono-num font-bold text-white">
                                  {m.result ? m.result.homeGoals : '-'}
                                  {m.result?.homeShootoutGoals !== undefined
                                    ? ` (${m.result.homeShootoutGoals})`
                                    : ''}
                                </span>
                              </div>
                              <div className="border-t border-white/6 my-1" />
                              <div className="flex items-center justify-between gap-2 py-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <TeamBadge team={a} size="xs" />
                                  <span
                                    className={`truncate font-semibold ${
                                      m.result?.winnerTeamId === a.id
                                        ? 'text-emerald-300'
                                        : 'text-white'
                                    }`}
                                  >
                                    {a.name}
                                  </span>
                                </div>
                                <span className="font-mono-num font-bold text-white">
                                  {m.result ? m.result.awayGoals : '-'}
                                  {m.result?.awayShootoutGoals !== undefined
                                    ? ` (${m.result.awayShootoutGoals})`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StandingsTableProps {
  rows: Array<{
    teamId: string;
    groupName?: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    qualified?: boolean;
    qualificationNote?: string;
  }>;
  playerTeamId: string;
  showGroupColumn?: boolean;
}

const StandingsTable: React.FC<StandingsTableProps> = ({
  rows,
  playerTeamId,
  showGroupColumn = false,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/10 text-slate-400">
            <th className="py-2 pr-2 font-semibold">#</th>
            <th className="py-2 pr-3 font-semibold">Team</th>
            {showGroupColumn && <th className="py-2 px-2 font-semibold">Grp</th>}
            <th className="py-2 px-2 text-right font-semibold">P</th>
            <th className="py-2 px-2 text-right font-semibold">W</th>
            <th className="py-2 px-2 text-right font-semibold">D</th>
            <th className="py-2 px-2 text-right font-semibold">L</th>
            <th className="py-2 px-2 text-right font-semibold">GF</th>
            <th className="py-2 px-2 text-right font-semibold">GA</th>
            <th className="py-2 px-2 text-right font-semibold">GD</th>
            <th className="py-2 pl-2 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6 font-mono-num">
          {rows.map((row, idx) => {
            const team = getTeamById(row.teamId);
            const isPlayer = row.teamId === playerTeamId;
            const isPlayoffNote = row.qualificationNote === 'Play-off';
            return (
              <tr
                key={row.teamId}
                className={isPlayer ? 'bg-emerald-500/12 text-white' : 'text-slate-200'}
              >
                <td className="py-2.5 pr-2 font-semibold text-slate-400">{idx + 1}</td>
                <td className="py-2.5 pr-3 font-sans">
                  <div className="flex items-center gap-2">
                    <TeamBadge team={team} size="xs" />
                    <span className={`font-semibold ${isPlayer ? 'text-emerald-300' : 'text-white'}`}>
                      {team.name}
                    </span>
                    {row.qualificationNote && (
                      <span
                        className={`text-[11px] font-medium whitespace-nowrap ${
                          isPlayoffNote ? 'text-amber-300' : 'text-emerald-400'
                        }`}
                      >
                        · {row.qualificationNote}
                      </span>
                    )}
                  </div>
                </td>
                {showGroupColumn && (
                  <td className="py-2.5 px-2 text-slate-400">{row.groupName}</td>
                )}
                <td className="py-2.5 px-2 text-right">{row.played}</td>
                <td className="py-2.5 px-2 text-right">{row.won}</td>
                <td className="py-2.5 px-2 text-right">{row.drawn}</td>
                <td className="py-2.5 px-2 text-right">{row.lost}</td>
                <td className="py-2.5 px-2 text-right">{row.goalsFor}</td>
                <td className="py-2.5 px-2 text-right">{row.goalsAgainst}</td>
                <td className="py-2.5 px-2 text-right">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="py-2.5 pl-2 text-right font-bold text-white">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
