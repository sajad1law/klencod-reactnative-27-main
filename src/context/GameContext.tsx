import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  DevicePlatform,
  Screen,
  GameMode,
  MatchSettings,
  TournamentState,
  GroupStanding,
  ScheduleMatch
} from '../types';
import {
  TEAMS,
  STADIUMS,
  OFFICIAL_SCHEDULE,
  INITIAL_STANDINGS_A,
  INITIAL_STANDINGS_B
} from '../data/tournamentData';

interface GameContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  
  // Device Platform: Mobile (Vertical) or Desktop (Horizontal Widescreen)
  devicePlatform: DevicePlatform;
  setDevicePlatform: (platform: DevicePlatform) => void;
  hasChosenPlatform: boolean;
  setHasChosenPlatform: (chosen: boolean) => void;
  isDeviceModalOpen: boolean;
  setIsDeviceModalOpen: (open: boolean) => void;

  // Settings modal visibility
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Active match setup
  homeTeamId: string;
  awayTeamId: string;
  currentStadiumId: string;
  activeMatchNumber: number | null;
  lastMatchResult: {
    homeScore: number;
    awayScore: number;
    homePenalty?: number;
    awayPenalty?: number;
    winnerId: string | null;
  } | null;

  // Settings
  settings: MatchSettings;
  updateSettings: (newSettings: Partial<MatchSettings>) => void;

  // Tournament state
  tournament: TournamentState;
  startTournament: (teamId: string) => void;
  resetTournament: () => void;
  startNextTournamentMatch: () => void;
  recordMatchResult: (homeScore: number, awayScore: number, penaltyHome?: number, penaltyAway?: number) => void;

  // Quick / custom game launchers
  startQuickMatch: (home: string, away: string, stadium?: string) => void;
  startLocalMultiplayer: (home: string, away: string) => void;
  startPenaltyMode: (home: string, away: string) => void;
  startPracticeMode: (teamId: string) => void;
  prepareMatchLobby: (home: string, away: string, stadium?: string, matchNum?: number) => void;

  // Schedules and Standings
  schedule: ScheduleMatch[];
}

const STORAGE_KEY = 'khaleeji27_save_v1.3';
const SETTINGS_KEY = 'khaleeji27_settings_v1';
const LANG_KEY = 'khaleeji27_lang_v1';

// Helper to calculate exact standings directly from completed matches
export const computeGroupStandings = (completedMatches: Record<number, { homeScore: number; awayScore: number }>) => {
  let standingsA: GroupStanding[] = INITIAL_STANDINGS_A.map(s => ({
    teamId: s.teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: []
  }));

  let standingsB: GroupStanding[] = INITIAL_STANDINGS_B.map(s => ({
    teamId: s.teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: []
  }));

  for (let matchNum = 1; matchNum <= 12; matchNum++) {
    const res = completedMatches[matchNum];
    if (!res) continue;
    const fixture = OFFICIAL_SCHEDULE.find(m => m.matchNumber === matchNum);
    if (!fixture) continue;

    const isGroupA = fixture.group === 'A';
    const list = isGroupA ? standingsA : standingsB;

    const updated = list.map(entry => {
      if (entry.teamId !== fixture.homeTeamId && entry.teamId !== fixture.awayTeamId) return entry;
      const isHome = entry.teamId === fixture.homeTeamId;
      const gf = isHome ? res.homeScore : res.awayScore;
      const ga = isHome ? res.awayScore : res.homeScore;

      let won = entry.won;
      let drawn = entry.drawn;
      let lost = entry.lost;
      let points = entry.points;
      const form = [...entry.form];

      if (gf > ga) {
        won += 1;
        points += 3;
        form.push('W');
      } else if (gf === ga) {
        drawn += 1;
        points += 1;
        form.push('D');
      } else {
        lost += 1;
        form.push('L');
      }

      const totalGf = entry.goalsFor + gf;
      const totalGa = entry.goalsAgainst + ga;

      return {
        ...entry,
        played: entry.played + 1,
        won,
        drawn,
        lost,
        goalsFor: totalGf,
        goalsAgainst: totalGa,
        goalDifference: totalGf - totalGa,
        points,
        form: form.slice(-5)
      };
    });

    const sortFn = (a: GroupStanding, b: GroupStanding) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      const teamA = TEAMS[a.teamId];
      const teamB = TEAMS[b.teamId];
      return (teamB?.rating || 0) - (teamA?.rating || 0);
    };

    if (isGroupA) {
      standingsA = updated.sort(sortFn);
    } else {
      standingsB = updated.sort(sortFn);
    }
  }

  return { standingsA, standingsB };
};

const defaultTournamentState: TournamentState = {
  playerTeamId: 'ksa',
  currentMatchNumber: 1,
  completedMatches: {},
  standingsA: INITIAL_STANDINGS_A.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
  standingsB: INITIAL_STANDINGS_B.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
  isCompleted: false
};

const defaultSettings: MatchSettings = {
  durationSeconds: 120, // 2 mins arcade match
  soundEnabled: true,
  crowdMurmur: true,
  difficulty: 'medium',
  musicEnabled: true,
  musicVolume: 70,
  currentTrackIndex: 0
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });

  const PLATFORM_KEY = 'khaleeji27_device_platform_v2';
  const [devicePlatform, setDevicePlatformState] = useState<DevicePlatform>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PLATFORM_KEY);
      if (saved === 'mobile' || saved === 'desktop') return saved;
      return (window.innerWidth >= 900 && window.innerWidth > window.innerHeight)
        ? 'desktop'
        : 'mobile';
    }
    return 'mobile';
  });

  const [hasChosenPlatform, setHasChosenPlatform] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PLATFORM_KEY) !== null;
    }
    return false;
  });

  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);

  const setDevicePlatform = (platform: DevicePlatform) => {
    setDevicePlatformState(platform);
    setHasChosenPlatform(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PLATFORM_KEY, platform);
    }
  };

  const [screen, setScreen] = useState<Screen>('splash');
  const [gameMode, setGameMode] = useState<GameMode>('tournament');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [homeTeamId, setHomeTeamId] = useState<string>('ksa');
  const [awayTeamId, setAwayTeamId] = useState<string>('kwt');
  const [currentStadiumId, setCurrentStadiumId] = useState<string>('kasc');
  const [activeMatchNumber, setActiveMatchNumber] = useState<number | null>(null);
  
  const [lastMatchResult, setLastMatchResult] = useState<{
    homeScore: number;
    awayScore: number;
    homePenalty?: number;
    awayPenalty?: number;
    winnerId: string | null;
  } | null>(null);

  const [settings, setSettings] = useState<MatchSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return defaultSettings;
  });

  const [tournament, setTournament] = useState<TournamentState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return defaultTournamentState;
  });

  const [schedule, setSchedule] = useState<ScheduleMatch[]>(OFFICIAL_SCHEDULE);

  // Sync HTML direction with language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_KEY, lang);
    }
  };

  const updateSettings = (newSettings: Partial<MatchSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Save tournament to state and localStorage
  const saveTournament = (state: TournamentState) => {
    setTournament(state);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  // Auto-heal / migration effect: If player finished 3 group matches but semiFinal1 is missing,
  // or if standings need calculation, fix immediately so the player's 7-point Iraq campaign progresses to Semi-Finals!
  useEffect(() => {
    if (!tournament || tournament.isCompleted) return;

    const playerMatches = OFFICIAL_SCHEDULE.filter(
      m => m.matchNumber <= 12 && (m.homeTeamId === tournament.playerTeamId || m.awayTeamId === tournament.playerTeamId)
    );
    const playerFinished3 = playerMatches.every(m => tournament.completedMatches[m.matchNumber]);

    if (playerFinished3 && !tournament.semiFinal1) {
      const updatedCompleted = { ...tournament.completedMatches };
      // Ensure all 12 group matches are completed
      for (let m = 1; m <= 12; m++) {
        if (!updatedCompleted[m]) {
          const fix = OFFICIAL_SCHEDULE.find(f => f.matchNumber === m);
          if (fix) {
            const sim = simulateAiMatch(fix.homeTeamId, fix.awayTeamId);
            updatedCompleted[m] = { homeScore: sim.homeGoals, awayScore: sim.awayGoals };
          }
        }
      }

      const { standingsA, standingsB } = computeGroupStandings(updatedCompleted);
      const semi1 = {
        homeId: standingsA[0].teamId,
        awayId: standingsB[1].teamId
      };
      const semi2 = {
        homeId: standingsB[0].teamId,
        awayId: standingsA[1].teamId
      };

      saveTournament({
        ...tournament,
        completedMatches: updatedCompleted,
        standingsA,
        standingsB,
        semiFinal1: semi1,
        semiFinal2: semi2
      });
    }
  }, [tournament]);

  // Recalculate schedule matches based on completed results
  useEffect(() => {
    const updatedSchedule = OFFICIAL_SCHEDULE.map(m => {
      const completed = tournament.completedMatches[m.matchNumber];
      if (completed) {
        return {
          ...m,
          isPlayed: true,
          homeScore: completed.homeScore,
          awayScore: completed.awayScore,
          penalties: completed.penaltyHome !== undefined ? { home: completed.penaltyHome, away: completed.penaltyAway || 0 } : undefined
        };
      }

      // Check if semi or final teams can be populated
      if (m.matchNumber === 13 && tournament.semiFinal1) {
        return {
          ...m,
          homeTeamId: tournament.semiFinal1.homeId,
          awayTeamId: tournament.semiFinal1.awayId
        };
      }
      if (m.matchNumber === 14 && tournament.semiFinal2) {
        return {
          ...m,
          homeTeamId: tournament.semiFinal2.homeId,
          awayTeamId: tournament.semiFinal2.awayId
        };
      }
      if (m.matchNumber === 15 && tournament.finalMatch) {
        return {
          ...m,
          homeTeamId: tournament.finalMatch.homeId,
          awayTeamId: tournament.finalMatch.awayId
        };
      }

      return m;
    });

    setSchedule(updatedSchedule);
  }, [tournament]);

  // Start new tournament campaign with chosen nation
  const startTournament = (teamId: string) => {
    const freshTournament: TournamentState = {
      playerTeamId: teamId,
      currentMatchNumber: 1,
      completedMatches: {},
      standingsA: INITIAL_STANDINGS_A.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
      standingsB: INITIAL_STANDINGS_B.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
      isCompleted: false
    };
    saveTournament(freshTournament);
    setGameMode('tournament');
    setScreen('tournament_dashboard');
  };

  const resetTournament = () => {
    const freshTournament: TournamentState = {
      playerTeamId: 'ksa',
      currentMatchNumber: 1,
      completedMatches: {},
      standingsA: INITIAL_STANDINGS_A.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
      standingsB: INITIAL_STANDINGS_B.map(s => ({ ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] })),
      isCompleted: false
    };
    saveTournament(freshTournament);
    setActiveMatchNumber(null);
    setLastMatchResult(null);
  };

  // Simulate a match between two AI teams deterministically based on team ratings
  const simulateAiMatch = (homeId: string, awayId: string): { homeGoals: number; awayGoals: number } => {
    const homeTeam = TEAMS[homeId] || { attack: 82, defense: 82 };
    const awayTeam = TEAMS[awayId] || { attack: 82, defense: 82 };

    const homeAdvantage = 0.3;
    const diff = (homeTeam.attack - awayTeam.defense) / 10 + homeAdvantage;

    let homeGoals = Math.max(0, Math.floor(Math.random() * 2.5 + Math.max(0, diff)));
    let awayGoals = Math.max(0, Math.floor(Math.random() * 2.3 - Math.min(0, diff)));

    // Keep score realistic for Gulf Cup
    homeGoals = Math.min(homeGoals, 4);
    awayGoals = Math.min(awayGoals, 4);

    return { homeGoals, awayGoals };
  };

  // Record active match result
  const recordMatchResult = (
    homeScore: number,
    awayScore: number,
    penaltyHome?: number,
    penaltyAway?: number
  ) => {
    let winnerId: string | null = null;
    if (homeScore > awayScore) {
      winnerId = homeTeamId;
    } else if (awayScore > homeScore) {
      winnerId = awayTeamId;
    } else if (penaltyHome !== undefined && penaltyAway !== undefined) {
      winnerId = penaltyHome > penaltyAway ? homeTeamId : awayTeamId;
    }

    setLastMatchResult({
      homeScore,
      awayScore,
      homePenalty: penaltyHome,
      awayPenalty: penaltyAway,
      winnerId
    });

    if (gameMode !== 'tournament' || !activeMatchNumber) {
      setScreen('match_result');
      return;
    }

    // In Tournament mode, update tournament state
    const currentCompleted = {
      ...tournament.completedMatches
    };

    let newStandingsA = [...tournament.standingsA];
    let newStandingsB = [...tournament.standingsB];

    // If it was a group match, update group table
    if (activeMatchNumber <= 12) {
      const matchFixture = OFFICIAL_SCHEDULE.find(m => m.matchNumber === activeMatchNumber);
      if (matchFixture) {
        const isPlayerFixtureHome = matchFixture.homeTeamId === tournament.playerTeamId;
        const fixtureHomeScore = isPlayerFixtureHome ? homeScore : awayScore;
        const fixtureAwayScore = isPlayerFixtureHome ? awayScore : homeScore;

        currentCompleted[activeMatchNumber] = {
          homeScore: fixtureHomeScore,
          awayScore: fixtureAwayScore,
          penaltyHome,
          penaltyAway
        };
      }

      // Check how many group matches involving player have been completed
      const playerGroupMatches = OFFICIAL_SCHEDULE.filter(
        m => m.matchNumber <= 12 && (m.homeTeamId === tournament.playerTeamId || m.awayTeamId === tournament.playerTeamId)
      );
      const playerCompletedCount = playerGroupMatches.filter(m => currentCompleted[m.matchNumber]).length;

      // Simulate matches for the appropriate round:
      // Match 1 completed: simulate round 1 (matches 1..4)
      // Match 2 completed: simulate round 2 (matches 1..8)
      // Match 3 completed: SIMULATE ALL GROUP MATCHES (matches 1..12)!
      const maxMatchToSim = playerCompletedCount >= 3 ? 12 : playerCompletedCount === 2 ? 8 : 4;
      for (let m = 1; m <= maxMatchToSim; m++) {
        if (!currentCompleted[m]) {
          const fix = OFFICIAL_SCHEDULE.find(f => f.matchNumber === m);
          if (fix) {
            const sim = simulateAiMatch(fix.homeTeamId, fix.awayTeamId);
            currentCompleted[m] = { homeScore: sim.homeGoals, awayScore: sim.awayGoals };
          }
        }
      }

      // Re-calculate the official standings
      const { standingsA, standingsB } = computeGroupStandings(currentCompleted);
      newStandingsA = standingsA;
      newStandingsB = standingsB;
    }

    // Check if group stage is complete (all 12 matches completed)
    let semiFinal1 = tournament.semiFinal1;
    let semiFinal2 = tournament.semiFinal2;
    let finalMatch = tournament.finalMatch;
    let championTeamId = tournament.championTeamId;
    let isCompleted = tournament.isCompleted;

    const allGroupDone = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every(num => currentCompleted[num]);
    if (allGroupDone && (!semiFinal1 || !semiFinal2)) {
      // Winner A vs Runner-up B, Winner B vs Runner-up A
      semiFinal1 = {
        homeId: newStandingsA[0].teamId,
        awayId: newStandingsB[1].teamId
      };
      semiFinal2 = {
        homeId: newStandingsB[0].teamId,
        awayId: newStandingsA[1].teamId
      };
    }

    // Handle Semi-Final 1 (Match 13)
    if (activeMatchNumber === 13 && semiFinal1) {
      const isPlayerHome = semiFinal1.homeId === tournament.playerTeamId;
      const sHomeScore = isPlayerHome ? homeScore : awayScore;
      const sAwayScore = isPlayerHome ? awayScore : homeScore;
      semiFinal1.homeScore = sHomeScore;
      semiFinal1.awayScore = sAwayScore;
      currentCompleted[13] = { homeScore: sHomeScore, awayScore: sAwayScore, penaltyHome, penaltyAway };

      // Simulate the other semi-final (Match 14) if not played yet
      if (!currentCompleted[14] && semiFinal2) {
        const sim = simulateAiMatch(semiFinal2.homeId, semiFinal2.awayId);
        let hG = sim.homeGoals;
        let aG = sim.awayGoals;
        if (hG === aG) {
          if (Math.random() > 0.5) hG += 1; else aG += 1;
        }
        semiFinal2.homeScore = hG;
        semiFinal2.awayScore = aG;
        currentCompleted[14] = { homeScore: hG, awayScore: aG };
      }
    }

    // Handle Semi-Final 2 (Match 14)
    if (activeMatchNumber === 14 && semiFinal2) {
      const isPlayerHome = semiFinal2.homeId === tournament.playerTeamId;
      const sHomeScore = isPlayerHome ? homeScore : awayScore;
      const sAwayScore = isPlayerHome ? awayScore : homeScore;
      semiFinal2.homeScore = sHomeScore;
      semiFinal2.awayScore = sAwayScore;
      currentCompleted[14] = { homeScore: sHomeScore, awayScore: sAwayScore, penaltyHome, penaltyAway };

      // Simulate the other semi-final (Match 13) if not played yet
      if (!currentCompleted[13] && semiFinal1) {
        const sim = simulateAiMatch(semiFinal1.homeId, semiFinal1.awayId);
        let hG = sim.homeGoals;
        let aG = sim.awayGoals;
        if (hG === aG) {
          if (Math.random() > 0.5) hG += 1; else aG += 1;
        }
        semiFinal1.homeScore = hG;
        semiFinal1.awayScore = aG;
        currentCompleted[13] = { homeScore: hG, awayScore: aG };
      }
    }

    // If both semi-finals are complete, setup the Grand Final!
    if (currentCompleted[13] && currentCompleted[14] && !finalMatch && semiFinal1 && semiFinal2) {
      const semi1 = currentCompleted[13];
      const semi2 = currentCompleted[14];
      const winSemi1 = (semi1.homeScore ?? 0) > (semi1.awayScore ?? 0) ? semiFinal1.homeId : semiFinal1.awayId;
      const winSemi2 = (semi2.homeScore ?? 0) > (semi2.awayScore ?? 0) ? semiFinal2.homeId : semiFinal2.awayId;

      finalMatch = {
        homeId: winSemi1,
        awayId: winSemi2
      };
    }

    // Handle Final match (Match 15)
    if (activeMatchNumber === 15 && finalMatch) {
      const isPlayerHome = finalMatch.homeId === tournament.playerTeamId;
      const fHomeScore = isPlayerHome ? homeScore : awayScore;
      const fAwayScore = isPlayerHome ? awayScore : homeScore;
      finalMatch.homeScore = fHomeScore;
      finalMatch.awayScore = fAwayScore;
      currentCompleted[15] = { homeScore: fHomeScore, awayScore: fAwayScore, penaltyHome, penaltyAway };

      const grandWinner = homeScore > awayScore ? tournament.playerTeamId : (isPlayerHome ? finalMatch.awayId : finalMatch.homeId);
      championTeamId = grandWinner;
      isCompleted = true;
    }

    const updatedTourney: TournamentState = {
      ...tournament,
      completedMatches: currentCompleted,
      standingsA: newStandingsA,
      standingsB: newStandingsB,
      semiFinal1,
      semiFinal2,
      finalMatch,
      championTeamId,
      isCompleted
    };

    saveTournament(updatedTourney);

    if (activeMatchNumber === 15 && isCompleted && championTeamId === tournament.playerTeamId) {
      setScreen('champion');
    } else {
      setScreen('match_result');
    }
  };

  // Launch next tournament match for player
  const startNextTournamentMatch = () => {
    const playerTeam = tournament.playerTeamId;

    // Check group matches first
    for (let i = 1; i <= 12; i++) {
      if (!tournament.completedMatches[i]) {
        const fixture = OFFICIAL_SCHEDULE.find(m => m.matchNumber === i);
        if (fixture && (fixture.homeTeamId === playerTeam || fixture.awayTeamId === playerTeam)) {
          const opponentId = fixture.homeTeamId === playerTeam ? fixture.awayTeamId : fixture.homeTeamId;
          // Human player is ALWAYS set as homeTeamId so they control their chosen nation!
          prepareMatchLobby(playerTeam, opponentId, fixture.stadiumId, fixture.matchNumber);
          return;
        }
      }
    }

    // Check semi-final 1
    if (tournament.semiFinal1 && !tournament.completedMatches[13]) {
      if (tournament.semiFinal1.homeId === playerTeam || tournament.semiFinal1.awayId === playerTeam) {
        const opponentId = tournament.semiFinal1.homeId === playerTeam ? tournament.semiFinal1.awayId : tournament.semiFinal1.homeId;
        prepareMatchLobby(playerTeam, opponentId, 'paf', 13);
        return;
      }
    }

    // Check semi-final 2
    if (tournament.semiFinal2 && !tournament.completedMatches[14]) {
      if (tournament.semiFinal2.homeId === playerTeam || tournament.semiFinal2.awayId === playerTeam) {
        const opponentId = tournament.semiFinal2.homeId === playerTeam ? tournament.semiFinal2.awayId : tournament.semiFinal2.homeId;
        prepareMatchLobby(playerTeam, opponentId, 'kasc', 14);
        return;
      }
    }

    // Check final
    if (tournament.finalMatch && !tournament.completedMatches[15]) {
      if (tournament.finalMatch.homeId === playerTeam || tournament.finalMatch.awayId === playerTeam) {
        const opponentId = tournament.finalMatch.homeId === playerTeam ? tournament.finalMatch.awayId : tournament.finalMatch.homeId;
        prepareMatchLobby(playerTeam, opponentId, 'kasc', 15);
        return;
      }
    }

    // Default fallback to dashboard
    setScreen('tournament_dashboard');
  };

  const prepareMatchLobby = (home: string, away: string, stadium = 'kasc', matchNum?: number) => {
    setHomeTeamId(home);
    setAwayTeamId(away);
    setCurrentStadiumId(stadium);
    setActiveMatchNumber(matchNum || null);
    setScreen('match_lobby');
  };

  const startQuickMatch = (home: string, away: string, stadium = 'kasc') => {
    setGameMode('quick');
    prepareMatchLobby(home, away, stadium);
  };

  const startLocalMultiplayer = (home: string, away: string) => {
    setGameMode('multiplayer');
    prepareMatchLobby(home, away, 'kasc');
  };

  const startPenaltyMode = (home: string, away: string) => {
    setGameMode('penalties');
    setHomeTeamId(home);
    setAwayTeamId(away);
    setCurrentStadiumId('kasc');
    setActiveMatchNumber(null);
    setScreen('penalties');
  };

  const startPracticeMode = (teamId: string) => {
    setGameMode('practice');
    setHomeTeamId(teamId);
    setAwayTeamId('ksa' === teamId ? 'irq' : 'ksa');
    setCurrentStadiumId('kasc');
    setActiveMatchNumber(null);
    setScreen('match');
  };

  return (
    <GameContext.Provider
      value={{
        language,
        setLanguage,
        screen,
        setScreen,
        gameMode,
        setGameMode,
        devicePlatform,
        setDevicePlatform,
        hasChosenPlatform,
        setHasChosenPlatform,
        isDeviceModalOpen,
        setIsDeviceModalOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        homeTeamId,
        awayTeamId,
        currentStadiumId,
        activeMatchNumber,
        lastMatchResult,
        settings,
        updateSettings,
        tournament,
        startTournament,
        resetTournament,
        startNextTournamentMatch,
        recordMatchResult,
        startQuickMatch,
        startLocalMultiplayer,
        startPenaltyMode,
        startPracticeMode,
        prepareMatchLobby,
        schedule
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
