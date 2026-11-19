import {
  ActiveMatchState,
  AttemptOutcome,
  MatchQuestion,
  MatchQuestionRecord,
  ShotDirection,
  VocabularyEntry,
} from '../types/game';
import { generateSingleShootoutQuestion } from './vocabularyEngine';

export const REGULAR_MATCH_QUESTIONS = 10;
export const ATTACK_SUCCESS_PROBABILITY = 0.75;
export const GK_SAVE_PROBABILITY = 0.75;
export const SHOOTOUT_INITIAL_ROUNDS = 5;

const DIRECTIONS: ShotDirection[] = ['LEFT', 'CENTER', 'RIGHT'];

function pickOppositeDirection(dir: ShotDirection, rng: () => number): ShotDirection {
  const others = DIRECTIONS.filter((d) => d !== dir);
  return others[Math.floor(rng() * others.length)];
}

function pickRandomDirection(rng: () => number): ShotDirection {
  return DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
}

export function createActiveMatch(params: {
  fixtureId: string;
  stageLabel: string;
  isKnockout: boolean;
  playerTeamId: string;
  opponentTeamId: string;
  isPlayerHome: boolean;
  questions: MatchQuestion[];
}): ActiveMatchState {
  if (params.questions.length !== REGULAR_MATCH_QUESTIONS) {
    throw new Error(`A regular match must have exactly ${REGULAR_MATCH_QUESTIONS} questions.`);
  }
  // Enforce alternating Attack / Goalkeeper sequence (5 Attack, 5 Goalkeeper)
  const normalizedQuestions = params.questions.map((q, idx) => ({
    ...q,
    role: idx % 2 === 0 ? ('ATTACK' as const) : ('GOALKEEPER' as const),
  }));

  return {
    fixtureId: params.fixtureId,
    stageLabel: params.stageLabel,
    isKnockout: params.isKnockout,
    playerTeamId: params.playerTeamId,
    opponentTeamId: params.opponentTeamId,
    isPlayerHome: params.isPlayerHome,
    phase: 'INTRO',
    regularQuestions: normalizedQuestions,
    currentQuestionIndex: 0,
    playerGoals: 0,
    opponentGoals: 0,
    penaltiesTaken: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    saves: 0,
    goalsConceded: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    records: [],
    selectedOptionIndex: null,
    lastAnswerCorrect: null,
    selectedDirection: null,
    lastAttemptOutcome: null,
    lastKeeperDive: null,
    lastShotTarget: null,
    isShootout: false,
    shootoutRound: 1,
    shootoutTurn: 'ATTACK',
    shootoutPlayerGoals: 0,
    shootoutOpponentGoals: 0,
    shootoutPlayerTaken: 0,
    shootoutOpponentTaken: 0,
    shootoutQuestion: null,
    winnerTeamId: null,
  };
}

export function getCurrentQuestion(match: ActiveMatchState): MatchQuestion | null {
  if (match.isShootout) {
    return match.shootoutQuestion;
  }
  return match.regularQuestions[match.currentQuestionIndex] ?? null;
}

export function startMatchKickoff(match: ActiveMatchState): ActiveMatchState {
  if (match.phase !== 'INTRO') return match;
  return {
    ...match,
    phase: 'QUESTION',
  };
}

/**
 * Handles answering a vocabulary question.
 * - ATTACK + Wrong => automatic miss (no shot screen), goes to FEEDBACK_WRONG
 * - ATTACK + Correct => unlocks manual direction selection (PENALTY_AIM)
 * - GOALKEEPER + Wrong => automatic conceded goal, goes to GK_ANIMATION
 * - GOALKEEPER + Correct => automatic 75% save / 25% concede attempt, goes to GK_ANIMATION
 */
export function submitVocabularyAnswer(
  match: ActiveMatchState,
  optionIndex: number,
  rng: () => number = Math.random
): ActiveMatchState {
  if (match.phase !== 'QUESTION') return match;
  const question = getCurrentQuestion(match);
  if (!question) return match;

  const isCorrect = optionIndex === question.correctOptionIndex;

  if (question.role === 'ATTACK') {
    if (!isCorrect) {
      const outcome: AttemptOutcome = 'MISS_WRONG_ANSWER';
      const record: MatchQuestionRecord = {
        questionIndex: match.isShootout ? match.records.length : match.currentQuestionIndex,
        isShootout: match.isShootout,
        shootoutRound: match.isShootout ? match.shootoutRound : undefined,
        role: 'ATTACK',
        entryId: question.entryId,
        word: question.word,
        meaning: question.meaning,
        partOfSpeech: question.partOfSpeech,
        ipa: question.ipa,
        example: question.example,
        selectedOptionIndex: optionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isAnswerCorrect: false,
        outcome,
      };
      return {
        ...match,
        phase: 'FEEDBACK_WRONG',
        selectedOptionIndex: optionIndex,
        lastAnswerCorrect: false,
        lastAttemptOutcome: outcome,
        lastShotTarget: null,
        lastKeeperDive: null,
        penaltiesTaken: match.penaltiesTaken + 1,
        penaltiesMissed: match.penaltiesMissed + 1,
        incorrectAnswers: match.incorrectAnswers + 1,
        shootoutPlayerTaken: match.isShootout
          ? match.shootoutPlayerTaken + 1
          : match.shootoutPlayerTaken,
        records: [...match.records, record],
      };
    }

    // Correct Attack answer -> unlock manual direction selection (never auto-shoot)
    return {
      ...match,
      phase: 'PENALTY_AIM',
      selectedOptionIndex: optionIndex,
      lastAnswerCorrect: true,
      selectedDirection: null,
      lastAttemptOutcome: null,
      correctAnswers: match.correctAnswers + 1,
    };
  }

  // GOALKEEPER MODE (no manual direction choice)
  const roll = isCorrect ? rng() : 1.0;
  const isSave = isCorrect && roll < GK_SAVE_PROBABILITY;
  const outcome: AttemptOutcome = isSave
    ? 'SAVE'
    : isCorrect
      ? 'CONCEDED_BEAT_GK'
      : 'CONCEDED_WRONG_ANSWER';

  const shotTarget = pickRandomDirection(rng);
  const keeperDive = isSave ? shotTarget : pickOppositeDirection(shotTarget, rng);

  const record: MatchQuestionRecord = {
    questionIndex: match.isShootout ? match.records.length : match.currentQuestionIndex,
    isShootout: match.isShootout,
    shootoutRound: match.isShootout ? match.shootoutRound : undefined,
    role: 'GOALKEEPER',
    entryId: question.entryId,
    word: question.word,
    meaning: question.meaning,
    partOfSpeech: question.partOfSpeech,
    ipa: question.ipa,
    example: question.example,
    selectedOptionIndex: optionIndex,
    correctOptionIndex: question.correctOptionIndex,
    isAnswerCorrect: isCorrect,
    chosenDirection: shotTarget,
    keeperDiveDirection: keeperDive,
    outcome,
    probabilityRoll: isCorrect ? roll : undefined,
  };

  return {
    ...match,
    phase: 'GK_ANIMATION',
    selectedOptionIndex: optionIndex,
    lastAnswerCorrect: isCorrect,
    lastAttemptOutcome: outcome,
    lastShotTarget: shotTarget,
    lastKeeperDive: keeperDive,
    correctAnswers: match.correctAnswers + (isCorrect ? 1 : 0),
    incorrectAnswers: match.incorrectAnswers + (isCorrect ? 0 : 1),
    saves: match.saves + (isSave ? 1 : 0),
    goalsConceded: match.goalsConceded + (isSave ? 0 : 1),
    opponentGoals:
      !match.isShootout && !isSave ? match.opponentGoals + 1 : match.opponentGoals,
    shootoutOpponentGoals:
      match.isShootout && !isSave
        ? match.shootoutOpponentGoals + 1
        : match.shootoutOpponentGoals,
    shootoutOpponentTaken: match.isShootout
      ? match.shootoutOpponentTaken + 1
      : match.shootoutOpponentTaken,
    records: [...match.records, record],
  };
}

/**
 * Executes the Attack penalty shot after the player manually picks LEFT / CENTER / RIGHT.
 * Uses independent 75% scoring probability / 25% miss probability.
 */
export function executeAttackPenaltyShot(
  match: ActiveMatchState,
  direction: ShotDirection,
  rng: () => number = Math.random
): ActiveMatchState {
  if (match.phase !== 'PENALTY_AIM') return match;
  const question = getCurrentQuestion(match);
  if (!question || question.role !== 'ATTACK') return match;

  const roll = rng();
  const isGoal = roll < ATTACK_SUCCESS_PROBABILITY;
  const outcome: AttemptOutcome = isGoal ? 'GOAL' : 'MISS_SAVED';
  const keeperDive = isGoal ? pickOppositeDirection(direction, rng) : direction;

  const record: MatchQuestionRecord = {
    questionIndex: match.isShootout ? match.records.length : match.currentQuestionIndex,
    isShootout: match.isShootout,
    shootoutRound: match.isShootout ? match.shootoutRound : undefined,
    role: 'ATTACK',
    entryId: question.entryId,
    word: question.word,
    meaning: question.meaning,
    partOfSpeech: question.partOfSpeech,
    ipa: question.ipa,
    example: question.example,
    selectedOptionIndex: match.selectedOptionIndex ?? question.correctOptionIndex,
    correctOptionIndex: question.correctOptionIndex,
    isAnswerCorrect: true,
    chosenDirection: direction,
    keeperDiveDirection: keeperDive,
    outcome,
    probabilityRoll: roll,
  };

  return {
    ...match,
    phase: 'PENALTY_ANIMATION',
    selectedDirection: direction,
    lastShotTarget: direction,
    lastKeeperDive: keeperDive,
    lastAttemptOutcome: outcome,
    penaltiesTaken: match.penaltiesTaken + 1,
    penaltiesScored: match.penaltiesScored + (isGoal ? 1 : 0),
    penaltiesMissed: match.penaltiesMissed + (isGoal ? 0 : 1),
    playerGoals: !match.isShootout && isGoal ? match.playerGoals + 1 : match.playerGoals,
    shootoutPlayerGoals:
      match.isShootout && isGoal ? match.shootoutPlayerGoals + 1 : match.shootoutPlayerGoals,
    shootoutPlayerTaken: match.isShootout
      ? match.shootoutPlayerTaken + 1
      : match.shootoutPlayerTaken,
    records: [...match.records, record],
  };
}

export function completeAnimationPhase(match: ActiveMatchState): ActiveMatchState {
  if (match.phase !== 'PENALTY_ANIMATION' && match.phase !== 'GK_ANIMATION') {
    return match;
  }
  return {
    ...match,
    phase: 'ROUND_FEEDBACK',
  };
}

export function checkShootoutWinner(match: ActiveMatchState): string | null {
  if (!match.isShootout) return null;
  const pGoals = match.shootoutPlayerGoals;
  const oGoals = match.shootoutOpponentGoals;
  const pTaken = match.shootoutPlayerTaken;
  const oTaken = match.shootoutOpponentTaken;

  if (pTaken <= SHOOTOUT_INITIAL_ROUNDS && oTaken <= SHOOTOUT_INITIAL_ROUNDS) {
    const pRemaining = SHOOTOUT_INITIAL_ROUNDS - pTaken;
    const oRemaining = SHOOTOUT_INITIAL_ROUNDS - oTaken;
    // Mathematical clinch during the first 5 attempts
    if (pGoals > oGoals + oRemaining) return match.playerTeamId;
    if (oGoals > pGoals + pRemaining) return match.opponentTeamId;
    // Completed 5 each
    if (pTaken === SHOOTOUT_INITIAL_ROUNDS && oTaken === SHOOTOUT_INITIAL_ROUNDS) {
      if (pGoals > oGoals) return match.playerTeamId;
      if (oGoals > pGoals) return match.opponentTeamId;
    }
    return null;
  }

  // Sudden death (after 5 attempts each): winner decided when both teams have taken equal kicks in that sudden-death round
  if (pTaken === oTaken) {
    if (pGoals > oGoals) return match.playerTeamId;
    if (oGoals > pGoals) return match.opponentTeamId;
  }
  return null;
}

export function advanceAfterRoundFeedback(
  match: ActiveMatchState,
  selectedVocabPool: VocabularyEntry[],
  rng: () => number = Math.random
): ActiveMatchState {
  if (match.phase !== 'ROUND_FEEDBACK' && match.phase !== 'FEEDBACK_WRONG') {
    return match;
  }

  // Regular 10-question match progression
  if (!match.isShootout) {
    const nextIndex = match.currentQuestionIndex + 1;
    if (nextIndex < REGULAR_MATCH_QUESTIONS) {
      return {
        ...match,
        currentQuestionIndex: nextIndex,
        phase: 'QUESTION',
        selectedOptionIndex: null,
        lastAnswerCorrect: null,
        selectedDirection: null,
        lastAttemptOutcome: null,
        lastShotTarget: null,
        lastKeeperDive: null,
      };
    }

    // Regular match complete (10/10 done)
    if (match.isKnockout && match.playerGoals === match.opponentGoals) {
      // Drawn knockout match MUST trigger Penalty Shootout Tie-Breaker
      return {
        ...match,
        phase: 'SHOOTOUT_INTRO',
        isShootout: true,
        shootoutRound: 1,
        shootoutTurn: 'ATTACK',
        shootoutPlayerGoals: 0,
        shootoutOpponentGoals: 0,
        shootoutPlayerTaken: 0,
        shootoutOpponentTaken: 0,
        selectedOptionIndex: null,
        lastAnswerCorrect: null,
        selectedDirection: null,
        lastAttemptOutcome: null,
      };
    }

    const winnerTeamId =
      match.playerGoals > match.opponentGoals
        ? match.playerTeamId
        : match.opponentGoals > match.playerGoals
          ? match.opponentTeamId
          : null;

    return {
      ...match,
      phase: 'FULL_TIME',
      winnerTeamId,
    };
  }

  // Shootout progression
  const shootoutWinner = checkShootoutWinner(match);
  if (shootoutWinner) {
    return {
      ...match,
      phase: 'FULL_TIME',
      winnerTeamId: shootoutWinner,
    };
  }

  const nextTurn: 'ATTACK' | 'GOALKEEPER' =
    match.shootoutTurn === 'ATTACK' ? 'GOALKEEPER' : 'ATTACK';
  const nextRound =
    match.shootoutTurn === 'GOALKEEPER' ? match.shootoutRound + 1 : match.shootoutRound;

  const usedIds = match.records.map((r) => r.entryId);
  const nextQuestion = generateSingleShootoutQuestion(selectedVocabPool, nextTurn, usedIds, rng);

  return {
    ...match,
    phase: 'QUESTION',
    shootoutTurn: nextTurn,
    shootoutRound: nextRound,
    shootoutQuestion: nextQuestion,
    selectedOptionIndex: null,
    lastAnswerCorrect: null,
    selectedDirection: null,
    lastAttemptOutcome: null,
    lastShotTarget: null,
    lastKeeperDive: null,
  };
}

export function beginShootoutKick(
  match: ActiveMatchState,
  selectedVocabPool: VocabularyEntry[],
  rng: () => number = Math.random
): ActiveMatchState {
  if (match.phase !== 'SHOOTOUT_INTRO') return match;
  const usedIds = match.records.map((r) => r.entryId);
  const firstQuestion = generateSingleShootoutQuestion(selectedVocabPool, 'ATTACK', usedIds, rng);
  return {
    ...match,
    phase: 'QUESTION',
    isShootout: true,
    shootoutRound: 1,
    shootoutTurn: 'ATTACK',
    shootoutQuestion: firstQuestion,
  };
}
