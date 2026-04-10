// background.js - NaviPet Service Worker
// Gère les alarmes et notifications OS pour garder le pet en vie !

const ALARM_CHECK = 'navipet-check';
const CHECK_INTERVAL_MINUTES = 10; // Vérifier toutes les 10 minutes

// --- INITIALISATION ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_CHECK, { periodInMinutes: CHECK_INTERVAL_MINUTES });
  console.log('[NaviPet] Service Worker installé. Alarmes actives.');
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.get(ALARM_CHECK, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(ALARM_CHECK, { periodInMinutes: CHECK_INTERVAL_MINUTES });
    }
  });
});

// --- GESTIONNAIRE D'ALARMES ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_CHECK) {
    checkPetStatus();
  } else if (alarm.name === 'focus-timer') {
    handleFocusEnd();
  }
});

function handleFocusEnd() {
  chrome.storage.local.get(['naviState'], (result) => {
    let navi = result.naviState || {};
    if (navi.isAdopted) {
      navi.coins = (navi.coins || 0) + 50;
      navi.xp = (navi.xp || 0) + 50;
      navi.joie = Math.min(100, navi.joie + 20);
      chrome.storage.local.set({ naviState: navi });
      
      sendNotification(
        '🍅 Focus Terminé !',
        'Bravo pour ta concentration ! Ton pet gagne +50 XP et +50 🪙.',
        'focus'
      );
    }
    chrome.runtime.sendMessage({ type: 'FOCUS_END' }).catch(() => {});
  });
}

function checkPetStatus() {
  chrome.storage.local.get(['naviState'], (result) => {
    if (!result.naviState || !result.naviState.isAdopted) return;

    const navi = result.naviState;
    const DECAY_RATE_MINUTES = 5;
    const DECAY_AMOUNT = 5;

    // Calculer la dégradation actuelle
    const now = Date.now();
    const elapsedMinutes = (now - navi.lastSaved) / (1000 * 60);
    const cycles = Math.floor(elapsedMinutes / DECAY_RATE_MINUTES);

    let faim = navi.faim;
    let joie = navi.joie;
    let energie = navi.energie;

    if (!navi.isSleeping && cycles > 0) {
      faim = Math.max(0, faim - (cycles * DECAY_AMOUNT));
      joie = Math.max(0, joie - (cycles * DECAY_AMOUNT));
      energie = Math.max(0, energie - (cycles * 2));
    }

    const petName = navi.name || 'NaviPet';

    // Notifications selon le niveau d'urgence
    if (faim <= 0 || joie <= 0) {
      sendNotification(
        `🚨 ${petName} est en danger !`,
        `${petName} est à bout ! Il a désespérément besoin de toi. Viens vite !`,
        'danger'
      );
    } else if (faim <= 20 && joie <= 20) {
      sendNotification(
        `😭 ${petName} va très mal...`,
        `${petName} a très faim ET s'ennuie beaucoup. Il a besoin d'attention !`,
        'warning'
      );
    } else if (faim <= 20) {
      sendNotification(
        `🍗 ${petName} a très faim !`,
        `${petName} n'a presque plus rien à manger. Viens le nourrir !`,
        'hunger'
      );
    } else if (joie <= 20) {
      sendNotification(
        `😢 ${petName} s'ennuie...`,
        `${petName} aimerait que tu joues avec lui ou lui parles un peu !`,
        'joy'
      );
    } else if (energie <= 15 && !navi.isSleeping) {
      sendNotification(
        `😴 ${petName} est épuisé !`,
        `${petName} tombe de sommeil. Laisse-le dormir un peu !`,
        'energy'
      );
    }
  });
}

function sendNotification(title, message, type) {
  // Éviter les notifications répétées du même type en 30 min
  const storageKey = `lastNotif_${type}`;
  chrome.storage.local.get([storageKey], (result) => {
    const lastTime = result[storageKey] || 0;
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    if (now - lastTime < thirtyMinutes) return; // Pas de spam !

    chrome.notifications.create(`navipet-${type}-${now}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: title,
      message: message,
      priority: type === 'danger' ? 2 : 1,
    });

    // Mémoriser l'heure d'envoi
    chrome.storage.local.set({ [storageKey]: now });
  });
}

// --- RÉACTION AUX ONGLETS ---
// Le pet commente les sites visités !
const TAB_REACTIONS = {
  'github.com': ['Encore GitHub...', 'Du code à déboguer ?', 'Push tes commits !!'],
  'youtube.com': ['Une vidéo au lieu de bosser ?', 'Netflix du pauvre...', 'Tu regardes quoi ?'],
  'twitter.com': ['Twitter... vraiment ?', 'Deep scrolling activé', 'Tu fais quoi sur twitter ???'],
  'x.com': ['Twitter... vraiment ?', 'Tu fais quoi sur twitter ???', 'Les tweets ne nourrissent pas !'],
  'reddit.com': ['Reddit ? pff...', 'r/procrastination en direct', 'Juste un subreddit... juste un...'],
  'twitch.tv': ['Stream au lieu de bosser !', 'PogChamp !', 'Le vrai gaming...'],
  'chat.openai.com': ['Un autre IA ? Jaloux !', 'Tu me trompes ?', 'Je vaux mieux que GPT !'],
  'claude.ai': ['Claude Senpai ?', 'Tu parles à claude ce fou', 'NaviPet chez Anthropic !'],
  'figma.com': ['Pixel perfect ! ', 'Design mode ON', 'Les designers aussi ont des bugs'],
  'discord.com': ['On discute au lieu de bosser ?', 'Ping !', 'Discord sur le web ?'],
  'netflix.com': ['Sérieusement Netflix ?', 'Juste un épisode... ', 'Un bon film j\'espere !'],
};

let lastTabReaction = 0;
const REACTION_COOLDOWN = 5 * 60 * 1000; // 5 minutes entre réactions

chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  if (now - lastTabReaction < REACTION_COOLDOWN) return;

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab.url) return;

    try {
      const url = new URL(tab.url);
      const hostname = url.hostname.replace('www.', '');

      for (const [domain, reactions] of Object.entries(TAB_REACTIONS)) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          const reaction = reactions[Math.floor(Math.random() * reactions.length)];
          // Envoyer la réaction à la popup si elle est ouverte
          chrome.runtime.sendMessage({ type: 'TAB_REACTION', message: reaction }).catch(() => {
            // Popup fermée : on sauvegarde la réaction pour la prochaine ouverture !
            chrome.storage.local.set({ pendingReaction: reaction });
          });
          lastTabReaction = now;
          break;
        }
      }
    } catch (e) {
      // URL non parseable (chrome://, etc.), ignorer
    }
  });
});

// --- LISTENER MESSAGES ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATUS') {
    sendResponse({ ok: true });
  }
});
// --- DETECTION AFK (CHROME.IDLE) ---
// Met le pet en veille automatiquement si l'utilisateur est inactif
chrome.idle.setDetectionInterval(300); // 5 minutes

chrome.idle.onStateChanged.addListener((newState) => {
  chrome.storage.local.get(['naviState'], (result) => {
    if (!result.naviState || !result.naviState.isAdopted) return;

    let navi = result.naviState;
    if (newState === 'idle' || newState === 'locked') {
      if (!navi.isSleeping) {
        navi.isSleeping = true;
        navi.autoSleeping = true; // Pour le r�veiller auto
        chrome.storage.local.set({ naviState: navi });
        // Notifier la UI si ouverte
        chrome.runtime.sendMessage({ type: 'STATE_UPDATED' }).catch(() => {});
      }
    } else if (newState === 'active') {
      if (navi.isSleeping && navi.autoSleeping) {
        navi.isSleeping = false;
        navi.autoSleeping = false;
        chrome.storage.local.set({ naviState: navi });
        chrome.runtime.sendMessage({ type: 'STATE_UPDATED' }).catch(() => {});
      }
    }
  });
});
