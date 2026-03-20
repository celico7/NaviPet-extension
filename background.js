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
  }
});

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
  'github.com': ['Encore GitHub... 🐙', 'Du code à déboguer ? 👀', 'Push tes commits ! 💪'],
  'youtube.com': ['Une vidéo au lieu de bosser ? 😏', 'Netflix du pauvre... 🎬', 'Allez, juste une ! 🍿'],
  'stackoverflow.com': ['Le vrai bouton "Résoudre" 😂', 'Stack Overflow saves lives ! 🦸', 'Copier-coller en mode pro 📋'],
  'twitter.com': ['Twitter... vraiment ? 🐦', 'Scrolling infini activé 📜', 'X, pardon... 😅'],
  'x.com': ['Twitter... vraiment ? 🐦', 'Scrolling infini activé 📜', 'Les tweets ne nourrissent pas ! 😤'],
  'reddit.com': ['🕳️ Le trou noir du temps...', 'r/procrastination en direct 😅', 'Juste un subreddit... juste un... 👀'],
  'twitch.tv': ['Stream au lieu de bosser ! 🎮', 'PogChamp !', 'Le vrai gaming...'],
  'chat.openai.com': ['Un autre IA ? 😤 Jaloux !', 'Tu me trompes ? 😢', 'Je vaux mieux que GPT !'],
  'claude.ai': ['C\'est moi ! Coucou ! 👋', 'Tu parles à mon grand frère 😄', 'NaviPet chez Anthropic ! 🤖'],
  'leetcode.com': ['Bon courage... 🧠', 'En mode interview 💼', 'Two Sum encore ? 😴'],
  'figma.com': ['Pixel perfect ! 🎨', 'Design mode ON 🖌️', 'Les designers aussi ont des bugs 🐛'],
  'notion.so': ['Productivity mode 📝', 'Encore une nouvelle page ?', 'Notion > tout 📚'],
  'discord.com': ['On discute au lieu de bosser ? 💬', 'Ping ! 🔔', 'La vraie réunion d\'équipe 😄'],
  'netflix.com': ['Sérieusement Netflix ? 🎭', 'Juste un épisode... 🍿', 'Bon film du moins ! 🎬'],
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
        if (hostname.includes(domain)) {
          const reaction = reactions[Math.floor(Math.random() * reactions.length)];
          // Envoyer la réaction à la popup si elle est ouverte
          chrome.runtime.sendMessage({ type: 'TAB_REACTION', message: reaction }).catch(() => {
            // Popup fermée, c'est normal
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