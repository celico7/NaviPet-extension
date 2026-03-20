document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // --- DONNEES DES ESPECES ---
  // ============================================================
  const SPECIES_DATA = [
    { id: 'dragon', name: 'Dragon',  emojis: ['🥚', '🦎', '🐉', '🐉', '🐉', '🐉'] },
    { id: 'dog',    name: 'Chien',   emojis: ['🐶', '🐕', '🐕', '🐕', '🐕', '🐕'] },
    { id: 'cat',    name: 'Chat',    emojis: ['🐱', '🐈', '🐈', '🐈', '🐈', '🐈'] },
    { id: 'robot',  name: 'Robot',   emojis: ['📦', '🤖', '👾', '👾', '👾', '👾'] },
    { id: 'plant',  name: 'Plante',  emojis: ['🌱', '🌿', '🪴', '🌳', '🌳', '🌸'] }
  ];
  let currentSpeciesIndex = 0;

  // ============================================================
  // --- CONSTANTES ---
  // ============================================================
  const XP_PER_LEVEL = 100;
  const DECAY_RATE_MINUTES = 5;
  const DECAY_AMOUNT = 5;
  const MAX_STAT = 100;

  // ============================================================
  // --- DONNÉES BOUTIQUE : FONDS D'ÉCRAN ---
  // ============================================================
  const SHOP_BACKGROUNDS = [
    { id: 'bg-default', name: 'Pièce Simple',       price: 0,   icon: '🏠', extraHtml: '' },
    { id: 'bg-forest',  name: 'Forêt Magique',      price: 50,  icon: '🌲', extraHtml: '<div style="position:absolute;bottom:5px;left:10px;font-size:24px;pointer-events:none;">🍄</div><div style="position:absolute;bottom:5px;right:15px;font-size:32px;pointer-events:none;">🏕️</div><div style="position:absolute;top:10px;right:30px;font-size:20px;pointer-events:none;opacity:0.7;">☁️</div>' },
    { id: 'bg-beach',   name: 'Plage Ensoleillée',  price: 100, icon: '🏖️', extraHtml: '<div style="position:absolute;top:10px;right:10px;font-size:32px;pointer-events:none;">☀️</div><div style="position:absolute;bottom:5px;left:20px;font-size:28px;pointer-events:none;">🐚</div><div style="position:absolute;bottom:5px;right:20px;font-size:24px;pointer-events:none;">🦀</div>' },
    { id: 'bg-hacker',  name: 'Bureau Hacker',      price: 150, icon: '💻', extraHtml: '<div style="position:absolute;top:50%;left:5px;font-size:24px;pointer-events:none;">🖥️</div><div style="position:absolute;bottom:5px;right:10px;font-size:20px;pointer-events:none;">☕</div><div style="position:absolute;top:10px;left:20px;color:#2ecc71;font-size:10px;font-family:monospace;pointer-events:none;">>_ hello_world<br>>_ hack.sh</div>' },
    { id: 'bg-space',   name: 'Station Spatiale',   price: 300, icon: '🚀', extraHtml: '<div style="position:absolute;top:15px;left:15px;font-size:24px;pointer-events:none;animation:bob 4s infinite;">🛸</div><div style="position:absolute;bottom:20px;right:20px;font-size:32px;pointer-events:none;">🪐</div><div style="position:absolute;top:30px;right:40px;font-size:12px;pointer-events:none;color:yellow;">⭐</div>' }
  ];

  // ============================================================
  // --- DONNÉES BOUTIQUE : NOURRITURE PREMIUM ---
  // ============================================================
  const SHOP_FOOD = [
    { id: 'food-apple',    name: 'Pomme',          price: 5,   icon: '🍎', faim: +35, joie: 0,   energie: -2,  desc: 'Le classique' },
    { id: 'food-pizza',    name: 'Pizza',           price: 15,  icon: '🍕', faim: +60, joie: +10, energie: -3,  desc: '+10 Joie bonus !' },
    { id: 'food-sushi',    name: 'Sushi',           price: 20,  icon: '🍣', faim: +50, joie: +15, energie: +5,  desc: '+5 Énergie bonus !' },
    { id: 'food-ramen',    name: 'Ramen',           price: 25,  icon: '🍜', faim: +70, joie: +5,  energie: +10, desc: 'Très nourrissant !' },
    { id: 'food-cake',     name: 'Gâteau d\'anniv', price: 50,  icon: '🎂', faim: +40, joie: +40, energie: +20, desc: 'Pour les occasions ✨' },
    { id: 'food-coffee',   name: 'Café Turbo',      price: 30,  icon: '☕', faim: -5,  joie: +5,  energie: +50, desc: 'Boost d\'énergie max !' },
  ];

  // ============================================================
  // --- DONNÉES BOUTIQUE : ACCESSOIRES ---
  // ============================================================
  const SHOP_ACCESSORIES = [
    { id: 'acc-none',       name: 'Aucun',          price: 0,   icon: '✖️',  emoji: '',   desc: 'Retirer l\'accessoire' },
    { id: 'acc-hat',        name: 'Chapeau 🎩',     price: 80,  icon: '🎩',  emoji: '🎩', desc: 'Très élégant !' },
    { id: 'acc-sunglasses', name: 'Lunettes 🕶️',   price: 60,  icon: '🕶️',  emoji: '🕶️', desc: 'Trop stylé' },
    { id: 'acc-crown',      name: 'Couronne 👑',    price: 200, icon: '👑',  emoji: '👑', desc: 'Royauté assurée !' },
    { id: 'acc-bow',        name: 'Nœud papillon',  price: 40,  icon: '🎀',  emoji: '🎀', desc: 'Mignon au max' },
    { id: 'acc-ninja',      name: 'Masque ninja',   price: 120, icon: '🥷',  emoji: '🥷', desc: 'Mode furtif activé' },
    { id: 'acc-santa',      name: 'Chapeau Père Noël', price: 150, icon: '🎅', emoji: '🎅', desc: 'Ho ho ho !' },
  ];

  // ============================================================
  // --- ÉTAT PAR DÉFAUT ---
  // ============================================================
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
    unlockedAccessories: ['acc-none'],
    currentAccessory: 'acc-none',
    lastSaved: Date.now()
  };

  let navi = {};

  // ============================================================
  // --- ÉLÉMENTS DOM ---
  // ============================================================
  const onboardingScreen  = document.getElementById('onboarding-screen');
  const gameScreen        = document.getElementById('game-screen');
  const shopScreen        = document.getElementById('shop-screen');
  const arcadeScreen      = document.getElementById('arcade-screen');
  const memoryScreen      = document.getElementById('memory-screen');

  const slideLeft         = document.getElementById('slide-left');
  const slideRight        = document.getElementById('slide-right');
  const sliderAvatar      = document.getElementById('slider-avatar');
  const speciesNameEl     = document.getElementById('species-name');
  const petNameInput      = document.getElementById('pet-name-input');
  const btnAdopt          = document.getElementById('btn-adopt');

  const avatar            = document.getElementById('avatar');
  const accessoryLayer    = document.getElementById('accessory-layer');
  const screenArea        = document.getElementById('screen-area');
  const barFaim           = document.getElementById('bar-faim');
  const barJoie           = document.getElementById('bar-joie');
  const barEnergie        = document.getElementById('bar-energie');
  const barXp             = document.getElementById('bar-xp');
  const levelDisplay      = document.getElementById('level-display');
  const coinsDisplay      = document.getElementById('coins-display');
  const petNameDisplay    = document.getElementById('pet-name-display');
  const statusMessage     = document.getElementById('status-message');

  const btnWork           = document.getElementById('btn-work');
  const btnFeed           = document.getElementById('btn-feed');
  const btnPlay           = document.getElementById('btn-play');
  const btnSleep          = document.getElementById('btn-sleep');
  const btnArcade         = document.getElementById('btn-arcade');
  const btnReset          = document.getElementById('btn-reset');
  const btnShop           = document.getElementById('btn-shop');

  // Boutique
  const shopTabBgs        = document.getElementById('shop-tab-bgs');
  const shopTabFood       = document.getElementById('shop-tab-food');
  const shopTabAcc        = document.getElementById('shop-tab-acc');
  const shopItemsContainer = document.getElementById('shop-items');
  const shopCoins         = document.getElementById('shop-coins');
  const btnShopQuit       = document.getElementById('btn-shop-quit');
  let currentShopTab      = 'bgs';

  // Mini-jeu Chasse aux Bugs
  const mgTimer           = document.getElementById('mg-timer');
  const mgScore           = document.getElementById('mg-score');
  const mgArea            = document.getElementById('mg-area');
  const btnMgQuit         = document.getElementById('btn-mg-quit');
  let mgInterval, mgSpawnInterval, mgTimeLeft, mgCurrentScore;

  // Mini-jeu Memory
  const memoryGrid        = document.getElementById('memory-grid');
  const memoryStatus      = document.getElementById('memory-status');
  const btnMemoryQuit     = document.getElementById('btn-memory-quit');
  let memoryCards         = [];
  let memoryFlipped       = [];
  let memoryMatched       = 0;
  let memoryLocked        = false;

  // ============================================================
  // --- INIT & SAUVEGARDE ---
  // ============================================================
  function loadData() {
    chrome.storage.local.get(['naviState'], (result) => {
      if (result.naviState && result.naviState.isAdopted) {
        navi = result.naviState;
        // Migration accessoires (si ancienne save)
        if (!navi.unlockedAccessories) navi.unlockedAccessories = ['acc-none'];
        if (!navi.currentAccessory)    navi.currentAccessory    = 'acc-none';
        if (!navi.unlockedBackgrounds) navi.unlockedBackgrounds = ['bg-default'];
        if (!navi.currentBackground)   navi.currentBackground   = 'bg-default';

        // Calcul dégradation hors-ligne
        const now = Date.now();
        const elapsedMinutes = (now - navi.lastSaved) / (1000 * 60);
        if (elapsedMinutes >= DECAY_RATE_MINUTES) {
          const cycles = Math.floor(elapsedMinutes / DECAY_RATE_MINUTES);
          if (navi.isSleeping) {
            navi.energie = Math.min(MAX_STAT, navi.energie + (cycles * 15));
            navi.faim    = Math.max(0, navi.faim - (cycles * 2));
          } else {
            navi.xp = (navi.xp || 0) + (cycles * 2);
            while (navi.xp >= XP_PER_LEVEL) { navi.niveau++; navi.xp -= XP_PER_LEVEL; }
            navi.faim    = Math.max(0, navi.faim    - (cycles * DECAY_AMOUNT));
            navi.joie    = Math.max(0, navi.joie    - (cycles * DECAY_AMOUNT));
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
    if (!navi.isAdopted) return;
    navi.lastSaved = Date.now();
    chrome.storage.local.set({ naviState: navi });
    updateUI();
  }

  // ============================================================
  // --- GESTION DES ÉCRANS ---
  // ============================================================
  function hideAllScreens() {
    [onboardingScreen, gameScreen, shopScreen, arcadeScreen, memoryScreen].forEach(s => {
      if (s) s.classList.add('hidden');
    });
  }

  function showOnboarding() {
    hideAllScreens();
    onboardingScreen.classList.remove('hidden');
    updateSlider();
    applyTheme();
  }

  function startGame() {
    hideAllScreens();
    gameScreen.classList.remove('hidden');
    petNameDisplay.textContent = navi.name || 'NaviPet';
    applyTheme();
    updateUI();
    listenForTabReactions();
  }

  // ============================================================
  // --- ONBOARDING ---
  // ============================================================
  function updateSlider() {
    const species = SPECIES_DATA[currentSpeciesIndex];
    sliderAvatar.textContent = species.emojis[0];
    speciesNameEl.textContent = species.name;
    sliderAvatar.classList.remove('anim-idle');
    void sliderAvatar.offsetWidth;
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
    navi = { ...defaultState };
    navi.isAdopted = true;
    navi.species   = species.id;
    navi.name      = petNameInput.value.trim() || species.name;
    saveData();
    startGame();
    spawnParticle('🎉');
  });

  // ============================================================
  // --- LOGIQUE PRINCIPALE ---
  // ============================================================
  function getAvatarEmoji() {
    const speciesObj = SPECIES_DATA.find(s => s.id === (navi.species || 'dragon'));
    const emojis = speciesObj ? speciesObj.emojis : SPECIES_DATA[0].emojis;
    if (navi.niveau < 5)  return emojis[0];
    if (navi.niveau < 10) return emojis[1];
    if (navi.niveau < 15) return emojis[2];
    if (navi.niveau < 20) return emojis[3];
    if (navi.niveau < 25) return emojis[4];
    return emojis[5] || emojis[emojis.length - 1];
  }

  function applyTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7;
    document.body.classList.toggle('theme-night', isNight);
    document.body.classList.toggle('theme-day', !isNight);
  }

  function updateUI() {
    // Background
    screenArea.className = navi.currentBackground || 'bg-default';
    const currentBgItem = SHOP_BACKGROUNDS.find(i => i.id === (navi.currentBackground || 'bg-default'));
    let overlay = document.getElementById('bg-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bg-overlay';
      Object.assign(overlay.style, { position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:'1' });
      screenArea.insertBefore(overlay, screenArea.firstChild);
    }
    overlay.innerHTML = currentBgItem?.extraHtml || '';

    // Accessoire
    const accData = SHOP_ACCESSORIES.find(a => a.id === (navi.currentAccessory || 'acc-none'));
    if (accessoryLayer) {
      accessoryLayer.textContent = accData?.emoji || '';
      accessoryLayer.style.display = accData?.emoji ? 'block' : 'none';
    }

    // Stats bars
    updateBar(barFaim,    navi.faim);
    updateBar(barJoie,    navi.joie);
    updateBar(barEnergie, navi.energie);
    updateBar(barXp,      (navi.xp / XP_PER_LEVEL) * 100);

    levelDisplay.textContent  = `Niv. ${navi.niveau}`;
    coinsDisplay.textContent  = navi.coins;

    // Avatar + animations + statut
    avatar.classList.remove('anim-idle', 'anim-sleep', 'anim-shake');
    const currentEmoji = getAvatarEmoji();

    if (navi.isSleeping) {
      avatar.textContent = '💤';
      avatar.classList.add('anim-sleep');
      statusMessage.innerHTML   = 'Dodo...';
      statusMessage.style.color = '#7f8c8d';
      toggleButtons(true);
      btnSleep.innerHTML = '☀️<br>Réveil';
    } else if (navi.faim <= 0 || navi.joie <= 0) {
      avatar.textContent = currentEmoji;
      avatar.classList.add('anim-shake');
      statusMessage.innerHTML   = '🚨 Au secours !';
      statusMessage.style.color = '#c0392b';
      toggleButtons(false);
      btnSleep.innerHTML = '🛏️<br>Dormir';
    } else if (navi.faim <= 25 || navi.joie <= 25) {
      avatar.textContent = currentEmoji;
      avatar.classList.add('anim-shake');
      statusMessage.innerHTML   = "J'ai besoin de toi !";
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

    setBarDanger(barFaim,    navi.faim);
    setBarDanger(barJoie,    navi.joie);
    setBarDanger(barEnergie, navi.energie);
  }

  function updateBar(el, val)          { if (el) el.style.width = `${Math.max(0, Math.min(100, val))}%`; }
  function setBarDanger(el, val)       { if (el) el.classList.toggle('bar-danger', val <= 25); }
  function toggleButtons(disable) {
    [btnWork, btnFeed, btnPlay, btnArcade].forEach(b => {
      if (b) { b.disabled = disable; b.style.opacity = disable ? '0.5' : '1'; }
    });
  }

  function showMessage(msg, color = '#27ae60') {
    statusMessage.innerHTML   = msg;
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
    particle.className    = 'particle';
    particle.textContent  = emoji;
    if (x && y) {
      const rect = screenArea.getBoundingClientRect();
      particle.style.left = `${x - rect.left - 10}px`;
      particle.style.top  = `${y - rect.top  - 10}px`;
    } else {
      particle.style.left      = '50%';
      particle.style.top       = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
    }
    screenArea.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }

  // ============================================================
  // --- ACTIONS JEUX ---
  // ============================================================
  screenArea.addEventListener('click', (e) => {
    if (!navi.isAdopted) return;
    if (navi.isSleeping) { spawnParticle('💤', e.clientX, e.clientY); return; }
    navi.joie  = Math.min(MAX_STAT, navi.joie + 2);
    navi.xp   += 5;
    if (navi.xp >= XP_PER_LEVEL) {
      navi.niveau++;
      navi.xp = 0;
      showMessage('Niveau Sup ! ✨', '#9b59b6');
      triggerAnimation('anim-eat');
    }
    spawnParticle('❤️', e.clientX, e.clientY);
    triggerAnimation('anim-eat');
    saveData();
  });

  btnWork.addEventListener('click', () => {
    if (navi.energie < 20) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.energie -= 10; navi.faim -= 15; navi.joie -= 5; navi.coins += 10;
    spawnParticle('💻'); triggerAnimation('anim-idle'); saveData();
    showMessage('+10 DevCoins 🪙', '#f1c40f');
  });

  // Bouton nourrir = ouvrir menu nourriture rapide
  btnFeed.addEventListener('click', () => {
    openShop('food');
  });

  btnPlay.addEventListener('click', () => {
    if (navi.energie < 15) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.joie    = Math.min(MAX_STAT, navi.joie + 25);
    navi.energie -= 8;
    navi.faim    -= 10;
    spawnParticle('⚽'); triggerAnimation('anim-idle'); saveData();
  });

  btnSleep.addEventListener('click', () => {
    navi.isSleeping = !navi.isSleeping;
    if (!navi.isSleeping) { spawnParticle('☀️'); showMessage('Bonjour !', '#2ecc71'); }
    else { spawnParticle('💤'); }
    saveData();
  });

  // ============================================================
  // --- BOUTIQUE ---
  // ============================================================
  function openShop(tab = 'bgs') {
    currentShopTab = tab;
    hideAllScreens();
    shopScreen.classList.remove('hidden');
    shopCoins.textContent = navi.coins;
    renderShopTab(currentShopTab);
    updateShopTabUI();
  }

  function updateShopTabUI() {
    [shopTabBgs, shopTabFood, shopTabAcc].forEach(t => t && t.classList.remove('tab-active'));
    if (currentShopTab === 'bgs'  && shopTabBgs)  shopTabBgs.classList.add('tab-active');
    if (currentShopTab === 'food' && shopTabFood)  shopTabFood.classList.add('tab-active');
    if (currentShopTab === 'acc'  && shopTabAcc)   shopTabAcc.classList.add('tab-active');
  }

  function renderShopTab(tab) {
    shopItemsContainer.innerHTML = '';
    shopCoins.textContent = navi.coins;

    if (tab === 'bgs')  renderBackgrounds();
    if (tab === 'food') renderFood();
    if (tab === 'acc')  renderAccessories();
  }

  // --- Fonds d'écran ---
  function renderBackgrounds() {
    SHOP_BACKGROUNDS.forEach(item => {
      const isUnlocked = navi.unlockedBackgrounds.includes(item.id);
      const isEquipped = navi.currentBackground === item.id;
      const div = createShopRow(item.icon, item.name, isEquipped ? '#2ecc71' : 'var(--panel-bg)');

      const btn = createShopBtn();
      if (isEquipped) {
        btn.textContent  = '✓ Équipé';
        btn.disabled     = true;
        btn.style.background = '#27ae60';
        btn.style.color  = 'white';
      } else if (isUnlocked) {
        btn.textContent  = 'Équiper';
        btn.style.background = '#3498db';
        btn.style.color  = 'white';
        btn.onclick = () => { navi.currentBackground = item.id; saveData(); renderShopTab('bgs'); };
      } else {
        btn.textContent  = `${item.price} 🪙`;
        btn.style.background = navi.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled     = navi.coins < item.price;
        btn.onclick = () => {
          if (navi.coins >= item.price) {
            navi.coins -= item.price;
            navi.unlockedBackgrounds.push(item.id);
            navi.currentBackground = item.id;
            saveData(); renderShopTab('bgs');
          }
        };
      }
      div.appendChild(btn);
      shopItemsContainer.appendChild(div);
    });
  }

  // --- Nourriture ---
  function renderFood() {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'font-size:8px;color:var(--border-color);margin-bottom:8px;text-align:center;';
    infoDiv.textContent = 'Acheter = utiliser immédiatement !';
    shopItemsContainer.appendChild(infoDiv);

    SHOP_FOOD.forEach(item => {
      const canAfford = navi.coins >= item.price;
      const div = createShopRow(item.icon, `${item.name} — ${item.desc}`, 'var(--panel-bg)');

      const btn = createShopBtn();
      btn.textContent  = `${item.price} 🪙`;
      btn.style.background = canAfford ? '#2ecc71' : '#bdc3c7';
      btn.style.color  = 'white';
      btn.disabled     = !canAfford;
      btn.onclick = () => {
        if (navi.coins >= item.price) {
          navi.coins   -= item.price;
          navi.faim    = Math.min(MAX_STAT, navi.faim    + (item.faim    || 0));
          navi.joie    = Math.min(MAX_STAT, Math.max(0, navi.joie + (item.joie    || 0)));
          navi.energie = Math.min(MAX_STAT, Math.max(0, navi.energie + (item.energie || 0)));
          saveData();
          spawnParticle(item.icon);
          triggerAnimation('anim-eat');
          showMessage(`${item.icon} Miam !`, '#2ecc71');
          renderShopTab('food');
        }
      };
      div.appendChild(btn);
      shopItemsContainer.appendChild(div);
    });
  }

  // --- Accessoires ---
  function renderAccessories() {
    SHOP_ACCESSORIES.forEach(item => {
      const isUnlocked = navi.unlockedAccessories.includes(item.id);
      const isEquipped = navi.currentAccessory === item.id;
      const div = createShopRow(item.icon, `${item.name} — ${item.desc}`, isEquipped ? '#a29bfe' : 'var(--panel-bg)');

      const btn = createShopBtn();
      if (isEquipped) {
        btn.textContent  = '✓ Porté';
        btn.disabled     = true;
        btn.style.background = '#6c5ce7';
        btn.style.color  = 'white';
      } else if (isUnlocked) {
        btn.textContent  = 'Porter';
        btn.style.background = '#a29bfe';
        btn.style.color  = 'white';
        btn.onclick = () => { navi.currentAccessory = item.id; saveData(); renderShopTab('acc'); };
      } else {
        btn.textContent  = `${item.price} 🪙`;
        btn.style.background = navi.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled     = navi.coins < item.price;
        btn.onclick = () => {
          if (navi.coins >= item.price) {
            navi.coins -= item.price;
            navi.unlockedAccessories.push(item.id);
            navi.currentAccessory = item.id;
            saveData(); renderShopTab('acc');
          }
        };
      }
      div.appendChild(btn);
      shopItemsContainer.appendChild(div);
    });
  }

  function createShopRow(icon, label, bgColor) {
    const div = document.createElement('div');
    div.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:10px;background-color:${bgColor};border:2px solid var(--border-color);border-radius:5px;gap:8px;`;
    const info = document.createElement('div');
    info.style.cssText = 'text-align:left;font-size:9px;flex-grow:1;';
    info.innerHTML = `<span style="font-size:18px;">${icon}</span><br>${label}`;
    div.appendChild(info);
    return div;
  }

  function createShopBtn() {
    const btn = document.createElement('button');
    btn.style.cssText = 'font-family:inherit;font-size:8px;padding:8px;cursor:pointer;border-radius:3px;border:1px solid rgba(0,0,0,0.2);white-space:nowrap;';
    return btn;
  }

  // Onglets boutique
  if (shopTabBgs)  shopTabBgs.addEventListener('click',  () => { currentShopTab = 'bgs';  updateShopTabUI(); renderShopTab('bgs'); });
  if (shopTabFood) shopTabFood.addEventListener('click', () => { currentShopTab = 'food'; updateShopTabUI(); renderShopTab('food'); });
  if (shopTabAcc)  shopTabAcc.addEventListener('click',  () => { currentShopTab = 'acc';  updateShopTabUI(); renderShopTab('acc'); });

  btnShop.addEventListener('click', () => openShop('bgs'));
  btnShopQuit.addEventListener('click', () => { hideAllScreens(); gameScreen.classList.remove('hidden'); updateUI(); });

  // ============================================================
  // --- MINI-JEU 1 : CHASSE AUX BUGS ---
  // ============================================================
  btnArcade.addEventListener('click', () => {
    if (navi.energie < 10) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    openArcadeMenu();
  });

  function openArcadeMenu() {
    hideAllScreens();
    arcadeScreen.classList.remove('hidden');
    // Montrer le menu choix mini-jeux
    const arcadeMenu = document.getElementById('arcade-menu');
    const bugGameArea = document.getElementById('bug-game-area');
    if (arcadeMenu) arcadeMenu.classList.remove('hidden');
    if (bugGameArea) bugGameArea.classList.add('hidden');
  }

  document.getElementById('btn-start-bugs')?.addEventListener('click', () => {
    document.getElementById('arcade-menu')?.classList.add('hidden');
    document.getElementById('bug-game-area')?.classList.remove('hidden');
    startMiniGame();
  });

  document.getElementById('btn-start-memory')?.addEventListener('click', () => {
    hideAllScreens();
    memoryScreen.classList.remove('hidden');
    startMemoryGame();
  });

  function startMiniGame() {
    mgTimeLeft = 15; mgCurrentScore = 0;
    mgTimer.textContent = mgTimeLeft; mgScore.textContent = mgCurrentScore;
    mgArea.innerHTML = '';
    mgInterval      = setInterval(() => { mgTimeLeft--; mgTimer.textContent = mgTimeLeft; if (mgTimeLeft <= 0) endMiniGame(); }, 1000);
    mgSpawnInterval = setInterval(spawnBug, 600);
  }

  function spawnBug() {
    const bug = document.createElement('div');
    bug.textContent = '🐛';
    bug.style.cssText = `position:absolute;font-size:24px;user-select:none;cursor:pointer;left:${Math.random() * (mgArea.clientWidth - 30)}px;top:${Math.random() * (mgArea.clientHeight - 30)}px;`;
    bug.addEventListener('mousedown', (e) => {
      e.stopPropagation(); mgCurrentScore++; mgScore.textContent = mgCurrentScore;
      bug.textContent = '💥'; setTimeout(() => bug.remove(), 200);
    });
    mgArea.appendChild(bug);
    setTimeout(() => { if (bug.parentNode) bug.remove(); }, 1000);
  }

  function endMiniGame() {
    clearInterval(mgInterval); clearInterval(mgSpawnInterval);
    const coinsWon = Math.floor(mgCurrentScore / 2);
    mgArea.innerHTML = `<div style="color:white;margin-top:60px;font-size:12px;">Terminé !<br><br>Score : ${mgCurrentScore}<br><br><span style="color:#f1c40f;font-size:16px;">+${coinsWon} 🪙</span></div>`;
    navi.coins += coinsWon; navi.energie = Math.max(0, navi.energie - 10); navi.joie = Math.min(MAX_STAT, navi.joie + 15);
    setTimeout(() => { hideAllScreens(); gameScreen.classList.remove('hidden'); saveData(); if (coinsWon > 0) showMessage(`+${coinsWon} 🪙 gagnés !`, '#f1c40f'); }, 2500);
  }

  btnMgQuit.addEventListener('click', () => {
    clearInterval(mgInterval); clearInterval(mgSpawnInterval);
    hideAllScreens(); gameScreen.classList.remove('hidden');
  });

  // ============================================================
  // --- MINI-JEU 2 : MEMORY ---
  // ============================================================
  const MEMORY_EMOJIS = ['🐛','🦋','🌺','⭐','🍕','🎮','🚀','💎'];

  function startMemoryGame() {
    memoryMatched = 0; memoryFlipped = []; memoryLocked = false;
    memoryStatus.textContent = 'Retourne les paires ! 🧠';
    memoryStatus.style.color = 'white';

    const all = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5);
    memoryCards = [];
    memoryGrid.innerHTML = '';

    all.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.emoji = emoji;
      card.dataset.index = i;
      card.innerHTML = '<span class="card-front">❓</span><span class="card-back" style="display:none;">' + emoji + '</span>';
      card.addEventListener('click', onMemoryCardClick);
      memoryGrid.appendChild(card);
      memoryCards.push(card);
    });
  }

  function onMemoryCardClick(e) {
    if (memoryLocked) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped')) return;
    if (memoryFlipped.length >= 2) return;

    card.classList.add('flipped');
    card.querySelector('.card-front').style.display = 'none';
    card.querySelector('.card-back').style.display  = 'inline';
    memoryFlipped.push(card);

    if (memoryFlipped.length === 2) {
      memoryLocked = true;
      const [a, b] = memoryFlipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        // Paire trouvée !
        a.style.background = '#2ecc71'; b.style.background = '#2ecc71';
        memoryMatched++;
        memoryFlipped = []; memoryLocked = false;
        if (memoryMatched === MEMORY_EMOJIS.length) endMemoryGame();
      } else {
        setTimeout(() => {
          [a, b].forEach(c => {
            c.classList.remove('flipped');
            c.querySelector('.card-front').style.display = 'inline';
            c.querySelector('.card-back').style.display  = 'none';
            c.style.background = '';
          });
          memoryFlipped = []; memoryLocked = false;
        }, 900);
      }
    }
  }

  function endMemoryGame() {
    const coinsWon = 25;
    memoryStatus.textContent = `🎉 Parfait ! +${coinsWon} 🪙 & +20 Joie !`;
    memoryStatus.style.color = '#f1c40f';
    navi.coins += coinsWon; navi.joie = Math.min(MAX_STAT, navi.joie + 20); navi.energie = Math.max(0, navi.energie - 15);
    setTimeout(() => { hideAllScreens(); gameScreen.classList.remove('hidden'); saveData(); showMessage(`+${coinsWon} 🪙 !`, '#f1c40f'); }, 2500);
  }

  btnMemoryQuit?.addEventListener('click', () => { hideAllScreens(); gameScreen.classList.remove('hidden'); });

  // ============================================================
  // --- RÉACTIONS AUX ONGLETS (via background.js) ---
  // ============================================================
  function listenForTabReactions() {
    if (chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'TAB_REACTION' && msg.message) {
          showMessage(msg.message, '#a29bfe');
          spawnParticle('💬');
        }
      });
    }
  }

  // ============================================================
  // --- RESET ---
  // ============================================================
  btnReset.addEventListener('click', () => {
    chrome.storage.local.clear(() => window.location.reload());
  });

  // ============================================================
  // --- DÉMARRAGE ---
  // ============================================================
  loadData();
});