import React, { useMemo } from 'react';
import { ArrowLeft, Award, Trophy } from 'lucide-react';
import { CareerSave, PlayerProfile, VocabularyEntry } from '../types/game';
import { getTeamById } from '../data/competitions';
import { TeamBadge } from './TeamBadge';

interface StatisticsScreenProps {
  profile: PlayerProfile;
  careerSave: CareerSave | null;
  vocabEntries: VocabularyEntry[];
  onBack: () => void;
  onMarkWordLearning: (entryId: string) => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  profile,
  careerSave,
  vocabEntries,
  onBack,
  onMarkWordLearning,
}) => {
  const accuracy =
    profile.vocabAnswered > 0
      ? Math.round((profile.vocabCorrect / profile.vocabAnswered) * 100)
      : 0;

  const penaltySuccessRate =
    profile.penaltiesTaken > 0
      ? Math.round((profile.penaltiesScored / profile.penaltiesTaken) * 100)
      : 0;

  const mostMissedWords = useMemo(() => {
    return vocabEntries
      .filter((e) => e.stats.incorrect > 0)
      .sort((a, b) => b.stats.incorrect - a.stats.incorrect)
      .slice(0, 8);
  }, [vocabEntries]);

  const champions = profile.trophies.filter((t) => t.placement === 'CHAMPION');
  const runnersUp = profile.trophies.filter((t) => t.placement === 'RUNNER_UP');
  const activeTeam = careerSave ? getTeamById(careerSave.playerTeamId) : null;

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#111B30] px-3.5 text-sm font-medium text-slate-200 hover:border-white/25 hover:text-white whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Menu
            </button>
            <div>
              <p className="text-xs text-slate-400">Career Records · Learning Performance · Honors</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Player Statistics & Trophy Cabinet
              </h1>
            </div>
          </div>

          {careerSave && activeTeam && (
            <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#10192D] px-3.5 py-2 text-xs">
              <TeamBadge team={activeTeam} size="xs" />
              <div>
                <span className="font-semibold text-white">{activeTeam.name}</span>
                <span className="text-slate-400"> · {careerSave.competitionName} ({careerSave.season})</span>
              </div>
            </div>
          )}
        </div>

        {/* Core Career Metrics Grid */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
            <span className="text-xs text-slate-400">Matches Played</span>
            <div className="mt-1 font-mono-num text-3xl font-bold text-white">
              {profile.matchesPlayed}
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {profile.wins}W · {profile.draws}D · {profile.losses}L
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
            <span className="text-xs text-slate-400">Goals Scored / Conceded</span>
            <div className="mt-1 font-mono-num text-3xl font-bold text-emerald-400">
              {profile.goalsScored} : {profile.goalsConceded}
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {profile.saves} goalkeeper saves
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
            <span className="text-xs text-slate-400">Penalties Scored</span>
            <div className="mt-1 font-mono-num text-3xl font-bold text-white">
              {profile.penaltiesScored}/{profile.penaltiesTaken}
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {penaltySuccessRate}% conversion · {profile.penaltiesMissed} missed
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#10192D] p-5">
            <span className="text-xs text-slate-400">Vocabulary Accuracy</span>
            <div className="mt-1 font-mono-num text-3xl font-bold text-amber-300">
              {accuracy}%
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {profile.vocabCorrect}/{profile.vocabAnswered} answered correctly
            </span>
          </div>
        </section>

        {/* Trophy Cabinet */}
        <section className="mt-8 rounded-xl border border-white/10 bg-[#10192D] p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img
              src="/src/assets/images/championship_trophy_1795091134675.jpg"
              alt="Golden Championship Trophy"
              referrerPolicy="no-referrer"
              className="h-44 w-44 rounded-xl object-cover border border-amber-400/25 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-amber-300">
                <Trophy className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-white">Trophy Cabinet</h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Trophies are awarded strictly upon winning a completed international tournament or domestic league season.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/8 pt-4">
                <div>
                  <span className="block text-xs text-slate-400">Championships</span>
                  <span className="font-mono-num text-2xl font-bold text-amber-300">
                    {champions.length}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Runner-Up Finishes</span>
                  <span className="font-mono-num text-2xl font-bold text-slate-200">
                    {runnersUp.length}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Competitions Entered</span>
                  <span className="font-mono-num text-2xl font-bold text-white">
                    {profile.trophies.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {profile.trophies.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-white/12 bg-[#0A1120] p-6 text-center text-sm text-slate-400">
              No completed competitions yet. Win a tournament final or finish first in a domestic league to claim your first trophy.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.trophies.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-lg border p-4 ${
                    t.placement === 'CHAMPION'
                      ? 'border-amber-400/45 bg-amber-500/10'
                      : 'border-white/10 bg-[#0A1120]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Award
                      className={`h-4 w-4 ${
                        t.placement === 'CHAMPION' ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={
                        t.placement === 'CHAMPION' ? 'text-amber-300' : 'text-slate-300'
                      }
                    >
                      {t.placement === 'CHAMPION'
                        ? 'Champion'
                        : t.placement === 'RUNNER_UP'
                          ? 'Runner-Up'
                          : 'Participant'}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-lg font-bold text-white">
                    {t.competitionName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.teamName} · {t.season}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Split: Most Missed Words + Recent Match History */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <h2 className="font-display text-xl font-bold text-white">
              Most Frequently Missed Vocabulary
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Tracked independently from football results so you can focus your next study session.
            </p>
            {mostMissedWords.length === 0 ? (
              <p className="mt-6 text-sm text-slate-400">
                No missed vocabulary recorded yet. Play a match to track per-word accuracy.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-white/8">
                {mostMissedWords.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{w.word}</div>
                      <div className="text-xs text-amber-200 truncate">{w.meaning}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono-num text-xs text-red-400">
                        {w.stats.incorrect} missed / {w.stats.attempts} tries
                      </span>
                      {w.status !== 'Learning' && (
                        <button
                          type="button"
                          onClick={() => onMarkWordLearning(w.id)}
                          className="rounded-md border border-amber-400/40 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/15"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-[#10192D] p-6">
            <h2 className="font-display text-xl font-bold text-white">Recent Match History</h2>
            <p className="mt-1 text-xs text-slate-400">
              Completed matches stay permanently recorded even if you modify vocabulary collections.
            </p>
            {profile.matchHistory.length === 0 ? (
              <p className="mt-6 text-sm text-slate-400">
                No completed matches yet. Start a career and kick off your first match!
              </p>
            ) : (
              <div className="mt-4 divide-y divide-white/8">
                {profile.matchHistory.slice(0, 8).map((m) => {
                  const pTeam = getTeamById(m.playerTeamId);
                  const oTeam = getTeamById(m.opponentTeamId);
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">
                          {pTeam.shortName} {m.playerGoals} - {m.opponentGoals} {oTeam.shortName}
                          {m.shootoutPlayerGoals !== undefined
                            ? ` (${m.shootoutPlayerGoals}-${m.shootoutOpponentGoals} p)`
                            : ''}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {m.competitionName} · {m.stageLabel}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-bold ${
                            m.result === 'WIN'
                              ? 'text-emerald-400'
                              : m.result === 'DRAW'
                                ? 'text-amber-300'
                                : 'text-red-400'
                          }`}
                        >
                          {m.result}
                        </div>
                        <div className="font-mono-num text-xs text-slate-400">
                          {m.vocabCorrect}/{m.vocabTotal} vocab
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
