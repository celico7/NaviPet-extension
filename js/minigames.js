import { stateManager } from './state.js';
import { ui } from './ui.js';
import { MAX_STAT, SPECIES_DATA } from './constants.js';

class MinigamesController {
  constructor() {
    this.cacheDOM();
    this.bindEvents();
    
    // État Bug Game
    this.mgInterval = null;
    this.mgSpawnInterval = null;
    this.mgTimeLeft = 0;
    this.mgCurrentScore = 0;
    
    // État Memory
    this.MEMORY_EMOJIS = ['🐛','🦋','🌺','⭐','🍕','🎮','🚀','💎'];
    this.memoryFlipped = [];
    this.memoryMatched = 0;
    this.memoryLocked = false;
    this.memoryTimerInterval = null;
    this.memoryTimeLeft = 60;
    
    // État Jump Game
    this.jumpGameActive = false;
    this.jumpScore = 0;
    this.jumpSpeed = 5;
    this.obstaclePos = 280;
    this.isJumping = false;
    this.jumpLoop = null;
  }

  cacheDOM() {
    this.arcadeMenu = document.getElementById('arcade-menu');
    this.btnMgQuit = document.getElementById('btn-mg-quit');

    // Chasse aux bugs
    this.bugGameArea = document.getElementById('bug-game-area');
    this.btnStartBugs = document.getElementById('btn-start-bugs');
    this.btnBugQuit = document.getElementById('btn-bug-quit');
    this.mgTimer = document.getElementById('mg-timer');
    this.mgScore = document.getElementById('mg-score');
    this.mgArea = document.getElementById('mg-area');

    // Memory
    this.btnStartMemory = document.getElementById('btn-start-memory');
    this.memoryGrid = document.getElementById('memory-grid');
    this.memoryStatus = document.getElementById('memory-status');
    this.memoryTimerDisplay = document.getElementById('memory-timer');
    this.btnMemoryQuit = document.getElementById('btn-memory-quit');

    // PFC
    this.btnStartPfc = document.getElementById('btn-start-pfc');
    this.pfcStatus = document.getElementById('pfc-status');
    this.pfcPlayerEmoji = document.getElementById('pfc-player-emoji');
    this.pfcPetEmoji = document.getElementById('pfc-pet-emoji');
    this.pfcResult = document.getElementById('pfc-result');
    this.pfcChoiceBtns = document.querySelectorAll('.pfc-choice-btn');
    this.btnPfcQuit = document.getElementById('btn-pfc-quit');

    // Saut d'obstacles
    this.btnStartJump = document.getElementById('btn-start-jump');
    this.jumpGameArea = document.getElementById('jump-game-area');
    this.jumpViewport = document.getElementById('jump-viewport');
    this.jumpPlayer = document.getElementById('jump-player');
    this.jumpObstacle = document.getElementById('jump-obstacle');
    this.jumpScoreDisplay = document.getElementById('jump-score');
    this.jumpHighScoreDisplay = document.getElementById('jump-highscore');
    this.btnJumpQuit = document.getElementById('btn-jump-quit');
  }

  bindEvents() {
    // Menu
    this.btnMgQuit?.addEventListener('click', () => {
      this.clearAllIntervals();
      ui.showScreen('gameScreen');
    });

    // Chasse aux Bugs
    this.btnStartBugs?.addEventListener('click', () => this.startBugGame());
    this.btnBugQuit?.addEventListener('click', () => {
      this.clearAllIntervals();
      this.openArcadeMenu();
    });
    
    // Memory
    this.btnStartMemory?.addEventListener('click', () => this.startMemoryGame());
    this.btnMemoryQuit?.addEventListener('click', () => {
      this.clearAllIntervals();
      this.openArcadeMenu();
    });

    // PFC
    this.btnStartPfc?.addEventListener('click', () => this.startPfcGame());
    this.pfcChoiceBtns.forEach(btn => {
      btn.addEventListener('click', () => this.playPfcMatch(btn.getAttribute('data-choice')));
    });
    this.btnPfcQuit?.addEventListener('click', () => this.openArcadeMenu());

    // Jump Game
    this.btnStartJump?.addEventListener('click', () => this.startJumpGame());
    this.btnJumpQuit?.addEventListener('click', () => {
      this.clearAllIntervals();
      this.openArcadeMenu();
    });
    
    // Jump mechanics (Space or Click)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.jumpGameActive) {
        e.preventDefault();
        this.performJump();
      }
    });
    this.jumpViewport?.addEventListener('mousedown', () => {
      if (this.jumpGameActive) this.performJump();
    });
  }

  openArcadeMenu() {
    ui.showScreen('arcadeScreen');
    if (this.arcadeMenu) this.arcadeMenu.classList.remove('hidden');
    if (this.bugGameArea) this.bugGameArea.classList.add('hidden');
    if (this.jumpGameArea) this.jumpGameArea.classList.add('hidden');
    this.jumpGameActive = false;
  }

  clearAllIntervals() {
    if (this.mgInterval) clearInterval(this.mgInterval);
    if (this.mgSpawnInterval) clearInterval(this.mgSpawnInterval);
    if (this.memoryTimerInterval) clearInterval(this.memoryTimerInterval);
    if (this.jumpLoop) cancelAnimationFrame(this.jumpLoop);
    if (this.endTimeout) clearTimeout(this.endTimeout);
  }

  // ==========================================
  // CHASSE AUX BUGS
  // ==========================================
  startBugGame() {
    if (this.arcadeMenu) this.arcadeMenu.classList.add('hidden');
    if (this.bugGameArea) this.bugGameArea.classList.remove('hidden');
    
    this.mgTimeLeft = 15; 
    this.mgCurrentScore = 0;
    
    if (this.mgTimer) this.mgTimer.textContent = this.mgTimeLeft;
    if (this.mgScore) this.mgScore.textContent = this.mgCurrentScore;
    if (this.mgArea) this.mgArea.innerHTML = '';
    
    this.clearAllIntervals();
    
    this.mgInterval = setInterval(() => { 
      this.mgTimeLeft--; 
      if (this.mgTimer) this.mgTimer.textContent = this.mgTimeLeft;
      if (this.mgTimeLeft <= 0) this.endBugGame(); 
    }, 1000);
    
    this.mgSpawnInterval = setInterval(() => this.spawnBug(), 600);
  }

  spawnBug() {
    if (!this.mgArea) return;
    const bug = document.createElement('div');
    const isRare = Math.random() < 0.12;
    bug.textContent = isRare ? '🦟' : '🐛';
    const pts = isRare ? 3 : 1;
    
    const maxX = this.mgArea.clientWidth - 30;
    const maxY = this.mgArea.clientHeight - 30;
    
    bug.style.cssText = `position:absolute;font-size:${isRare ? 16 : 24}px;user-select:none;cursor:pointer;left:${Math.random()*maxX}px;top:${Math.random()*maxY}px;`;
    
    bug.addEventListener('mousedown', (e) => {
      e.stopPropagation(); 
      this.mgCurrentScore += pts; 
      if (this.mgScore) this.mgScore.textContent = this.mgCurrentScore;
      bug.textContent = '💥'; 
      setTimeout(() => bug.remove(), 200);
    });
    
    this.mgArea.appendChild(bug);
    setTimeout(() => { if (bug.parentNode) bug.remove(); }, 1200);
  }

  endBugGame() {
    this.clearAllIntervals();
    const coinsWon = Math.floor(this.mgCurrentScore / 2);
    
    if (this.mgArea) {
      this.mgArea.innerHTML = `<div style="color:white;padding-top:45px;font-size:12px;line-height:2;">Terminé !<br>Score : ${this.mgCurrentScore}<br><span style="color:#f1c40f;font-size:16px;">+${coinsWon} 🪙</span><br><span style="font-size:8px;opacity:0.7;">(🦟 vaut 3 pts !)</span></div>`;
    }
    
    const data = stateManager.data;
    data.coins += coinsWon;
    stateManager.updateStat('energie', -10);
    stateManager.updateStat('joie', 15);
    stateManager.notify();
    
    this.endTimeout = setTimeout(() => {
      this.openArcadeMenu();
    }, 2500);
  }

  // ==========================================
  // MEMORY
  // ==========================================
  startMemoryGame() {
    ui.showScreen('memoryScreen');
    this.memoryMatched = 0; 
    this.memoryFlipped = []; 
    this.memoryLocked = false;
    this.memoryTimeLeft = 45; // 45 seconds to finish the game

    if (this.memoryTimerDisplay) {
      this.memoryTimerDisplay.textContent = this.memoryTimeLeft;
    }
    
    if (this.memoryStatus) {
      this.memoryStatus.textContent = 'Retourne les paires ! 🧠';
      this.memoryStatus.style.color = 'white';
    }
    
    if (this.memoryGrid) {
      this.memoryGrid.innerHTML = '';
      [...this.MEMORY_EMOJIS, ...this.MEMORY_EMOJIS]
        .sort(() => Math.random() - 0.5)
        .forEach(emoji => {
          const card = document.createElement('div');
          card.className = 'memory-card'; 
          card.dataset.emoji = emoji;
          card.innerHTML = '<span class="card-front">❓</span><span class="card-back" style="display:none;">' + emoji + '</span>';
          card.addEventListener('click', (e) => this.onMemoryCardClick(e));
          this.memoryGrid.appendChild(card);
        });
    }

    this.clearAllIntervals();
    this.memoryTimerInterval = setInterval(() => {
      this.memoryTimeLeft--;
      if (this.memoryTimerDisplay) this.memoryTimerDisplay.textContent = this.memoryTimeLeft;
      
      if (this.memoryTimeLeft <= 0) {
        this.clearAllIntervals();
        this.memoryLocked = true;
        if (this.memoryStatus) {
          this.memoryStatus.textContent = 'Temps écoulé ! ⏳';
          this.memoryStatus.style.color = '#e74c3c';
        }
        this.endTimeout = setTimeout(() => this.openArcadeMenu(), 2000);
      }
    }, 1000);
  }

  onMemoryCardClick(e) {
    if (this.memoryLocked) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || this.memoryFlipped.length >= 2) return;
    
    card.classList.add('flipped');
    card.querySelector('.card-front').style.display = 'none';
    card.querySelector('.card-back').style.display = 'inline';
    this.memoryFlipped.push(card);
    
    if (this.memoryFlipped.length === 2) {
      this.memoryLocked = true;
      const [a, b] = this.memoryFlipped;
      
      if (a.dataset.emoji === b.dataset.emoji) {
        a.style.background = '#2ecc71'; 
        b.style.background = '#2ecc71';
        this.memoryMatched++; 
        this.memoryFlipped = []; 
        this.memoryLocked = false;
        
        if (this.memoryMatched === this.MEMORY_EMOJIS.length) this.endMemoryGame();
      } else {
        setTimeout(() => {
          [a, b].forEach(c => {
            c.classList.remove('flipped');
            c.querySelector('.card-front').style.display = 'inline';
            c.querySelector('.card-back').style.display = 'none';
            c.style.background = '';
          });
          this.memoryFlipped = []; 
          this.memoryLocked = false;
        }, 900);
      }
    }
  }

  endMemoryGame() {
    this.clearAllIntervals();
    const coinsWon = 25;
    if (this.memoryStatus) {
      this.memoryStatus.textContent = `🎉 Parfait ! +${coinsWon} 🪙 & +20 Joie !`;
      this.memoryStatus.style.color = '#f1c40f';
    }
    
    const data = stateManager.data;
    data.coins += coinsWon; 
    stateManager.updateStat('joie', 20);
    stateManager.updateStat('energie', -15);
    stateManager.notify();
    
    this.endTimeout = setTimeout(() => {
      this.openArcadeMenu();
    }, 2500);
  }

  // ==========================================
  // PIERRE FEUILLE CISEAUX
  // ==========================================
  startPfcGame() {
    ui.showScreen('pfcScreen');
    if (this.pfcPlayerEmoji) this.pfcPlayerEmoji.textContent = '❓'; 
    if (this.pfcPetEmoji) this.pfcPetEmoji.textContent = '❓';
    if (this.pfcResult) this.pfcResult.textContent = ''; 
    if (this.pfcStatus) this.pfcStatus.textContent = 'Choisis ton arme 🥷';
  }

  playPfcMatch(playerChoice) {
    const data = stateManager.data;
    if (data.energie < 5) { 
      if (this.pfcResult) {
        this.pfcResult.textContent = 'Trop fatigué !'; 
        this.pfcResult.style.color = '#e74c3c'; 
      }
      return; 
    }
    
    const choices = ['pierre','feuille','ciseaux'];
    const emojis = { pierre:'🪨', feuille:'📄', ciseaux:'✂️' };
    const petChoice = choices[Math.floor(Math.random() * 3)];
    
    if (this.pfcPlayerEmoji) this.pfcPlayerEmoji.textContent = emojis[playerChoice];
    if (this.pfcPetEmoji) this.pfcPetEmoji.textContent = emojis[petChoice];
    
    stateManager.updateStat('energie', -5);
    stateManager.updateStat('faim', -2);
    
    if (playerChoice === petChoice) {
      if (this.pfcResult) {
        this.pfcResult.textContent = 'Égalité !'; 
        this.pfcResult.style.color = '#bdc3c7';
      }
      stateManager.updateStat('joie', 5);
      ui.spawnParticle('⚖️');
    } else if (
      (playerChoice === 'pierre' && petChoice === 'ciseaux') ||
      (playerChoice === 'feuille' && petChoice === 'pierre') ||
      (playerChoice === 'ciseaux' && petChoice === 'feuille')
    ) {
      if (this.pfcResult) {
        this.pfcResult.textContent = 'Victoire ! +10 🪙'; 
        this.pfcResult.style.color = '#2ecc71';
      }
      data.coins += 10; 
      stateManager.updateStat('joie', 15);
      stateManager.addXp(5);
      ui.spawnParticle('🎉');
    } else {
      if (this.pfcResult) {
        this.pfcResult.textContent = 'Défaite ! Mince...'; 
        this.pfcResult.style.color = '#e74c3c';
      }
      stateManager.updateStat('joie', -5);
      ui.spawnParticle('😿');
    }
    
    stateManager.notify();
  }

  // ==========================================
  // SAUT D'OBSTACLES (JUMP GAME)
  // ==========================================
  startJumpGame() {
    if (this.arcadeMenu) this.arcadeMenu.classList.add('hidden');
    if (this.jumpGameArea) this.jumpGameArea.classList.remove('hidden');
    
    this.clearAllIntervals();
    this.jumpGameActive = true;
    this.jumpScore = 0;
    this.jumpSpeed = 4;
    this.obstaclePos = 280; // Viewport width
    if (this.jumpScoreDisplay) this.jumpScoreDisplay.textContent = '0';
    if (this.jumpHighScoreDisplay) this.jumpHighScoreDisplay.textContent = stateManager.data.jumpHighScore || 0;
    if (this.jumpPlayer) {
      this.jumpPlayer.classList.remove('jumping');
      const sp = SPECIES_DATA.find(s => s.id === stateManager.data.species);
      const playerSprite = sp ? sp.emojis[0] : '🥚';
      ui.renderSpriteToElement(this.jumpPlayer, playerSprite);
    }
    if (this.jumpObstacle) {
      this.jumpObstacle.style.left = '300px';
      this.jumpObstacle.classList.remove('hidden');
    }
    
    // Decrease energy before playing
    stateManager.updateStat('energie', -10);
    stateManager.notify();
    
    requestAnimationFrame(() => this.updateJumpGame());
  }

  performJump() {
    if (this.isJumping || !this.jumpPlayer) return;
    this.isJumping = true;
    this.jumpPlayer.classList.add('jumping');
    
    setTimeout(() => {
      this.jumpPlayer.classList.remove('jumping');
      this.isJumping = false;
    }, 600); // match CSS animation duration
  }

  updateJumpGame() {
    if (!this.jumpGameActive) return;

    // Move obstacle
    this.obstaclePos -= this.jumpSpeed;
    if (this.obstaclePos < -30) {
      this.obstaclePos = 280;
      this.jumpScore += 1;
      if (this.jumpScoreDisplay) this.jumpScoreDisplay.textContent = this.jumpScore;
      this.jumpSpeed += 0.2; // increase difficulty slightly
    }
    if (this.jumpObstacle) {
      this.jumpObstacle.style.left = this.obstaclePos + 'px';
    }

    // Check collision
    const playerRect = this.jumpPlayer.getBoundingClientRect();
    const obstacleRect = this.jumpObstacle.getBoundingClientRect();

    // Simple AABB collision (a bit forgiving for the player)
    if (
      playerRect.right - 10 > obstacleRect.left &&
      playerRect.left + 10 < obstacleRect.right &&
      playerRect.bottom - 5 > obstacleRect.top
    ) {
      this.endJumpGame();
      return;
    }

    this.jumpLoop = requestAnimationFrame(() => this.updateJumpGame());
  }

  endJumpGame() {
    this.jumpGameActive = false;
    if (this.jumpLoop) cancelAnimationFrame(this.jumpLoop);
    if (this.jumpPlayer) this.jumpPlayer.classList.remove('jumping');
    
    const coinsWon = Math.floor(this.jumpScore * 2);
    const data = stateManager.data;
    data.coins += coinsWon;
    
    // Check and save High Score
    if (this.jumpScore > (data.jumpHighScore || 0)) {
      data.jumpHighScore = this.jumpScore;
      if (this.jumpHighScoreDisplay) this.jumpHighScoreDisplay.textContent = this.jumpScore;
      ui.spawnParticle('🏆');
    }

    stateManager.updateStat('joie', 15);
    stateManager.notify();

    if (this.jumpScoreDisplay) {
      this.jumpScoreDisplay.innerHTML = this.jumpScore + ' <br><span style="color:#2ecc71;font-size:9px;">+ ' + coinsWon + ' 🪙</span>';
    }
    
    setTimeout(() => {
      this.openArcadeMenu();
      if (coinsWon > 0) ui.showMessage('+' + coinsWon + ' 🪙 gagnés !', '#f1c40f');
    }, 2500);
  }
}

export const minigames = new MinigamesController();