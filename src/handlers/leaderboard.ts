import { Context } from '@devvit/public-api';
import type { LeaderboardEntry, DailyLeaderboardEntry } from '../types/index.js';

const LEADERBOARD_KEY = 'zombie_leaderboard';
const DAILY_LEADERBOARD_KEY = 'zombie_daily_leaderboard';
const MAX_ENTRIES = 100;

export async function getLeaderboard(
  context: Context,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const entries = await context.redis.zRange(LEADERBOARD_KEY, 0, limit - 1, {
    reverse: true,
    by: 'rank',
  });

  const leaderboard: LeaderboardEntry[] = [];
  for (const entry of entries) {
    const data = await context.redis.hGetAll(`${LEADERBOARD_KEY}:${entry.member}`);
    if (data && data.username) {
      leaderboard.push({
        odometerId: entry.member,
        username: data.username,
        score: entry.score,
        level: parseInt(data.level || '1'),
        kills: parseInt(data.kills || '0'),
        timestamp: parseInt(data.timestamp || '0'),
      });
    }
  }

  return leaderboard;
}

export async function submitScore(
  context: Context,
  odometerId: string,
  username: string,
  score: number,
  level: number,
  kills: number
): Promise<number> {
  // Get current score
  const currentScore = await context.redis.zScore(LEADERBOARD_KEY, odometerId);

  // Only update if new score is higher
  if (currentScore === undefined || score > currentScore) {
    await context.redis.zAdd(LEADERBOARD_KEY, { member: odometerId, score });

    // Store additional data
    await context.redis.hSet(`${LEADERBOARD_KEY}:${odometerId}`, {
      username,
      level: level.toString(),
      kills: kills.toString(),
      timestamp: Date.now().toString(),
    });

    // Trim leaderboard to max entries
    const count = await context.redis.zCard(LEADERBOARD_KEY);
    if (count > MAX_ENTRIES) {
      await context.redis.zRemRangeByRank(LEADERBOARD_KEY, 0, count - MAX_ENTRIES - 1);
    }
  }

  // Return player's rank (1-indexed)
  const rank = await context.redis.zRank(LEADERBOARD_KEY, odometerId);
  const total = await context.redis.zCard(LEADERBOARD_KEY);
  return rank !== undefined ? total - rank : total;
}

export async function getPlayerRank(
  context: Context,
  odometerId: string
): Promise<number | null> {
  const rank = await context.redis.zRank(LEADERBOARD_KEY, odometerId);
  if (rank === undefined) return null;
  const total = await context.redis.zCard(LEADERBOARD_KEY);
  return total - rank;
}

export async function getPlayerScore(
  context: Context,
  odometerId: string
): Promise<number | null> {
  const score = await context.redis.zScore(LEADERBOARD_KEY, odometerId);
  return score ?? null;
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function submitDailyScore(
  context: Context,
  odometerId: string,
  username: string,
  score: number,
  kills: number,
  challengeCompleted: boolean
): Promise<void> {
  const date = getDateString();
  const key = `${DAILY_LEADERBOARD_KEY}:${date}`;

  // Get current daily score
  const currentScore = await context.redis.zScore(key, odometerId);

  // Only update if new score is higher
  if (currentScore === undefined || score > currentScore) {
    await context.redis.zAdd(key, { member: odometerId, score });

    await context.redis.hSet(`${key}:${odometerId}`, {
      username,
      kills: kills.toString(),
      challengeCompleted: challengeCompleted.toString(),
      timestamp: Date.now().toString(),
    });
  }
}

export async function getDailyLeaderboard(
  context: Context,
  limit: number = 10
): Promise<DailyLeaderboardEntry[]> {
  const date = getDateString();
  const key = `${DAILY_LEADERBOARD_KEY}:${date}`;

  const entries = await context.redis.zRange(key, 0, limit - 1, {
    reverse: true,
    by: 'rank',
  });

  const leaderboard: DailyLeaderboardEntry[] = [];
  for (const entry of entries) {
    const data = await context.redis.hGetAll(`${key}:${entry.member}`);
    if (data && data.username) {
      leaderboard.push({
        username: data.username,
        score: entry.score,
        kills: parseInt(data.kills || '0'),
        challengeCompleted: data.challengeCompleted === 'true',
        timestamp: parseInt(data.timestamp || '0'),
      });
    }
  }

  return leaderboard;
}
