import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Shield,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  ActiveMatchState,
  LearningStatus,
  ShotDirection,
  VocabularyEntry,
} from '../types/game';
import { getTeamById } from '../data/competitions';
import { getCurrentQuestion, REGULAR_MATCH_QUESTIONS } from '../engine/matchEngine';
import { TeamBadge } from './TeamBadge';
import { PenaltyCanvas } from './PenaltyCanvas';

interface MatchScreenProps {
  match: ActiveMatchState;
  competitionName: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  vocabEntries: VocabularyEntry[];
  onToggleSound: () => void;
  onSaveAndExit: () => void;
  onKickoff: () => void;
  onAnswerOption: (optionIndex: number) => void;
  onShootPenalty: (direction: ShotDirection) => void;
  onAnimationComplete: () => void;
  onNextQuestion: () => void;
  onBeginShootout: () => void;
  onUpdateWordStatus: (entryId: string, status: LearningStatus) => void;
  onFinishMatch: () => void;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({
  match,
  competitionName,
  soundEnabled,
  animationsEnabled,
  vocabEntries,
  onToggleSound,
  onSaveAndExit,
  onKickoff,
  onAnswerOption,
  onShootPenalty,
  onAnimationComplete,
  onNextQuestion,
  onBeginShootout,
  onUpdateWordStatus,
  onFinishMatch,
}) => {
  const [aimDirection, setAimDirection] = useState<ShotDirection | null>(null);
  const playerTeam = getTeamById(match.playerTeamId);
  const opponentTeam = getTeamById(match.opponentTeamId);
  const currentQuestion = getCurrentQuestion(match);

  // Reset manual aim selection whenever entering PENALTY_AIM
  useEffect(() => {
    if (match.phase === 'PENALTY_AIM') {
      setAimDirection(null);
    }
  }, [match.phase, match.currentQuestionIndex, match.shootoutRound]);

  // Keyboard shortcuts (1-4 answer in QUESTION phase, Enter for Continue in feedback)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'm') {
        onToggleSound();
        return;
      }
      if (match.phase === 'QUESTION' && currentQuestion) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          if (idx >= 0 && idx < currentQuestion.options.length) {
            e.preventDefault();
            onAnswerOption(idx);
          }
        }
      } else if (match.phase === 'FEEDBACK_WRONG' || match.phase === 'ROUND_FEEDBACK') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [match.phase, currentQuestion, onAnswerOption, onNextQuestion, onToggleSound]);

  const entryStatusMap = useMemo(() => {
    const map = new Map<string, LearningStatus>();
    for (const e of vocabEntries) {
      map.set(e.id, e.status);
    }
    return map;
  }, [vocabEntries]);

  const lastRecord = match.records[match.records.length - 1] ?? null;

  const outcomeBanner = useMemo(() => {
    switch (match.lastAttemptOutcome) {
      case 'GOAL':
        return {
          title: 'GOAL SCORED!',
          subtitle: 'Clinical finish from the penalty spot.',
          tone: 'emerald',
        };
      case 'MISS_SAVED':
        return {
          title: 'PENALTY SAVED BY KEEPER',
          subtitle: 'Correct vocabulary answer, but the keeper guessed the corner (25% miss chance).',
          tone: 'red',
        };
      case 'MISS_WRONG_ANSWER':
        return {
          title: 'PENALTY OPPORTUNITY LOST',
          subtitle: 'Incorrect vocabulary answer — automatic missed penalty.',
          tone: 'red',
        };
      case 'SAVE':
        return {
          title: 'BRILLIANT SAVE!',
          subtitle: 'Correct answer and a decisive diving stop.',
          tone: 'emerald',
        };
      case 'CONCEDED_BEAT_GK':
        return {
          title: 'GOAL CONCEDED',
          subtitle: 'Correct vocabulary answer, but the opponent placed an unstoppable strike (25% concede chance).',
          tone: 'red',
        };
      case 'CONCEDED_WRONG_ANSWER':
        return {
          title: 'GOAL CONCEDED',
          subtitle: 'Incorrect vocabulary answer — opponent converted the penalty.',
          tone: 'red',
        };
      default:
        return null;
    }
  }, [match.lastAttemptOutcome]);

  const homeTeam = match.isPlayerHome ? playerTeam : opponentTeam;
  const awayTeam = match.isPlayerHome ? opponentTeam : playerTeam;
  const homeGoals = match.isPlayerHome ? match.playerGoals : match.opponentGoals;
  const awayGoals = match.isPlayerHome ? match.opponentGoals : match.playerGoals;
  const homePen = match.isPlayerHome ? match.shootoutPlayerGoals : match.shootoutOpponentGoals;
  const awayPen = match.isPlayerHome ? match.shootoutOpponentGoals : match.shootoutPlayerGoals;

  const isPlayerAttacking =
    currentQuestion?.role === 'ATTACK' ||
    match.phase === 'PENALTY_AIM' ||
    match.phase === 'PENALTY_ANIMATION';

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 flex flex-col">
      {/* Broadcast Top Scoreboard HUD */}
      <header className="border-b border-white/10 bg-[#0C1526]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-8">
          <button
            type="button"
            onClick={onSaveAndExit}
            className="order-1 inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#121F38] px-3 text-xs font-semibold text-slate-200 hover:border-white/25 hover:text-white whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Save & Exit
          </button>

          {/* Center Scoreboard */}
          <div
            data-testid="match-scoreboard"
            className="order-3 flex w-full items-center justify-center gap-3 rounded-lg border border-white/12 bg-[#080E1A] px-4 py-2 sm:order-2 sm:w-auto sm:gap-5"
          >
            <div className="flex items-center gap-2">
              <TeamBadge team={homeTeam} size="xs" />
              <span className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
                {homeTeam.shortName}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono-num text-xl font-extrabold text-white sm:text-2xl">
              <span className={match.isPlayerHome ? 'text-emerald-400' : 'text-white'}>
                {homeGoals}
              </span>
              <span className="text-slate-500">-</span>
              <span className={!match.isPlayerHome ? 'text-emerald-400' : 'text-white'}>
                {awayGoals}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
                {awayTeam.shortName}
              </span>
              <TeamBadge team={awayTeam} size="xs" />
            </div>

            {match.isShootout && (
              <div className="border-l border-white/15 pl-3 font-mono-num text-xs font-bold text-amber-300 whitespace-nowrap">
                PEN {homePen}-{awayPen}
              </div>
            )}
          </div>

          <div className="order-2 flex items-center gap-2.5 sm:order-3 sm:gap-3">
            <div className="text-right text-xs">
              <div className="font-mono-num font-bold text-white" data-testid="question-progress">
                {match.isShootout
                  ? match.shootoutRound > 5
                    ? `Sudden Death R${match.shootoutRound}`
                    : `Shootout R${match.shootoutRound}/5`
                  : `${Math.min(match.currentQuestionIndex + 1, REGULAR_MATCH_QUESTIONS)}/${REGULAR_MATCH_QUESTIONS}`}
              </div>
              <div className="text-slate-400 hidden sm:block">{match.stageLabel}</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleSound();
              }}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121F38] text-slate-200 hover:border-emerald-400/50"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Match Content Area */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-6 sm:px-8">
        {/* 1. MATCH INTRODUCTION */}
        {match.phase === 'INTRO' && (
          <div className="rounded-xl border border-white/12 bg-[#10192D] p-8 text-center">
            <p className="text-xs font-semibold tracking-wider text-emerald-400">
              {competitionName} · {match.stageLabel}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Match Kick-Off
            </h1>

            <div className="my-8 flex items-center justify-center gap-6 sm:gap-12">
              <div className="flex flex-col items-center gap-2.5">
                <TeamBadge team={homeTeam} size="xl" />
                <span className="font-display text-xl font-bold text-white">{homeTeam.name}</span>
                <span className="text-xs text-slate-400">
                  {match.isPlayerHome ? 'Your Team · Home' : 'Opponent · Home'}
                </span>
              </div>

              <div className="font-display text-3xl font-extrabold text-amber-400">VS</div>

              <div className="flex flex-col items-center gap-2.5">
                <TeamBadge team={awayTeam} size="xl" />
                <span className="font-display text-xl font-bold text-white">{awayTeam.name}</span>
                <span className="text-xs text-slate-400">
                  {!match.isPlayerHome ? 'Your Team · Away' : 'Opponent · Away'}
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-xl rounded-lg border border-white/8 bg-[#0A1120] p-4 text-left text-xs text-slate-300 space-y-1.5">
              <p>
                <strong className="text-white">Match Structure:</strong> 10 vocabulary questions alternating 5 Attack penalties and 5 Goalkeeper saves.
              </p>
              <p>
                <strong className="text-emerald-400">Attack:</strong> Answer correctly to unlock manual direction aiming (Left / Center / Right) with a 75% goal probability.
              </p>
              <p>
                <strong className="text-sky-400">Goalkeeper:</strong> Answer correctly to trigger an automatic diving save attempt (75% save probability).
              </p>
              {match.isKnockout && (
                <p>
                  <strong className="text-amber-300">Knockout Rules:</strong> If tied after 10 questions, a Penalty Shootout Tie-Breaker decides who advances.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onKickoff}
              className="mt-7 inline-flex min-h-[50px] items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400"
            >
              Kick Off Match
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 2. SHOOTOUT TIE-BREAKER INTRO */}
        {match.phase === 'SHOOTOUT_INTRO' && (
          <div className="rounded-xl border border-amber-400/35 bg-[#10192D] p-8 text-center">
            <p className="text-xs font-semibold tracking-wider text-amber-300">
              Knockout Match Level · {match.playerGoals} - {match.opponentGoals}
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white">
              Penalty Shootout Tie-Breaker
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">
              Knockout matches cannot end in a draw. Each team will take 5 penalty attempts alternating Attack and Goalkeeper turns, followed by Sudden Death if still level.
            </p>
            <button
              type="button"
              onClick={onBeginShootout}
              className="mt-6 inline-flex min-h-[50px] items-center gap-2 rounded-lg bg-amber-400 px-8 py-3 text-base font-bold text-slate-950 hover:bg-amber-300"
            >
              Begin Penalty Shootout
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 3. VOCABULARY QUESTION PHASE */}
        {match.phase === 'QUESTION' && currentQuestion && (
          <div className="space-y-5">
            {/* Role Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#10192D] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                {currentQuestion.role === 'ATTACK' ? (
                  <Target className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Shield className="h-5 w-5 text-sky-400" />
                )}
                <div>
                  <div className="font-display text-lg font-bold tracking-wide text-white">
                    {currentQuestion.role === 'ATTACK' ? 'ATTACK TURN · TAKE PENALTY' : 'GOALKEEPER TURN · DEFEND GOAL'}
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentQuestion.role === 'ATTACK'
                      ? 'Answer correctly to unlock manual penalty shot aiming.'
                      : 'Answer correctly to dive and save the opponent’s penalty.'}
                  </p>
                </div>
              </div>
              <div className="font-mono-num text-xs text-slate-400">
                {match.isShootout
                  ? `Shootout Round ${match.shootoutRound}`
                  : `Question ${match.currentQuestionIndex + 1} of ${REGULAR_MATCH_QUESTIONS}`}
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-xl border border-white/12 bg-[#10192D] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white sm:text-2xl leading-snug">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.contextSentence && (
                <div className="mt-4 rounded-lg border border-white/10 bg-[#0A1120] px-4 py-3.5 text-base font-medium text-emerald-200">
                  "{currentQuestion.contextSentence}"
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={`${currentQuestion.id}_${idx}`}
                    type="button"
                    onClick={() => onAnswerOption(idx)}
                    className="group flex min-h-[58px] items-center gap-3.5 rounded-lg border border-white/12 bg-[#0A1120] px-4 py-3.5 text-left text-base font-semibold text-white transition-colors hover:border-emerald-400 hover:bg-[#14233E]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[#10192D] font-mono-num text-xs font-bold text-slate-300 group-hover:border-emerald-400 group-hover:text-emerald-300">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ATTACK AIM & ANIMATION / GOALKEEPER ANIMATION */}
        {(match.phase === 'PENALTY_AIM' ||
          match.phase === 'PENALTY_ANIMATION' ||
          match.phase === 'GK_ANIMATION') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="font-semibold text-white">
                {match.phase === 'PENALTY_AIM'
                  ? `${playerTeam.name} Penalty Kick — Select Target`
                  : match.phase === 'PENALTY_ANIMATION'
                    ? `${playerTeam.name} shooting ${match.lastShotTarget}...`
                    : `${opponentTeam.name} penalty vs ${playerTeam.name} Goalkeeper...`}
              </span>
              <span className="text-slate-400">
                {match.phase === 'PENALTY_AIM'
                  ? '75% goal probability on shot'
                  : match.phase === 'GK_ANIMATION'
                    ? match.lastAnswerCorrect
                      ? 'Correct answer · 75% save attempt'
                      : 'Wrong answer · Goal conceded'
                    : ''}
              </span>
            </div>

            <PenaltyCanvas
              mode={
                match.phase === 'PENALTY_AIM'
                  ? 'ATTACK_AIM'
                  : match.phase === 'PENALTY_ANIMATION'
                    ? 'ATTACK_ANIMATION'
                    : 'GK_ANIMATION'
              }
              selectedDirection={aimDirection}
              shotTarget={match.lastShotTarget}
              keeperDive={match.lastKeeperDive}
              outcome={match.lastAttemptOutcome}
              attackingTeam={isPlayerAttacking ? playerTeam : opponentTeam}
              defendingTeam={isPlayerAttacking ? opponentTeam : playerTeam}
              animationsEnabled={animationsEnabled}
              onSelectDirection={setAimDirection}
              onConfirmShot={() => aimDirection && onShootPenalty(aimDirection)}
              onAnimationComplete={onAnimationComplete}
            />
          </div>
        )}

        {/* 5. ROUND FEEDBACK & LEARNING EXPLANATION */}
        {(match.phase === 'FEEDBACK_WRONG' || match.phase === 'ROUND_FEEDBACK') &&
          currentQuestion &&
          outcomeBanner && (
            <div className="space-y-5">
              <div
                className={`rounded-xl border p-6 ${
                  outcomeBanner.tone === 'emerald'
                    ? 'border-emerald-400/40 bg-emerald-500/12'
                    : 'border-red-500/40 bg-red-500/12'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {outcomeBanner.tone === 'emerald' ? (
                    <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-7 w-7 shrink-0 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <h2 className="font-display text-3xl font-extrabold tracking-wide text-white">
                      {outcomeBanner.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-200">{outcomeBanner.subtitle}</p>
                    {lastRecord?.chosenDirection && (
                      <p className="mt-1 text-xs text-slate-300">
                        Shot: {lastRecord.chosenDirection} · Goalkeeper dive: {lastRecord.keeperDiveDirection}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mandatory Learning Feedback Card */}
              <div className="rounded-xl border border-white/12 bg-[#10192D] p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-400">Vocabulary Learning Feedback</p>
                  {(() => {
                    const isMastered = entryStatusMap.get(currentQuestion.entryId) === 'Mastered';
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateWordStatus(
                            currentQuestion.entryId,
                            isMastered ? 'Learning' : 'Mastered'
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${
                          isMastered
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/15 bg-[#0A1120] text-slate-300 hover:border-emerald-400/60 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isMastered ? 'Mastered (Skipped in future matches)' : 'Mark as Mastered'}
                      </button>
                    );
                  })()}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-2xl font-bold text-white">{currentQuestion.word}</span>
                  {currentQuestion.ipa && (
                    <span className="font-mono text-sm text-slate-400">{currentQuestion.ipa}</span>
                  )}
                  <span className="text-sm font-medium text-emerald-400">
                    {currentQuestion.partOfSpeech}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-amber-200">
                  {currentQuestion.meaning}
                </p>
                {currentQuestion.example && (
                  <p className="mt-3 rounded-lg border border-white/8 bg-[#0A1120] px-4 py-3 text-sm italic text-slate-200">
                    "{currentQuestion.example}"
                  </p>
                )}
                <p className="mt-3 text-xs text-slate-400">{currentQuestion.explanation}</p>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    {!match.isShootout && match.currentQuestionIndex === REGULAR_MATCH_QUESTIONS - 1
                      ? 'View Match Result'
                      : 'Next Turn'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* 6. FULL-TIME MATCH RESULT & POST-MATCH VOCABULARY REVIEW */}
        {match.phase === 'FULL_TIME' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/12 bg-[#10192D] p-6 sm:p-8 text-center">
              <p className="text-xs font-semibold tracking-wider text-amber-300">
                Full-Time · {competitionName} · {match.stageLabel}
              </p>
              <h1 className="mt-1 font-display text-4xl font-extrabold text-white">
                {match.winnerTeamId === match.playerTeamId
                  ? 'VICTORY!'
                  : match.winnerTeamId === null
                    ? 'FULL-TIME DRAW'
                    : 'DEFEAT'}
              </h1>

              <div className="my-6 flex items-center justify-center gap-6 sm:gap-10">
                <div className="flex flex-col items-center gap-2">
                  <TeamBadge team={homeTeam} size="lg" />
                  <span className="font-display text-lg font-bold text-white">{homeTeam.name}</span>
                </div>

                <div className="text-center">
                  <div className="font-mono-num text-5xl font-extrabold text-white">
                    {homeGoals} - {awayGoals}
                  </div>
                  {match.isShootout && (
                    <div className="mt-1 font-mono-num text-sm font-bold text-amber-300">
                      Penalties: {homePen} - {awayPen}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <TeamBadge team={awayTeam} size="lg" />
                  <span className="font-display text-lg font-bold text-white">{awayTeam.name}</span>
                </div>
              </div>

              {/* Match Stat Breakdown */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-5 sm:grid-cols-4 text-left">
                <div className="rounded-lg bg-[#0A1120] p-3.5">
                  <span className="block text-xs text-slate-400">Goals / Missed</span>
                  <span className="font-mono-num text-lg font-bold text-emerald-400">
                    {match.penaltiesScored} / {match.penaltiesMissed}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0A1120] p-3.5">
                  <span className="block text-xs text-slate-400">Saves / Conceded</span>
                  <span className="font-mono-num text-lg font-bold text-sky-400">
                    {match.saves} / {match.goalsConceded}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0A1120] p-3.5">
                  <span className="block text-xs text-slate-400">Vocab Correct</span>
                  <span className="font-mono-num text-lg font-bold text-white">
                    {match.correctAnswers}/{match.correctAnswers + match.incorrectAnswers}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0A1120] p-3.5">
                  <span className="block text-xs text-slate-400">Vocab Accuracy</span>
                  <span className="font-mono-num text-lg font-bold text-amber-300">
                    {match.correctAnswers + match.incorrectAnswers > 0
                      ? Math.round(
                          (match.correctAnswers /
                            (match.correctAnswers + match.incorrectAnswers)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={onFinishMatch}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Trophy className="h-4 w-4" />
                  Save Result & Continue Tournament
                </button>
              </div>
            </div>

            {/* Post-Match Vocabulary Review */}
            <section className="rounded-xl border border-white/12 bg-[#10192D] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Post-Match Vocabulary Review
                  </h2>
                  <p className="text-xs text-slate-400">
                    Words marked Mastered are skipped in future matches while unmastered words remain.
                  </p>
                </div>
                <span className="font-mono-num text-xs text-slate-400">
                  {match.records.length} attempts reviewed
                </span>
              </div>

              <div className="mt-4 divide-y divide-white/8">
                {match.records.map((rec, i) => {
                  const currentStatus = entryStatusMap.get(rec.entryId) ?? 'Learning';
                  return (
                    <div
                      key={`${rec.entryId}_${i}`}
                      className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {rec.isAnswerCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                          )}
                          <span className="font-bold text-white">{rec.word}</span>
                          {rec.ipa && (
                            <span className="font-mono text-xs text-slate-400">{rec.ipa}</span>
                          )}
                          <span className="text-xs text-slate-400">({rec.partOfSpeech})</span>
                          <span className="text-xs text-slate-500" aria-hidden="true">·</span>
                          <span className="text-xs font-medium text-amber-200">{rec.meaning}</span>
                        </div>
                        {rec.example && (
                          <p className="mt-1 pl-6 text-xs italic text-slate-400">"{rec.example}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pl-6 sm:pl-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateWordStatus(rec.entryId, 'Learning')}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                            currentStatus === 'Learning'
                              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                              : 'border-white/10 bg-[#0A1120] text-slate-400 hover:text-white'
                          }`}
                        >
                          Learning
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateWordStatus(rec.entryId, 'Mastered')}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                            currentStatus === 'Mastered'
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                              : 'border-white/10 bg-[#0A1120] text-slate-400 hover:text-white'
                          }`}
                        >
                          Mastered
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
