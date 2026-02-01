import { Context } from '@devvit/public-api';
import type { DailyChallenge, ChallengeProgress, ChallengeRequirement } from '../types/index.js';

const CHALLENGE_KEY = 'zombie_daily';
const WINNERS_KEY = 'zombie_daily_winners';

// Predefined challenges that rotate - expanded to 15+ types
const CHALLENGES: Omit<DailyChallenge, 'id' | 'date'>[] = [
  // Original challenges
  {
    title: 'Pistol Expert',
    description: 'Kill 50 zombies using only the pistol',
    requirement: { type: 'weapon', target: 50, weapon: 'pistol' },
    reward: 500,
  },
  {
    title: 'Flawless Victory',
    description: 'Complete Level 1 without taking any damage',
    requirement: { type: 'nodamage', target: 1, level: 1 },
    reward: 1000,
  },
  {
    title: 'Melee Master',
    description: 'Kill 25 zombies using melee attacks',
    requirement: { type: 'melee', target: 25 },
    reward: 750,
  },
  {
    title: 'Zombie Slayer',
    description: 'Kill 100 zombies in a single session',
    requirement: { type: 'kills', target: 100 },
    reward: 600,
  },
  {
    title: 'Shotgun Specialist',
    description: 'Kill 30 zombies with the shotgun',
    requirement: { type: 'weapon', target: 30, weapon: 'shotgun' },
    reward: 550,
  },
  {
    title: 'Speed Runner',
    description: 'Complete Level 2 (any completion counts)',
    requirement: { type: 'level', target: 2 },
    reward: 800,
  },
  {
    title: 'Survivalist',
    description: 'Complete Level 3 without dying',
    requirement: { type: 'nodamage', target: 1, level: 3 },
    reward: 1200,
  },

  // New challenges
  {
    title: 'Combo King',
    description: 'Reach a 15 kill combo in a single game',
    requirement: { type: 'combo', target: 15 },
    reward: 600,
  },
  {
    title: 'Grenadier',
    description: 'Kill 20 zombies with grenades',
    requirement: { type: 'grenade', target: 20 },
    reward: 700,
  },
  {
    title: 'Speed Demon',
    description: 'Complete Level 1 in under 3 minutes',
    requirement: { type: 'time', target: 180, level: 1 },
    reward: 800,
  },
  {
    title: 'Untouchable',
    description: 'Kill 50 zombies without taking any damage',
    requirement: { type: 'nodamage_kills', target: 50 },
    reward: 900,
  },
  {
    title: 'Boss Hunter',
    description: 'Defeat 2 bosses in a single session',
    requirement: { type: 'boss_kills', target: 2 },
    reward: 1000,
  },
  {
    title: 'Headshot Hero',
    description: 'Kill 30 zombies with the rifle',
    requirement: { type: 'weapon', target: 30, weapon: 'rifle' },
    reward: 550,
  },
  {
    title: 'Fire Starter',
    description: 'Kill 40 zombies with the flamethrower',
    requirement: { type: 'weapon', target: 40, weapon: 'flamethrower' },
    reward: 600,
  },
  {
    title: 'Marathon',
    description: 'Kill 200 zombies in one session',
    requirement: { type: 'kills', target: 200 },
    reward: 800,
  },
];

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDailyChallengeIndex(date: string): number {
  // Use date to deterministically select a challenge
  const dateNum = parseInt(date.replace(/-/g, ''), 10);
  return dateNum % CHALLENGES.length;
}

export function getTodaysChallenge(): DailyChallenge {
  const date = getDateString();
  const index = getDailyChallengeIndex(date);
  const challenge = CHALLENGES[index];

  return {
    id: `challenge_${date}`,
    date,
    ...challenge,
  };
}

export async function getChallengeProgress(
  context: Context,
  odometerId: string
): Promise<ChallengeProgress | null> {
  const challenge = getTodaysChallenge();
  const key = `${CHALLENGE_KEY}:${challenge.date}:progress:${odometerId}`;
  const data = await context.redis.get(key);

  if (data) {
    return JSON.parse(data) as ChallengeProgress;
  }
  return null;
}

export async function updateChallengeProgress(
  context: Context,
  odometerId: string,
  progress: number
): Promise<ChallengeProgress> {
  const challenge = getTodaysChallenge();
  const key = `${CHALLENGE_KEY}:${challenge.date}:progress:${odometerId}`;

  let currentProgress = await getChallengeProgress(context, odometerId);

  if (!currentProgress) {
    currentProgress = {
      odometerId,
      challengeId: challenge.id,
      progress: 0,
      completed: false,
    };
  }

  // Update progress
  currentProgress.progress = Math.max(currentProgress.progress, progress);

  // Check if completed
  if (!currentProgress.completed && currentProgress.progress >= challenge.requirement.target) {
    currentProgress.completed = true;
    currentProgress.completedAt = Date.now();

    // Add to winners list
    await context.redis.zAdd(`${WINNERS_KEY}:${challenge.date}`, {
      member: odometerId,
      score: currentProgress.completedAt,
    });
  }

  await context.redis.set(key, JSON.stringify(currentProgress));
  return currentProgress;
}

export async function getDailyWinners(
  context: Context,
  date?: string
): Promise<string[]> {
  const targetDate = date || getDateString();
  const entries = await context.redis.zRange(`${WINNERS_KEY}:${targetDate}`, 0, -1, {
    by: 'rank',
  });
  return entries.map(e => e.member);
}

export async function hasCompletedToday(
  context: Context,
  odometerId: string
): Promise<boolean> {
  const progress = await getChallengeProgress(context, odometerId);
  return progress?.completed ?? false;
}
