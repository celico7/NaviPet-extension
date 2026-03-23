import { stateManager } from './js/state.js';
import { SPECIES_DATA } from './js/constants.js';
import { ui } from './js/ui.js';
import { shop } from './js/shop.js';
// Ces imports initialisent les controllers (ils s'auto-abonnent aux events DOM)
import './js/minigames.js';
import './js/quests.js';

class AppController {
  constructor() {
    this.currentSpeciesIndex = 0;
    this.focusInterval = null;
    
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    // 1. Abonner l'UI au StateManager
    stateManager.subscribe((data) => ui.update(data));

    // 2. Charger les données (ce qui déclenchera un ui.update)
    const data = await stateManager.load();

    // 3. Initialiser les événements principaux
    this.bindEvents();

    if (data.isAdopted) {
      ui.showScreen('gameScreen');
      ui.applyTheme();
      ui.updateMoodAura();
      this.listenForTabReactions();
      this.initFocusUI();
      setInterval(() => ui.updateMoodAura(), 30000);
      
      // Vérifier si le background script a laissé une réaction en attente
      chrome.storage.local.get(['pendingReaction'], (res) => {
        if (res.pendingReaction) {
          setTimeout(() => {
            ui.showMessage(res.pendingReaction, '#a29bfe');
            ui.spawnParticle('💬');
            chrome.storage.local.remove('pendingReaction');
          }, 800);
        }
      });
    } else {
      ui.showScreen('onboardingScreen');
      this.updateSlider();
      ui.applyTheme();
    }
  }

  bindEvents() {
    // --- ONBOARDING ---
    const slideLeft = document.getElementById('slide-left');
    const slideRight = document.getElementById('slide-right');
    const btnAdopt = document.getElementById('btn-adopt');

    slideLeft?.addEventListener('click', () => {
      this.currentSpeciesIndex = (this.currentSpeciesIndex - 1 + SPECIES_DATA.length) % SPECIES_DATA.length;
      this.updateSlider();
    });

    slideRight?.addEventListener('click', () => {
      this.currentSpeciesIndex = (this.currentSpeciesIndex + 1) % SPECIES_DATA.length;
      this.updateSlider();
    });

    btnAdopt?.addEventListener('click', () => {
      const sp = SPECIES_DATA[this.currentSpeciesIndex];
      const petNameInput = document.getElementById('pet-name-input');
      const name = petNameInput.value.trim() || sp.name;
      const isShiny = Math.random() < 0.01; // 1% chance d'être Shiny !
      
      stateManager.adopt(sp.id, name, isShiny);
      ui.showScreen('gameScreen');
      ui.applyTheme();
      ui.updateMoodAura();
      this.listenForTabReactions();
      
      if (isShiny) {
        setTimeout(() => {
          ui.showMessage('✨ SHINY ! Rarissime ! ✨', '#f1c40f');
          ui.spawnParticle('⭐'); ui.spawnParticle('✨'); ui.spawnParticle('🌟');
        }, 800);
      } else {
        ui.spawnParticle('🎉');
      }
    });

    // --- INTERACTIONS PET ---
    ui.elements.screenArea?.addEventListener('click', (e) => {
      const data = stateManager.data;
      if (!data.isAdopted) return;
      if (data.isSleeping) { 
        ui.spawnParticle('💤', e.clientX, e.clientY); 
        return; 
      }
      
      stateManager.updateStat('joie', 2);
      stateManager.addXp(5);
      
      ui.spawnParticle(data.isShiny && data.niveau >= 5 ? '⭐' : '❤️', e.clientX, e.clientY);
      ui.triggerAnimation('anim-eat');
      stateManager.notify();
      
      document.dispatchEvent(new CustomEvent('navipet:action', { detail: { type: 'click' } }));
    });

    // --- BOUTONS D'ACTION PRINCIPAUX ---
    ui.elements.btnWork?.addEventListener('click', () => {
      const data = stateManager.data;
      if (data.energie < 20) { 
        ui.showMessage('Trop fatigué...', '#e74c3c'); 
        ui.triggerAnimation('anim-shake'); 
        return; 
      }
      stateManager.updateStat('energie', -10);
      stateManager.updateStat('faim', -15);
      stateManager.updateStat('joie', -5);
      data.coins += 10;
      
      ui.spawnParticle('💻'); 
      ui.triggerAnimation('anim-idle'); 
      ui.showMessage('+10 DevCoins 🪙', '#f1c40f');
      stateManager.notify();
      
      document.dispatchEvent(new CustomEvent('navipet:action', { detail: { type: 'work' } }));
    });

    ui.elements.btnFeed?.addEventListener('click', () => shop.openInventory());

    ui.elements.btnPlay?.addEventListener('click', () => {
      const data = stateManager.data;
      if (data.energie < 15) { 
        ui.showMessage('Trop fatigué...', '#e74c3c'); 
        ui.triggerAnimation('anim-shake'); 
        return; 
      }
      stateManager.updateStat('joie', 25);
      stateManager.updateStat('energie', -8);
      stateManager.updateStat('faim', -10);
      
      ui.spawnParticle('⚽'); 
      ui.triggerAnimation('anim-idle'); 
      stateManager.notify();
      
      document.dispatchEvent(new CustomEvent('navipet:action', { detail: { type: 'play' } }));
    });

    ui.elements.btnArcade?.addEventListener('click', () => {
      ui.showScreen('arcadeScreen');
    });

    ui.elements.btnSleep?.addEventListener('click', () => {
      const data = stateManager.data;
      data.isSleeping = !data.isSleeping;
      if (!data.isSleeping) { 
        ui.spawnParticle('☀️'); 
        ui.showMessage('Bonjour !', '#2ecc71'); 
      } else { 
        ui.spawnParticle('💤'); 
      }
      stateManager.notify();
    });

    // --- FOCUS (POMODORO) ---
    const btnFocus = document.getElementById('btn-focus');
    btnFocus?.addEventListener('click', () => {
      chrome.alarms.get('focus-timer', (alarm) => {
        if (alarm) {
          chrome.alarms.clear('focus-timer');
          this.stopFocusUI();
          ui.showMessage('Focus annulé...', '#e74c3c');
        } else {
          chrome.alarms.create('focus-timer', { delayInMinutes: 25 });
          this.updateFocusUI();
          ui.showMessage('Concentration ! 🤫', '#2ecc71');
        }
      });
    });

    // --- RESET ---
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      stateManager.reset().then(() => window.location.reload());
    });

    // --- NOTIFICATIONS ---
    const btnNotif = document.getElementById('btn-notif');
    if (btnNotif) {
      // Vérifier le statut initial
      if (chrome.permissions) {
        chrome.permissions.contains({ permissions: ['notifications'] }, (hasPerm) => {
          btnNotif.textContent = hasPerm ? '🔔' : '🔕';
          btnNotif.title = hasPerm ? 'Désactiver les notifications' : 'Activer les notifications';
        });
      }
      
      btnNotif.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.permissions.contains({ permissions: ['notifications'] }, (hasPerm) => {
          if (hasPerm) {
            chrome.permissions.remove({ permissions: ['notifications'] }, (removed) => {
              if (removed) {
                btnNotif.textContent = '🔕';
                btnNotif.title = 'Activer les notifications';
                ui.showMessage('Notifications désactivées', '#e74c3c');
              }
            });
          } else {
            chrome.permissions.request({ permissions: ['notifications'] }, (granted) => {
              if (granted) {
                btnNotif.textContent = '🔔';
                btnNotif.title = 'Désactiver les notifications';
                ui.showMessage('Notifications activées !', '#2ecc71');
                
                // Petit test pour vérifier que ça marche
                chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'icons/icon128.png',
                  title: 'NaviPet',
                  message: 'Les notifications sont bien activées ! 🎉'
                });
              }
            });
          }
        });
      });
    }
  }

  // --- ONBOARDING UTILS ---
  updateSlider() {
    const sp = SPECIES_DATA[this.currentSpeciesIndex];
    const sliderAvatar = document.getElementById('slider-avatar');
    const speciesNameEl = document.getElementById('species-name');
    
    if (sliderAvatar) {
      sliderAvatar.textContent = sp.emojis[0];
      sliderAvatar.classList.remove('anim-idle');
      void sliderAvatar.offsetWidth; // Trigger reflow
      sliderAvatar.classList.add('anim-idle');
    }
    if (speciesNameEl) {
      speciesNameEl.textContent = sp.name;
    }
  }

  // --- FOCUS UTILS ---
  initFocusUI() {
    this.updateFocusUI();
  }

  updateFocusUI() {
    chrome.alarms.get('focus-timer', (alarm) => {
      const btnFocus = document.getElementById('btn-focus');
      const focusText = document.getElementById('focus-text');
      
      if (alarm) {
        if (btnFocus) {
          btnFocus.style.backgroundColor = '#2ecc71';
          btnFocus.style.borderColor = '#27ae60';
        }
        
        if (!this.focusInterval) {
          this.focusInterval = setInterval(() => this.updateFocusUI(), 1000);
        }
        
        const remainingMs = alarm.scheduledTime - Date.now();
        if (remainingMs > 0 && focusText) {
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          focusText.textContent = `En Focus : ${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
          this.stopFocusUI();
        }
      } else {
        this.stopFocusUI();
      }
    });
  }

  stopFocusUI() {
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }
    const btnFocus = document.getElementById('btn-focus');
    const focusText = document.getElementById('focus-text');
    
    if (btnFocus) {
      btnFocus.style.backgroundColor = '#e74c3c';
      btnFocus.style.borderColor = '#c0392b';
    }
    if (focusText) {
      focusText.textContent = 'Mode Focus (25:00)';
    }
  }

  // --- MESSAGES BACKGROUND ---
  listenForTabReactions() {
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'TAB_REACTION' && msg.message) {
          ui.showMessage(msg.message, '#a29bfe'); 
          ui.spawnParticle('💬');
        } else if (msg.type === 'FOCUS_END') {
          this.stopFocusUI();
          stateManager.load().then(() => {
            ui.showMessage('Focus Terminé ! +50 🪙', '#f1c40f');
            ui.spawnParticle('🍅');
          });
        } else if (msg.type === 'STATE_UPDATED') {
          stateManager.load(); // Recharger quand l'idle state met le pet en veille
        }
      });
    } catch(e) {
      console.warn("Erreur écoute background", e);
    }
  }
}

// Démarrer l'application
new AppController();