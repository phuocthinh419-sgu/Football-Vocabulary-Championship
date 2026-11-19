export type DifficultyLevel = 'A2' | 'B1' | 'B2' | 'C1';

export type LearningStatus = 'New' | 'Learning' | 'Mastered';

export type CompetitionCategory = 'international' | 'league';

export type CompetitionFormatType =
  | 'group_knockout_32'
  | 'group_knockout_48'
  | 'group_knockout_24'
  | 'group_knockout_16'
  | 'world_cup_qualifiers'
  | 'double_round_robin';

export type ShotDirection = 'LEFT' | 'CENTER' | 'RIGHT';

export type QuestionRole = 'ATTACK' | 'GOALKEEPER';

export type QuestionFormat =
  | 'en_to_vi'
  | 'vi_to_en'
  | 'fill_blank'
  | 'context_choice'
  | 'definition_match';

export type MatchPhase =
  | 'INTRO'
  | 'QUESTION'
  | 'FEEDBACK_WRONG'
  | 'PENALTY_AIM'
  | 'PENALTY_ANIMATION'
  | 'GK_ANIMATION'
  | 'ROUND_FEEDBACK'
  | 'SHOOTOUT_INTRO'
  | 'FULL_TIME';

export type AppScreen =
  | 'MAIN_MENU'
  | 'TOURNAMENT_SELECT'
  | 'TEAM_SELECT'
  | 'VOCAB_SETUP'
  | 'DASHBOARD'
  | 'MATCH'
  | 'VOCAB_LIBRARY'
  | 'STATISTICS'
  | 'SETTINGS';

export type DashboardTab = 'OVERVIEW' | 'STANDINGS' | 'FIXTURES' | 'BRACKET';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flagCode?: string; // ISO alpha-2 for national teams or country
  isNational: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  confederation?: string;
  rating: number; // 65-95 realistic strength rating for deterministic AI simulation
  stadium?: string;
  info?: string;
}

export interface CompetitionFormatConfig {
  id: string;
  label: string;
  formatType: CompetitionFormatType;
  teamCount: number;
  groupCount?: number;
  teamsPerGroup?: number;
  advancersPerGroup?: number;
  bestThirdCount?: number;
  description: string;
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  category: CompetitionCategory;
  season: string;
  identity: string;
  accentColor: string;
  trophyName: string;
  formats: CompetitionFormatConfig[];
  defaultFormatId: string;
  participantTeamIds: string[]; // Verified participating teams for the selected season
  customizable?: boolean;
}

export interface VocabularyCollection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isSample?: boolean;
}

export interface VocabularyWordStats {
  attempts: number;
  correct: number;
  incorrect: number;
  lastAnsweredAt?: string;
  needsReview: boolean;
}

export interface VocabularyEntry {
  id: string;
  word: string;
  meaning: string; // Vietnamese meaning
  partOfSpeech: string;
  ipa?: string;
  example: string;
  difficulty: DifficultyLevel;
  topic: string;
  source?: string;
  notes?: string;
  status: LearningStatus;
  collectionIds: string[];
  createdAt: string;
  updatedAt: string;
  stats: VocabularyWordStats;
}

export interface VocabularyLibraryState {
  entries: VocabularyEntry[];
  collections: VocabularyCollection[];
}

export type VocabSelectionMode =
  | 'all'
  | 'single_collection'
  | 'multi_collection'
  | 'learning_only'
  | 'custom_words';

export interface VocabularySourceConfig {
  mode: VocabSelectionMode;
  collectionIds: string[];
  customWordIds: string[];
  preferredDifficulty: DifficultyLevel | 'ALL';
  allowQuestionReuse: boolean;
}

export interface MatchQuestion {
  id: string;
  entryId: string;
  role: QuestionRole;
  format: QuestionFormat;
  prompt: string;
  contextSentence?: string;
  options: string[];
  correctOptionIndex: number;
  correctAnswerText: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  ipa?: string;
  example: string;
  explanation: string;
}

export type AttemptOutcome =
  | 'GOAL'
  | 'MISS_WRONG_ANSWER'
  | 'MISS_SAVED'
  | 'SAVE'
  | 'CONCEDED_WRONG_ANSWER'
  | 'CONCEDED_BEAT_GK';

export interface MatchQuestionRecord {
  questionIndex: number;
  isShootout: boolean;
  shootoutRound?: number;
  role: QuestionRole;
  entryId: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  ipa?: string;
  example: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isAnswerCorrect: boolean;
  chosenDirection?: ShotDirection;
  keeperDiveDirection?: ShotDirection;
  outcome: AttemptOutcome;
  probabilityRoll?: number;
}

export interface ActiveMatchState {
  fixtureId: string;
  stageLabel: string;
  isKnockout: boolean;
  playerTeamId: string;
  opponentTeamId: string;
  isPlayerHome: boolean;
  phase: MatchPhase;
  regularQuestions: MatchQuestion[];
  currentQuestionIndex: number; // 0..9 in regular match
  playerGoals: number;
  opponentGoals: number;
  penaltiesTaken: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  saves: number;
  goalsConceded: number;
  correctAnswers: number;
  incorrectAnswers: number;
  records: MatchQuestionRecord[];
  // Current interactive step
  selectedOptionIndex: number | null;
  lastAnswerCorrect: boolean | null;
  selectedDirection: ShotDirection | null;
  lastAttemptOutcome: AttemptOutcome | null;
  lastKeeperDive: ShotDirection | null;
  lastShotTarget: ShotDirection | null;
  // Knockout shootout state
  isShootout: boolean;
  shootoutRound: number; // 1..5, then 6+ sudden death
  shootoutTurn: QuestionRole; // Alternates ATTACK then GOALKEEPER per round
  shootoutPlayerGoals: number;
  shootoutOpponentGoals: number;
  shootoutPlayerTaken: number;
  shootoutOpponentTaken: number;
  shootoutQuestion: MatchQuestion | null;
  winnerTeamId: string | null;
}

export interface FixtureResult {
  homeGoals: number;
  awayGoals: number;
  homeShootoutGoals?: number;
  awayShootoutGoals?: number;
  winnerTeamId?: string;
  playedByUser: boolean;
  completedAt: string;
}

export interface Fixture {
  id: string;
  competitionId: string;
  stage: 'QUALIFIERS' | 'QUALIFIER_PLAYOFF' | 'GROUP' | 'LEAGUE' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL';
  groupName?: string; // 'A', 'B', ... or 'AFC Group', etc.
  matchday: number; // 1..3 for qualifiers/groups, 1..38 for leagues, knockout round order
  bracketSlot?: number; // Position in knockout round (0, 1, 2, ...)
  homeTeamId: string;
  awayTeamId: string;
  result?: FixtureResult;
}

export interface StandingsRow {
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
}

export interface GroupData {
  name: string;
  teamIds: string[];
}

export type TournamentStageStatus =
  | 'QUALIFIERS'
  | 'QUALIFIER_PLAYOFF'
  | 'GROUP_STAGE'
  | 'LEAGUE_SEASON'
  | 'R32'
  | 'R16'
  | 'QF'
  | 'SF'
  | 'FINAL'
  | 'COMPLETED'
  | 'ELIMINATED';

export interface CareerSave {
  id: string;
  createdAt: string;
  updatedAt: string;
  competitionId: string;
  competitionName: string;
  season: string;
  formatId: string;
  formatType: CompetitionFormatType;
  category: CompetitionCategory;
  playerTeamId: string;
  vocabConfig: VocabularySourceConfig;
  participatingTeamIds: string[];
  qualifierGroups?: GroupData[];
  qualifiedForFinals?: boolean;
  groups: GroupData[];
  fixtures: Fixture[];
  currentStage: TournamentStageStatus;
  currentMatchday: number;
  totalMatchdays: number;
  activeMatch: ActiveMatchState | null;
  championTeamId?: string;
  runnerUpTeamId?: string;
  playerFinalPlacement?: string;
  recentWordIds: string[];
  careerStats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    penaltiesTaken: number;
    penaltiesScored: number;
    penaltiesMissed: number;
    saves: number;
    vocabAnswered: number;
    vocabCorrect: number;
  };
}

export interface TrophyRecord {
  id: string;
  competitionId: string;
  competitionName: string;
  season: string;
  teamId: string;
  teamName: string;
  placement: 'CHAMPION' | 'RUNNER_UP' | 'PARTICIPANT';
  achievedAt: string;
}

export interface CompletedMatchSummary {
  id: string;
  fixtureId: string;
  competitionName: string;
  season: string;
  stageLabel: string;
  playerTeamId: string;
  opponentTeamId: string;
  playerGoals: number;
  opponentGoals: number;
  shootoutPlayerGoals?: number;
  shootoutOpponentGoals?: number;
  result: 'WIN' | 'DRAW' | 'LOSS';
  vocabCorrect: number;
  vocabTotal: number;
  completedAt: string;
}

export interface PlayerProfile {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  penaltiesTaken: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  saves: number;
  vocabAnswered: number;
  vocabCorrect: number;
  trophies: TrophyRecord[];
  matchHistory: CompletedMatchSummary[];
  bestWinMargin: number;
  bestAccuracyMatch: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  crowdAmbience: boolean;
  animationsEnabled: boolean;
  customCompetitionTeams: Record<string, string[]>; // Optional user-edited team datasets per competitionId
}

export interface FullExportBundle {
  version: 1;
  exportedAt: string;
  vocabularyLibrary: VocabularyLibraryState;
  careerSave: CareerSave | null;
  playerProfile: PlayerProfile;
  settings: AppSettings;
}
