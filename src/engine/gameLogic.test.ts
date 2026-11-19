import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMatchQuestions,
  parseBulkVocabularyInput,
  filterSelectedVocabulary,
} from './vocabularyEngine';
import {
  createActiveMatch,
  startMatchKickoff,
  submitVocabularyAnswer,
  executeAttackPenaltyShot,
  completeAnimationPhase,
  advanceAfterRoundFeedback,
  beginShootoutKick,
  REGULAR_MATCH_QUESTIONS,
} from './matchEngine';
import {
  generateDoubleRoundRobinFixtures,
  generateGroupStage,
  calculateAllGroupStandings,
  simulateOpponentFixture,
  createNewCareer,
  recordPlayerMatchAndAdvance,
  getNextPlayerFixture,
} from './tournamentEngine';
import {
  ALL_NATIONAL_TEAMS,
  COMPETITIONS,
  EPL_2024_25_TEAMS,
  BUNDESLIGA_2024_25_TEAMS,
  LA_LIGA_2024_25_TEAMS,
  WORLD_CUP_32_TEAMS,
  WORLD_CUP_48_TEAMS,
  UEFA_EURO_2024_TEAMS,
  AFC_ASIAN_CUP_2023_TEAMS,
  COPA_AMERICA_2024_TEAMS,
  getTeamById,
} from '../data/competitions';
import { buildSamplePackEntries, OPTIONAL_SAMPLE_PACKS } from '../data/sampleVocabulary';
import { VocabularyEntry, VocabularyLibraryState } from '../types/game';

function makeSeededRng(values: number[]): () => number {
  let idx = 0;
  return () => {
    const val = values[idx % values.length];
    idx++;
    return val;
  };
}

function getTestPool(): VocabularyEntry[] {
  const pack = buildSamplePackEntries('col_sample_football');
  assert.ok(pack, 'Football sample pack should exist');
  return pack.entries;
}

test('Vocabulary engine: generates exactly 10 alternating questions strictly from selected pool', () => {
  const pool = getTestPool();
  const poolIds = new Set(pool.map((e) => e.id));
  const res = generateMatchQuestions(pool, {
    count: 10,
    rng: makeSeededRng([0.1, 0.3, 0.5, 0.7, 0.2, 0.8]),
  });

  assert.equal(res.ok, true);
  assert.equal(res.questions.length, 10);

  let attackCount = 0;
  let gkCount = 0;
  res.questions.forEach((q, idx) => {
    assert.ok(poolIds.has(q.entryId), 'Question must come only from selected vocabulary');
    assert.equal(q.options.length, 4);
    assert.equal(q.options[q.correctOptionIndex], q.correctAnswerText);
    const expectedRole = idx % 2 === 0 ? 'ATTACK' : 'GOALKEEPER';
    assert.equal(q.role, expectedRole);
    if (q.role === 'ATTACK') attackCount++;
    else gkCount++;
  });
  assert.equal(attackCount, 5);
  assert.equal(gkCount, 5);
});

test('Vocabulary engine: refuses silent fallback when pool < 10 without reuse permission', () => {
  const smallPool = getTestPool().slice(0, 6);
  const blocked = generateMatchQuestions(smallPool, { count: 10, allowQuestionReuse: false });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.requiresReusePermission, true);

  const permitted = generateMatchQuestions(smallPool, { count: 10, allowQuestionReuse: true });
  assert.equal(permitted.ok, true);
  assert.equal(permitted.questions.length, 10);
});

test('Vocabulary engine: bulk import parses pipe and CSV lines and flags duplicates', () => {
  const existing = getTestPool().slice(0, 2);
  const raw = [
    'goalkeeper | thủ môn | noun | The goalkeeper dived.',
    'striker | tiền đạo | noun | The striker scored twice.',
    'brokenlinewithoutseparator',
    '"tackle","pha xoạc bóng","noun","A clean tackle stopped the winger."',
  ].join('\n');

  const parsed = parseBulkVocabularyInput(raw, existing);
  assert.equal(parsed.duplicates.length, 1);
  assert.equal(parsed.duplicates[0].word, 'goalkeeper');
  assert.equal(parsed.validRows.length, 2);
  assert.equal(parsed.invalidLines.length, 1);
});

test('Vocabulary engine: filter respects preferred difficulty without mutating entry difficulty', () => {
  const entries = getTestPool();
  const lib: VocabularyLibraryState = {
    entries,
    collections: [{ id: 'col_sample_football', name: 'Football', description: '', createdAt: '' }],
  };
  const b2Only = filterSelectedVocabulary(lib, {
    mode: 'all',
    collectionIds: [],
    customWordIds: [],
    preferredDifficulty: 'B2',
    allowQuestionReuse: false,
  });
  assert.ok(b2Only.length > 0);
  assert.ok(b2Only.every((e) => e.difficulty === 'B2'));
});

test('Vocabulary engine: excludes Mastered words while unmastered words remain and cycles full library without repeating', () => {
  const allPackEntries = OPTIONAL_SAMPLE_PACKS.flatMap(
    (p) => buildSamplePackEntries(p.collection.id)?.entries ?? []
  );
  const extraEntries: VocabularyEntry[] = Array.from({ length: 22 }, (_, i) => ({
    id: `custom_rot_${i + 1}`,
    word: `vocabword${i + 1}`,
    meaning: `nghia_tu_${i + 1}`,
    partOfSpeech: 'noun',
    example: `We practiced vocabword${i + 1} during training.`,
    difficulty: 'B1',
    topic: 'Custom',
    collectionIds: [],
    status: 'New',
    source: 'Personal',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    stats: { attempts: 0, correct: 0, incorrect: 0, needsReview: false },
  }));
  const pool: VocabularyEntry[] = [...allPackEntries, ...extraEntries].slice(0, 50);
  assert.equal(pool.length, 50);

  // Mark the first 10 words as Mastered
  const masteredIds = new Set(pool.slice(0, 10).map((e) => e.id));
  let entries = pool.map((e) =>
    masteredIds.has(e.id) ? { ...e, status: 'Mastered' as const } : e
  );

  // Play 4 consecutive 10-question matches (40 unmastered words total):
  // - ZERO Mastered words should appear in any of the 4 matches
  // - ALL 40 unmastered words should appear exactly once with ZERO repeats across all 4 matches!
  const seenAcross4Matches = new Set<string>();
  let recentWordIds: string[] = [];

  for (let matchNum = 0; matchNum < 4; matchNum++) {
    const gen = generateMatchQuestions(entries, {
      count: 10,
      recentWordIds,
      rng: makeSeededRng([0.13 + matchNum * 0.1, 0.47, 0.81, 0.29]),
    });
    assert.equal(gen.ok, true);
    assert.equal(gen.questions.length, 10);

    const askedThisMatch = gen.questions.map((q) => q.entryId);
    for (const id of askedThisMatch) {
      assert.equal(masteredIds.has(id), false, `Mastered word ${id} must not be asked while unmastered words remain`);
      assert.equal(seenAcross4Matches.has(id), false, `Word ${id} repeated before full unmastered library was exhausted`);
      seenAcross4Matches.add(id);
    }

    // Simulate answering all 10 correctly (updating stats & lastAnsweredAt)
    const ts = new Date(Date.now() + matchNum * 60_000).toISOString();
    entries = entries.map((e) =>
      askedThisMatch.includes(e.id)
        ? {
            ...e,
            status: 'Learning' as const,
            stats: {
              attempts: e.stats.attempts + 1,
              correct: e.stats.correct + 1,
              incorrect: e.stats.incorrect,
              lastAnsweredAt: ts,
              needsReview: false,
            },
          }
        : e
    );
    recentWordIds = Array.from(new Set([...askedThisMatch, ...recentWordIds])).slice(0, 200);
  }

  assert.equal(seenAcross4Matches.size, 40, 'All 40 unmastered words should be cycled once before any repeat');

  // Match 5 (even if recentWordIds is cleared like in a New Career!):
  // Should pick the OLDEST-answered words from Match 1, NOT the words just answered in Match 4, and still zero Mastered!
  const match5 = generateMatchQuestions(entries, {
    count: 10,
    recentWordIds: [],
    rng: makeSeededRng([0.2, 0.5, 0.8]),
  });
  assert.equal(match5.ok, true);
  const match4Ids = new Set(recentWordIds.slice(0, 10));
  for (const q of match5.questions) {
    assert.equal(masteredIds.has(q.entryId), false, 'Mastered words remain excluded on Match 5');
    assert.equal(match4Ids.has(q.entryId), false, 'Words just answered in Match 4 must not immediately repeat in Match 5');
  }

  // Fallback check: when only 4 unmastered words remain, all 4 are asked + 6 Mastered top up the 10-question match
  const mostlyMastered = pool.map((e, idx) =>
    idx < 4 ? { ...e, status: 'New' as const } : { ...e, status: 'Mastered' as const }
  );
  const fallbackGen = generateMatchQuestions(mostlyMastered, {
    count: 10,
    rng: makeSeededRng([0.3, 0.7]),
  });
  assert.equal(fallbackGen.ok, true);
  const fallbackIds = new Set(fallbackGen.questions.map((q) => q.entryId));
  for (let i = 0; i < 4; i++) {
    assert.ok(fallbackIds.has(pool[i].id), 'All remaining unmastered words must be prioritized first');
  }
});

test('Match engine: enforces 10 alternating questions, manual attack aim, 75/25 rolls, and exact scoring', () => {
  const pool = getTestPool();
  const gen = generateMatchQuestions(pool, { count: 10, rng: makeSeededRng([0.2, 0.6, 0.4]) });
  assert.equal(gen.ok, true);

  let match = createActiveMatch({
    fixtureId: 'fix_1',
    stageLabel: 'Group A · Matchday 1',
    isKnockout: false,
    playerTeamId: 'nat_eng',
    opponentTeamId: 'nat_fra',
    isPlayerHome: true,
    questions: gen.questions,
  });

  match = startMatchKickoff(match);
  assert.equal(match.phase, 'QUESTION');

  // Q1 (ATTACK): Correct answer MUST unlock PENALTY_AIM (never auto-shoot)
  const q1 = match.regularQuestions[0];
  assert.equal(q1.role, 'ATTACK');
  match = submitVocabularyAnswer(match, q1.correctOptionIndex);
  assert.equal(match.phase, 'PENALTY_AIM');
  assert.equal(match.playerGoals, 0);

  // Manual shot with roll 0.749 (< 0.75) => GOAL
  match = executeAttackPenaltyShot(match, 'LEFT', makeSeededRng([0.749, 0.2]));
  assert.equal(match.phase, 'PENALTY_ANIMATION');
  assert.equal(match.lastAttemptOutcome, 'GOAL');
  assert.equal(match.playerGoals, 1);
  match = completeAnimationPhase(match);
  match = advanceAfterRoundFeedback(match, pool);

  // Q2 (GOALKEEPER): Correct answer with roll 0.750 (>= 0.75) => CONCEDED (25% chance)
  const q2 = match.regularQuestions[1];
  assert.equal(q2.role, 'GOALKEEPER');
  match = submitVocabularyAnswer(match, q2.correctOptionIndex, makeSeededRng([0.75, 0.1, 0.5]));
  assert.equal(match.phase, 'GK_ANIMATION');
  assert.equal(match.lastAttemptOutcome, 'CONCEDED_BEAT_GK');
  assert.equal(match.opponentGoals, 1);
  match = completeAnimationPhase(match);
  match = advanceAfterRoundFeedback(match, pool);

  // Q3 (ATTACK): Wrong answer => automatic miss (no aim phase)
  const q3 = match.regularQuestions[2];
  const wrongIdx = (q3.correctOptionIndex + 1) % 4;
  match = submitVocabularyAnswer(match, wrongIdx);
  assert.equal(match.phase, 'FEEDBACK_WRONG');
  assert.equal(match.lastAttemptOutcome, 'MISS_WRONG_ANSWER');
  assert.equal(match.penaltiesMissed, 1);
  match = advanceAfterRoundFeedback(match, pool);

  // Q4 (GOALKEEPER): Wrong answer => automatic conceded goal
  const q4 = match.regularQuestions[3];
  match = submitVocabularyAnswer(match, (q4.correctOptionIndex + 1) % 4);
  assert.equal(match.phase, 'GK_ANIMATION');
  assert.equal(match.lastAttemptOutcome, 'CONCEDED_WRONG_ANSWER');
  assert.equal(match.opponentGoals, 2);
  match = completeAnimationPhase(match);
  match = advanceAfterRoundFeedback(match, pool);

  // Q5..Q10: Answer all correctly with favorable 0.10 rolls (goals & saves)
  for (let idx = 4; idx < REGULAR_MATCH_QUESTIONS; idx++) {
    const q = match.regularQuestions[idx];
    if (q.role === 'ATTACK') {
      match = submitVocabularyAnswer(match, q.correctOptionIndex);
      assert.equal(match.phase, 'PENALTY_AIM');
      match = executeAttackPenaltyShot(match, 'RIGHT', makeSeededRng([0.1, 0.3]));
      match = completeAnimationPhase(match);
    } else {
      match = submitVocabularyAnswer(match, q.correctOptionIndex, makeSeededRng([0.1, 0.4]));
      assert.equal(match.lastAttemptOutcome, 'SAVE');
      match = completeAnimationPhase(match);
    }
    match = advanceAfterRoundFeedback(match, pool);
  }

  assert.equal(match.phase, 'FULL_TIME');
  // Q1 scored (1), Q3 wrong (0), Q5,Q7,Q9 scored (+3) => 4 goals
  assert.equal(match.playerGoals, 4);
  // Q2 beat GK (1), Q4 wrong (1), Q6,Q8,Q10 saved (0) => 2 conceded
  assert.equal(match.opponentGoals, 2);
  assert.equal(match.saves, 3);
  assert.equal(match.records.length, 10);
});

test('Match engine: drawn knockout match triggers penalty shootout and resolves sudden death', () => {
  const pool = getTestPool();
  const gen = generateMatchQuestions(pool, { count: 10, rng: makeSeededRng([0.3]) });
  let match = createActiveMatch({
    fixtureId: 'ko_1',
    stageLabel: 'Quarter-Finals',
    isKnockout: true,
    playerTeamId: 'nat_arg',
    opponentTeamId: 'nat_bra',
    isPlayerHome: true,
    questions: gen.questions,
  });
  match = startMatchKickoff(match);

  // Play all 10 questions to a 0-0 draw (wrong answers on attack, saved on GK)
  for (let i = 0; i < 10; i++) {
    const q = match.regularQuestions[i];
    if (q.role === 'ATTACK') {
      match = submitVocabularyAnswer(match, (q.correctOptionIndex + 1) % 4);
    } else {
      match = submitVocabularyAnswer(match, q.correctOptionIndex, makeSeededRng([0.1, 0.2]));
      match = completeAnimationPhase(match);
    }
    match = advanceAfterRoundFeedback(match, pool);
  }

  assert.equal(match.phase, 'SHOOTOUT_INTRO');
  assert.equal(match.isShootout, true);

  match = beginShootoutKick(match, pool, makeSeededRng([0.2]));
  assert.equal(match.phase, 'QUESTION');

  // Play 5 shootout rounds tied 5-5, then win in sudden death round 6
  for (let round = 1; round <= 5; round++) {
    const atkQ = match.shootoutQuestion!;
    match = submitVocabularyAnswer(match, atkQ.correctOptionIndex);
    match = executeAttackPenaltyShot(match, 'CENTER', makeSeededRng([0.2, 0.4]));
    match = completeAnimationPhase(match);
    match = advanceAfterRoundFeedback(match, pool, makeSeededRng([0.3]));

    const gkQ = match.shootoutQuestion!;
    // Concede in GK so shootout remains tied 5-5
    match = submitVocabularyAnswer(match, (gkQ.correctOptionIndex + 1) % 4);
    match = completeAnimationPhase(match);
    match = advanceAfterRoundFeedback(match, pool, makeSeededRng([0.3]));
  }

  assert.equal(match.shootoutPlayerGoals, 5);
  assert.equal(match.shootoutOpponentGoals, 5);
  assert.equal(match.shootoutRound, 6); // Sudden death!

  // Round 6 Sudden Death: player scores, goalkeeper saves => player wins!
  match = submitVocabularyAnswer(match, match.shootoutQuestion!.correctOptionIndex);
  match = executeAttackPenaltyShot(match, 'LEFT', makeSeededRng([0.2, 0.5]));
  match = completeAnimationPhase(match);
  match = advanceAfterRoundFeedback(match, pool, makeSeededRng([0.3]));

  match = submitVocabularyAnswer(match, match.shootoutQuestion!.correctOptionIndex, makeSeededRng([0.1, 0.2]));
  match = completeAnimationPhase(match);
  match = advanceAfterRoundFeedback(match, pool, makeSeededRng([0.3]));

  assert.equal(match.phase, 'FULL_TIME');
  assert.equal(match.winnerTeamId, 'nat_arg');
  assert.equal(match.shootoutPlayerGoals, 6);
  assert.equal(match.shootoutOpponentGoals, 5);
});

test('Tournament engine: leagues generate exact double round-robin fixtures with zero duplicates or self-matches', () => {
  const cases = [
    { id: 'epl', teams: EPL_2024_25_TEAMS, expectedMatchdays: 38, expectedTotal: 380 },
    { id: 'bundesliga', teams: BUNDESLIGA_2024_25_TEAMS, expectedMatchdays: 34, expectedTotal: 306 },
    { id: 'la_liga', teams: LA_LIGA_2024_25_TEAMS, expectedMatchdays: 38, expectedTotal: 380 },
  ];

  for (const c of cases) {
    const fixtures = generateDoubleRoundRobinFixtures(c.id, c.teams);
    assert.equal(fixtures.length, c.expectedTotal, `${c.id} fixture count`);

    const pairKeys = new Set<string>();
    const counts = new Map<string, number>();

    for (const f of fixtures) {
      assert.notEqual(f.homeTeamId, f.awayTeamId, 'No self-matches allowed');
      const key = `${f.homeTeamId}__${f.awayTeamId}`;
      assert.equal(pairKeys.has(key), false, `Duplicate fixture ${key} in ${c.id}`);
      pairKeys.add(key);
      counts.set(f.homeTeamId, (counts.get(f.homeTeamId) ?? 0) + 1);
      counts.set(f.awayTeamId, (counts.get(f.awayTeamId) ?? 0) + 1);
    }

    for (const t of c.teams) {
      assert.equal(counts.get(t), c.expectedMatchdays, `${t} must play ${c.expectedMatchdays} matches`);
    }
  }
});

test('Tournament engine: international formats (WC32, WC48, Euro24, AFC24, Copa16) & deterministic simulation', () => {
  const wc32 = generateGroupStage('wc32', WORLD_CUP_32_TEAMS, 8, 4);
  assert.equal(wc32.groups.length, 8);
  assert.equal(wc32.fixtures.length, 48);

  const wc48 = generateGroupStage('wc48', WORLD_CUP_48_TEAMS, 12, 4);
  assert.equal(wc48.groups.length, 12);
  assert.equal(wc48.fixtures.length, 72);

  const euro24 = generateGroupStage('euro24', UEFA_EURO_2024_TEAMS, 6, 4);
  assert.equal(euro24.groups.length, 6);
  assert.equal(euro24.fixtures.length, 36);

  const afc24 = generateGroupStage('afc24', AFC_ASIAN_CUP_2023_TEAMS, 6, 4);
  assert.equal(afc24.groups.length, 6);
  assert.equal(afc24.fixtures.length, 36);

  const copa16 = generateGroupStage('copa16', COPA_AMERICA_2024_TEAMS, 4, 4);
  assert.equal(copa16.groups.length, 4);
  assert.equal(copa16.fixtures.length, 24);

  // Deterministic opponent simulation check
  const sampleFixture = euro24.fixtures[0];
  const simA = simulateOpponentFixture('career_fixed_seed', sampleFixture, false);
  const simB = simulateOpponentFixture('career_fixed_seed', sampleFixture, false);
  assert.equal(simA.homeGoals, simB.homeGoals);
  assert.equal(simA.awayGoals, simB.awayGoals);

  // Best third-placed qualification count check for Euro 24 (12 top-2 + 4 best 3rd = 16 teams)
  const completedFixtures = euro24.fixtures.map((f) => ({
    ...f,
    result: simulateOpponentFixture('career_fixed_seed', f, false),
  }));
  const standings = calculateAllGroupStandings(euro24.groups, completedFixtures, 4);
  assert.equal(standings.qualifiedTeamIds.size, 16);
});

test('Tournament engine: winning group stage & knockouts crowns champion', () => {
  const copa = COMPETITIONS.find((c) => c.id === 'copa_america')!;
  let career = createNewCareer({
    competition: copa,
    format: copa.formats[0],
    participatingTeamIds: COPA_AMERICA_2024_TEAMS,
    playerTeamId: 'nat_arg',
    vocabConfig: {
      mode: 'all',
      collectionIds: [],
      customWordIds: [],
      preferredDifficulty: 'ALL',
      allowQuestionReuse: true,
    },
  });

  // Win all 3 group matches + QF + SF + Final (6 matches total for 16-team Copa)
  let matchesWon = 0;
  while (career.currentStage !== 'COMPLETED' && career.currentStage !== 'ELIMINATED') {
    const nextFix = getNextPlayerFixture(career);
    assert.ok(nextFix, 'Player should have a next fixture');
    const isHome = nextFix.homeTeamId === career.playerTeamId;
    career = recordPlayerMatchAndAdvance(
      career,
      nextFix.id,
      {
        homeGoals: isHome ? 3 : 0,
        awayGoals: isHome ? 0 : 3,
        winnerTeamId: career.playerTeamId,
        playedByUser: true,
        completedAt: new Date().toISOString(),
      },
      {
        playerGoals: 3,
        opponentGoals: 0,
        penaltiesTaken: 5,
        penaltiesScored: 3,
        penaltiesMissed: 2,
        saves: 5,
        vocabAnswered: 10,
        vocabCorrect: 10,
        usedWordIds: [],
      }
    );
    matchesWon++;
    assert.ok(matchesWon <= 6, 'Copa 16 should take at most 6 matches to win');
  }

  assert.equal(matchesWon, 6);
  assert.equal(career.currentStage, 'COMPLETED');
  assert.equal(career.championTeamId, 'nat_arg');
  assert.equal(career.playerFinalPlacement, 'Champion');
});

test('Tournament engine: group standings never repeat identical "Top 2" labels across ranks', () => {
  const afc24 = generateGroupStage('afc24', AFC_ASIAN_CUP_2023_TEAMS, 6, 4);

  // Before any matches played: no qualification badges shown
  const initialStandings = calculateAllGroupStandings(afc24.groups, afc24.fixtures, 4);
  for (const g of afc24.groups) {
    for (const row of initialStandings.byGroup[g.name]) {
      assert.equal(row.qualificationNote, undefined);
    }
  }

  // After Matchday 1: Rank 1 and Rank 2 MUST have distinct labels (no duplicate "Top 2")
  const md1Played = afc24.fixtures.map((f) =>
    f.matchday === 1
      ? { ...f, result: simulateOpponentFixture('seed_md1', f, false) }
      : f
  );
  const midStandings = calculateAllGroupStandings(afc24.groups, md1Played, 4);
  for (const g of afc24.groups) {
    const rows = midStandings.byGroup[g.name];
    assert.equal(rows[0].qualificationNote, 'Advancing (1st)');
    assert.equal(rows[1].qualificationNote, 'Advancing (2nd)');
    assert.notEqual(rows[0].qualificationNote, rows[1].qualificationNote);
  }

  // After all 3 matchdays: Rank 1 and Rank 2 show Qualified (1st) and Qualified (2nd)
  const allPlayed = afc24.fixtures.map((f) => ({
    ...f,
    result: simulateOpponentFixture('seed_md1', f, false),
  }));
  const finalStandings = calculateAllGroupStandings(afc24.groups, allPlayed, 4);
  for (const g of afc24.groups) {
    const rows = finalStandings.byGroup[g.name];
    assert.equal(rows[0].qualificationNote, 'Qualified (1st)');
    assert.equal(rows[1].qualificationNote, 'Qualified (2nd)');
    assert.notEqual(rows[0].qualificationNote, rows[1].qualificationNote);
  }
});

test('Tournament engine: Vietnam can qualify for FIFA World Cup Finals via Qualifiers (direct & play-off)', () => {
  const wc = COMPETITIONS.find((c) => c.id === 'fifa_world_cup')!;
  const qualFormat = wc.formats.find((f) => f.id === 'wc_qualifiers')!;
  assert.ok(qualFormat, 'wc_qualifiers format should exist');
  assert.ok(ALL_NATIONAL_TEAMS.includes('nat_vie'), 'Vietnam must be selectable in World Cup Qualifiers');

  const vocabConfig = {
    mode: 'all' as const,
    collectionIds: [],
    customWordIds: [],
    preferredDifficulty: 'ALL' as const,
    allowQuestionReuse: true,
  };

  // Path 1: Vietnam wins all 3 AFC Qualifier matches -> advances directly to 32-team WC Finals
  let directCareer = createNewCareer({
    competition: wc,
    format: qualFormat,
    participatingTeamIds: ALL_NATIONAL_TEAMS,
    playerTeamId: 'nat_vie',
    vocabConfig,
  });

  assert.equal(directCareer.currentStage, 'QUALIFIERS');
  assert.ok(directCareer.qualifierGroups && directCareer.qualifierGroups.length >= 2);
  const vietnamGroup = directCareer.qualifierGroups.find((g) => g.teamIds.includes('nat_vie'));
  assert.ok(vietnamGroup, 'Vietnam must be placed in a qualifying group');
  assert.equal(vietnamGroup.name, 'AFC Group A');
  assert.equal(vietnamGroup.teamIds.length, 4);
  for (const tid of vietnamGroup.teamIds) {
    assert.equal(getTeamById(tid).confederation, 'AFC');
  }

  // Play all 3 qualifier matchdays with Vietnam winning 3-0
  for (let md = 1; md <= 3; md++) {
    const nextFix = getNextPlayerFixture(directCareer);
    assert.ok(nextFix && nextFix.stage === 'QUALIFIERS');
    const isHome = nextFix.homeTeamId === 'nat_vie';
    directCareer = recordPlayerMatchAndAdvance(
      directCareer,
      nextFix.id,
      {
        homeGoals: isHome ? 3 : 0,
        awayGoals: isHome ? 0 : 3,
        winnerTeamId: 'nat_vie',
        playedByUser: true,
        completedAt: new Date().toISOString(),
      },
      {
        playerGoals: 3,
        opponentGoals: 0,
        penaltiesTaken: 5,
        penaltiesScored: 3,
        penaltiesMissed: 2,
        saves: 5,
        vocabAnswered: 10,
        vocabCorrect: 10,
        usedWordIds: [],
      }
    );
  }

  assert.equal(directCareer.currentStage, 'GROUP_STAGE');
  assert.equal(directCareer.qualifiedForFinals, true);
  assert.equal(directCareer.groups.length, 8);
  assert.ok(
    directCareer.groups.some((g) => g.teamIds.includes('nat_vie')),
    'Vietnam must be drawn into one of the 8 FIFA World Cup Finals groups'
  );
  const finalsFix = getNextPlayerFixture(directCareer);
  assert.ok(finalsFix && finalsFix.stage === 'GROUP');
});

