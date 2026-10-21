export type Language = 'ar' | 'en';
export type DevicePlatform = 'mobile' | 'desktop';

export interface Team {
  id: string;
  name_ar: string;
  name_en: string;
  group: 'A' | 'B';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  rating: number; // 1-5 stars or 80-92 rating
  attack: number;
  defense: number;
  speed: number;
  shortCode: string;
  flagUrl?: string;
  description_ar: string;
  description_en: string;
}

export interface Stadium {
  id: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  capacity: number;
  nickname_ar?: string;
  nickname_en?: string;
}

export interface ScheduleMatch {
  matchNumber: number;
  group?: 'A' | 'B';
  stage: 'group' | 'semi' | 'final';
  stageTitle_ar: string;
  stageTitle_en: string;
  homeTeamId: string; // or placeholder like 'WINNER_A'
  awayTeamId: string;
  date: string;
  time: string;
  stadiumId: string;
  homeScore?: number;
  awayScore?: number;
  isPlayed: boolean;
  penalties?: {
    home: number;
    away: number;
  };
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export type GameMode = 'tournament' | 'quick' | 'multiplayer' | 'penalties' | 'practice';

export type Screen = 
  | 'splash'
  | 'menu'
  | 'team_select'
  | 'tournament_dashboard'
  | 'schedule'
  | 'standings'
  | 'match_lobby'
  | 'match'
  | 'penalties'
  | 'match_result'
  | 'champion';

export interface MatchSettings {
  durationSeconds: number; // default 120 (2 mins)
  soundEnabled: boolean;
  crowdMurmur: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  musicEnabled: boolean;
  musicVolume: number; // 0 to 100
  currentTrackIndex?: number;
}

export interface TournamentState {
  playerTeamId: string;
  currentMatchNumber: number;
  completedMatches: Record<number, { homeScore: number; awayScore: number; penaltyHome?: number; penaltyAway?: number }>;
  standingsA: GroupStanding[];
  standingsB: GroupStanding[];
  semiFinal1?: { homeId: string; awayId: string; homeScore?: number; awayScore?: number };
  semiFinal2?: { homeId: string; awayId: string; homeScore?: number; awayScore?: number };
  finalMatch?: { homeId: string; awayId: string; homeScore?: number; awayScore?: number };
  championTeamId?: string;
  isCompleted: boolean;
}
