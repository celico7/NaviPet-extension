import { stateManager } from './state.js';
import { SPECIES_DATA, SHOP_BACKGROUNDS, SHOP_ACCESSORIES, XP_PER_LEVEL } from './constants.js';

class UIController {
  constructor() {
    this.elements = {};
    this.cacheDOM();
  }

  cacheDOM() {
    // Écrans
    this.elements.onboardingScreen = document.getElementById('onboarding-screen');
    this.elements.gameScreen = document.getElementById('game-screen');
    this.elements.shopScreen = document.getElementById('shop-screen');
    this.elements.arcadeScreen = document.getElementById('arcade-screen');
    this.elements.memoryScreen = document.getElementById('memory-screen');
    this.elements.pfcScreen = document.getElementById('pfc-screen');
    this.elements.questsScreen = document.getElementById('quests-screen');

    // Éléments de la zone principale
    this.elements.screenArea = document.getElementById('screen-area');
    this.elements.avatar = document.getElementById('avatar');
    this.elements.accessoryLayer = document.getElementById('accessory-layer');
    this.elements.moodAura = document.getElementById('mood-aura');
    this.elements.shinyBadge = document.getElementById('shiny-badge');
    this.elements.statusMessage = document.getElementById('status-message');
    this.elements.petNameDisplay = document.getElementById('pet-name-display');

    // Stats
    this.elements.barFaim = document.getElementById('bar-faim');
    this.elements.barJoie = document.getElementById('bar-joie');
    this.elements.barEnergie = document.getElementById('bar-energie');
    this.elements.barXp = document.getElementById('bar-xp');
    this.elements.levelDisplay = document.getElementById('level-display');
    this.elements.coinsDisplay = document.getElementById('coins-display');

    // Boutons de contrôle principal
    this.elements.btnWork = document.getElementById('btn-work');
    this.elements.btnFeed = document.getElementById('btn-feed');
    this.elements.btnPlay = document.getElementById('btn-play');
    this.elements.btnArcade = document.getElementById('btn-arcade');
    this.elements.btnSleep = document.getElementById('btn-sleep');
  }

  // --- Gestion des écrans ---
  hideAllScreens() {
    ['onboardingScreen', 'gameScreen', 'shopScreen', 'arcadeScreen', 'memoryScreen', 'pfcScreen', 'questsScreen'].forEach(screen => {
      if (this.elements[screen]) this.elements[screen].classList.add('hidden');
    });
  }

  showScreen(screenName) {
    this.hideAllScreens();
    if (this.elements[screenName]) {
      this.elements[screenName].classList.remove('hidden');
    }
  }

  // --- Thème et Humeur ---
  applyTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7;
    document.body.classList.toggle('theme-night', isNight);
    document.body.classList.toggle('theme-day', !isNight);
    return isNight;
  }

  updateMoodAura() {
    const data = stateManager.data;
    if (!data.isAdopted || !this.elements.moodAura) return;
    try {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) return;
        const count = tabs.length;
        let color, label;
        if (count <= 3) { color = 'rgba(52,152,219,0.3)'; label = '😌 Zen'; }
        else if (count <= 10) { color = 'rgba(46,204,113,0.3)'; label = '😊 Focus'; }
        else if (count <= 20) { color = 'rgba(241,196,15,0.4)'; label = '😅 Chargé'; }
        else { color = 'rgba(231,76,60,0.5)'; label = '🤯 Chaos!'; }
        
        this.elements.moodAura.style.boxShadow = `inset 0 0 30px 10px ${color}`;
        this.elements.moodAura.title = `${label} (${count} onglets)`;
        
        if (count > 20 && Math.random() < 0.3) {
          this.showMessage('🤯 ' + count + ' onglets ?!', '#e74c3c');
        }
      });
    } catch (e) {
      console.warn("Erreur lors de la récupération des onglets", e);
    }
  }

  // --- Mise à jour visuelle (appelée par le StateManager) ---
  update(data) {
    if (!data.isAdopted) {
      this.showScreen('onboardingScreen');
      return;
    }

    // Identité
    if (this.elements.petNameDisplay) {
      this.elements.petNameDisplay.textContent = data.name || 'NaviPet';
    }

    // Décor
    if (this.elements.screenArea) {
      this.elements.screenArea.className = (data.currentBackground || 'bg-default') + ' screen-area-base';
      const currentBgItem = SHOP_BACKGROUNDS.find(i => i.id === (data.currentBackground || 'bg-default'));
      let overlay = document.getElementById('bg-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bg-overlay';
        Object.assign(overlay.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: '1' });
        this.elements.screenArea.insertBefore(overlay, this.elements.screenArea.firstChild);
      }
      overlay.innerHTML = currentBgItem?.extraHtml || '';
    }

    // Accessoire
    const isNight = this.applyTheme();
    const accData = SHOP_ACCESSORIES.find(a => a.id === (data.currentAccessory || 'acc-none'));
    if (this.elements.accessoryLayer) {
      if (isNight && (!accData || !accData.emoji)) {
        this.elements.accessoryLayer.textContent = '🌙';
        this.elements.accessoryLayer.style.display = 'block';
      } else {
        this.elements.accessoryLayer.textContent = accData?.emoji || '';
        this.elements.accessoryLayer.style.display = accData?.emoji ? 'block' : 'none';
      }
    }

    // Shiny
    if (this.elements.shinyBadge) {
      this.elements.shinyBadge.style.display = data.isShiny ? 'inline' : 'none';
    }

    // Barres de stats
    this.updateBar(this.elements.barFaim, data.faim);
    this.updateBar(this.elements.barJoie, data.joie);
    this.updateBar(this.elements.barEnergie, data.energie);
    this.updateBar(this.elements.barXp, (data.xp / XP_PER_LEVEL) * 100);
    
    if (this.elements.levelDisplay) this.elements.levelDisplay.textContent = `Niv. ${data.niveau}`;
    if (this.elements.coinsDisplay) this.elements.coinsDisplay.textContent = data.coins;

    // État de l'avatar et boutons
    this.updateAvatarState(data);
  }

  updateBar(el, val) {
    if (el) {
      el.style.width = `${Math.max(0, Math.min(100, val))}%`;
      el.classList.toggle('bar-danger', val <= 25);
    }
  }

  getAvatarEmoji(data) {
    const sp = SPECIES_DATA.find(s => s.id === (data.species || 'dragon')) || SPECIES_DATA[0];
    if (data.isShiny && data.niveau >= 5) return sp.shiny;
    if (data.niveau < 5) return sp.emojis[0];
    if (data.niveau < 10) return sp.emojis[1];
    if (data.niveau < 15) return sp.emojis[2];
    if (data.niveau < 20) return sp.emojis[3];
    if (data.niveau < 25) return sp.emojis[4];
    return sp.emojis[5] || sp.emojis[sp.emojis.length - 1];
  }

  updateAvatarState(data) {
    const avatar = this.elements.avatar;
    if (!avatar) return;

    avatar.classList.remove('anim-idle', 'anim-sleep', 'anim-shake', 'anim-shiny');
    const currentEmoji = this.getAvatarEmoji(data);

    if (data.isSleeping) {
      avatar.textContent = '💤';
      avatar.classList.add('anim-sleep');
      this.setStatusMessage('Dodo... 💤', '#7f8c8d');
      this.toggleButtons(true);
      if (this.elements.btnSleep) this.elements.btnSleep.innerHTML = '☀️<br>Réveil';
    } else if (data.faim <= 0 || data.joie <= 0) {
      avatar.textContent = currentEmoji;
      avatar.classList.add('anim-shake');
      this.setStatusMessage('🚨 Au secours !', '#c0392b');
      this.toggleButtons(false);
      if (this.elements.btnSleep) this.elements.btnSleep.innerHTML = '🛏️<br>Dormir';
    } else if (data.faim <= 25 || data.joie <= 25) {
      avatar.textContent = currentEmoji;
      avatar.classList.add('anim-shake');
      this.setStatusMessage("J'ai besoin de toi !", '#e74c3c');
      this.toggleButtons(false);
      if (this.elements.btnSleep) this.elements.btnSleep.innerHTML = '🛏️<br>Dormir';
    } else {
      avatar.textContent = currentEmoji;
      avatar.classList.add(data.isShiny && data.niveau >= 5 ? 'anim-shiny' : 'anim-idle');
      this.setStatusMessage(data.isShiny ? '✨ Shiny ✨' : '', '#f1c40f');
      this.toggleButtons(false);
      if (this.elements.btnSleep) this.elements.btnSleep.innerHTML = '🛏️<br>Dormir';
    }
  }

  toggleButtons(disable) {
    [this.elements.btnWork, this.elements.btnFeed, this.elements.btnPlay, this.elements.btnArcade].forEach(b => {
      if (b) {
        b.disabled = disable;
        b.style.opacity = disable ? '0.5' : '1';
      }
    });
  }

  setStatusMessage(msg, color = '#27ae60') {
    if (!this.elements.statusMessage) return;
    this.elements.statusMessage.innerHTML = msg;
    this.elements.statusMessage.style.color = color;
  }

  showMessage(msg, color = '#27ae60', duration = 2500) {
    this.setStatusMessage(msg, color);
    
    // Annuler le timeout précédent s'il existe
    if (this._messageTimeout) clearTimeout(this._messageTimeout);
    
    this._messageTimeout = setTimeout(() => {
      if (!stateManager.data.isSleeping && stateManager.data.isAdopted) {
        this.update(stateManager.data); // Restaure le message par défaut
      }
    }, duration);
  }

  triggerAnimation(animClass) {
    if (!this.elements.avatar) return;
    this.elements.avatar.classList.add(animClass);
    setTimeout(() => {
      this.elements.avatar.classList.remove(animClass);
      if (!stateManager.data.isSleeping) {
        this.elements.avatar.classList.add(stateManager.data.isShiny && stateManager.data.niveau >= 5 ? 'anim-shiny' : 'anim-idle');
      }
    }, 500);
  }

  spawnParticle(emoji, x = null, y = null) {
    if (!this.elements.screenArea) return;
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    
    if (x !== null && y !== null) {
      const rect = this.elements.screenArea.getBoundingClientRect();
      p.style.left = `${x - rect.left - 10}px`;
      p.style.top = `${y - rect.top - 10}px`;
    } else {
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.transform = 'translate(-50%,-50%)';
    }
    
    this.elements.screenArea.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

export const ui = new UIController();