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
      this.initDirtSystem();
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
      this.initDirtSystem();
      
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
        ui.spawnParticle('assets/sprites/ui/sleep.png', e.clientX, e.clientY);
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
      
      ui.spawnParticle('assets/sprites/ui/computer.png'); 
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
        ui.spawnParticle('assets/sprites/ui/sun.png');
        ui.showMessage('Bonjour !', '#2ecc71');
      } else {
        ui.spawnParticle('assets/sprites/ui/sleep.png');
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
      ui.renderSpriteToElement(sliderAvatar, sp.emojis[0]);
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

  // --- SYSTEME DE SALISSURE ---
  initDirtSystem() {
    const area = document.getElementById('screen-area');
    if (!area) return;

    // Calculer les saletés basées sur le temps
    const data = stateManager.data;
    const now = Date.now();
    const lastOpen = data.lastOpenTime || now;
    const hoursElapsed = (now - lastOpen) / (1000 * 60 * 60);

    // Max 5 taches au chargement, spawn basé sur le temps d'absence
    const stainsToSpawn = Math.min(5, Math.floor(hoursElapsed / 2) + Math.floor(Math.random() * 2));
    
    for (let i = 0; i < stainsToSpawn; i++) {
       this.spawnDirt(area);
    }
    
    // Vérification initiale : si vraiment sale à l'ouverture, baisser la joie
    setTimeout(() => {
      const initialStains = area.querySelectorAll('.dirt-stain').length;
      if (initialStains >= 3) {
         stateManager.updateStat('joie', -(initialStains * 2));
         ui.showMessage(`Eww... il y a des taches partout !`, '#e74c3c', 4000);
         stateManager.notify();
      }
    }, 1000);

    // Spawn progressif en restant ouvert + Check de propreté
    setInterval(() => {
      const currentStains = area.querySelectorAll('.dirt-stain').length;
      
      // Impact négatif : plus c'est sale, plus la joie descend
      if (currentStains >= 2) {
        // Enlève 1 de joie pour 2 taches, 2 pour 4 taches, etc.
        const penalty = Math.floor(currentStains / 2);
        stateManager.updateStat('joie', -penalty);
        
        if (currentStains >= 4 && Math.random() < 0.5) {
          ui.showMessage(`Je me sens mal, nettoie un peu stp...`, '#e74c3c', 3500);
        }
        stateManager.notify();
      }

      // Apparition aléatoire d'une nouvelle tache (1 chance sur 4)
      if (Math.random() < 0.25) {
        this.spawnDirt(area);
      }
    }, 25000);

    // Sauvegarder l'heure d'ouverture pour la prochaine fois
    data.lastOpenTime = now;
    stateManager.notify();
  }

  spawnDirt(area) {
    if (area.querySelectorAll('.dirt-stain').length >= 6) return; // Max 6 taches simultanées

    const dirt = document.createElement('div');
    dirt.className = 'dirt-stain';
    
    // Position aléatoire près du bas (où se trouve généralement le NaviPet)
    const top = 40 + Math.random() * 50;  // 40% to 90% en hauteur
    const left = 10 + Math.random() * 75; // 10% to 85% en largeur
    
    const scale = 0.6 + Math.random() * 0.9;
    dirt.style.transform = `scale(${scale})`;
    dirt.style.top = `${top}%`;
    dirt.style.left = `${left}%`;
    
    dirt.style.opacity = '0';
    setTimeout(() => dirt.style.opacity = '1', 50); // Apparition en fondu grâce à CSS transition

    let isCleaning = false;
    let pressTimer = null;
    
    const startClean = (e) => {
      e.stopPropagation();
      if (isCleaning) return;
      
      // Lancer visuellement le nettoyage
      dirt.style.transition = 'transform 1s linear, opacity 1s linear';
      dirt.style.transform = 'scale(0.1) rotate(-180deg)';
      dirt.style.opacity = '0.3';
      
      pressTimer = setTimeout(() => {
        isCleaning = true;
        const coinsWon = Math.random() > 0.5 ? 2 : 1;
        
        // Obtenir la position relative dans la zone pour la particule DEVCOIN avant supprimer
        const coinParticle = document.createElement('div');
        coinParticle.className = 'particle';
        coinParticle.innerHTML = `<span style="font-size:16px; font-weight:bold; color:#f1c40f; text-shadow: 1px 1px 0 #000;">+${coinsWon}</span> <img src="assets/sprites/shop/devcoins.png" style="width:24px; height:24px; image-rendering:pixelated; vertical-align:middle;">`;
        coinParticle.style.left = dirt.style.left;
        coinParticle.style.top = parseInt(dirt.style.top) - 10 + '%';
        coinParticle.style.zIndex = '20';
        area.appendChild(coinParticle);
        setTimeout(() => coinParticle.remove(), 1000);

        dirt.remove();
        
        stateManager.data.coins += coinsWon;
        stateManager.data.xp += 2; // Petite récompense d'expérience
        
        if (typeof ui.spawnParticle === 'function') {
          // Particule bonus au centre du pet (optionnel)
          ui.spawnParticle('✨');
        }
        
        stateManager.notify();
      }, 1000); // 1 seconde de clic maintenu pour nettoyer
    };

    const stopClean = () => {
      if (isCleaning || !pressTimer) return;
      clearTimeout(pressTimer);
      pressTimer = null;
      
      // Annuler : revenir à la taille normale s'il a lâché avant
      dirt.style.transition = 'transform 0.2s ease-out, opacity 0.3s ease-out';
      dirt.style.transform = `scale(${scale})`;
      dirt.style.opacity = '1';
    };

    // Support Souris & Tactile
    dirt.addEventListener('mousedown', startClean);
    dirt.addEventListener('touchstart', startClean);
    
    // Si on relâche ou sort le curseur
    dirt.addEventListener('mouseup', stopClean);
    dirt.addEventListener('mouseleave', stopClean);
    dirt.addEventListener('touchend', stopClean);

    area.appendChild(dirt);
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
