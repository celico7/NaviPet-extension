document.addEventListener('DOMContentLoaded', () => {
  // --- DONNEES DES ESPECES ---
  const SPECIES_DATA = [
      { id: 'dragon', name: 'Dragon', emojis: ['🥚', '🦎', '🐉', '🐉', '🐉', '🐉'] },
      { id: 'dog', name: 'Chien', emojis: ['🥚', '🐶', '🐕', '🐕', '🐕', '🐕'] },
      { id: 'cat', name: 'Chat', emojis: ['🥚', '🐱', '🐈', '🐈', '🐈', '🐈'] },
      { id: 'robot', name: 'Robot', emojis: ['📦', '🤖', '🤖', '🤖', '🤖', '🤖'] },
      { id: 'plant', name: 'Plante', emojis: ['🌱', '🌿', '🪴', '🌳', '🌳', '🌸'] }
    ];
  let currentSpeciesIndex = 0;

  // --- VARIABLES GLOBALES ---
  let navi = {};
  const XP_PER_LEVEL = 100;
  const DECAY_RATE_MINUTES = 5; 
  const DECAY_AMOUNT = 5;
  const MAX_STAT = 100;

  const SHOP_ITEMS = [
      { id: 'bg-default', name: 'Pièce Simple', price: 0, icon: '🏠' },
      { id: 'bg-forest', name: 'Forêt Magique', price: 50, icon: '🌲' },
      { id: 'bg-beach', name: 'Plage Ensoleillée', price: 100, icon: '🏖️' },
      { id: 'bg-hacker', name: 'Bureau Hacker', price: 150, icon: '💻' },
      { id: 'bg-space', name: 'Station Spatiale', price: 300, icon: '🚀' }
    ];

  const defaultState = {
    isAdopted: false,
    name: '',
    species: 'dragon',
    faim: 80,
    joie: 80,
    energie: 100,
    xp: 0,
    niveau: 1,
    coins: 20,
    isSleeping: false,
    unlockedBackgrounds: ['bg-default'],
    currentBackground: 'bg-default',
    lastSaved: Date.now()
  };

  // --- ELEMENTS DOM ---
  const onboardingScreen = document.getElementById('onboarding-screen');
  const gameScreen = document.getElementById('game-screen');
  
  const slideLeft = document.getElementById('slide-left');
  const slideRight = document.getElementById('slide-right');
  const sliderAvatar = document.getElementById('slider-avatar');
  const speciesNameEl = document.getElementById('species-name');
  const petNameInput = document.getElementById('pet-name-input');
  const btnAdopt = document.getElementById('btn-adopt');

  const avatar = document.getElementById('avatar');
  const screenArea = document.getElementById('screen-area');
  const barFaim = document.getElementById('bar-faim');
  const barJoie = document.getElementById('bar-joie');
  const barEnergie = document.getElementById('bar-energie');
  const barXp = document.getElementById('bar-xp');
  const levelDisplay = document.getElementById('level-display');
  const coinsDisplay = document.getElementById('coins-display');
  const petNameDisplay = document.getElementById('pet-name-display');
  const statusMessage = document.getElementById('status-message');
  
  const btnWork = document.getElementById('btn-work');
  const btnFeed = document.getElementById('btn-feed');
  const btnPlay = document.getElementById('btn-play');
  const btnSleep = document.getElementById('btn-sleep');
  const btnArcade = document.getElementById('btn-arcade');
  const btnReset = document.getElementById('btn-reset');
  const btnShop = document.getElementById('btn-shop');
  
  // Boutique Elements
  const shopScreen = document.getElementById('shop-screen');
  const shopItemsContainer = document.getElementById('shop-items');
  const shopCoins = document.getElementById('shop-coins');
  const btnShopQuit = document.getElementById('btn-shop-quit');

  // Mini-jeu Elements DOM
  const arcadeScreen = document.getElementById('arcade-screen');
  const mgTimer = document.getElementById('mg-timer');
  const mgScore = document.getElementById('mg-score');
  const mgArea = document.getElementById('mg-area');
  const btnMgQuit = document.getElementById('btn-mg-quit');
  let mgInterval, mgSpawnInterval, mgTimeLeft, mgCurrentScore;

  // --- INIT & SAUVEGARDE ---
  function loadData() {
    chrome.storage.local.get(['naviState'], (result) => {
      if (result.naviState && result.naviState.isAdopted) {
        navi = result.naviState;
        
        // Calcul dégradation temps
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
        
        startGame();
      } else {
        navi = { ...defaultState };
        showOnboarding();
      }
    });
  }

  function saveData() {
    if(!navi.isAdopted) return;
    navi.lastSaved = Date.now();
    chrome.storage.local.set({ naviState: navi });
    updateUI();
  }

  // --- ECRANS LOGIQUE ---
  function showOnboarding() {
    onboardingScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    updateSlider();
    applyTheme(); 
  }

  function startGame() {
    // Migration des anciennes sauvegardes
    if (!navi.unlockedBackgrounds) navi.unlockedBackgrounds = ['bg-default'];
    if (!navi.currentBackground) navi.currentBackground = 'bg-default';

    onboardingScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    petNameDisplay.textContent = navi.name || "NaviPet";
    applyTheme();
    updateUI();
  }

  // --- ONBOARDING LISTENERS ---
  function updateSlider() {
    const species = SPECIES_DATA[currentSpeciesIndex];
    sliderAvatar.textContent = species.emojis[0]; 
    speciesNameEl.textContent = species.name;
    
    sliderAvatar.classList.remove('anim-idle');
    void sliderAvatar.offsetWidth; // trigger reflow pour relancer l'anim
    sliderAvatar.classList.add('anim-idle');
  }

  slideLeft.addEventListener('click', () => {
    currentSpeciesIndex = (currentSpeciesIndex - 1 + SPECIES_DATA.length) % SPECIES_DATA.length;
    updateSlider();
  });

  slideRight.addEventListener('click', () => {
    currentSpeciesIndex = (currentSpeciesIndex + 1) % SPECIES_DATA.length;
    updateSlider();
  });

  btnAdopt.addEventListener('click', () => {
    const species = SPECIES_DATA[currentSpeciesIndex];
    const petNameInputVal = petNameInput.value.trim() || species.name;
    
    navi = { ...defaultState };
    navi.isAdopted = true;
    navi.species = species.id;
    navi.name = petNameInputVal;
    
    saveData();
    startGame();
    spawnParticle('?');
  });

  // --- GAME LOGIQUE ---
  function getAvatarEmoji() {
    const speciesObj = SPECIES_DATA.find(s => s.id === (navi.species || 'dragon'));
    const emojis = speciesObj ? speciesObj.emojis : SPECIES_DATA[0].emojis;
    
    if (navi.niveau < 5) return emojis[0];
    if (navi.niveau < 10) return emojis[1];
    if (navi.niveau < 15) return emojis[2];
    if (navi.niveau < 20) return emojis[3];
    if (navi.niveau < 25) return emojis[4];
    return emojis[5] || emojis[emojis.length-1];
  }

  function applyTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7;
    if (isNight) {
      document.body.classList.add('theme-night');
      document.body.classList.remove('theme-day');
    } else {
      document.body.classList.add('theme-day');
      document.body.classList.remove('theme-night');
    }
  }

  function updateUI() {
    screenArea.className = navi.currentBackground || 'bg-default';
    updateBar(barFaim, navi.faim);
    updateBar(barJoie, navi.joie);
    updateBar(barEnergie, navi.energie);
    
    // Update XP Bar
    const xpPercentage = (navi.xp / XP_PER_LEVEL) * 100;
    updateBar(barXp, xpPercentage);

    levelDisplay.textContent = `Niv. ${navi.niveau}`;
    coinsDisplay.textContent = navi.coins;

    avatar.classList.remove('anim-idle', 'anim-sleep', 'anim-shake');
    const currentEmoji = getAvatarEmoji();

    if (navi.isSleeping) {
      avatar.textContent = '💤';
      avatar.classList.add('anim-sleep');
      statusMessage.innerHTML = 'Dodo...';
      statusMessage.style.color = '#7f8c8d';
      toggleButtons(true);
      btnSleep.innerHTML = '☀️<br>Réveil';
    } else if (navi.faim <= 0 || navi.joie <= 0) {
      avatar.textContent = '💤';
      avatar.classList.add('anim-shake');
      statusMessage.innerHTML = 'Au secours !';
      statusMessage.style.color = '#c0392b';
      toggleButtons(false);
      btnSleep.innerHTML = '🛏️<br>Dormir';
    } else if (navi.faim <= 25 || navi.joie <= 25) {
      avatar.textContent = currentEmoji;
      avatar.classList.add('anim-shake');
      statusMessage.innerHTML = "J'ai besoin de toi!";
      statusMessage.style.color = '#e74c3c';
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
    if (value <= 25) barElement.classList.add('bar-danger');
    else barElement.classList.remove('bar-danger');
  }

  function toggleButtons(disable) {
    btnWork.disabled = disable; btnWork.style.opacity = disable ? '0.5' : '1';
    btnFeed.disabled = disable; btnFeed.style.opacity = disable ? '0.5' : '1';
    btnPlay.disabled = disable; btnPlay.style.opacity = disable ? '0.5' : '1';
    btnArcade.disabled = disable; btnArcade.style.opacity = disable ? '0.5' : '1';
  }

  function showMessage(msg, color = '#27ae60') {
    statusMessage.innerHTML = msg;
    statusMessage.style.color = color;
    setTimeout(() => { if (!navi.isSleeping && navi.isAdopted) updateUI(); }, 2500);
  }

  function triggerAnimation(animClass) {
    avatar.classList.add(animClass);
    setTimeout(() => {
      avatar.classList.remove(animClass);
      if (!navi.isSleeping) avatar.classList.add('anim-idle');
    }, 500);
  }

  function spawnParticle(emoji, x = null, y = null) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = emoji;
    
    if (x && y) {
      const rect = screenArea.getBoundingClientRect();
      particle.style.left = `${x - rect.left - 10}px`;
      particle.style.top = `${y - rect.top - 10}px`;
    } else {
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
    }

    screenArea.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }

  // --- ACTIONS DU JEU ---
  screenArea.addEventListener('click', (e) => {
    if(!navi.isAdopted) return;
    if (navi.isSleeping) { spawnParticle('💤', e.clientX, e.clientY); return; }
    
    navi.joie = Math.min(MAX_STAT, navi.joie + 2);
    navi.xp += 5;
    
    if (navi.xp >= XP_PER_LEVEL) {
      navi.niveau++;
      navi.xp = 0;
      showMessage('Niveau Sup ! ✨', '#9b59b6');
      triggerAnimation('anim-eat');
    }
    
    spawnParticle('❤️', e.clientX, e.clientY);
    triggerAnimation('anim-eat'); // eat est un petit rebond mignon
    saveData();
  });

  btnWork.addEventListener('click', () => {
    if (navi.energie < 20) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.energie -= 10; navi.faim -= 15; navi.joie -= 5; navi.coins += 10;
    spawnParticle('💻'); triggerAnimation('anim-idle'); saveData();
      showMessage('+10 DevCoins', '#f1c40f');
  });

  btnFeed.addEventListener('click', () => {
    if (navi.coins < 5) { showMessage('Sans le sou !', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.coins -= 5; navi.faim = Math.min(MAX_STAT, navi.faim + 35); navi.energie -= 2;
    spawnParticle('🍎'); triggerAnimation('anim-eat'); saveData();
  });

  btnPlay.addEventListener('click', () => {
    if (navi.energie < 15) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.joie = Math.min(MAX_STAT, navi.joie + 25); navi.energie -= 8; navi.faim -= 10;
    spawnParticle('?'); triggerAnimation('anim-idle'); saveData();
  });

  btnSleep.addEventListener('click', () => {
    navi.isSleeping = !navi.isSleeping;
    if (!navi.isSleeping) { spawnParticle('☀️'); showMessage('Bonjour !', '#2ecc71'); } 
    else { spawnParticle('💤'); }
    saveData();
  });

  btnArcade.addEventListener('click', () => {
    if (navi.energie < 10) { 
      showMessage('Trop fatigué...', '#e74c3c'); 
      triggerAnimation('anim-shake');
      return; 
    }
    gameScreen.classList.add('hidden');
    arcadeScreen.classList.remove('hidden');
    startMiniGame();
  });

  // --- LOGIQUE DU MINI-JEU : CHASSE AUX BUGS ---
  function startMiniGame() {
    mgTimeLeft = 15;
    mgCurrentScore = 0;
    mgTimer.textContent = mgTimeLeft;
    mgScore.textContent = mgCurrentScore;
    mgArea.innerHTML = '';
    
    // Timer principal
    mgInterval = setInterval(() => {
      mgTimeLeft--;
      mgTimer.textContent = mgTimeLeft;
      if (mgTimeLeft <= 0) endMiniGame();
    }, 1000);

    // Apparition des bugs
    mgSpawnInterval = setInterval(spawnBug, 600);
  }

  function spawnBug() {
    const bug = document.createElement('div');
    bug.textContent = '🐛';
    bug.style.position = 'absolute';
    bug.style.fontSize = '24px';
    bug.style.userSelect = 'none';
    
    // Position aléatoire dans la zone
    const maxX = mgArea.clientWidth - 30;
    const maxY = mgArea.clientHeight - 30;
    bug.style.left = Math.random() * maxX + 'px';
    bug.style.top = Math.random() * maxY + 'px';
    
    // Clic pour écraser le bug
    bug.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      mgCurrentScore++;
      mgScore.textContent = mgCurrentScore;
      bug.textContent = '💥';
      setTimeout(() => bug.remove(), 200);
    });
    
    mgArea.appendChild(bug);
    
    // Le bug disparait si on n'est pas assez rapide
    setTimeout(() => { if (bug.parentNode) bug.remove(); }, 1000); 
  }

  function endMiniGame() {
    clearInterval(mgInterval);
    clearInterval(mgSpawnInterval);
    mgArea.innerHTML = `<div style="color:white; margin-top:80px; font-size:12px;">Terminé !<br><br>Score : ${mgCurrentScore}<br><br><span style="color:#f1c40f; font-size:16px;">+${Math.floor(mgCurrentScore / 2)} 🪙</span></div>`;
    
    // Récompense : 1 coin tous les 2 bugs, et de la joie
    const coinsWon = Math.floor(mgCurrentScore / 2);
    navi.coins += coinsWon;
    navi.energie = Math.max(0, navi.energie - 10);
    navi.joie = Math.min(MAX_STAT, navi.joie + 15);
    
    if (coinsWon > 0) {
      setTimeout(() => {
        arcadeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        saveData();
        showMessage(`+${coinsWon} 🪙 gagnés !`, '#f1c40f');
      }, 2500);
    } else {
      setTimeout(() => {
        arcadeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        saveData();
      }, 2000);
    }
  }

  btnMgQuit.addEventListener('click', () => {
    clearInterval(mgInterval);
    clearInterval(mgSpawnInterval);
    arcadeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  });

  // --- LOGIQUE BOUTIQUE ---
  function openShop() {
    gameScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopCoins.textContent = navi.coins;
    renderShopItems();
  }

  function renderShopItems() {
    shopItemsContainer.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const isUnlocked = navi.unlockedBackgrounds.includes(item.id);
      const isEquipped = navi.currentBackground === item.id;
      
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '10px';
      div.style.backgroundColor = isEquipped ? '#2ecc71' : 'var(--panel-bg)';
      div.style.border = '2px solid var(--border-color)';
      div.style.borderRadius = '5px';
      div.style.color = 'var(--text-color)';

      const info = document.createElement('div');
      info.style.textAlign = 'left';
      info.style.fontSize = '9px';
      info.innerHTML = "<span style=\"font-size:16px;\">" + item.icon + "</span><br>" + item.name;

      const btn = document.createElement('button');
      btn.style.fontFamily = 'inherit';
      btn.style.fontSize = '8px';
      btn.style.padding = '8px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '3px';

      if (isEquipped) {
        btn.textContent = 'Équipé';
        btn.disabled = true;
      } else if (isUnlocked) {
        btn.textContent = 'Équiper';
        btn.style.backgroundColor = '#3498db';
        btn.style.color = 'white';
        btn.onclick = () => {
          navi.currentBackground = item.id;
          saveData();
          renderShopItems();
        };
      } else {
        btn.textContent = item.price + ' 🪙';
        btn.style.backgroundColor = navi.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled = navi.coins < item.price;
        btn.onclick = () => {
          if (navi.coins >= item.price) {
            navi.coins -= item.price;
            navi.unlockedBackgrounds.push(item.id);
            navi.currentBackground = item.id;
            saveData();
            shopCoins.textContent = navi.coins;
            renderShopItems();
          }
        };
      }

      div.appendChild(info);
      div.appendChild(btn);
      shopItemsContainer.appendChild(div);
    });
  }

  btnShop.addEventListener('click', openShop);
  btnShopQuit.addEventListener('click', () => {
    shopScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateUI();
  });

  btnReset.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      // Recharge la fenêtre, ce qui revient à l'écran d'adoption (isAdopted = false)
      window.location.reload();
    });
  });

  // Init
  loadData();
});

















