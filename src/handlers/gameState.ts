import { Context } from '@devvit/public-api';
import type { GameProgress, PlayerStats, StreakInfo, StreakReward, Achievement } from '../types/index.js';
import { ACHIEVEMENTS, STREAK_REWARDS } from '../types/index.js';

const PROGRESS_KEY = 'zombie_progress';
const STATS_KEY = 'zombie_stats';

export const defaultProgress: GameProgress = {
  currentLevel: 1,
  unlockedLevels: [1],
  weapons: ['pistol'],
  achievements: [],
};

export const defaultStats: PlayerStats = {
  totalKills: 0,
  totalDeaths: 0,
  accuracy: 0,
  levelsCompleted: 0,
  highScore: 0,
  playtime: 0,
  lastPlayedDate: undefined,
  currentStreak: 0,
  longestStreak: 0,
  pistolKills: 0,
  shotgunKills: 0,
  rifleKills: 0,
  meleeKillsTotal: 0,
  grenadeKillsTotal: 0,
  bossKillsTotal: 0,
  bestCombo: 0,
};

export async function getPlayerProgress(
  context: Context,
  odometerId: string
): Promise<GameProgress> {
  const key = `${PROGRESS_KEY}:${odometerId}`;
  const data = await context.redis.get(key);
  if (data) {
    return JSON.parse(data) as GameProgress;
  }
  return { ...defaultProgress };
}

export async function savePlayerProgress(
  context: Context,
  odometerId: string,
  progress: GameProgress
): Promise<void> {
  const key = `${PROGRESS_KEY}:${odometerId}`;
  await context.redis.set(key, JSON.stringify(progress));
}

export async function getPlayerStats(
  context: Context,
  odometerId: string
): Promise<PlayerStats> {
  const key = `${STATS_KEY}:${odometerId}`;
  const data = await context.redis.get(key);
  if (data) {
    return JSON.parse(data) as PlayerStats;
  }
  return { ...defaultStats };
}

export async function savePlayerStats(
  context: Context,
  odometerId: string,
  stats: PlayerStats
): Promise<void> {
  const key = `${STATS_KEY}:${odometerId}`;
  await context.redis.set(key, JSON.stringify(stats));
}

export async function updateHighScore(
  context: Context,
  odometerId: string,
  score: number
): Promise<boolean> {
  const stats = await getPlayerStats(context, odometerId);
  if (score > stats.highScore) {
    stats.highScore = score;
    await savePlayerStats(context, odometerId, stats);
    return true;
  }
  return false;
}

// Helper to get today's date string
function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Update daily streak when player plays
export async function updateDailyStreak(
  context: Context,
  odometerId: string
): Promise<StreakInfo> {
  const stats = await getPlayerStats(context, odometerId);
  const today = getDateString();

  // Initialize streak values if undefined
  if (stats.currentStreak === undefined) stats.currentStreak = 0;
  if (stats.longestStreak === undefined) stats.longestStreak = 0;

  const lastPlayed = stats.lastPlayedDate;
  let todayPlayed = lastPlayed === today;

  if (!todayPlayed) {
    // Check if this is a consecutive day
    if (lastPlayed) {
      const lastDate = new Date(lastPlayed);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        stats.currentStreak = (stats.currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        // Streak broken - reset
        stats.currentStreak = 1;
      }
    } else {
      // First time playing
      stats.currentStreak = 1;
    }

    // Update longest streak
    if ((stats.currentStreak || 0) > (stats.longestStreak || 0)) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastPlayedDate = today;
    todayPlayed = true;
    await savePlayerStats(context, odometerId, stats);
  }

  // Calculate active rewards and next reward
  const activeRewards = STREAK_REWARDS.filter(r => (stats.currentStreak || 0) >= r.days);
  const nextReward = STREAK_REWARDS.find(r => (stats.currentStreak || 0) < r.days);

  return {
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0,
    lastPlayedDate: stats.lastPlayedDate || today,
    todayPlayed,
    nextReward,
    activeRewards,
  };
}

// Get streak info without updating
export async function getStreakInfo(
  context: Context,
  odometerId: string
): Promise<StreakInfo> {
  const stats = await getPlayerStats(context, odometerId);
  const today = getDateString();

  const currentStreak = stats.currentStreak || 0;
  const longestStreak = stats.longestStreak || 0;
  const lastPlayedDate = stats.lastPlayedDate || '';
  const todayPlayed = lastPlayedDate === today;

  const activeRewards = STREAK_REWARDS.filter(r => currentStreak >= r.days);
  const nextReward = STREAK_REWARDS.find(r => currentStreak < r.days);

  return {
    currentStreak,
    longestStreak,
    lastPlayedDate,
    todayPlayed,
    nextReward,
    activeRewards,
  };
}

// Unlock an achievement
export async function unlockAchievement(
  context: Context,
  odometerId: string,
  achievementId: string
): Promise<Achievement | null> {
  const progress = await getPlayerProgress(context, odometerId);

  // Check if already unlocked
  if (progress.achievements.includes(achievementId)) {
    return null;
  }

  // Find achievement definition
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) {
    return null;
  }

  // Unlock it
  progress.achievements.push(achievementId);
  await savePlayerProgress(context, odometerId, progress);

  return achievement;
}

// Check achievements based on current stats
export async function checkAchievements(
  context: Context,
  odometerId: string,
  stats: PlayerStats
): Promise<Achievement[]> {
  const progress = await getPlayerProgress(context, odometerId);
  const unlockedAchievements: Achievement[] = [];

  // Helper to check and unlock
  const checkAndUnlock = async (id: string, condition: boolean) => {
    if (condition && !progress.achievements.includes(id)) {
      const achievement = await unlockAchievement(context, odometerId, id);
      if (achievement) unlockedAchievements.push(achievement);
    }
  };

  // Combat achievements
  await checkAndUnlock('first_blood', stats.totalKills >= 1);
  await checkAndUnlock('zombie_slayer', stats.totalKills >= 100);
  await checkAndUnlock('zombie_hunter', stats.totalKills >= 500);
  await checkAndUnlock('zombie_legend', stats.totalKills >= 1000);
  await checkAndUnlock('combo_master', (stats.bestCombo || 0) >= 20);
  await checkAndUnlock('mega_combo', (stats.bestCombo || 0) >= 50);

  // Weapon achievements
  await checkAndUnlock('pistol_pro', (stats.pistolKills || 0) >= 50);
  await checkAndUnlock('shotgun_surgeon', (stats.shotgunKills || 0) >= 50);
  await checkAndUnlock('rifle_expert', (stats.rifleKills || 0) >= 50);
  await checkAndUnlock('melee_maniac', (stats.meleeKillsTotal || 0) >= 25);

  // Progression achievements
  await checkAndUnlock('first_victory', stats.levelsCompleted >= 1);
  await checkAndUnlock('halfway_there', stats.levelsCompleted >= 3);
  await checkAndUnlock('survivor', stats.levelsCompleted >= 5);

  // Streak achievement
  await checkAndUnlock('dedicated', (stats.currentStreak || 0) >= 7);

  return unlockedAchievements;
}
