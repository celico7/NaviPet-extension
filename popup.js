// --- CONFIGURATION DU JEU ---
const MAX_STAT = 100;
const DECAY_RATE_MINUTES = 5; 
const DECAY_AMOUNT = 5;       
const XP_PER_LEVEL = 100;

// Évolutions (Level -> Emoji)
const EVOLUTIONS = [
  { level: 1,  emoji: '🥚' }, // Oeuf
  { level: 3,  emoji: '🐣' }, // Bébé
  { level: 5,  emoji: '🐥' }, // Poussin
  { level: 8,  emoji: '🦉' }, // Hibou
  { level: 12, emoji: '🦅' }, // Aigle
  { level: 20, emoji: '🐉' }  // Dragon
];

// État initial de NaviPet
const defaultState = {
  faim: 80,
  joie: 80,
  energie: 100,
  xp: 0,
  niveau: 1,
  coins: 10,
  isSleeping: false,
  lastSaved: Date.now()
};

let navi = { ...defaultState };

// --- ÉLÉMENTS DU DOM ---
const avatar = document.getElementById('avatar');
const screenArea = document.getElementById('screen-area');
const barFaim = document.getElementById('bar-faim');
const barJoie = document.getElementById('bar-joie');
const barEnergie = document.getElementById('bar-energie');
const levelDisplay = document.getElementById('level-display');
const coinsDisplay = document.getElementById('coins-display');
const statusMessage = document.getElementById('status-message');

const btnWork = document.getElementById('btn-work');
const btnFeed = document.getElementById('btn-feed');
const btnPlay = document.getElementById('btn-play');
const btnSleep = document.getElementById('btn-sleep');

// --- CHARGEMENT ET SAUVEGARDE VIA CHROME STORAGE ---
function loadData() {
  chrome.storage.local.get(['naviState'], (result) => {
    if (result.naviState) {
      navi = { ...defaultState, ...result.naviState };
      // Compatibilité pour les anciennes sauvegardes
      if (navi.coins === undefined) navi.coins = 10; 
      calculateOfflineDecay();
    } else {
      saveData();
    }
    applyTheme();
    updateUI();
  });
}

function saveData() {
  navi.lastSaved = Date.now();
  chrome.storage.local.set({ naviState: navi });
}

// --- LOGIQUE HORS-LIGNE ---
function calculateOfflineDecay() {
  const now = Date.now();
  const elapsedMinutes = (now - navi.lastSaved) / (1000 * 60);
  
  if (elapsedMinutes >= DECAY_RATE_MINUTES) {
    const cycles = Math.floor(elapsedMinutes / DECAY_RATE_MINUTES);
    
    if (navi.isSleeping) {
      navi.energie = Math.min(MAX_STAT, navi.energie + (cycles * 15));
      navi.faim = Math.max(0, navi.faim - (cycles * 2)); 
    } else {
      navi.faim = Math.max(0, navi.faim - (cycles * DECAY_AMOUNT));
      navi.joie = Math.max(0, navi.joie - (cycles * DECAY_AMOUNT));
      navi.energie = Math.max(0, navi.energie - (cycles * 2));
    }
  }
}

// --- THEME JOUR/NUIT ---
function applyTheme() {
  const hour = new Date().getHours();
  // Mode Nuit de 19h à 7h
  if (hour >= 19 || hour < 7) {
    document.body.classList.add('theme-night');
  } else {
    document.body.classList.remove('theme-night');
  }
}

// --- SYSTÈME DE PARTICULES & ÉVOLUTION ---
function spawnParticle(emoji, x = null, y = null) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.innerText = emoji;
  
  // Position au clic, sinon aléatoire
  p.style.left = x ? (x - 10) + 'px' : (Math.random() * 40 + 30) + '%';
  p.style.top = y ? (y - 15) + 'px' : '40%';
  
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1000);
}

function getAvatarEmoji() {
  let currentEmoji = EVOLUTIONS[0].emoji;
  for (const evo of EVOLUTIONS) {
    if (navi.niveau >= evo.level) {
      currentEmoji = evo.emoji;
    }
  }
  return currentEmoji;
}

// --- MISE À JOUR DE L'INTERFACE ---
function updateUI() {
  updateBar(barFaim, navi.faim);
  updateBar(barJoie, navi.joie);
  updateBar(barEnergie, navi.energie);
  
  levelDisplay.textContent = `Niv. ${navi.niveau}`;
  coinsDisplay.textContent = `🪙 ${navi.coins}`;

  avatar.classList.remove('anim-idle', 'anim-sleep', 'anim-shake');
  
  const currentEmoji = getAvatarEmoji();

  if (navi.isSleeping) {
    avatar.textContent = '💤';
    avatar.classList.add('anim-sleep');
    statusMessage.innerHTML = 'Dodo... zZz...';
    statusMessage.style.color = '#7f8c8d';
    toggleButtons(true);
    btnSleep.innerHTML = '☀️<br>Réveiller';
  } else if (navi.faim <= 0 || navi.joie <= 0) {
    avatar.textContent = '💀';
    avatar.classList.add('anim-shake');
    statusMessage.innerHTML = 'NaviPet est au plus mal !';
    statusMessage.style.color = '#c0392b';
    toggleButtons(false);
    btnSleep.innerHTML = '🛏️<br>Dormir';
  } else if (navi.faim <= 25 || navi.joie <= 25) {
    avatar.textContent = '🥺';
    avatar.classList.add('anim-idle');
    statusMessage.innerHTML = "J'ai besoin de toi !";
    statusMessage.style.color = '#e74c3c';
    toggleButtons(false);
    btnSleep.innerHTML = '🛏️<br>Dormir';
  } else if (navi.energie <= 15) {
    avatar.textContent = '🥱';
    avatar.classList.add('anim-idle');
    statusMessage.innerHTML = 'Bâillement...';
    statusMessage.style.color = '#e67e22';
    toggleButtons(false);
    btnSleep.innerHTML = '🛏️<br>Dormir';
  } else {
    avatar.textContent = currentEmoji;
    avatar.classList.add('anim-idle');
    statusMessage.innerHTML = '';
    toggleButtons(false);
    btnSleep.innerHTML = '🛏️<br>Dormir';
  }

  setBarDanger(barFaim, navi.faim);
  setBarDanger(barJoie, navi.joie);
  setBarDanger(barEnergie, navi.energie);
}

function updateBar(barElement, value) {
  barElement.style.width = `${value}%`;
}

function setBarDanger(barElement, value) {
  if (value < 25) {
    barElement.style.backgroundColor = '#c0392b';
  } else {
    barElement.style.backgroundColor = '';
  }
}

function toggleButtons(disabled) {
  btnWork.disabled = disabled;
  btnFeed.disabled = disabled;
  btnPlay.disabled = disabled;
}

function showMessage(msg, color = '#27ae60') {
  statusMessage.innerHTML = msg;
  statusMessage.style.color = color;
  setTimeout(() => { if (!navi.isSleeping) updateUI(); }, 2500);
}

function triggerAnimation(animClass) {
  avatar.classList.remove('anim-idle');
  avatar.classList.add(animClass);
  setTimeout(() => {
    avatar.classList.remove(animClass);
    if (!navi.isSleeping) avatar.classList.add('anim-idle');
  }, 500);
}

// --- SYSTÈME D'EXPÉRIENCE ---
function gainXp(amount) {
  navi.xp += amount;
  if (navi.xp >= XP_PER_LEVEL) {
    navi.niveau++;
    navi.xp -= XP_PER_LEVEL;
    avatar.textContent = '🌟';
    triggerAnimation('anim-shake');
    spawnParticle('✨'); spawnParticle('✨'); spawnParticle('✨');
    showMessage(`ÉVOLUTION ! Niv. ${navi.niveau}`, '#8e44ad');
  }
}

// --- ACTIONS INTERACTIVES ---

// 1. Caresses !
screenArea.addEventListener('click', (e) => {
  if (navi.isSleeping) {
    spawnParticle('💤', e.clientX, e.clientY);
    return;
  }
  if (navi.joie >= MAX_STAT) {
    spawnParticle('✨', e.clientX, e.clientY);
    return;
  }
  
  navi.joie = Math.min(MAX_STAT, navi.joie + 5);
  gainXp(2); // XP lent
  
  const rect = screenArea.getBoundingClientRect();
  const x = e.clientX - rect.left; 
  const y = e.clientY - rect.top;
  spawnParticle('❤️', x, y);
  
  triggerAnimation('anim-pet');
  saveData();
  updateUI();
});

// 2. Travailler (Coder)
btnWork.addEventListener('click', () => {
  if (navi.energie < 20) {
    showMessage('Trop fatigué...', '#e74c3c');
    triggerAnimation('anim-shake');
    return;
  }
  navi.energie -= 20;
  navi.faim = Math.max(0, navi.faim - 15);
  navi.joie = Math.max(0, navi.joie - 5);
  navi.coins += 10;
  
  spawnParticle('🪙');
  triggerAnimation('anim-pet'); 
  showMessage('+10 🪙 Gagnés !');
  gainXp(15);
  saveData();
  updateUI();
});

// 3. Nourrir (Shop)
btnFeed.addEventListener('click', () => {
  if (navi.coins < 5) {
    showMessage('Va coder 💻 !', '#c0392b');
    triggerAnimation('anim-shake');
    return;
  }
  if (navi.faim >= MAX_STAT) {
    showMessage("J'ai pas faim !", '#e67e22');
    return;
  }
  
  navi.coins -= 5;
  navi.faim = Math.min(MAX_STAT, navi.faim + 35);
  navi.energie = Math.max(0, navi.energie - 5);
  
  spawnParticle('🍎');
  triggerAnimation('anim-eat');
  showMessage('Miam ! +35 Faim');
  gainXp(10);
  saveData();
  updateUI();
});

// 4. Jouer
btnPlay.addEventListener('click', () => {
  if (navi.energie < 15) {
    showMessage('Trop fatigué...', '#e74c3c');
    triggerAnimation('anim-shake');
    return;
  }
  
  navi.joie = Math.min(MAX_STAT, navi.joie + 25);
  navi.energie -= 15;
  navi.faim -= 10;
  
  spawnParticle('🎮');
  triggerAnimation('anim-pet'); 
  showMessage('+25 Joie 🕹️');
  gainXp(12);
  saveData();
  updateUI();
});

// 5. Dormir
btnSleep.addEventListener('click', () => {
  if (navi.isSleeping) {
    navi.isSleeping = false;
    spawnParticle('☀️');
    showMessage('Bonjour !', '#2ecc71');
  } else {
    navi.isSleeping = true;
    spawnParticle('💤');
  }
  saveData();
  updateUI();
});

// Boucle pour actualiser en temps réel
setInterval(() => {
  calculateOfflineDecay();
  applyTheme();
  updateUI();
  saveData();
}, 60000);

loadData();

