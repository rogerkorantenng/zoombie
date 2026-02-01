// App.js - Main application controller and Devvit bridge

class App {
  constructor() {
    // Game instance
    this.game = null;
    this.levelManager = new LevelManager();

    // Player data
    this.username = 'Anonymous';
    this.progress = {
      currentLevel: 1,
      unlockedLevels: [1],
      weapons: ['pistol'],
      achievements: [],
    };
    this.stats = {
      totalKills: 0,
      totalDeaths: 0,
      accuracy: 0,
      levelsCompleted: 0,
      highScore: 0,
      playtime: 0,
    };

    // Streak info
    this.streakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      todayPlayed: false,
      activeRewards: [],
    };

    // Achievement notification queue
    this.achievementQueue = [];
    this.showingAchievement = false;

    // UI elements
    this.screens = {
      mainMenu: document.getElementById('main-menu'),
      levelSelect: document.getElementById('level-select'),
      leaderboard: document.getElementById('leaderboard-screen'),
      daily: document.getElementById('daily-screen'),
      game: document.getElementById('game-screen'),
    };

    this.overlays = {
      pause: document.getElementById('pause-menu'),
      gameover: document.getElementById('gameover-overlay'),
      levelComplete: document.getElementById('levelcomplete-overlay'),
      victory: document.getElementById('victory-overlay'),
    };

    // Current state
    this.currentScreen = 'mainMenu';
    this.selectedLevel = 1;
    this.isPlaying = false;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupDevvitBridge();
    this.requestInitData();
  }

  setupCanvas() {
    const canvas = document.getElementById('game-canvas');
    const container = document.getElementById('game-screen');

    // Set canvas size - store resize function for later use
    this.resizeCanvas = () => {
      // Use container dimensions, fallback to window if container is hidden
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      if (this.game) {
        this.game.width = canvas.width;
        this.game.height = canvas.height;
      }
    };

    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);

    // Create game instance
    this.game = new Game(canvas);
    this.game.init(this.levelManager);
  }

  setupEventListeners() {
    // Main menu buttons
    document.getElementById('btn-play').addEventListener('click', () => this.startGame());
    document.getElementById('btn-levels').addEventListener('click', () => this.showScreen('levelSelect'));
    document.getElementById('btn-leaderboard').addEventListener('click', () => this.showLeaderboard());
    document.getElementById('btn-daily').addEventListener('click', () => this.showDailyChallenge());

    // Level select
    document.getElementById('btn-back-levels').addEventListener('click', () => this.showScreen('mainMenu'));

    // Leaderboard
    document.getElementById('btn-back-leaderboard').addEventListener('click', () => this.showScreen('mainMenu'));

    // Daily challenge
    document.getElementById('btn-back-daily').addEventListener('click', () => this.showScreen('mainMenu'));
    document.getElementById('btn-play-challenge').addEventListener('click', () => this.startDailyChallenge());

    // Pause menu
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());
    document.getElementById('btn-quit').addEventListener('click', () => this.quitToMenu());

    // Game over
    document.getElementById('btn-retry').addEventListener('click', () => this.restartGame());
    document.getElementById('btn-menu').addEventListener('click', () => this.quitToMenu());

    // Level complete
    document.getElementById('btn-nextlevel').addEventListener('click', () => this.nextLevel());
    document.getElementById('btn-menu-complete').addEventListener('click', () => this.quitToMenu());

    // Victory
    document.getElementById('btn-menu-victory').addEventListener('click', () => this.quitToMenu());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.currentScreen === 'mainMenu') {
        this.startGame();
      }
      if (e.code === 'Escape') {
        if (this.isPlaying && this.game.state === 'playing') {
          this.pauseGame();
        } else if (this.game.state === 'paused') {
          this.resumeGame();
        }
      }
    });

    // Game events
    window.addEventListener('gameOver', (e) => this.onGameOver(e.detail));
    window.addEventListener('levelComplete', (e) => this.onLevelComplete(e.detail));
    window.addEventListener('gameWin', (e) => this.onGameWin(e.detail));
    window.addEventListener('notification', (e) => this.showNotification(e.detail.text));

    // Achievement triggers from game
    window.addEventListener('achievementTrigger', (e) => this.onAchievementTrigger(e.detail));
  }

  onAchievementTrigger(detail) {
    // Map trigger type to achievement ID
    const triggerMap = {
      'first_blood': 'first_blood',
      'combo_master': 'combo_master',
      'mega_combo': 'mega_combo',
    };

    const achievementId = triggerMap[detail.type];
    if (achievementId) {
      this.unlockAchievement(achievementId);
    }
  }

  setupDevvitBridge() {
    // Listen for messages from Devvit
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'devvit-message':
          this.handleDevvitMessage(msg.data.message);
          break;
      }
    });
  }

  handleDevvitMessage(msg) {
    switch (msg.type) {
      case 'INIT_RESPONSE':
        this.onInitResponse(msg.data);
        break;
      case 'LEADERBOARD_DATA':
        this.displayLeaderboard(msg.data);
        break;
      case 'DAILY_CHALLENGE_DATA':
        this.displayDailyChallenge(msg.data);
        break;
      case 'ACHIEVEMENT_UNLOCKED':
        this.onAchievementUnlocked(msg.data.achievement);
        break;
      case 'STREAK_INFO':
        this.onStreakInfo(msg.data);
        break;
      case 'SAVE_SUCCESS':
        console.log('Data saved successfully');
        break;
      case 'ERROR':
        console.error('Devvit error:', msg.message);
        break;
    }
  }

  sendToDevvit(message) {
    window.parent.postMessage(message, '*');
  }

  requestInitData() {
    this.sendToDevvit({ type: 'INIT' });
  }

  onInitResponse(data) {
    this.username = data.username;
    this.progress = data.progress;
    this.stats = data.stats;

    // Handle streak info
    if (data.streakInfo) {
      this.streakInfo = data.streakInfo;
      this.updateStreakDisplay();
    }

    // Update UI
    document.getElementById('username').textContent = this.username;
    document.getElementById('high-score').textContent = `High Score: ${this.stats.highScore}`;

    // Populate level select
    this.populateLevelSelect();
  }

  onStreakInfo(streakInfo) {
    this.streakInfo = streakInfo;
    this.updateStreakDisplay();
  }

  updateStreakDisplay() {
    // Update streak display in main menu
    let streakEl = document.getElementById('streak-display');
    if (!streakEl) {
      // Create streak display element
      const menuButtons = document.querySelector('#main-menu .menu-buttons');
      if (menuButtons) {
        streakEl = document.createElement('div');
        streakEl.id = 'streak-display';
        streakEl.className = 'streak-display';
        menuButtons.parentNode.insertBefore(streakEl, menuButtons);
      }
    }

    if (streakEl && this.streakInfo.currentStreak > 0) {
      const flames = '🔥'.repeat(Math.min(5, Math.ceil(this.streakInfo.currentStreak / 3)));
      streakEl.innerHTML = `
        <div class="streak-flames">${flames}</div>
        <div class="streak-count">${this.streakInfo.currentStreak} Day Streak!</div>
        ${this.streakInfo.nextReward ? `<div class="streak-next">Next reward at ${this.streakInfo.nextReward.days} days</div>` : ''}
      `;
      streakEl.style.display = 'block';
    } else if (streakEl) {
      streakEl.style.display = 'none';
    }
  }

  onAchievementUnlocked(achievement) {
    this.achievementQueue.push(achievement);
    this.processAchievementQueue();
  }

  processAchievementQueue() {
    if (this.showingAchievement || this.achievementQueue.length === 0) return;

    this.showingAchievement = true;
    const achievement = this.achievementQueue.shift();

    this.showAchievementNotification(achievement);

    // Process next achievement after delay
    setTimeout(() => {
      this.showingAchievement = false;
      this.processAchievementQueue();
    }, 2500);
  }

  showAchievementNotification(achievement) {
    // Create achievement notification element
    let achievementEl = document.getElementById('achievement-notification');
    if (!achievementEl) {
      achievementEl = document.createElement('div');
      achievementEl.id = 'achievement-notification';
      achievementEl.className = 'achievement-notification';
      document.body.appendChild(achievementEl);
    }

    achievementEl.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
        <div class="achievement-points">+${achievement.points} pts</div>
      </div>
    `;

    achievementEl.classList.add('show');

    // Also show in-game notification
    this.showNotification(`🏆 ${achievement.name}`);

    setTimeout(() => {
      achievementEl.classList.remove('show');
    }, 2000);
  }

  // Screen management
  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.add('hidden'));
    Object.values(this.overlays).forEach(o => o.classList.add('hidden'));

    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
    }

    this.currentScreen = screenName;
  }

  hideAllOverlays() {
    Object.values(this.overlays).forEach(o => o.classList.add('hidden'));
  }

  showOverlay(overlayName) {
    if (this.overlays[overlayName]) {
      this.overlays[overlayName].classList.remove('hidden');
    }
  }

  // Level select
  populateLevelSelect() {
    const container = document.getElementById('level-list');
    container.innerHTML = '';

    for (let i = 1; i <= this.levelManager.getTotalLevels(); i++) {
      const levelData = this.levelManager.getLevel(i);
      const isUnlocked = this.progress.unlockedLevels.includes(i);

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <h3>Level ${i}</h3>
        <p>${levelData.name}</p>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.selectedLevel = i;
          this.startGame(i);
        });
      }

      container.appendChild(card);
    }
  }

  // Game control
  startGame(level = 1) {
    this.selectedLevel = level;
    this.showScreen('game');

    // Resize canvas after screen is visible (fixes 0x0 canvas issue)
    requestAnimationFrame(() => {
      this.resizeCanvas();
      this.isPlaying = true;
      this.game.startGame(level);
      this.game.start();
    });
  }

  pauseGame() {
    if (this.game.state === 'playing') {
      this.game.togglePause();
      this.showOverlay('pause');
    }
  }

  resumeGame() {
    this.game.togglePause();
    this.hideAllOverlays();
  }

  restartGame() {
    this.hideAllOverlays();
    this.game.startGame(this.selectedLevel);
  }

  nextLevel() {
    this.hideAllOverlays();
    this.game.nextLevel();
  }

  quitToMenu() {
    this.hideAllOverlays();
    this.isPlaying = false;
    this.game.reset();
    this.showScreen('mainMenu');
    this.requestInitData(); // Refresh data
  }

  // Game event handlers
  onGameOver(data) {
    document.getElementById('final-score').textContent = data.score;
    document.getElementById('final-kills').textContent = data.stats.kills;
    document.getElementById('final-level').textContent = data.level;

    this.showOverlay('gameover');

    // Save stats and submit score
    this.updateStats(data.stats);
    this.submitScore(data.score, data.level, data.stats.kills);

    // Check achievements
    this.checkAchievements(data.stats);
  }

  onLevelComplete(data) {
    const bonus = 1000 * data.level;
    document.getElementById('level-score').textContent = data.score;
    document.getElementById('level-bonus').textContent = bonus;

    this.showOverlay('levelComplete');

    // Unlock next level
    const nextLevel = data.level + 1;
    if (nextLevel <= this.levelManager.getTotalLevels() && !this.progress.unlockedLevels.includes(nextLevel)) {
      this.progress.unlockedLevels.push(nextLevel);
      this.saveProgress();
    }

    this.updateStats(data.stats);
    this.submitScore(data.score, data.level, data.stats.kills);

    // Check achievements
    this.checkAchievements(data.stats);
    this.checkLevelAchievements(data.level, data.stats);
  }

  onGameWin(data) {
    document.getElementById('victory-score').textContent = data.score;
    document.getElementById('victory-kills').textContent = data.stats.kills;

    this.showOverlay('victory');

    this.updateStats(data.stats);
    this.submitScore(data.score, 5, data.stats.kills);

    // Check achievements - completed all levels!
    this.checkAchievements(data.stats);
    this.checkLevelAchievements(5, data.stats);
  }

  updateStats(sessionStats) {
    this.stats.totalKills += sessionStats.kills;
    this.stats.totalDeaths += sessionStats.deaths;

    if (sessionStats.shotsFired > 0) {
      const sessionAccuracy = (sessionStats.shotsHit / sessionStats.shotsFired) * 100;
      this.stats.accuracy = Math.round((this.stats.accuracy + sessionAccuracy) / 2);
    }

    this.sendToDevvit({ type: 'SAVE_STATS', data: this.stats });
  }

  saveProgress() {
    this.sendToDevvit({ type: 'SAVE_PROGRESS', data: this.progress });
  }

  submitScore(score, level, kills) {
    if (score > this.stats.highScore) {
      this.stats.highScore = score;
      document.getElementById('high-score').textContent = `High Score: ${score}`;
    }

    this.sendToDevvit({
      type: 'SUBMIT_SCORE',
      data: { score, level, kills },
    });
  }

  // Leaderboard
  showLeaderboard() {
    this.showScreen('leaderboard');
    document.getElementById('leaderboard-list').innerHTML = '<div class="loading">Loading...</div>';
    this.sendToDevvit({ type: 'GET_LEADERBOARD' });
  }

  displayLeaderboard(entries) {
    const container = document.getElementById('leaderboard-list');

    if (!entries || entries.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #888;">No scores yet. Be the first!</p>';
      return;
    }

    container.innerHTML = entries.map((entry, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return `
        <div class="leaderboard-entry ${rankClass}">
          <span class="leaderboard-rank">#${index + 1}</span>
          <span class="leaderboard-name">${entry.username}</span>
          <span class="leaderboard-score">${entry.score}</span>
        </div>
      `;
    }).join('');
  }

  // Daily Challenge
  showDailyChallenge() {
    this.showScreen('daily');
    document.getElementById('challenge-info').innerHTML = '<div class="loading">Loading...</div>';
    document.getElementById('btn-play-challenge').classList.add('hidden');
    this.sendToDevvit({ type: 'GET_DAILY_CHALLENGE' });
  }

  displayDailyChallenge(data) {
    const { challenge, progress } = data;
    const container = document.getElementById('challenge-info');
    const playBtn = document.getElementById('btn-play-challenge');

    const currentProgress = progress?.progress || 0;
    const progressPercent = Math.min(100, (currentProgress / challenge.requirement.target) * 100);
    const isCompleted = progress?.completed || false;

    container.innerHTML = `
      <h3 class="challenge-title">${challenge.title}</h3>
      <p class="challenge-description">${challenge.description}</p>
      <div class="challenge-progress">
        <div class="challenge-progress-bar" style="width: ${progressPercent}%"></div>
      </div>
      <p>${currentProgress} / ${challenge.requirement.target}</p>
      <p class="challenge-reward">Reward: ${challenge.reward} points</p>
      ${isCompleted ? '<p class="challenge-completed">✓ COMPLETED!</p>' : ''}
    `;

    if (!isCompleted) {
      playBtn.classList.remove('hidden');
    }
  }

  startDailyChallenge() {
    // Start game in challenge mode
    this.startGame(1);
    // Could add special challenge tracking here
  }

  // Notifications
  showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.classList.remove('hidden');

    setTimeout(() => {
      notification.classList.add('hidden');
    }, 800);
  }

  // Achievement system
  unlockAchievement(achievementId) {
    // Check if already unlocked locally
    if (this.progress.achievements.includes(achievementId)) {
      return;
    }

    // Send to Devvit
    this.sendToDevvit({
      type: 'UNLOCK_ACHIEVEMENT',
      data: { achievementId },
    });

    // Add to local progress
    this.progress.achievements.push(achievementId);
  }

  // Check achievements based on game stats
  checkAchievements(sessionStats) {
    // Combat achievements
    if (this.stats.totalKills >= 1) {
      this.unlockAchievement('first_blood');
    }
    if (this.stats.totalKills >= 100) {
      this.unlockAchievement('zombie_slayer');
    }
    if (this.stats.totalKills >= 500) {
      this.unlockAchievement('zombie_hunter');
    }
    if (this.stats.totalKills >= 1000) {
      this.unlockAchievement('zombie_legend');
    }

    // Combo achievements (from session)
    if (sessionStats.maxCombo >= 20) {
      this.unlockAchievement('combo_master');
    }
    if (sessionStats.maxCombo >= 50) {
      this.unlockAchievement('mega_combo');
    }

    // Streak achievement
    if (this.streakInfo.currentStreak >= 7) {
      this.unlockAchievement('dedicated');
    }
  }

  // Check level completion achievements
  checkLevelAchievements(level, stats) {
    if (level >= 1) {
      this.unlockAchievement('first_victory');
    }
    if (level >= 3) {
      this.unlockAchievement('halfway_there');
    }
    if (level >= 5) {
      this.unlockAchievement('survivor');
    }

    // Flawless - completed level without taking damage
    if (stats.damageTaken === 0) {
      this.unlockAchievement('flawless');
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
