import { stateManager } from './state.js';
import { ui } from './ui.js';
import { DAILY_QUESTS_POOL } from './constants.js';

class QuestsController {
  constructor() {
    this.cacheDOM();
    this.bindEvents();
    
    // Écouter les événements d'actions génériques pour avancer les quêtes
    document.addEventListener('navipet:action', (e) => {
      this.advanceQuest(e.detail.type, e.detail.amount || 1);
    });
  }

  cacheDOM() {
    this.btnQuests = document.getElementById('btn-quests');
    this.btnQuestsQuit = document.getElementById('btn-quests-quit');
    this.questsList = document.getElementById('quests-list');
  }

  bindEvents() {
    this.btnQuests?.addEventListener('click', () => {
      ui.showScreen('questsScreen');
      this.renderQuests();
    });

    this.btnQuestsQuit?.addEventListener('click', () => {
      ui.showScreen('gameScreen');
    });
  }

  getDailyQuests() {
    const data = stateManager.data;
    const today = new Date().toISOString().split('T')[0];
    
    if (!data.quests || data.quests.date !== today) {
      const shuffled = [...DAILY_QUESTS_POOL].sort(() => 0.5 - Math.random());
      data.quests = {
        date: today,
        list: shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, done: false }))
      };
      stateManager.save();
    }
    
    return data.quests.list;
  }

  advanceQuest(id, amount = 1) {
    const data = stateManager.data;
    if (!data.isAdopted) return;
    
    const quests = this.getDailyQuests();
    let updated = false;
    
    quests.forEach(q => {
      if (q.id === id && !q.done) {
        q.progress += amount;
        if (q.progress >= q.target) {
          q.progress = q.target;
          q.done = true;
          data.coins += q.reward;
          setTimeout(() => ui.showMessage(`Quête ! +${q.reward} 🪙`, '#f1c40f'), 1000);
        }
        updated = true;
      }
    });

    if (updated) {
      stateManager.notify();
      if (ui.elements.questsScreen && !ui.elements.questsScreen.classList.contains('hidden')) {
        this.renderQuests();
      }
    }
  }

  renderQuests() {
    if (!this.questsList) return;
    
    this.questsList.innerHTML = '';
    const quests = this.getDailyQuests();
    
    quests.forEach(q => {
      const qDiv = document.createElement('div');
      qDiv.style.cssText = `background:var(--bg-color); border:2px solid var(--border-color); padding:10px; border-radius:5px; text-align:left; font-size:8px; opacity: ${q.done ? '0.6' : '1'};`;
      
      const title = document.createElement('div');
      title.textContent = q.title + ` ( ${q.progress}/${q.target} )`;
      title.style.marginBottom = '5px';
      
      const reward = document.createElement('div');
      reward.textContent = `🎁 +${q.reward} 🪙`;
      reward.style.color = '#f1c40f';

      if (q.done) {
        title.innerHTML = `✅ <strike>${title.textContent}</strike>`;
      }

      qDiv.appendChild(title);
      qDiv.appendChild(reward);
      this.questsList.appendChild(qDiv);
    });
  }
}

export const quests = new QuestsController();