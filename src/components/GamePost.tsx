import { Context, Devvit, useState } from '@devvit/public-api';
import {
  getPlayerProgress,
  savePlayerProgress,
  getPlayerStats,
  savePlayerStats,
  updateDailyStreak,
  getStreakInfo,
  unlockAchievement,
  checkAchievements,
} from '../handlers/gameState.js';
import { getLeaderboard, submitScore, submitDailyScore, getDailyLeaderboard } from '../handlers/leaderboard.js';
import {
  getTodaysChallenge,
  getChallengeProgress,
  updateChallengeProgress,
} from '../handlers/dailyChallenge.js';
import type { WebViewMessage } from '../types/index.js';

interface GamePostProps {
  context: Context;
}

export function GamePost({ context }: GamePostProps) {
  const [webviewVisible, setWebviewVisible] = useState(false);

  const handleMessage = async (msg: WebViewMessage) => {
    const odometerId = context.userId ?? 'anonymous';

    switch (msg.type) {
      case 'INIT': {
        const user = await context.reddit.getCurrentUser();
        const username = user?.username ?? 'Anonymous';
        const progress = await getPlayerProgress(context, odometerId);
        const stats = await getPlayerStats(context, odometerId);
        const streakInfo = await updateDailyStreak(context, odometerId);

        context.ui.webView.postMessage('game-webview', {
          type: 'INIT_RESPONSE',
          data: {
            username,
            progress: JSON.parse(JSON.stringify(progress)),
            stats: JSON.parse(JSON.stringify(stats)),
            streakInfo: JSON.parse(JSON.stringify(streakInfo)),
          },
        });
        break;
      }

      case 'SAVE_PROGRESS': {
        await savePlayerProgress(context, odometerId, msg.data);
        context.ui.webView.postMessage('game-webview', { type: 'SAVE_SUCCESS' });
        break;
      }

      case 'SAVE_STATS': {
        await savePlayerStats(context, odometerId, msg.data);
        context.ui.webView.postMessage('game-webview', { type: 'SAVE_SUCCESS' });
        break;
      }

      case 'SUBMIT_SCORE': {
        const user = await context.reddit.getCurrentUser();
        const username = user?.username ?? 'Anonymous';
        await submitScore(
          context,
          odometerId,
          username,
          msg.data.score,
          msg.data.level,
          msg.data.kills
        );
        context.ui.webView.postMessage('game-webview', { type: 'SAVE_SUCCESS' });
        break;
      }

      case 'GET_LEADERBOARD': {
        const leaderboard = await getLeaderboard(context, 10);
        context.ui.webView.postMessage('game-webview', {
          type: 'LEADERBOARD_DATA',
          data: JSON.parse(JSON.stringify(leaderboard)),
        });
        break;
      }

      case 'GET_DAILY_CHALLENGE': {
        const challenge = getTodaysChallenge();
        const progress = await getChallengeProgress(context, odometerId);
        context.ui.webView.postMessage('game-webview', {
          type: 'DAILY_CHALLENGE_DATA',
          data: { challenge: JSON.parse(JSON.stringify(challenge)), progress: progress ? JSON.parse(JSON.stringify(progress)) : null },
        });
        break;
      }

      case 'UPDATE_CHALLENGE_PROGRESS': {
        const updatedProgress = await updateChallengeProgress(
          context,
          odometerId,
          msg.data.progress
        );
        const challenge = getTodaysChallenge();
        context.ui.webView.postMessage('game-webview', {
          type: 'DAILY_CHALLENGE_DATA',
          data: { challenge: JSON.parse(JSON.stringify(challenge)), progress: JSON.parse(JSON.stringify(updatedProgress)) },
        });
        break;
      }

      case 'GET_PLAYER_DATA': {
        const user = await context.reddit.getCurrentUser();
        const username = user?.username ?? 'Anonymous';
        const progress = await getPlayerProgress(context, odometerId);
        const stats = await getPlayerStats(context, odometerId);
        const streakInfo = await getStreakInfo(context, odometerId);
        context.ui.webView.postMessage('game-webview', {
          type: 'INIT_RESPONSE',
          data: {
            username,
            progress: JSON.parse(JSON.stringify(progress)),
            stats: JSON.parse(JSON.stringify(stats)),
            streakInfo: JSON.parse(JSON.stringify(streakInfo)),
          },
        });
        break;
      }

      case 'UNLOCK_ACHIEVEMENT': {
        const achievement = await unlockAchievement(context, odometerId, msg.data.achievementId);
        if (achievement) {
          context.ui.webView.postMessage('game-webview', {
            type: 'ACHIEVEMENT_UNLOCKED',
            data: { achievement: JSON.parse(JSON.stringify(achievement)) },
          });
        }
        break;
      }

      case 'UPDATE_STREAK': {
        const streakInfo = await updateDailyStreak(context, odometerId);
        context.ui.webView.postMessage('game-webview', {
          type: 'STREAK_INFO',
          data: JSON.parse(JSON.stringify(streakInfo)),
        });
        break;
      }

      case 'GET_STREAK_INFO': {
        const streakInfo = await getStreakInfo(context, odometerId);
        context.ui.webView.postMessage('game-webview', {
          type: 'STREAK_INFO',
          data: JSON.parse(JSON.stringify(streakInfo)),
        });
        break;
      }

      case 'SUBMIT_DAILY_SCORE': {
        const user = await context.reddit.getCurrentUser();
        const username = user?.username ?? 'Anonymous';
        await submitDailyScore(
          context,
          odometerId,
          username,
          msg.data.score,
          msg.data.kills,
          msg.data.challengeCompleted
        );
        context.ui.webView.postMessage('game-webview', { type: 'SAVE_SUCCESS' });
        break;
      }

      case 'GET_DAILY_LEADERBOARD': {
        const dailyLeaderboard = await getDailyLeaderboard(context, 10);
        context.ui.webView.postMessage('game-webview', {
          type: 'DAILY_LEADERBOARD_DATA',
          data: JSON.parse(JSON.stringify(dailyLeaderboard)),
        });
        break;
      }
    }
  };

  if (!webviewVisible) {
    return (
      <vstack height="100%" width="100%" alignment="center middle" backgroundColor="#1a0a0a">
        <vstack
          alignment="center middle"
          padding="large"
          backgroundColor="#2d1515"
          cornerRadius="large"
          gap="medium"
        >
          <text size="xxlarge" weight="bold" color="#ff4444">
            ZOMBIE APOCALYPSE
          </text>
          <text size="medium" color="#cccccc">
            Side-scrolling zombie shooter
          </text>
          <spacer size="medium" />
          <button
            appearance="destructive"
            size="large"
            onPress={() => setWebviewVisible(true)}
          >
            PLAY GAME
          </button>
          <spacer size="small" />
          <text size="small" color="#888888">
            Use WASD/Arrows to move, Z to shoot, X for melee
          </text>
        </vstack>
      </vstack>
    );
  }

  return (
    <vstack height="100%" width="100%">
      <webview
        id="game-webview"
        url="index.html"
        width="100%"
        height="100%"
        onMessage={(msg) => handleMessage(msg as WebViewMessage)}
      />
    </vstack>
  );
}
