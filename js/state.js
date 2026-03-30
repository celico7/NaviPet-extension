import { DECAY_RATE_MIN, DECAY_AMOUNT, MAX_STAT, XP_PER_LEVEL, DEFAULT_STATE } from './constants.js';

class PetState {
  constructor() {
    this.data = { ...DEFAULT_STATE };
    this.listeners = [];
  }

  // Permet de s'inscrire aux changements d'état
  subscribe(callback) {
    this.listeners.push(callback);
  }

  // Notifie tous les composants UI que l'état a changé
  notify() {
    this.listeners.forEach(callback => callback(this.data));
    this.save();
  }

  async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['naviState'], (result) => {
        if (result.naviState && result.naviState.isAdopted) {
          this.data = { ...DEFAULT_STATE, ...result.naviState };
          
          // Réveil automatique si mis en veille par l'AFK Chrome
          if (this.data.isSleeping && this.data.autoSleeping) {
            this.data.isSleeping = false;
            this.data.autoSleeping = false;
          }

          this.processOfflineDecay();
        } else {
          this.data = { ...DEFAULT_STATE };
        }
        setTimeout(() => this.notify(), 0); // Évite de bloquer la boucle Promise
        resolve(this.data);
      });
    });
  }

  save() {
    if (!this.data.isAdopted) return;
    this.data.lastSaved = Date.now();
    chrome.storage.local.set({ naviState: this.data });
  }

  reset() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        this.data = { ...DEFAULT_STATE };
        resolve();
      });
    });
  }

  processOfflineDecay() {
    const now = Date.now();
    const elapsedMin = (now - this.data.lastSaved) / 60000;
    
    if (elapsedMin >= DECAY_RATE_MIN) {
      const cycles = Math.floor(elapsedMin / DECAY_RATE_MIN);
      if (this.data.isSleeping) {
        this.updateStat('energie', cycles * 15);
        this.updateStat('faim', -cycles * 2);
      } else {
        this.addXp(cycles * 2);
        this.updateStat('faim', -cycles * DECAY_AMOUNT);
        this.updateStat('joie', -cycles * DECAY_AMOUNT);
        this.updateStat('energie', -cycles * 2);
      }
    }
  }

  updateStat(statName, amount) {
    this.data[statName] = Math.min(MAX_STAT, Math.max(0, this.data[statName] + amount));
  }

  addXp(amount) {
    this.data.xp += amount;
    while (this.data.xp >= XP_PER_LEVEL) {
      this.data.niveau++;
      this.data.xp -= XP_PER_LEVEL;
    }
  }

  adopt(speciesId, name, isShiny) {
    this.data = { ...DEFAULT_STATE };
    this.data.isAdopted = true;
    this.data.species = speciesId;
    this.data.name = name;
    this.data.isShiny = isShiny;
    this.notify();
  }
}

export const stateManager = new PetState();
