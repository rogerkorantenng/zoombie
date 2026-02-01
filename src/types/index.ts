// Game state and data types

export interface PlayerStats {
  totalKills: number;
  totalDeaths: number;
  accuracy: number;
  levelsCompleted: number;
  highScore: number;
  playtime: number;
  // Daily streak tracking
  lastPlayedDate?: string; // "YYYY-MM-DD"
  currentStreak?: number;
  longestStreak?: number;
  // Weapon-specific kills
  pistolKills?: number;
  shotgunKills?: number;
  rifleKills?: number;
  meleeKillsTotal?: number;
  grenadeKillsTotal?: number;
  bossKillsTotal?: number;
  // Combo tracking
  bestCombo?: number;
}

export interface GameProgress {
  currentLevel: number;
  unlockedLevels: number[];
  weapons: string[];
  achievements: string[];
}

export interface LeaderboardEntry {
  odometerId: string;
  username: string;
  score: number;
  level: number;
  kills: number;
  timestamp: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  requirement: ChallengeRequirement;
  reward: number;
}

export interface ChallengeRequirement {
  type: 'kills' | 'level' | 'nodamage' | 'melee' | 'weapon' | 'combo' | 'grenade' | 'time' | 'boss_kills' | 'nodamage_kills';
  target: number;
  weapon?: string;
  level?: number;
}

export interface ChallengeProgress {
  odometerId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
}

export interface SavedGameState {
  health: number;
  score: number;
  level: number;
  weapons: string[];
  ammo: Record<string, number>;
  lives: number;
}

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'combat' | 'weapon' | 'progression';
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Combat achievements
  { id: 'first_blood', name: 'First Blood', description: 'Kill your first zombie', points: 10, category: 'combat' },
  { id: 'zombie_slayer', name: 'Zombie Slayer', description: 'Kill 100 zombies total', points: 50, category: 'combat' },
  { id: 'zombie_hunter', name: 'Zombie Hunter', description: 'Kill 500 zombies total', points: 100, category: 'combat' },
  { id: 'zombie_legend', name: 'Zombie Legend', description: 'Kill 1000 zombies total', points: 200, category: 'combat' },
  { id: 'combo_master', name: 'Combo Master', description: 'Reach a 20 kill combo', points: 75, category: 'combat' },
  { id: 'mega_combo', name: 'Mega Combo', description: 'Reach a 50 kill combo', points: 150, category: 'combat' },

  // Weapon achievements
  { id: 'pistol_pro', name: 'Pistol Pro', description: 'Kill 50 zombies with pistol', points: 50, category: 'weapon' },
  { id: 'shotgun_surgeon', name: 'Shotgun Surgeon', description: 'Kill 50 zombies with shotgun', points: 50, category: 'weapon' },
  { id: 'rifle_expert', name: 'Rifle Expert', description: 'Kill 50 zombies with rifle', points: 50, category: 'weapon' },
  { id: 'melee_maniac', name: 'Melee Maniac', description: 'Kill 25 zombies with melee', points: 75, category: 'weapon' },

  // Progression achievements
  { id: 'first_victory', name: 'First Victory', description: 'Complete Level 1', points: 25, category: 'progression' },
  { id: 'halfway_there', name: 'Halfway There', description: 'Complete Level 3', points: 75, category: 'progression' },
  { id: 'survivor', name: 'Survivor', description: 'Complete all 5 levels', points: 200, category: 'progression' },
  { id: 'flawless', name: 'Flawless', description: 'Complete any level without taking damage', points: 100, category: 'progression' },
  { id: 'dedicated', name: 'Dedicated', description: 'Play 7 days in a row', points: 150, category: 'progression' },
];

// Streak rewards configuration
export interface StreakReward {
  days: number;
  bonusPoints: number;
  achievementId?: string;
  extraGrenades?: number;
  permanentScoreBoost?: number;
}

export const STREAK_REWARDS: StreakReward[] = [
  { days: 3, bonusPoints: 500 },
  { days: 7, bonusPoints: 1000, achievementId: 'dedicated' },
  { days: 14, bonusPoints: 2000, extraGrenades: 1 },
  { days: 30, bonusPoints: 5000, permanentScoreBoost: 0.1 },
];

// WebView message types
export type WebViewMessage =
  | { type: 'INIT' }
  | { type: 'SAVE_PROGRESS'; data: GameProgress }
  | { type: 'SAVE_STATS'; data: PlayerStats }
  | { type: 'SUBMIT_SCORE'; data: { score: number; level: number; kills: number } }
  | { type: 'GET_LEADERBOARD' }
  | { type: 'GET_DAILY_CHALLENGE' }
  | { type: 'UPDATE_CHALLENGE_PROGRESS'; data: { progress: number; challengeType?: string } }
  | { type: 'GET_PLAYER_DATA' }
  | { type: 'UNLOCK_ACHIEVEMENT'; data: { achievementId: string } }
  | { type: 'UPDATE_STREAK' }
  | { type: 'GET_STREAK_INFO' };

export type DevvitMessage =
  | { type: 'INIT_RESPONSE'; data: { username: string; progress: GameProgress; stats: PlayerStats; streakInfo?: StreakInfo } }
  | { type: 'LEADERBOARD_DATA'; data: LeaderboardEntry[] }
  | { type: 'DAILY_CHALLENGE_DATA'; data: { challenge: DailyChallenge; progress: ChallengeProgress | null } }
  | { type: 'ACHIEVEMENT_UNLOCKED'; data: { achievement: Achievement } }
  | { type: 'STREAK_INFO'; data: StreakInfo }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'ERROR'; message: string };

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  todayPlayed: boolean;
  nextReward?: StreakReward;
  activeRewards: StreakReward[];
}
