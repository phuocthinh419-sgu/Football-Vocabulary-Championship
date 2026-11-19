import {
  CareerSave,
  Competition,
  CompetitionFormatConfig,
  Fixture,
  FixtureResult,
  GroupData,
  StandingsRow,
  TournamentStageStatus,
  VocabularySourceConfig,
} from '../types/game';
import { getTeamById, WORLD_CUP_32_TEAMS } from '../data/competitions';

/**
 * Deterministic hash-based PRNG (Mulberry32) so opponent simulation results
 * are deterministic once generated and saved, never changing on refresh or navigation.
 */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates standard double round-robin fixtures using the Circle Method (Berger tables).
 * Guarantees:
 * - Zero self-matches (homeTeamId !== awayTeamId)
 * - Zero duplicate fixtures
 * - Exact 2 * (N - 1) matchdays (e.g. 38 for 20 teams, 34 for 18 teams)
 * - Every club plays every other club exactly once at home and once away
 */
export function generateDoubleRoundRobinFixtures(
  competitionId: string,
  teamIds: string[]
): Fixture[] {
  const teams = teamIds.slice();
  if (teams.length % 2 !== 0) {
    throw new Error('League must have an even number of clubs.');
  }
  const n = teams.length;
  const half = n / 2;
  const roundsFirstHalf = n - 1;
  const fixtures: Fixture[] = [];

  const rotating = teams.slice(1);
  const fixed = teams[0];

  for (let round = 0; round < roundsFirstHalf; round++) {
    const matchday = round + 1;
    const roundTeams = [fixed, ...rotating];

    for (let i = 0; i < half; i++) {
      const t1 = roundTeams[i];
      const t2 = roundTeams[n - 1 - i];
      const flip = i === 0 ? round % 2 === 1 : (round + i) % 2 === 1;
      const homeTeamId = flip ? t2 : t1;
      const awayTeamId = flip ? t1 : t2;

      fixtures.push({
        id: `${competitionId}_L_MD${matchday}_M${i + 1}`,
        competitionId,
        stage: 'LEAGUE',
        matchday,
        homeTeamId,
        awayTeamId,
      });
    }

    const last = rotating.pop()!;
    rotating.unshift(last);
  }

  const firstHalfCount = fixtures.length;
  for (let idx = 0; idx < firstHalfCount; idx++) {
    const orig = fixtures[idx];
    const returnMatchday = orig.matchday + roundsFirstHalf;
    fixtures.push({
      id: `${competitionId}_L_MD${returnMatchday}_M${(idx % half) + 1}`,
      competitionId,
      stage: 'LEAGUE',
      matchday: returnMatchday,
      homeTeamId: orig.awayTeamId,
      awayTeamId: orig.homeTeamId,
    });
  }

  return fixtures;
}

/**
 * Splits participating teams into groups of 4 and generates the 3 group matchdays
 * (6 unique fixtures per group, zero self-matches, zero duplicates).
 */
export function generateGroupStage(
  competitionId: string,
  teamIds: string[],
  groupCount: number,
  teamsPerGroup = 4,
  stage: 'GROUP' | 'QUALIFIERS' = 'GROUP',
  customGroupNames?: string[]
): { groups: GroupData[]; fixtures: Fixture[] } {
  const letters = 'ABCDEFGHIJKLMNOP';
  const groups: GroupData[] = [];
  const fixtures: Fixture[] = [];

  for (let g = 0; g < groupCount; g++) {
    const groupName = customGroupNames?.[g] ?? letters[g];
    const slice = teamIds.slice(g * teamsPerGroup, (g + 1) * teamsPerGroup);
    if (slice.length !== 4) {
      throw new Error(`Group ${groupName} requires 4 teams, received ${slice.length}.`);
    }
    groups.push({ name: groupName, teamIds: slice });

    const [t0, t1, t2, t3] = slice;
    const pairings: Array<{ matchday: number; home: string; away: string; slot: number }> = [
      { matchday: 1, home: t0, away: t1, slot: 1 },
      { matchday: 1, home: t2, away: t3, slot: 2 },
      { matchday: 2, home: t0, away: t2, slot: 1 },
      { matchday: 2, home: t3, away: t1, slot: 2 },
      { matchday: 3, home: t3, away: t0, slot: 1 },
      { matchday: 3, home: t1, away: t2, slot: 2 },
    ];

    const stagePrefix = stage === 'QUALIFIERS' ? 'Q' : 'G';
    for (const p of pairings) {
      fixtures.push({
        id: `${competitionId}_${stagePrefix}${g + 1}_MD${p.matchday}_M${p.slot}`,
        competitionId,
        stage,
        groupName,
        matchday: p.matchday,
        homeTeamId: p.home,
        awayTeamId: p.away,
      });
    }
  }

  return { groups, fixtures };
}

/**
 * Builds continental World Cup Qualifying groups (4 teams per group) centered around
 * the player's confederation (e.g. Vietnam in AFC Qualifying Group A + a parallel
 * Intercontinental Play-off pool group from another confederation).
 */
export function generateWorldCupQualifiers(
  competitionId: string,
  allNationalTeamIds: string[],
  playerTeamId: string
): { qualifierGroups: GroupData[]; fixtures: Fixture[] } {
  const playerTeam = getTeamById(playerTeamId);
  const playerConf = playerTeam.confederation ?? 'AFC';

  const sameConfOthers = allNationalTeamIds.filter(
    (id) => id !== playerTeamId && getTeamById(id).confederation === playerConf
  );
  const otherConfTeams = allNationalTeamIds.filter(
    (id) => id !== playerTeamId && getTeamById(id).confederation !== playerConf
  );

  // Build balanced 4-team group for the player from their own confederation
  // (1 strong seed, 1 mid seed, 1 peer rival) so Vietnam gets an authentic AFC group!
  const sortedSame = sameConfOthers
    .slice()
    .sort((a, b) => getTeamById(b).rating - getTeamById(a).rating);

  const playerGroupOpponents: string[] = [];
  if (sortedSame.length >= 3) {
    playerGroupOpponents.push(
      sortedSame[0], // Top confederation seed (e.g. Japan in AFC)
      sortedSame[Math.floor(sortedSame.length * 0.4)], // Mid-tier seed (e.g. Iraq/UAE)
      sortedSame[Math.floor(sortedSame.length * 0.72)] // Peer rival (e.g. Indonesia/Thailand)
    );
  } else {
    playerGroupOpponents.push(...sortedSame, ...otherConfTeams.slice(0, 3 - sortedSame.length));
  }

  const playerGroupTeams = [playerTeamId, ...playerGroupOpponents.slice(0, 3)];
  const used = new Set(playerGroupTeams);

  // Build 3 additional continental qualifier groups so players can view global qualifiers
  // and provide an authentic intercontinental play-off opponent if finishing 3rd
  const remainingSame = sortedSame.filter((id) => !used.has(id));
  const confGroups: Array<{ name: string; teams: string[] }> = [
    { name: `${playerConf} Group A`, teams: playerGroupTeams },
  ];

  if (remainingSame.length >= 4) {
    const g2 = remainingSame.slice(0, 4);
    g2.forEach((id) => used.add(id));
    confGroups.push({ name: `${playerConf} Group B`, teams: g2 });
  }

  const interConfs = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC'].filter(
    (c) => c !== playerConf
  );
  for (const conf of interConfs) {
    if (confGroups.length >= 4) break;
    const pool = allNationalTeamIds.filter(
      (id) => !used.has(id) && getTeamById(id).confederation === conf
    );
    if (pool.length >= 4) {
      const picked = pool.slice(0, 4);
      picked.forEach((id) => used.add(id));
      confGroups.push({ name: `${conf} Qualifier`, teams: picked });
    }
  }

  const flatTeams = confGroups.flatMap((g) => g.teams);
  const names = confGroups.map((g) => g.name);
  const built = generateGroupStage(
    competitionId,
    flatTeams,
    confGroups.length,
    4,
    'QUALIFIERS',
    names
  );

  return {
    qualifierGroups: built.groups,
    fixtures: built.fixtures,
  };
}

/**
 * Calculates standings sorted strictly by:
 * 1. Points (3 win, 1 draw, 0 loss)
 * 2. Goal Difference
 * 3. Goals Scored
 * 4. Alphabetical team name tie-break
 */
export function calculateStandings(
  teamIds: string[],
  fixtures: Fixture[],
  groupName?: string
): StandingsRow[] {
  const map = new Map<string, StandingsRow>();
  for (const teamId of teamIds) {
    map.set(teamId, {
      teamId,
      groupName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const f of fixtures) {
    if (!f.result) continue;
    const home = map.get(f.homeTeamId);
    const away = map.get(f.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += f.result.homeGoals;
    home.goalsAgainst += f.result.awayGoals;
    away.goalsFor += f.result.awayGoals;
    away.goalsAgainst += f.result.homeGoals;

    if (f.result.homeGoals > f.result.awayGoals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (f.result.homeGoals < f.result.awayGoals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    goalDifference: r.goalsFor - r.goalsAgainst,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return getTeamById(a.teamId).name.localeCompare(getTeamById(b.teamId).name);
  });

  return rows;
}

export function calculateAllGroupStandings(
  groups: GroupData[],
  fixtures: Fixture[],
  bestThirdCount = 0,
  stage: 'GROUP' | 'QUALIFIERS' = 'GROUP'
): {
  byGroup: Record<string, StandingsRow[]>;
  thirdPlacedTable: StandingsRow[];
  qualifiedTeamIds: Set<string>;
} {
  const byGroup: Record<string, StandingsRow[]> = {};
  const thirdPlaced: StandingsRow[] = [];
  const qualifiedTeamIds = new Set<string>();

  for (const g of groups) {
    const groupFixtures = fixtures.filter((f) => f.stage === stage && f.groupName === g.name);
    const rows = calculateStandings(g.teamIds, groupFixtures, g.name);
    byGroup[g.name] = rows;
    if (rows[0]) qualifiedTeamIds.add(rows[0].teamId);
    if (rows[1]) qualifiedTeamIds.add(rows[1].teamId);
    if (rows[2]) thirdPlaced.push(rows[2]);
  }

  // Rank 3rd-placed teams strictly by Points -> Goal Difference -> Goals Scored
  thirdPlaced.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return getTeamById(a.teamId).name.localeCompare(getTeamById(b.teamId).name);
  });

  const qualifiedThirdIds = new Set(
    thirdPlaced.slice(0, bestThirdCount).map((row) => row.teamId)
  );
  for (const id of qualifiedThirdIds) {
    qualifiedTeamIds.add(id);
  }

  // Distinct, unambiguous rank & qualification annotations (never repeating "Top 2" twice!)
  for (const g of groups) {
    const groupHasPlayed = byGroup[g.name].some((r) => r.played > 0);
    const groupComplete = byGroup[g.name].every((r) => r.played >= 3);
    byGroup[g.name] = byGroup[g.name].map((row, idx) => {
      if (!groupHasPlayed) {
        return { ...row, qualified: false, qualificationNote: undefined };
      }

      if (stage === 'QUALIFIERS') {
        if (idx === 0) {
          return {
            ...row,
            qualified: true,
            qualificationNote: groupComplete ? 'Qualified (1st)' : '1st · WC Finals',
          };
        }
        if (idx === 1) {
          return {
            ...row,
            qualified: true,
            qualificationNote: groupComplete ? 'Qualified (2nd)' : '2nd · WC Finals',
          };
        }
        if (idx === 2) {
          return {
            ...row,
            qualified: false,
            qualificationNote: 'Play-off',
          };
        }
        return { ...row, qualified: false };
      }

      if (idx === 0) {
        return {
          ...row,
          qualified: true,
          qualificationNote: groupComplete ? 'Qualified (1st)' : 'Advancing (1st)',
        };
      }
      if (idx === 1) {
        return {
          ...row,
          qualified: true,
          qualificationNote: groupComplete ? 'Qualified (2nd)' : 'Advancing (2nd)',
        };
      }
      if (idx === 2 && qualifiedThirdIds.has(row.teamId)) {
        return {
          ...row,
          qualified: true,
          qualificationNote: groupComplete ? 'Qualified (Best 3rd)' : 'Best 3rd',
        };
      }
      return { ...row, qualified: false };
    });
  }

  const anyPlayed = thirdPlaced.some((r) => r.played > 0);
  const annotatedThird = thirdPlaced.map((row, idx) => ({
    ...row,
    qualified: anyPlayed && idx < bestThirdCount,
    qualificationNote: anyPlayed && idx < bestThirdCount ? 'Qualified (Best 3rd)' : undefined,
  }));

  return {
    byGroup,
    thirdPlacedTable: annotatedThird,
    qualifiedTeamIds,
  };
}

/**
 * Deterministic football match simulator for AI vs AI fixtures.
 */
export function simulateOpponentFixture(
  careerId: string,
  fixture: Fixture,
  isKnockout: boolean
): FixtureResult {
  const seed = hashStringToSeed(`${careerId}::${fixture.id}`);
  const rng = createSeededRng(seed);

  const homeTeam = getTeamById(fixture.homeTeamId);
  const awayTeam = getTeamById(fixture.awayTeamId);
  const ratingDiff = (homeTeam.rating - awayTeam.rating) / 100;

  const sampleGoals = (bias: number): number => {
    let goals = 0;
    for (let i = 0; i < 5; i++) {
      const p = Math.max(0.15, Math.min(0.62, 0.34 + bias));
      if (rng() < p) goals++;
    }
    return goals;
  };

  const homeGoals = sampleGoals(ratingDiff * 0.45 + 0.03);
  const awayGoals = sampleGoals(-ratingDiff * 0.45);

  if (!isKnockout || homeGoals !== awayGoals) {
    return {
      homeGoals,
      awayGoals,
      winnerTeamId:
        homeGoals > awayGoals
          ? fixture.homeTeamId
          : awayGoals > homeGoals
            ? fixture.awayTeamId
            : undefined,
      playedByUser: false,
      completedAt: new Date().toISOString(),
    };
  }

  let homePen = 0;
  let awayPen = 0;
  for (let r = 0; r < 5; r++) {
    if (rng() < 0.75) homePen++;
    if (rng() < 0.75) awayPen++;
  }
  while (homePen === awayPen) {
    const hHit = rng() < 0.75 ? 1 : 0;
    const aHit = rng() < 0.75 ? 1 : 0;
    homePen += hHit;
    awayPen += aHit;
  }

  return {
    homeGoals,
    awayGoals,
    homeShootoutGoals: homePen,
    awayShootoutGoals: awayPen,
    winnerTeamId: homePen > awayPen ? fixture.homeTeamId : fixture.awayTeamId,
    playedByUser: false,
    completedAt: new Date().toISOString(),
  };
}

export function createNewCareer(params: {
  competition: Competition;
  format: CompetitionFormatConfig;
  participatingTeamIds: string[];
  playerTeamId: string;
  vocabConfig: VocabularySourceConfig;
}): CareerSave {
  const { competition, format, participatingTeamIds, playerTeamId, vocabConfig } = params;
  const now = new Date().toISOString();
  const careerId = `career_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  let qualifierGroups: GroupData[] | undefined;
  let groups: GroupData[] = [];
  let fixtures: Fixture[] = [];
  let currentStage: TournamentStageStatus = 'GROUP_STAGE';
  let totalMatchdays = 3;

  if (format.formatType === 'double_round_robin') {
    fixtures = generateDoubleRoundRobinFixtures(competition.id, participatingTeamIds);
    currentStage = 'LEAGUE_SEASON';
    totalMatchdays = (participatingTeamIds.length - 1) * 2;
  } else if (format.formatType === 'world_cup_qualifiers') {
    const builtQuals = generateWorldCupQualifiers(
      competition.id,
      participatingTeamIds,
      playerTeamId
    );
    qualifierGroups = builtQuals.qualifierGroups;
    fixtures = builtQuals.fixtures;
    currentStage = 'QUALIFIERS';
    totalMatchdays = 3;
  } else {
    const groupCount = format.groupCount ?? Math.floor(participatingTeamIds.length / 4);
    const built = generateGroupStage(competition.id, participatingTeamIds, groupCount, 4);
    groups = built.groups;
    fixtures = built.fixtures;
    currentStage = 'GROUP_STAGE';
    totalMatchdays = 3;
  }

  return {
    id: careerId,
    createdAt: now,
    updatedAt: now,
    competitionId: competition.id,
    competitionName: competition.name,
    season: competition.season,
    formatId: format.id,
    formatType: format.formatType,
    category: competition.category,
    playerTeamId,
    vocabConfig,
    participatingTeamIds,
    qualifierGroups,
    qualifiedForFinals: format.formatType !== 'world_cup_qualifiers',
    groups,
    fixtures,
    currentStage,
    currentMatchday: 1,
    totalMatchdays,
    activeMatch: null,
    recentWordIds: [],
    careerStats: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      penaltiesTaken: 0,
      penaltiesScored: 0,
      penaltiesMissed: 0,
      saves: 0,
      vocabAnswered: 0,
      vocabCorrect: 0,
    },
  };
}

/**
 * Transitions a team that successfully qualified from World Cup Qualifiers (or Intercontinental Play-off)
 * directly into the 32-team FIFA World Cup Finals Group Stage!
 */
function buildWorldCupFinalsForQualifiedPlayer(
  competitionId: string,
  playerTeamId: string,
  qualifiedFromQuals: string[]
): { groups: GroupData[]; fixtures: Fixture[] } {
  const finalsPool: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (id: string) => {
    if (!seen.has(id) && finalsPool.length < 32) {
      seen.add(id);
      finalsPool.push(id);
    }
  };

  // Guarantee the player's team and other qualifier winners are included in the 32-team Finals
  pushUnique(playerTeamId);
  for (const id of qualifiedFromQuals) pushUnique(id);
  for (const id of WORLD_CUP_32_TEAMS) pushUnique(id);

  // Place player into Group A (or balanced slot) with 31 other verified nations -> 8 groups of 4
  const built = generateGroupStage(competitionId, finalsPool, 8, 4, 'GROUP');
  return built;
}

export function getBestThirdCountForFormat(formatType: CareerSave['formatType']): number {
  if (formatType === 'group_knockout_48') return 8;
  if (formatType === 'group_knockout_24') return 4;
  return 0;
}

function generateInitialKnockoutFixtures(career: CareerSave): {
  nextStage: 'R32' | 'R16' | 'QF';
  newFixtures: Fixture[];
  playerQualified: boolean;
} {
  const bestThirdCount = getBestThirdCountForFormat(career.formatType);
  const { byGroup, thirdPlacedTable, qualifiedTeamIds } = calculateAllGroupStandings(
    career.groups,
    career.fixtures,
    bestThirdCount,
    'GROUP'
  );

  const playerQualified = qualifiedTeamIds.has(career.playerTeamId);
  const groupNames = career.groups.map((g) => g.name);
  const winners = groupNames.map((n) => byGroup[n][0].teamId);
  const runnersUp = groupNames.map((n) => byGroup[n][1].teamId);
  const bestThirds = thirdPlacedTable.slice(0, bestThirdCount).map((r) => r.teamId);

  const pairings: Array<[string, string]> = [];
  let nextStage: 'R32' | 'R16' | 'QF' = 'R16';

  if (career.formatType === 'group_knockout_16') {
    nextStage = 'QF';
    pairings.push(
      [winners[0], runnersUp[1]],
      [winners[2], runnersUp[3]],
      [winners[1], runnersUp[0]],
      [winners[3], runnersUp[2]]
    );
  } else if (
    career.formatType === 'group_knockout_32' ||
    career.formatType === 'world_cup_qualifiers'
  ) {
    nextStage = 'R16';
    for (let i = 0; i < 8; i += 2) {
      pairings.push([winners[i], runnersUp[i + 1]]);
    }
    for (let i = 0; i < 8; i += 2) {
      pairings.push([winners[i + 1], runnersUp[i]]);
    }
  } else if (career.formatType === 'group_knockout_24') {
    nextStage = 'R16';
    pairings.push(
      [winners[0], bestThirds[0]],
      [winners[1], bestThirds[1]],
      [winners[2], bestThirds[2]],
      [winners[3], bestThirds[3]],
      [winners[4], runnersUp[5]],
      [winners[5], runnersUp[4]],
      [runnersUp[0], runnersUp[1]],
      [runnersUp[2], runnersUp[3]]
    );
  } else {
    nextStage = 'R32';
    for (let i = 0; i < 8; i++) {
      pairings.push([winners[i], bestThirds[i]]);
    }
    pairings.push(
      [winners[8], runnersUp[9]],
      [winners[9], runnersUp[8]],
      [winners[10], runnersUp[11]],
      [winners[11], runnersUp[10]],
      [runnersUp[0], runnersUp[1]],
      [runnersUp[2], runnersUp[3]],
      [runnersUp[4], runnersUp[5]],
      [runnersUp[6], runnersUp[7]]
    );
  }

  const newFixtures: Fixture[] = pairings.map(([home, away], idx) => ({
    id: `${career.competitionId}_${nextStage}_M${idx + 1}`,
    competitionId: career.competitionId,
    stage: nextStage,
    matchday: 4,
    bracketSlot: idx,
    homeTeamId: home,
    awayTeamId: away,
  }));

  return { nextStage, newFixtures, playerQualified };
}

function getNextKnockoutStage(
  stage: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL'
): 'R16' | 'QF' | 'SF' | 'FINAL' | 'COMPLETED' {
  switch (stage) {
    case 'R32':
      return 'R16';
    case 'R16':
      return 'QF';
    case 'QF':
      return 'SF';
    case 'SF':
      return 'FINAL';
    case 'FINAL':
      return 'COMPLETED';
  }
}

export function getNextPlayerFixture(career: CareerSave): Fixture | null {
  if (career.currentStage === 'COMPLETED' || career.currentStage === 'ELIMINATED') {
    return null;
  }

  if (career.currentStage === 'QUALIFIERS') {
    return (
      career.fixtures.find(
        (f) =>
          f.stage === 'QUALIFIERS' &&
          f.matchday === career.currentMatchday &&
          !f.result &&
          (f.homeTeamId === career.playerTeamId || f.awayTeamId === career.playerTeamId)
      ) ?? null
    );
  }

  if (career.currentStage === 'QUALIFIER_PLAYOFF') {
    return (
      career.fixtures.find(
        (f) =>
          f.stage === 'QUALIFIER_PLAYOFF' &&
          !f.result &&
          (f.homeTeamId === career.playerTeamId || f.awayTeamId === career.playerTeamId)
      ) ?? null
    );
  }

  if (career.currentStage === 'LEAGUE_SEASON' || career.currentStage === 'GROUP_STAGE') {
    const targetStage = career.currentStage === 'LEAGUE_SEASON' ? 'LEAGUE' : 'GROUP';
    return (
      career.fixtures.find(
        (f) =>
          f.stage === targetStage &&
          f.matchday === career.currentMatchday &&
          !f.result &&
          (f.homeTeamId === career.playerTeamId || f.awayTeamId === career.playerTeamId)
      ) ?? null
    );
  }

  return (
    career.fixtures.find(
      (f) =>
        f.stage === career.currentStage &&
        !f.result &&
        (f.homeTeamId === career.playerTeamId || f.awayTeamId === career.playerTeamId)
    ) ?? null
  );
}

/**
 * Records the user's completed match result, deterministically simulates all other
 * matches in the same matchday/knockout round, and advances tournament progression.
 */
export function recordPlayerMatchAndAdvance(
  career: CareerSave,
  fixtureId: string,
  userResult: FixtureResult,
  matchStatsDelta: {
    playerGoals: number;
    opponentGoals: number;
    penaltiesTaken: number;
    penaltiesScored: number;
    penaltiesMissed: number;
    saves: number;
    vocabAnswered: number;
    vocabCorrect: number;
    usedWordIds: string[];
  }
): CareerSave {
  const targetFixture = career.fixtures.find((f) => f.id === fixtureId);
  if (!targetFixture) return career;

  const isKnockoutStage =
    targetFixture.stage !== 'GROUP' &&
    targetFixture.stage !== 'LEAGUE' &&
    targetFixture.stage !== 'QUALIFIERS';

  let updatedFixtures = career.fixtures.map((f) => {
    if (f.id === fixtureId) {
      return { ...f, result: userResult };
    }
    const sameRound = isKnockoutStage
      ? f.stage === targetFixture.stage
      : f.stage === targetFixture.stage && f.matchday === targetFixture.matchday;

    if (sameRound && !f.result) {
      return {
        ...f,
        result: simulateOpponentFixture(career.id, f, isKnockoutStage),
      };
    }
    return f;
  });

  const isWin =
    userResult.winnerTeamId === career.playerTeamId ||
    (!userResult.winnerTeamId && matchStatsDelta.playerGoals > matchStatsDelta.opponentGoals);
  const isDraw =
    !isKnockoutStage && matchStatsDelta.playerGoals === matchStatsDelta.opponentGoals;
  const isLoss = !isWin && !isDraw;

  const nextRecentWords = Array.from(
    new Set([...matchStatsDelta.usedWordIds, ...career.recentWordIds])
  ).slice(0, 200);

  let nextStage: TournamentStageStatus = career.currentStage;
  let nextMatchday = career.currentMatchday;
  let nextGroups = career.groups;
  let qualifiedForFinals = career.qualifiedForFinals;
  let championTeamId = career.championTeamId;
  let runnerUpTeamId = career.runnerUpTeamId;
  let playerFinalPlacement = career.playerFinalPlacement;

  if (career.currentStage === 'QUALIFIERS') {
    if (career.currentMatchday < 3) {
      nextMatchday = career.currentMatchday + 1;
    } else {
      const qGroups = career.qualifierGroups ?? [];
      const qualStandings = calculateAllGroupStandings(qGroups, updatedFixtures, 0, 'QUALIFIERS');
      const playerQGroup = qGroups.find((g) => g.teamIds.includes(career.playerTeamId));
      const playerGroupRows = playerQGroup ? qualStandings.byGroup[playerQGroup.name] ?? [] : [];
      const playerRank = playerGroupRows.findIndex((r) => r.teamId === career.playerTeamId) + 1;
      const directQualifiers = Array.from(qualStandings.qualifiedTeamIds);

      if (playerRank === 1 || playerRank === 2) {
        // Qualified directly for the FIFA World Cup Finals!
        const builtFinals = buildWorldCupFinalsForQualifiedPlayer(
          career.competitionId,
          career.playerTeamId,
          directQualifiers
        );
        nextGroups = builtFinals.groups;
        updatedFixtures = [...updatedFixtures, ...builtFinals.fixtures];
        qualifiedForFinals = true;
        nextStage = 'GROUP_STAGE';
        nextMatchday = 1;
      } else if (playerRank === 3) {
        // Finished 3rd -> Intercontinental Play-off match for a World Cup Finals ticket!
        const otherThird =
          qualStandings.thirdPlacedTable.find((r) => r.teamId !== career.playerTeamId)?.teamId ??
          'nat_nzl';
        const playoffFixture: Fixture = {
          id: `${career.competitionId}_QUALIFIER_PLAYOFF_M1`,
          competitionId: career.competitionId,
          stage: 'QUALIFIER_PLAYOFF',
          matchday: 4,
          bracketSlot: 0,
          homeTeamId: career.playerTeamId,
          awayTeamId: otherThird,
        };
        updatedFixtures = [...updatedFixtures, playoffFixture];
        nextStage = 'QUALIFIER_PLAYOFF';
        nextMatchday = 4;
      } else {
        // Finished 4th -> Eliminated in Continental Qualifiers
        nextStage = 'ELIMINATED';
        qualifiedForFinals = false;
        playerFinalPlacement = 'World Cup Qualifiers (4th)';
      }
    }
  } else if (career.currentStage === 'QUALIFIER_PLAYOFF') {
    const playerWonPlayoff = userResult.winnerTeamId === career.playerTeamId;
    if (playerWonPlayoff) {
      const qGroups = career.qualifierGroups ?? [];
      const qualStandings = calculateAllGroupStandings(qGroups, updatedFixtures, 0, 'QUALIFIERS');
      const directQualifiers = Array.from(qualStandings.qualifiedTeamIds);
      const builtFinals = buildWorldCupFinalsForQualifiedPlayer(
        career.competitionId,
        career.playerTeamId,
        directQualifiers
      );
      nextGroups = builtFinals.groups;
      updatedFixtures = [...updatedFixtures, ...builtFinals.fixtures];
      qualifiedForFinals = true;
      nextStage = 'GROUP_STAGE';
      nextMatchday = 1;
    } else {
      nextStage = 'ELIMINATED';
      qualifiedForFinals = false;
      playerFinalPlacement = 'Intercontinental Play-off';
    }
  } else if (career.currentStage === 'LEAGUE_SEASON') {
    if (career.currentMatchday < career.totalMatchdays) {
      nextMatchday = career.currentMatchday + 1;
    } else {
      nextStage = 'COMPLETED';
      const finalTable = calculateStandings(career.participatingTeamIds, updatedFixtures);
      championTeamId = finalTable[0]?.teamId;
      runnerUpTeamId = finalTable[1]?.teamId;
      const rank = finalTable.findIndex((r) => r.teamId === career.playerTeamId) + 1;
      playerFinalPlacement =
        rank === 1 ? 'Champion' : rank === 2 ? 'Runner-Up' : `Finished #${rank}`;
    }
  } else if (career.currentStage === 'GROUP_STAGE') {
    if (career.currentMatchday < 3) {
      nextMatchday = career.currentMatchday + 1;
    } else {
      const builtKnockout = generateInitialKnockoutFixtures({
        ...career,
        fixtures: updatedFixtures,
      });
      updatedFixtures = [...updatedFixtures, ...builtKnockout.newFixtures];

      if (builtKnockout.playerQualified) {
        nextStage = builtKnockout.nextStage;
        nextMatchday = 4;
      } else {
        nextStage = 'ELIMINATED';
        playerFinalPlacement = 'World Cup Group Stage';
        const completed = simulateRemainingTournament(
          career.id,
          career.competitionId,
          updatedFixtures,
          builtKnockout.nextStage
        );
        updatedFixtures = completed.fixtures;
        championTeamId = completed.championTeamId;
        runnerUpTeamId = completed.runnerUpTeamId;
      }
    }
  } else if (
    career.currentStage === 'R32' ||
    career.currentStage === 'R16' ||
    career.currentStage === 'QF' ||
    career.currentStage === 'SF' ||
    career.currentStage === 'FINAL'
  ) {
    const currentRoundFixtures = updatedFixtures
      .filter((f) => f.stage === career.currentStage)
      .sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));

    const playerWonRound = userResult.winnerTeamId === career.playerTeamId;
    const followingStage = getNextKnockoutStage(career.currentStage);

    if (career.currentStage === 'FINAL') {
      nextStage = 'COMPLETED';
      championTeamId = userResult.winnerTeamId;
      runnerUpTeamId =
        championTeamId === targetFixture.homeTeamId
          ? targetFixture.awayTeamId
          : targetFixture.homeTeamId;
      playerFinalPlacement = playerWonRound ? 'Champion' : 'Runner-Up';
    } else if (followingStage !== 'COMPLETED') {
      const nextRoundFixtures: Fixture[] = [];
      for (let i = 0; i < currentRoundFixtures.length; i += 2) {
        const w1 = currentRoundFixtures[i].result?.winnerTeamId;
        const w2 = currentRoundFixtures[i + 1]?.result?.winnerTeamId;
        if (w1 && w2) {
          nextRoundFixtures.push({
            id: `${career.competitionId}_${followingStage}_M${i / 2 + 1}`,
            competitionId: career.competitionId,
            stage: followingStage,
            matchday: career.currentMatchday + 1,
            bracketSlot: i / 2,
            homeTeamId: w1,
            awayTeamId: w2,
          });
        }
      }
      updatedFixtures = [...updatedFixtures, ...nextRoundFixtures];

      if (playerWonRound) {
        nextStage = followingStage;
        nextMatchday = career.currentMatchday + 1;
      } else {
        nextStage = 'ELIMINATED';
        playerFinalPlacement = formatStageName(career.currentStage);
        const completed = simulateRemainingTournament(
          career.id,
          career.competitionId,
          updatedFixtures,
          followingStage
        );
        updatedFixtures = completed.fixtures;
        championTeamId = completed.championTeamId;
        runnerUpTeamId = completed.runnerUpTeamId;
      }
    }
  }

  return {
    ...career,
    updatedAt: new Date().toISOString(),
    groups: nextGroups,
    qualifiedForFinals,
    fixtures: updatedFixtures,
    currentStage: nextStage,
    currentMatchday: nextMatchday,
    activeMatch: null,
    championTeamId,
    runnerUpTeamId,
    playerFinalPlacement,
    recentWordIds: nextRecentWords,
    careerStats: {
      matchesPlayed: career.careerStats.matchesPlayed + 1,
      wins: career.careerStats.wins + (isWin ? 1 : 0),
      draws: career.careerStats.draws + (isDraw ? 1 : 0),
      losses: career.careerStats.losses + (isLoss ? 1 : 0),
      goalsScored: career.careerStats.goalsScored + matchStatsDelta.playerGoals,
      goalsConceded: career.careerStats.goalsConceded + matchStatsDelta.opponentGoals,
      penaltiesTaken: career.careerStats.penaltiesTaken + matchStatsDelta.penaltiesTaken,
      penaltiesScored: career.careerStats.penaltiesScored + matchStatsDelta.penaltiesScored,
      penaltiesMissed: career.careerStats.penaltiesMissed + matchStatsDelta.penaltiesMissed,
      saves: career.careerStats.saves + matchStatsDelta.saves,
      vocabAnswered: career.careerStats.vocabAnswered + matchStatsDelta.vocabAnswered,
      vocabCorrect: career.careerStats.vocabCorrect + matchStatsDelta.vocabCorrect,
    },
  };
}

function simulateRemainingTournament(
  careerId: string,
  competitionId: string,
  fixtures: Fixture[],
  startingStage: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL'
): { fixtures: Fixture[]; championTeamId?: string; runnerUpTeamId?: string } {
  let all = fixtures.slice();
  let stage: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL' | null = startingStage;
  let matchday = 5;

  while (stage !== null) {
    const activeStage = stage;
    all = all.map((f) =>
      f.stage === activeStage && !f.result
        ? { ...f, result: simulateOpponentFixture(careerId, f, true) }
        : f
    );

    const roundFixtures = all
      .filter((f) => f.stage === activeStage)
      .sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));

    if (activeStage === 'FINAL') {
      const finalMatch = roundFixtures[0];
      const championTeamId = finalMatch?.result?.winnerTeamId;
      const runnerUpTeamId =
        championTeamId && finalMatch
          ? championTeamId === finalMatch.homeTeamId
            ? finalMatch.awayTeamId
            : finalMatch.homeTeamId
          : undefined;
      return { fixtures: all, championTeamId, runnerUpTeamId };
    }

    const nextStage = getNextKnockoutStage(activeStage);
    if (nextStage === 'COMPLETED') break;

    for (let i = 0; i < roundFixtures.length; i += 2) {
      const w1 = roundFixtures[i]?.result?.winnerTeamId;
      const w2 = roundFixtures[i + 1]?.result?.winnerTeamId;
      if (w1 && w2) {
        all.push({
          id: `${competitionId}_${nextStage}_M${i / 2 + 1}`,
          competitionId,
          stage: nextStage,
          matchday,
          bracketSlot: i / 2,
          homeTeamId: w1,
          awayTeamId: w2,
        });
      }
    }
    stage = nextStage;
    matchday++;
  }

  return { fixtures: all };
}

export function formatStageName(stage: TournamentStageStatus | Fixture['stage']): string {
  switch (stage) {
    case 'QUALIFIERS':
      return 'World Cup Qualifiers';
    case 'QUALIFIER_PLAYOFF':
      return 'Intercontinental Play-off';
    case 'GROUP':
    case 'GROUP_STAGE':
      return 'Group Stage';
    case 'LEAGUE':
    case 'LEAGUE_SEASON':
      return 'League Season';
    case 'R32':
      return 'Round of 32';
    case 'R16':
      return 'Round of 16';
    case 'QF':
      return 'Quarter-Finals';
    case 'SF':
      return 'Semi-Finals';
    case 'FINAL':
      return 'Championship Final';
    case 'COMPLETED':
      return 'Completed';
    case 'ELIMINATED':
      return 'Eliminated';
  }
}
