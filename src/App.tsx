import { useCallback, useEffect, useState } from 'react';
import {
  AppScreen,
  AppSettings,
  CareerSave,
  Competition,
  CompetitionCategory,
  LearningStatus,
  PlayerProfile,
  ShotDirection,
  VocabularyLibraryState,
  VocabularySourceConfig,
} from './types/game';
import {
  COMPETITIONS,
  getParticipantsForCompetitionFormat,
  getTeamById,
} from './data/competitions';
import { buildSamplePackEntries } from './data/sampleVocabulary';
import {
  filterSelectedVocabulary,
  generateMatchQuestions,
} from './engine/vocabularyEngine';
import {
  advanceAfterRoundFeedback,
  beginShootoutKick,
  completeAnimationPhase,
  createActiveMatch,
  executeAttackPenaltyShot,
  getCurrentQuestion,
  startMatchKickoff,
  submitVocabularyAnswer,
} from './engine/matchEngine';
import {
  createNewCareer,
  formatStageName,
  getNextPlayerFixture,
  recordPlayerMatchAndAdvance,
} from './engine/tournamentEngine';
import {
  loadCareerSave,
  loadPlayerProfile,
  loadSettings,
  loadVocabLibrary,
  saveCareerSave,
  savePlayerProfile,
  saveSettings,
  saveVocabLibrary,
} from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { MainMenu } from './components/MainMenu';
import { TournamentSelection } from './components/TournamentSelection';
import { TeamSelection } from './components/TeamSelection';
import { VocabSetupScreen } from './components/VocabSetupScreen';
import { VocabularyLibraryScreen } from './components/VocabularyLibraryScreen';
import { CompetitionDashboard } from './components/CompetitionDashboard';
import { MatchScreen } from './components/MatchScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { SettingsScreen } from './components/SettingsScreen';

const DEFAULT_VOCAB_CONFIG: VocabularySourceConfig = {
  mode: 'all',
  collectionIds: [],
  customWordIds: [],
  preferredDifficulty: 'ALL',
  allowQuestionReuse: false,
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MAIN_MENU');
  const [returnScreenFromLibrary, setReturnScreenFromLibrary] = useState<AppScreen>('MAIN_MENU');
  const [tournamentCategory, setTournamentCategory] = useState<CompetitionCategory>('international');

  // Persistent state slices (Vocabulary stored independently from Career Saves!)
  const [vocabLibrary, setVocabLibrary] = useState<VocabularyLibraryState>(() => loadVocabLibrary());
  const [careerSave, setCareerSave] = useState<CareerSave | null>(() => loadCareerSave());
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // New Career Setup wizard state
  const [setupCompetition, setSetupCompetition] = useState<Competition>(COMPETITIONS[0]);
  const [setupFormatId, setSetupFormatId] = useState<string>(COMPETITIONS[0].defaultFormatId);
  const [setupTeamId, setSetupTeamId] = useState<string | null>(null);
  const [matchLaunchError, setMatchLaunchError] = useState<string | null>(null);

  // Sync audio engine with settings
  useEffect(() => {
    soundEngine.setEnabled(settings.soundEnabled);
    soundEngine.setCrowdAmbience(settings.crowdAmbience && screen === 'MATCH');
  }, [settings.soundEnabled, settings.crowdAmbience, screen]);

  // Mirror game state to document.body.dataset.state for accessibility & automated verification
  useEffect(() => {
    if (screen === 'MAIN_MENU') {
      document.body.dataset.state = 'title';
    } else if (screen === 'MATCH' && careerSave?.activeMatch?.phase === 'FULL_TIME') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [screen, careerSave?.activeMatch?.phase]);

  // Support ?autostart=1 to jump straight into active career or competition setup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      if (careerSave) {
        setScreen(careerSave.activeMatch ? 'MATCH' : 'DASHBOARD');
      } else {
        setScreen('TOURNAMENT_SELECT');
      }
    }
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistent state updaters
  const updateVocabLibrary = useCallback((next: VocabularyLibraryState) => {
    setVocabLibrary(next);
    saveVocabLibrary(next);
  }, []);

  const updateCareerSave = useCallback((next: CareerSave | null) => {
    setCareerSave(next);
    saveCareerSave(next);
  }, []);

  const updatePlayerProfile = useCallback((next: PlayerProfile) => {
    setPlayerProfile(next);
    savePlayerProfile(next);
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const handleToggleSound = useCallback(() => {
    updateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  }, [settings, updateSettings]);

  const handleImportSamplePack = useCallback(
    (packId: string) => {
      const built = buildSamplePackEntries(packId);
      if (!built) return;
      const existingCol = vocabLibrary.collections.some((c) => c.id === built.collection.id);
      const nextCols = existingCol
        ? vocabLibrary.collections
        : [...vocabLibrary.collections, built.collection];

      const existingWordSet = new Set(
        vocabLibrary.entries.map((e) => e.word.trim().toLowerCase())
      );
      const newEntries = built.entries.filter(
        (e) => !existingWordSet.has(e.word.trim().toLowerCase())
      );

      // Attach collection ID to any already-present matching words
      const updatedExisting = vocabLibrary.entries.map((entry) => {
        const matchesPack = built.entries.some(
          (pe) => pe.word.trim().toLowerCase() === entry.word.trim().toLowerCase()
        );
        if (matchesPack && !entry.collectionIds.includes(built.collection.id)) {
          return {
            ...entry,
            collectionIds: [...entry.collectionIds, built.collection.id],
          };
        }
        return entry;
      });

      updateVocabLibrary({
        collections: nextCols,
        entries: [...newEntries, ...updatedExisting],
      });
    },
    [vocabLibrary, updateVocabLibrary]
  );

  // Career launch after Step 3 (Vocabulary Setup)
  const handleLaunchCareer = useCallback(
    (vocabConfig: VocabularySourceConfig) => {
      if (!setupTeamId) return;
      const format =
        setupCompetition.formats.find((f) => f.id === setupFormatId) ??
        setupCompetition.formats[0];
      const participants = getParticipantsForCompetitionFormat(
        setupCompetition.id,
        format.id,
        settings.customCompetitionTeams
      );

      const newCareer = createNewCareer({
        competition: setupCompetition,
        format,
        participatingTeamIds: participants,
        playerTeamId: setupTeamId,
        vocabConfig,
      });

      updateCareerSave(newCareer);
      setMatchLaunchError(null);
      setScreen('DASHBOARD');
    },
    [setupTeamId, setupCompetition, setupFormatId, settings.customCompetitionTeams, updateCareerSave]
  );

  // Continue Career -> restores exact match state if interrupted mid-match, otherwise Dashboard
  const handleContinueCareer = useCallback(() => {
    if (!careerSave) return;
    setMatchLaunchError(null);
    if (careerSave.activeMatch) {
      setScreen('MATCH');
    } else {
      setScreen('DASHBOARD');
    }
  }, [careerSave]);

  // Start or Resume next fixture
  const handlePlayNextMatch = useCallback(() => {
    if (!careerSave) return;
    if (careerSave.activeMatch) {
      setScreen('MATCH');
      return;
    }

    const nextFixture = getNextPlayerFixture(careerSave);
    if (!nextFixture) return;

    const selectedPool = filterSelectedVocabulary(vocabLibrary, careerSave.vocabConfig);
    const gen = generateMatchQuestions(selectedPool, {
      count: 10,
      recentWordIds: careerSave.recentWordIds,
      allowQuestionReuse: careerSave.vocabConfig.allowQuestionReuse,
    });

    if (!gen.ok) {
      setMatchLaunchError(
        gen.error ??
          'Unable to generate 10 vocabulary questions from your selected vocabulary source.'
      );
      return;
    }

    setMatchLaunchError(null);
    const isPlayerHome = nextFixture.homeTeamId === careerSave.playerTeamId;
    const opponentTeamId = isPlayerHome ? nextFixture.awayTeamId : nextFixture.homeTeamId;
    const isKnockout =
      nextFixture.stage !== 'GROUP' &&
      nextFixture.stage !== 'LEAGUE' &&
      nextFixture.stage !== 'QUALIFIERS';
    const stageLabel =
      nextFixture.stage === 'QUALIFIERS'
        ? `${nextFixture.groupName ?? 'World Cup Qualifiers'} · Matchday ${nextFixture.matchday}`
        : nextFixture.stage === 'QUALIFIER_PLAYOFF'
          ? 'Intercontinental Play-off'
          : nextFixture.stage === 'GROUP'
            ? `Group ${nextFixture.groupName} · Matchday ${nextFixture.matchday}`
            : nextFixture.stage === 'LEAGUE'
              ? `Matchday ${nextFixture.matchday}`
              : formatStageName(nextFixture.stage);

    const activeMatch = createActiveMatch({
      fixtureId: nextFixture.id,
      stageLabel,
      isKnockout,
      playerTeamId: careerSave.playerTeamId,
      opponentTeamId,
      isPlayerHome,
      questions: gen.questions,
    });

    const updatedCareer: CareerSave = {
      ...careerSave,
      updatedAt: new Date().toISOString(),
      activeMatch,
    };
    updateCareerSave(updatedCareer);
    setScreen('MATCH');
  }, [careerSave, vocabLibrary, updateCareerSave]);

  // Update per-word vocabulary learning statistics independently from football stats
  const recordWordAttempt = useCallback(
    (entryId: string, isCorrect: boolean) => {
      const now = new Date().toISOString();
      const nextEntries = vocabLibrary.entries.map((entry) => {
        if (entry.id !== entryId) return entry;
        const attempts = entry.stats.attempts + 1;
        const correct = entry.stats.correct + (isCorrect ? 1 : 0);
        const incorrect = entry.stats.incorrect + (isCorrect ? 0 : 1);
        const nextStatus: LearningStatus =
          !isCorrect
            ? 'Learning'
            : entry.status === 'New'
              ? 'Learning'
              : entry.status;
        return {
          ...entry,
          status: nextStatus,
          updatedAt: now,
          stats: {
            attempts,
            correct,
            incorrect,
            lastAnsweredAt: now,
            needsReview: !isCorrect || incorrect > correct,
          },
        };
      });
      updateVocabLibrary({ ...vocabLibrary, entries: nextEntries });
    },
    [vocabLibrary, updateVocabLibrary]
  );

  const handleUpdateWordStatus = useCallback(
    (entryId: string, status: LearningStatus) => {
      const nextEntries = vocabLibrary.entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              status,
              stats: { ...e.stats, needsReview: status === 'Learning' },
              updatedAt: new Date().toISOString(),
            }
          : e
      );
      updateVocabLibrary({ ...vocabLibrary, entries: nextEntries });
    },
    [vocabLibrary, updateVocabLibrary]
  );

  // Match Actions (auto-saving immediately after every answer & shot)
  const handleMatchKickoff = useCallback(() => {
    if (!careerSave?.activeMatch) return;
    soundEngine.playWhistle(false);
    const nextMatch = startMatchKickoff(careerSave.activeMatch);
    updateCareerSave({
      ...careerSave,
      updatedAt: new Date().toISOString(),
      activeMatch: nextMatch,
    });
  }, [careerSave, updateCareerSave]);

  const handleAnswerOption = useCallback(
    (optionIndex: number) => {
      if (!careerSave?.activeMatch) return;
      const curQ = getCurrentQuestion(careerSave.activeMatch);
      if (!curQ) return;

      const isCorrect = optionIndex === curQ.correctOptionIndex;
      recordWordAttempt(curQ.entryId, isCorrect);

      const nextMatch = submitVocabularyAnswer(careerSave.activeMatch, optionIndex);

      if (curQ.role === 'ATTACK') {
        if (isCorrect) {
          soundEngine.playAnswerCorrect();
        } else {
          soundEngine.playAnswerWrong();
        }
      } else {
        // Goalkeeper shot starts immediately
        soundEngine.playKick();
      }

      updateCareerSave({
        ...careerSave,
        updatedAt: new Date().toISOString(),
        activeMatch: nextMatch,
      });
    },
    [careerSave, recordWordAttempt, updateCareerSave]
  );

  const handleShootPenalty = useCallback(
    (direction: ShotDirection) => {
      if (!careerSave?.activeMatch) return;
      soundEngine.playKick();
      const nextMatch = executeAttackPenaltyShot(careerSave.activeMatch, direction);
      updateCareerSave({
        ...careerSave,
        updatedAt: new Date().toISOString(),
        activeMatch: nextMatch,
      });
    },
    [careerSave, updateCareerSave]
  );

  const handleAnimationComplete = useCallback(() => {
    if (!careerSave?.activeMatch) return;
    const outcome = careerSave.activeMatch.lastAttemptOutcome;
    if (outcome === 'GOAL') soundEngine.playGoal();
    else if (outcome === 'SAVE') soundEngine.playSave();
    else soundEngine.playMiss();

    const nextMatch = completeAnimationPhase(careerSave.activeMatch);
    updateCareerSave({
      ...careerSave,
      updatedAt: new Date().toISOString(),
      activeMatch: nextMatch,
    });
  }, [careerSave, updateCareerSave]);

  const handleNextQuestion = useCallback(() => {
    if (!careerSave?.activeMatch) return;
    const selectedPool = filterSelectedVocabulary(vocabLibrary, careerSave.vocabConfig);
    const nextMatch = advanceAfterRoundFeedback(careerSave.activeMatch, selectedPool);
    if (nextMatch.phase === 'FULL_TIME') {
      soundEngine.playWhistle(true);
    }
    updateCareerSave({
      ...careerSave,
      updatedAt: new Date().toISOString(),
      activeMatch: nextMatch,
    });
  }, [careerSave, vocabLibrary, updateCareerSave]);

  const handleBeginShootout = useCallback(() => {
    if (!careerSave?.activeMatch) return;
    soundEngine.playWhistle(false);
    const selectedPool = filterSelectedVocabulary(vocabLibrary, careerSave.vocabConfig);
    const nextMatch = beginShootoutKick(careerSave.activeMatch, selectedPool);
    updateCareerSave({
      ...careerSave,
      updatedAt: new Date().toISOString(),
      activeMatch: nextMatch,
    });
  }, [careerSave, vocabLibrary, updateCareerSave]);

  const handleFinishMatch = useCallback(() => {
    if (!careerSave?.activeMatch) return;
    const m = careerSave.activeMatch;
    const homeGoals = m.isPlayerHome ? m.playerGoals : m.opponentGoals;
    const awayGoals = m.isPlayerHome ? m.opponentGoals : m.playerGoals;
    const homeShootoutGoals = m.isShootout
      ? m.isPlayerHome
        ? m.shootoutPlayerGoals
        : m.shootoutOpponentGoals
      : undefined;
    const awayShootoutGoals = m.isShootout
      ? m.isPlayerHome
        ? m.shootoutOpponentGoals
        : m.shootoutPlayerGoals
      : undefined;

    const now = new Date().toISOString();
    const updatedCareer = recordPlayerMatchAndAdvance(
      careerSave,
      m.fixtureId,
      {
        homeGoals,
        awayGoals,
        homeShootoutGoals,
        awayShootoutGoals,
        winnerTeamId: m.winnerTeamId ?? undefined,
        playedByUser: true,
        completedAt: now,
      },
      {
        playerGoals: m.playerGoals,
        opponentGoals: m.opponentGoals,
        penaltiesTaken: m.penaltiesTaken,
        penaltiesScored: m.penaltiesScored,
        penaltiesMissed: m.penaltiesMissed,
        saves: m.saves,
        vocabAnswered: m.correctAnswers + m.incorrectAnswers,
        vocabCorrect: m.correctAnswers,
        usedWordIds: m.records.map((r) => r.entryId),
      }
    );

    // Update persistent PlayerProfile stats & match history
    const isWin =
      m.winnerTeamId === m.playerTeamId ||
      (!m.isKnockout && m.playerGoals > m.opponentGoals);
    const isDraw = !m.isKnockout && m.playerGoals === m.opponentGoals;
    const totalVocab = m.correctAnswers + m.incorrectAnswers;
    const matchAcc = totalVocab > 0 ? Math.round((m.correctAnswers / totalVocab) * 100) : 0;

    let nextTrophies = playerProfile.trophies.slice();
    // Award trophy / runner-up / participation ONLY when competition actually concludes
    if (
      (updatedCareer.currentStage === 'COMPLETED' ||
        updatedCareer.currentStage === 'ELIMINATED') &&
      careerSave.currentStage !== 'COMPLETED' &&
      careerSave.currentStage !== 'ELIMINATED'
    ) {
      const placement: 'CHAMPION' | 'RUNNER_UP' | 'PARTICIPANT' =
        updatedCareer.championTeamId === updatedCareer.playerTeamId
          ? 'CHAMPION'
          : updatedCareer.runnerUpTeamId === updatedCareer.playerTeamId
            ? 'RUNNER_UP'
            : 'PARTICIPANT';

      nextTrophies = [
        {
          id: `trophy_${updatedCareer.id}`,
          competitionId: updatedCareer.competitionId,
          competitionName: updatedCareer.competitionName,
          season: updatedCareer.season,
          teamId: updatedCareer.playerTeamId,
          teamName: getTeamById(updatedCareer.playerTeamId).name,
          placement,
          achievedAt: now,
        },
        ...nextTrophies,
      ];
    }

    const nextProfile: PlayerProfile = {
      ...playerProfile,
      matchesPlayed: playerProfile.matchesPlayed + 1,
      wins: playerProfile.wins + (isWin ? 1 : 0),
      draws: playerProfile.draws + (isDraw ? 1 : 0),
      losses: playerProfile.losses + (!isWin && !isDraw ? 1 : 0),
      goalsScored: playerProfile.goalsScored + m.playerGoals,
      goalsConceded: playerProfile.goalsConceded + m.opponentGoals,
      penaltiesTaken: playerProfile.penaltiesTaken + m.penaltiesTaken,
      penaltiesScored: playerProfile.penaltiesScored + m.penaltiesScored,
      penaltiesMissed: playerProfile.penaltiesMissed + m.penaltiesMissed,
      saves: playerProfile.saves + m.saves,
      vocabAnswered: playerProfile.vocabAnswered + totalVocab,
      vocabCorrect: playerProfile.vocabCorrect + m.correctAnswers,
      bestWinMargin: Math.max(playerProfile.bestWinMargin, m.playerGoals - m.opponentGoals),
      bestAccuracyMatch: Math.max(playerProfile.bestAccuracyMatch, matchAcc),
      trophies: nextTrophies,
      matchHistory: [
        {
          id: `hist_${Date.now()}`,
          fixtureId: m.fixtureId,
          competitionName: careerSave.competitionName,
          season: careerSave.season,
          stageLabel: m.stageLabel,
          playerTeamId: m.playerTeamId,
          opponentTeamId: m.opponentTeamId,
          playerGoals: m.playerGoals,
          opponentGoals: m.opponentGoals,
          shootoutPlayerGoals: m.isShootout ? m.shootoutPlayerGoals : undefined,
          shootoutOpponentGoals: m.isShootout ? m.shootoutOpponentGoals : undefined,
          result: (isWin ? 'WIN' : isDraw ? 'DRAW' : 'LOSS') as 'WIN' | 'DRAW' | 'LOSS',
          vocabCorrect: m.correctAnswers,
          vocabTotal: totalVocab,
          completedAt: now,
        },
        ...playerProfile.matchHistory,
      ].slice(0, 60),
    };

    updateCareerSave(updatedCareer);
    updatePlayerProfile(nextProfile);
    setScreen('DASHBOARD');
  }, [careerSave, playerProfile, updateCareerSave, updatePlayerProfile]);

  // Screen Routing
  if (screen === 'MAIN_MENU') {
    return (
      <MainMenu
        careerSave={careerSave}
        vocabCount={vocabLibrary.entries.length}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onNewCareer={() => {
          setTournamentCategory('international');
          setScreen('TOURNAMENT_SELECT');
        }}
        onContinueCareer={handleContinueCareer}
        onSelectInternational={() => {
          setTournamentCategory('international');
          setScreen('TOURNAMENT_SELECT');
        }}
        onSelectClubLeagues={() => {
          setTournamentCategory('league');
          setScreen('TOURNAMENT_SELECT');
        }}
        onOpenVocabLibrary={() => {
          setReturnScreenFromLibrary('MAIN_MENU');
          setScreen('VOCAB_LIBRARY');
        }}
        onOpenStatistics={() => setScreen('STATISTICS')}
        onOpenSettings={() => setScreen('SETTINGS')}
      />
    );
  }

  if (screen === 'TOURNAMENT_SELECT') {
    return (
      <TournamentSelection
        initialCategory={tournamentCategory}
        onBack={() => setScreen('MAIN_MENU')}
        onSelectCompetition={(competition, formatId) => {
          setSetupCompetition(competition);
          setSetupFormatId(formatId);
          setSetupTeamId(null);
          setScreen('TEAM_SELECT');
        }}
      />
    );
  }

  if (screen === 'TEAM_SELECT') {
    const format =
      setupCompetition.formats.find((f) => f.id === setupFormatId) ??
      setupCompetition.formats[0];
    const participants = getParticipantsForCompetitionFormat(
      setupCompetition.id,
      format.id,
      settings.customCompetitionTeams
    );
    return (
      <TeamSelection
        competition={setupCompetition}
        format={format}
        participatingTeamIds={participants}
        onBack={() => setScreen('TOURNAMENT_SELECT')}
        onConfirmTeam={(teamId) => {
          setSetupTeamId(teamId);
          setScreen('VOCAB_SETUP');
        }}
      />
    );
  }

  if (screen === 'VOCAB_SETUP' && setupTeamId) {
    return (
      <VocabSetupScreen
        competition={setupCompetition}
        selectedTeamId={setupTeamId}
        library={vocabLibrary}
        initialConfig={careerSave?.vocabConfig ?? DEFAULT_VOCAB_CONFIG}
        hasExistingCareer={Boolean(careerSave)}
        onBack={() => setScreen('TEAM_SELECT')}
        onOpenLibrary={() => {
          setReturnScreenFromLibrary('VOCAB_SETUP');
          setScreen('VOCAB_LIBRARY');
        }}
        onImportSamplePack={handleImportSamplePack}
        onStartCareer={handleLaunchCareer}
      />
    );
  }

  if (screen === 'VOCAB_LIBRARY') {
    return (
      <VocabularyLibraryScreen
        library={vocabLibrary}
        onBack={() => setScreen(returnScreenFromLibrary)}
        backLabel={
          returnScreenFromLibrary === 'VOCAB_SETUP'
            ? 'Back to Setup'
            : returnScreenFromLibrary === 'DASHBOARD'
              ? 'Back to Competition'
              : 'Main Menu'
        }
        onSaveLibrary={updateVocabLibrary}
        onImportSamplePack={handleImportSamplePack}
      />
    );
  }

  if (screen === 'DASHBOARD' && careerSave) {
    return (
      <CompetitionDashboard
        career={careerSave}
        matchLaunchError={matchLaunchError}
        onBackToMenu={() => setScreen('MAIN_MENU')}
        onPlayNextMatch={handlePlayNextMatch}
        onOpenVocabLibrary={() => {
          setReturnScreenFromLibrary('DASHBOARD');
          setScreen('VOCAB_LIBRARY');
        }}
        onStartNewCareer={() => {
          setTournamentCategory('international');
          setScreen('TOURNAMENT_SELECT');
        }}
      />
    );
  }

  if (screen === 'MATCH' && careerSave?.activeMatch) {
    return (
      <MatchScreen
        match={careerSave.activeMatch}
        competitionName={careerSave.competitionName}
        soundEnabled={settings.soundEnabled}
        animationsEnabled={settings.animationsEnabled}
        vocabEntries={vocabLibrary.entries}
        onToggleSound={handleToggleSound}
        onSaveAndExit={() => setScreen('DASHBOARD')}
        onKickoff={handleMatchKickoff}
        onAnswerOption={handleAnswerOption}
        onShootPenalty={handleShootPenalty}
        onAnimationComplete={handleAnimationComplete}
        onNextQuestion={handleNextQuestion}
        onBeginShootout={handleBeginShootout}
        onUpdateWordStatus={handleUpdateWordStatus}
        onFinishMatch={handleFinishMatch}
      />
    );
  }

  if (screen === 'STATISTICS') {
    return (
      <StatisticsScreen
        profile={playerProfile}
        careerSave={careerSave}
        vocabEntries={vocabLibrary.entries}
        onBack={() => setScreen('MAIN_MENU')}
        onMarkWordLearning={(entryId) => handleUpdateWordStatus(entryId, 'Learning')}
      />
    );
  }

  if (screen === 'SETTINGS') {
    return (
      <SettingsScreen
        settings={settings}
        careerSave={careerSave}
        library={vocabLibrary}
        profile={playerProfile}
        onBack={() => setScreen('MAIN_MENU')}
        onUpdateSettings={updateSettings}
        onResetCareer={() => updateCareerSave(null)}
        onImportFullBundle={(bundle) => {
          updateVocabLibrary(bundle.vocabularyLibrary);
          updateCareerSave(bundle.careerSave);
          updatePlayerProfile(bundle.playerProfile);
          updateSettings(bundle.settings);
        }}
      />
    );
  }

  return (
    <MainMenu
      careerSave={careerSave}
      vocabCount={vocabLibrary.entries.length}
      soundEnabled={settings.soundEnabled}
      onToggleSound={handleToggleSound}
      onNewCareer={() => setScreen('TOURNAMENT_SELECT')}
      onContinueCareer={handleContinueCareer}
      onSelectInternational={() => {
        setTournamentCategory('international');
        setScreen('TOURNAMENT_SELECT');
      }}
      onSelectClubLeagues={() => {
        setTournamentCategory('league');
        setScreen('TOURNAMENT_SELECT');
      }}
      onOpenVocabLibrary={() => {
        setReturnScreenFromLibrary('MAIN_MENU');
        setScreen('VOCAB_LIBRARY');
      }}
      onOpenStatistics={() => setScreen('STATISTICS')}
      onOpenSettings={() => setScreen('SETTINGS')}
    />
  );
}
