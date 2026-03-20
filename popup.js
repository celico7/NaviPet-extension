document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // --- DONNEES DES ESPECES ---
  // ============================================================
  const SPECIES_DATA = [
    { id: 'dragon', name: 'Dragon',  emojis: ['🥚', '🦎', '🐉', '🐉', '🐉', '🐉'],  shiny: '✨🐉' },
    { id: 'dog',    name: 'Chien',   emojis: ['🐶', '🐕', '🐕', '🐕', '🐕', '🐕'],   shiny: '⭐🐕' },
    { id: 'cat',    name: 'Chat',    emojis: ['🐱', '🐈', '🐈', '🐈', '🐈', '🐈'],   shiny: '💫🐈' },
    { id: 'robot',  name: 'Robot',   emojis: ['📦', '🤖', '👾', '👾', '👾', '👾'],   shiny: '🌟👾' },
    { id: 'plant',  name: 'Plante',  emojis: ['🌱', '🌿', '🪴', '🌳', '🌳', '🌸'],  shiny: '🌟🌸' }
  ];
  let currentSpeciesIndex = 0;

  // ============================================================
  // --- CONSTANTES ---
  // ============================================================
  const XP_PER_LEVEL   = 100;
  const DECAY_RATE_MIN = 5;
  const DECAY_AMOUNT   = 5;
  const MAX_STAT       = 100;

  // ============================================================
  // --- DONNÉES BOUTIQUE ---
  // ============================================================
  const SHOP_BACKGROUNDS = [
    { id: 'bg-default', name: 'Pièce Simple',      price: 0,   icon: '🏠', extraHtml: '' },
    { id: 'bg-forest',  name: 'Forêt Magique',     price: 50,  icon: '🌲', extraHtml: '<div style="position:absolute;bottom:5px;left:10px;font-size:24px;pointer-events:none;">🍄</div><div style="position:absolute;bottom:5px;right:15px;font-size:32px;pointer-events:none;">🏕️</div><div style="position:absolute;top:10px;right:30px;font-size:20px;pointer-events:none;opacity:0.7;">☁️</div>' },
    { id: 'bg-beach',   name: 'Plage Ensoleillée', price: 100, icon: '🏖️', extraHtml: '<div style="position:absolute;top:10px;right:10px;font-size:32px;pointer-events:none;">☀️</div><div style="position:absolute;bottom:5px;left:20px;font-size:28px;pointer-events:none;">🐚</div><div style="position:absolute;bottom:5px;right:20px;font-size:24px;pointer-events:none;">🦀</div>' },
    { id: 'bg-hacker',  name: 'Bureau Hacker',     price: 150, icon: '💻', extraHtml: '<div style="position:absolute;top:50%;left:5px;font-size:24px;pointer-events:none;">🖥️</div><div style="position:absolute;bottom:5px;right:10px;font-size:20px;pointer-events:none;">☕</div><div style="position:absolute;top:10px;left:20px;color:#2ecc71;font-size:10px;font-family:monospace;pointer-events:none;">>_ hello_world<br>>_ hack.sh</div>' },
    { id: 'bg-space',   name: 'Station Spatiale',  price: 300, icon: '🚀', extraHtml: '<div style="position:absolute;top:15px;left:15px;font-size:24px;pointer-events:none;animation:bob 4s infinite;">🛸</div><div style="position:absolute;bottom:20px;right:20px;font-size:32px;pointer-events:none;">🪐</div><div style="position:absolute;top:30px;right:40px;font-size:12px;pointer-events:none;color:yellow;">⭐</div>' }
  ];

  const SHOP_FOOD = [
    { id: 'food-apple',  name: 'Pomme',           price: 5,  icon: '🍎', faim: +35, joie: 0,   energie: -2,  desc: 'Le classique' },
    { id: 'food-pizza',  name: 'Pizza',            price: 15, icon: '🍕', faim: +60, joie: +10, energie: -3,  desc: '+10 Joie bonus !' },
    { id: 'food-sushi',  name: 'Sushi',            price: 20, icon: '🍣', faim: +50, joie: +15, energie: +5,  desc: '+5 Énergie bonus !' },
    { id: 'food-ramen',  name: 'Ramen',            price: 25, icon: '🍜', faim: +70, joie: +5,  energie: +10, desc: 'Très nourrissant !' },
    { id: 'food-cake',   name: "Gâteau d'anniv",   price: 50, icon: '🎂', faim: +40, joie: +40, energie: +20, desc: 'Pour les occasions ✨' },
    { id: 'food-coffee', name: 'Café Turbo',        price: 30, icon: '☕', faim: -5,  joie: +5,  energie: +50, desc: 'Boost énergie max !' },
  ];

  const SHOP_ACCESSORIES = [
    { id: 'acc-none',       name: 'Aucun',              price: 0,   icon: '✖️',  emoji: '',   desc: "Retirer l'accessoire" },
    { id: 'acc-hat',        name: 'Chapeau',             price: 80,  icon: '🎩',  emoji: '🎩', desc: 'Très élégant !' },
    { id: 'acc-sunglasses', name: 'Lunettes',            price: 60,  icon: '🕶️',  emoji: '🕶️', desc: 'Trop stylé' },
    { id: 'acc-crown',      name: 'Couronne',            price: 200, icon: '👑',  emoji: '👑', desc: 'Royauté assurée !' },
    { id: 'acc-bow',        name: 'Nœud papillon',       price: 40,  icon: '🎀',  emoji: '🎀', desc: 'Mignon au max' },
    { id: 'acc-ninja',      name: 'Masque Ninja',        price: 120, icon: '🥷',  emoji: '🥷', desc: 'Mode furtif activé' },
    { id: 'acc-santa',      name: 'Chapeau Père Noël',   price: 150, icon: '🎅',  emoji: '🎅', desc: 'Ho ho ho !' },
    { id: 'acc-pajama',     name: 'Bonnet de Nuit',      price: 0,   icon: '😴',  emoji: '🌙', desc: 'Auto activé la nuit !' },
  ];

  // ============================================================
  // --- ÉTAT PAR DÉFAUT ---
  // ============================================================
  const defaultState = {
    isAdopted: false,
    name: '',
    species: 'dragon',
    isShiny: false,
    faim: 80,
    joie: 80,
    energie: 100,
    xp: 0,
    niveau: 1,
    coins: 20,
    isSleeping: false,
    unlockedBackgrounds: ['bg-default'],
    currentBackground: 'bg-default',
    unlockedAccessories: ['acc-none', 'acc-pajama'],
    currentAccessory: 'acc-none',
    lastSaved: Date.now()
  };

  let navi = {};

  // ============================================================
  // --- ÉLÉMENTS DOM ---
  // ============================================================
  const onboardingScreen = document.getElementById('onboarding-screen');
  const gameScreen       = document.getElementById('game-screen');
  const shopScreen       = document.getElementById('shop-screen');
  const arcadeScreen     = document.getElementById('arcade-screen');
  const memoryScreen     = document.getElementById('memory-screen');
  const pfcScreen        = document.getElementById('pfc-screen');

  const slideLeft       = document.getElementById('slide-left');
  const slideRight      = document.getElementById('slide-right');
  const sliderAvatar    = document.getElementById('slider-avatar');
  const speciesNameEl   = document.getElementById('species-name');
  const petNameInput    = document.getElementById('pet-name-input');
  const btnAdopt        = document.getElementById('btn-adopt');

  const avatar          = document.getElementById('avatar');
  const accessoryLayer  = document.getElementById('accessory-layer');
  const screenArea      = document.getElementById('screen-area');
  const barFaim         = document.getElementById('bar-faim');
  const barJoie         = document.getElementById('bar-joie');
  const barEnergie      = document.getElementById('bar-energie');
  const barXp           = document.getElementById('bar-xp');
  const levelDisplay    = document.getElementById('level-display');
  const coinsDisplay    = document.getElementById('coins-display');
  const petNameDisplay  = document.getElementById('pet-name-display');
  const statusMessage   = document.getElementById('status-message');
  const moodAura        = document.getElementById('mood-aura');
  const shinyBadge      = document.getElementById('shiny-badge');

  const btnWork         = document.getElementById('btn-work');
  const btnFeed         = document.getElementById('btn-feed');
  const btnPlay         = document.getElementById('btn-play');
  const btnSleep        = document.getElementById('btn-sleep');
  const btnArcade       = document.getElementById('btn-arcade');
  const btnReset        = document.getElementById('btn-reset');
  const btnShop         = document.getElementById('btn-shop');
  const mainControls    = document.getElementById('main-controls');
  const inventoryPanel  = document.getElementById('inventory-panel');
  const inventoryItems  = document.getElementById('inventory-items');
  const inventoryEmpty  = document.getElementById('inventory-empty');
  const btnCloseInv     = document.getElementById('btn-close-inventory');

  const shopTabBgs          = document.getElementById('shop-tab-bgs');
  const shopTabFood         = document.getElementById('shop-tab-food');
  const shopTabAcc          = document.getElementById('shop-tab-acc');
  const shopItemsContainer  = document.getElementById('shop-items');
  const shopCoins           = document.getElementById('shop-coins');
  const btnShopQuit         = document.getElementById('btn-shop-quit');
  let currentShopTab        = 'bgs';

  // Arcade
  const arcadeMenu    = document.getElementById('arcade-menu');
  const bugGameArea   = document.getElementById('bug-game-area');
  const mgTimer       = document.getElementById('mg-timer');
  const mgScore       = document.getElementById('mg-score');
  const mgArea        = document.getElementById('mg-area');
  const btnMgQuit     = document.getElementById('btn-mg-quit');
  let mgInterval, mgSpawnInterval, mgTimeLeft, mgCurrentScore;

  const memoryGrid    = document.getElementById('memory-grid');
  const memoryStatus  = document.getElementById('memory-status');
  const btnMemoryQuit = document.getElementById('btn-memory-quit');
  let memoryFlipped = [], memoryMatched = 0, memoryLocked = false;

  const pfcStatus      = document.getElementById('pfc-status');
  const pfcPlayerEmoji = document.getElementById('pfc-player-emoji');
  const pfcPetEmoji    = document.getElementById('pfc-pet-emoji');
  const pfcResult      = document.getElementById('pfc-result');
  const pfcChoiceBtns  = document.querySelectorAll('.pfc-choice-btn');
  const btnPfcQuit     = document.getElementById('btn-pfc-quit');

  // ============================================================
  // --- INIT & SAUVEGARDE ---
  // ============================================================
  function loadData() {
    chrome.storage.local.get(['naviState'], (result) => {
      if (result.naviState && result.naviState.isAdopted) {
        navi = result.naviState;
        if (!navi.unlockedAccessories) navi.unlockedAccessories = ['acc-none'];
        if (!navi.currentAccessory)    navi.currentAccessory    = 'acc-none';
        if (!navi.unlockedBackgrounds) navi.unlockedBackgrounds = ['bg-default'];
        if (!navi.currentBackground)   navi.currentBackground   = 'bg-default';
        if (navi.isShiny === undefined) navi.isShiny = false;
        if (!navi.inventory)           navi.inventory = {};
        if (!navi.unlockedAccessories.includes('acc-pajama')) {
          navi.unlockedAccessories.push('acc-pajama');
        }

        // Dégradation hors-ligne
        const now = Date.now();
        const elapsedMin = (now - navi.lastSaved) / 60000;
        if (elapsedMin >= DECAY_RATE_MIN) {
          const cycles = Math.floor(elapsedMin / DECAY_RATE_MIN);
          if (navi.isSleeping) {
            navi.energie = Math.min(MAX_STAT, navi.energie + cycles * 15);
            navi.faim    = Math.max(0, navi.faim - cycles * 2);
          } else {
            navi.xp = (navi.xp || 0) + cycles * 2;
            while (navi.xp >= XP_PER_LEVEL) { navi.niveau++; navi.xp -= XP_PER_LEVEL; }
            navi.faim    = Math.max(0, navi.faim    - cycles * DECAY_AMOUNT);
            navi.joie    = Math.max(0, navi.joie    - cycles * DECAY_AMOUNT);
            navi.energie = Math.max(0, navi.energie - cycles * 2);
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
    [onboardingScreen, gameScreen, shopScreen, arcadeScreen, memoryScreen, pfcScreen]
      .forEach(s => { if (s) s.classList.add('hidden'); });
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
    updateMoodAura();
    listenForTabReactions();
    setInterval(updateMoodAura, 30000);

    // Vérifier si le background script a laissé une réaction en attente
    chrome.storage.local.get(['pendingReaction'], (res) => {
      if (res.pendingReaction) {
        setTimeout(() => {
          showMessage(res.pendingReaction, '#a29bfe');
          spawnParticle('💬');
          chrome.storage.local.remove('pendingReaction');
        }, 800);
      }
    });
  }

  // ============================================================
  // --- ONBOARDING ---
  // ============================================================
  function updateSlider() {
    const sp = SPECIES_DATA[currentSpeciesIndex];
    sliderAvatar.textContent  = sp.emojis[0];
    speciesNameEl.textContent = sp.name;
    sliderAvatar.classList.remove('anim-idle');
    void sliderAvatar.offsetWidth;
    sliderAvatar.classList.add('anim-idle');
  }

  slideLeft.addEventListener('click',  () => { currentSpeciesIndex = (currentSpeciesIndex - 1 + SPECIES_DATA.length) % SPECIES_DATA.length; updateSlider(); });
  slideRight.addEventListener('click', () => { currentSpeciesIndex = (currentSpeciesIndex + 1) % SPECIES_DATA.length; updateSlider(); });

  btnAdopt.addEventListener('click', () => {
    const sp = SPECIES_DATA[currentSpeciesIndex];
    navi = { ...defaultState };
    navi.isAdopted = true;
    navi.species   = sp.id;
    navi.name      = petNameInput.value.trim() || sp.name;
    // 🌟 RARETÉ : 1% chance d'être Shiny !
    navi.isShiny   = Math.random() < 0.01;
    saveData();
    startGame();
    if (navi.isShiny) {
      setTimeout(() => {
        showMessage('✨ SHINY ! Rarissime ! ✨', '#f1c40f');
        spawnParticle('⭐'); spawnParticle('✨'); spawnParticle('🌟');
      }, 800);
    } else {
      spawnParticle('🎉');
    }
  });

  // ============================================================
  // --- LOGIQUE PRINCIPALE ---
  // ============================================================
  function getAvatarEmoji() {
    const sp = SPECIES_DATA.find(s => s.id === (navi.species || 'dragon')) || SPECIES_DATA[0];
    if (navi.isShiny && navi.niveau >= 5) return sp.shiny;
    if (navi.niveau < 5)  return sp.emojis[0];
    if (navi.niveau < 10) return sp.emojis[1];
    if (navi.niveau < 15) return sp.emojis[2];
    if (navi.niveau < 20) return sp.emojis[3];
    if (navi.niveau < 25) return sp.emojis[4];
    return sp.emojis[5] || sp.emojis[sp.emojis.length - 1];
  }

  function applyTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7;
    document.body.classList.toggle('theme-night', isNight);
    document.body.classList.toggle('theme-day', !isNight);
    return isNight;
  }

  // 🌈 MOOD RING : aura d'onglets
  function updateMoodAura() {
    if (!navi.isAdopted || !moodAura) return;
    try {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) return;
        const count = tabs.length;
        let color, label;
        if (count <= 3)       { color = 'rgba(52,152,219,0.3)';  label = '😌 Zen'; }
        else if (count <= 10) { color = 'rgba(46,204,113,0.3)';  label = '😊 Focus'; }
        else if (count <= 20) { color = 'rgba(241,196,15,0.4)';  label = '😅 Chargé'; }
        else                  { color = 'rgba(231,76,60,0.5)';   label = '🤯 Chaos!'; }
        moodAura.style.boxShadow = `inset 0 0 30px 10px ${color}`;
        moodAura.title = `${label} (${count} onglets)`;
        if (count > 20 && Math.random() < 0.3) {
          showMessage('🤯 ' + count + ' onglets ?!', '#e74c3c');
        }
      });
    } catch(e) {}
  }

  function updateUI() {
    // Background
    screenArea.className = (navi.currentBackground || 'bg-default') + ' screen-area-base';
    const currentBgItem = SHOP_BACKGROUNDS.find(i => i.id === (navi.currentBackground || 'bg-default'));
    let overlay = document.getElementById('bg-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bg-overlay';
      Object.assign(overlay.style, { position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:'1' });
      screenArea.insertBefore(overlay, screenArea.firstChild);
    }
    overlay.innerHTML = currentBgItem?.extraHtml || '';

    // Accessoire + bonnet auto la nuit
    const isNight = new Date().getHours() >= 19 || new Date().getHours() < 7;
    const accData = SHOP_ACCESSORIES.find(a => a.id === (navi.currentAccessory || 'acc-none'));
    if (accessoryLayer) {
      if (isNight && (!accData || !accData.emoji)) {
        accessoryLayer.textContent = '🌙';
        accessoryLayer.style.display = 'block';
      } else {
        accessoryLayer.textContent   = accData?.emoji || '';
        accessoryLayer.style.display = accData?.emoji ? 'block' : 'none';
      }
    }

    // Badge shiny
    if (shinyBadge) shinyBadge.style.display = navi.isShiny ? 'inline' : 'none';

    // Stats bars
    updateBar(barFaim,    navi.faim);
    updateBar(barJoie,    navi.joie);
    updateBar(barEnergie, navi.energie);
    updateBar(barXp,      (navi.xp / XP_PER_LEVEL) * 100);
    levelDisplay.textContent = `Niv. ${navi.niveau}`;
    coinsDisplay.textContent = navi.coins;

    // Avatar state
    avatar.classList.remove('anim-idle', 'anim-sleep', 'anim-shake', 'anim-shiny');
    const currentEmoji = getAvatarEmoji();

    if (navi.isSleeping) {
      avatar.textContent = '💤';
      avatar.classList.add('anim-sleep');
      statusMessage.innerHTML   = 'Dodo... 💤';
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
      avatar.classList.add(navi.isShiny && navi.niveau >= 5 ? 'anim-shiny' : 'anim-idle');
      statusMessage.innerHTML = navi.isShiny ? '✨ Shiny ✨' : '';
      statusMessage.style.color = '#f1c40f';
      toggleButtons(false);
      btnSleep.innerHTML = '🛏️<br>Dormir';
    }

    setBarDanger(barFaim,    navi.faim);
    setBarDanger(barJoie,    navi.joie);
    setBarDanger(barEnergie, navi.energie);
  }

  function updateBar(el, val)    { if (el) el.style.width = `${Math.max(0, Math.min(100, val))}%`; }
  function setBarDanger(el, val) { if (el) el.classList.toggle('bar-danger', val <= 25); }
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
    const p = document.createElement('div');
    p.className = 'particle'; p.textContent = emoji;
    if (x && y) {
      const rect = screenArea.getBoundingClientRect();
      p.style.left = `${x - rect.left - 10}px`;
      p.style.top  = `${y - rect.top  - 10}px`;
    } else {
      p.style.left = '50%'; p.style.top = '50%';
      p.style.transform = 'translate(-50%,-50%)';
    }
    screenArea.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }

  // ============================================================
  // --- ACTIONS JEUX ---
  // ============================================================
  screenArea.addEventListener('click', (e) => {
    if (!navi.isAdopted) return;
    if (navi.isSleeping) { spawnParticle('💤', e.clientX, e.clientY); return; }
    navi.joie = Math.min(MAX_STAT, navi.joie + 2);
    navi.xp  += 5;
    if (navi.xp >= XP_PER_LEVEL) {
      navi.niveau++; navi.xp = 0;
      showMessage('Niveau Sup ! ✨', '#9b59b6');
      triggerAnimation('anim-eat');
    }
    spawnParticle(navi.isShiny ? '⭐' : '❤️', e.clientX, e.clientY);
    triggerAnimation('anim-eat');
    saveData();
  });

  btnWork.addEventListener('click', () => {
    if (navi.energie < 20) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.energie -= 10; navi.faim -= 15; navi.joie -= 5; navi.coins += 10;
    spawnParticle('💻'); triggerAnimation('anim-idle'); saveData();
    showMessage('+10 DevCoins 🪙', '#f1c40f');
  });

  btnFeed.addEventListener('click', () => {
    if (mainControls) mainControls.classList.add('hidden');
    if (inventoryPanel) inventoryPanel.classList.remove('hidden');
    renderInventory();
  });

  if (btnCloseInv) {
    btnCloseInv.addEventListener('click', () => {
      inventoryPanel.classList.add('hidden');
      mainControls.classList.remove('hidden');
    });
  }

  function renderInventory() {
    if (!inventoryItems) return;
    inventoryItems.innerHTML = '';
    let hasItems = false;
    
    SHOP_FOOD.forEach(foodItem => {
      const count = navi.inventory ? navi.inventory[foodItem.id] : 0;
      if (count > 0) {
        hasItems = true;
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerHTML = `<span style="font-size:16px;">${foodItem.icon}</span><br><span style="font-size:8px;">x${count}</span>`;
        btn.style.cssText = 'padding:5px; gap:2px; height:50px;';
        
        btn.onclick = () => {
          if (navi.inventory[foodItem.id] > 0) {
            navi.inventory[foodItem.id]--;
            navi.faim = Math.min(MAX_STAT, navi.faim + (foodItem.faim || 0));
            navi.joie = Math.min(MAX_STAT, Math.max(0, navi.joie + (foodItem.joie || 0)));
            navi.energie = Math.min(MAX_STAT, Math.max(0, navi.energie + (foodItem.energie || 0)));
            
            spawnParticle(foodItem.icon);
            triggerAnimation('anim-eat');
            showMessage(`${foodItem.icon} Miam !`, '#2ecc71');
            saveData();
            
            if (navi.inventory[foodItem.id] <= 0) {
              renderInventory(); // Re-render pour effacer le bouton si 0
            } else {
              btn.innerHTML = `<span style="font-size:16px;">${foodItem.icon}</span><br><span style="font-size:8px;">x${navi.inventory[foodItem.id]}</span>`;
            }
          }
        };
        inventoryItems.appendChild(btn);
      }
    });

    if (inventoryEmpty) {
      inventoryEmpty.style.display = hasItems ? 'none' : 'block';
    }
  }

  btnPlay.addEventListener('click', () => {
    if (navi.energie < 15) { showMessage('Trop fatigué...', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    navi.joie    = Math.min(MAX_STAT, navi.joie + 25);
    navi.energie -= 8; navi.faim -= 10;
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
    renderShopTab(tab);
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

  function renderBackgrounds() {
    SHOP_BACKGROUNDS.forEach(item => {
      const isUnlocked = navi.unlockedBackgrounds.includes(item.id);
      const isEquipped = navi.currentBackground === item.id;
      const div = createShopRow(item.icon, item.name, isEquipped ? '#2ecc71' : 'var(--panel-bg)');
      const btn = createShopBtn();
      if (isEquipped) {
        btn.textContent = '✓ Équipé'; btn.disabled = true;
        btn.style.background = '#27ae60'; btn.style.color = 'white';
      } else if (isUnlocked) {
        btn.textContent = 'Équiper'; btn.style.background = '#3498db'; btn.style.color = 'white';
        btn.onclick = () => { navi.currentBackground = item.id; saveData(); renderShopTab('bgs'); };
      } else {
        btn.textContent = `${item.price} 🪙`;
        btn.style.background = navi.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled = navi.coins < item.price;
        btn.onclick = () => {
          if (navi.coins >= item.price) {
            navi.coins -= item.price; navi.unlockedBackgrounds.push(item.id);
            navi.currentBackground = item.id; saveData(); renderShopTab('bgs');
          }
        };
      }
      div.appendChild(btn); shopItemsContainer.appendChild(div);
    });
  }

  function renderFood() {
    const info = document.createElement('div');
    info.style.cssText = 'font-size:8px;color:var(--border-color);margin-bottom:8px;text-align:center;';
    info.textContent = 'Acheter = ajouter à l\'inventaire !';
    shopItemsContainer.appendChild(info);
    SHOP_FOOD.forEach(item => {
      const isOwned = (navi.inventory && navi.inventory[item.id] > 0);
      const div = createShopRow(item.icon, `${item.name} — ${item.desc}${isOwned ? '<br><span style="color:#2ecc71;">Possédé: ' + navi.inventory[item.id] + '</span>' : ''}`, 'var(--panel-bg)');
      const btn = createShopBtn();
      btn.textContent = `${item.price} 🪙`;
      btn.style.background = navi.coins >= item.price ? '#2ecc71' : '#bdc3c7';
      btn.style.color = 'white'; btn.disabled = navi.coins < item.price;
      btn.onclick = () => {
        if (navi.coins >= item.price) {
          navi.coins -= item.price;
          if (!navi.inventory) navi.inventory = {};
          navi.inventory[item.id] = (navi.inventory[item.id] || 0) + 1;
          saveData();
          showMessage(`+1 ${item.icon} (Acheté)`, '#f1c40f'); 
          renderShopTab('food');
        }
      };
      div.appendChild(btn); shopItemsContainer.appendChild(div);
    });
  }

  function renderAccessories() {
    SHOP_ACCESSORIES.forEach(item => {
      const isUnlocked = navi.unlockedAccessories.includes(item.id);
      const isEquipped = navi.currentAccessory === item.id;
      const div = createShopRow(item.icon, `${item.name} — ${item.desc}`, isEquipped ? '#a29bfe' : 'var(--panel-bg)');
      const btn = createShopBtn();
      if (isEquipped) {
        btn.textContent = '✓ Porté'; btn.disabled = true;
        btn.style.background = '#6c5ce7'; btn.style.color = 'white';
      } else if (isUnlocked) {
        btn.textContent = 'Porter'; btn.style.background = '#a29bfe'; btn.style.color = 'white';
        btn.onclick = () => { navi.currentAccessory = item.id; saveData(); renderShopTab('acc'); };
      } else {
        btn.textContent = `${item.price} 🪙`;
        btn.style.background = navi.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled = navi.coins < item.price;
        btn.onclick = () => {
          if (navi.coins >= item.price) {
            navi.coins -= item.price; navi.unlockedAccessories.push(item.id);
            navi.currentAccessory = item.id; saveData(); renderShopTab('acc');
          }
        };
      }
      div.appendChild(btn); shopItemsContainer.appendChild(div);
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

  shopTabBgs?.addEventListener('click',  () => { currentShopTab = 'bgs';  updateShopTabUI(); renderShopTab('bgs'); });
  shopTabFood?.addEventListener('click', () => { currentShopTab = 'food'; updateShopTabUI(); renderShopTab('food'); });
  shopTabAcc?.addEventListener('click',  () => { currentShopTab = 'acc';  updateShopTabUI(); renderShopTab('acc'); });
  btnShop.addEventListener('click',      () => openShop('bgs'));
  btnShopQuit.addEventListener('click',  () => { hideAllScreens(); gameScreen.classList.remove('hidden'); updateUI(); });

  // ============================================================
  // --- ARCADE : MENU ---
  // ============================================================
  btnArcade.addEventListener('click', () => {
    if (navi.energie < 10) { showMessage('Trop fatigué pour jouer !', '#e74c3c'); triggerAnimation('anim-shake'); return; }
    openArcadeMenu();
  });

  function openArcadeMenu() {
    hideAllScreens();
    arcadeScreen.classList.remove('hidden');
    arcadeMenu.classList.remove('hidden');
    bugGameArea.classList.add('hidden');
  }

  // Retour vers jeu depuis menu arcade
  btnMgQuit.addEventListener('click', () => {
    clearInterval(mgInterval); clearInterval(mgSpawnInterval);
    hideAllScreens(); gameScreen.classList.remove('hidden'); updateUI();
  });

  // ============================================================
  // --- ARCADE : CHASSE AUX BUGS (CORRIGÉ) ---
  // ============================================================
  document.getElementById('btn-start-bugs').addEventListener('click', () => {
    arcadeMenu.classList.add('hidden');
    bugGameArea.classList.remove('hidden');
    startBugGame(); // ← nom unifié, plus d'ambiguïté
  });

  function startBugGame() {
    mgTimeLeft = 15; mgCurrentScore = 0;
    mgTimer.textContent = mgTimeLeft;
    mgScore.textContent = mgCurrentScore;
    mgArea.innerHTML = '';
    clearInterval(mgInterval); clearInterval(mgSpawnInterval);
    mgInterval      = setInterval(() => { mgTimeLeft--; mgTimer.textContent = mgTimeLeft; if (mgTimeLeft <= 0) endBugGame(); }, 1000);
    mgSpawnInterval = setInterval(spawnBug, 600);
  }

  function spawnBug() {
    const bug = document.createElement('div');
    const isRare = Math.random() < 0.12;
    bug.textContent = isRare ? '🦟' : '🐛';
    const pts = isRare ? 3 : 1;
    bug.style.cssText = `position:absolute;font-size:${isRare ? 16 : 24}px;user-select:none;cursor:pointer;left:${Math.random()*(mgArea.clientWidth-30)}px;top:${Math.random()*(mgArea.clientHeight-30)}px;`;
    bug.addEventListener('mousedown', (e) => {
      e.stopPropagation(); mgCurrentScore += pts; mgScore.textContent = mgCurrentScore;
      bug.textContent = '💥'; setTimeout(() => bug.remove(), 200);
    });
    mgArea.appendChild(bug);
    setTimeout(() => { if (bug.parentNode) bug.remove(); }, 1200);
  }

  function endBugGame() {
    clearInterval(mgInterval); clearInterval(mgSpawnInterval);
    const coinsWon = Math.floor(mgCurrentScore / 2);
    mgArea.innerHTML = `<div style="color:white;padding-top:45px;font-size:12px;line-height:2;">Terminé !<br>Score : ${mgCurrentScore}<br><span style="color:#f1c40f;font-size:16px;">+${coinsWon} 🪙</span><br><span style="font-size:8px;opacity:0.7;">(🦟 vaut 3 pts !)</span></div>`;
    navi.coins  += coinsWon;
    navi.energie = Math.max(0, navi.energie - 10);
    navi.joie    = Math.min(MAX_STAT, navi.joie + 15);
    setTimeout(() => {
      bugGameArea.classList.add('hidden');
      openArcadeMenu();
      saveData();
      if (coinsWon > 0) showMessage(`+${coinsWon} 🪙 gagnés !`, '#f1c40f');
    }, 2500);
  }

  // ============================================================
  // --- ARCADE : MEMORY (CORRIGÉ) ---
  // ============================================================
  const MEMORY_EMOJIS = ['🐛','🦋','🌺','⭐','🍕','🎮','🚀','💎'];

  document.getElementById('btn-start-memory').addEventListener('click', () => {
    hideAllScreens();
    memoryScreen.classList.remove('hidden');
    startMemoryGame();
  });

  function startMemoryGame() {
    memoryMatched = 0; memoryFlipped = []; memoryLocked = false;
    memoryStatus.textContent = 'Retourne les paires ! 🧠';
    memoryStatus.style.color = 'white';
    memoryGrid.innerHTML = '';
    [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5).forEach(emoji => {
      const card = document.createElement('div');
      card.className = 'memory-card'; card.dataset.emoji = emoji;
      card.innerHTML = '<span class="card-front">❓</span><span class="card-back" style="display:none;">' + emoji + '</span>';
      card.addEventListener('click', onMemoryCardClick);
      memoryGrid.appendChild(card);
    });
  }

  function onMemoryCardClick(e) {
    if (memoryLocked) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || memoryFlipped.length >= 2) return;
    card.classList.add('flipped');
    card.querySelector('.card-front').style.display = 'none';
    card.querySelector('.card-back').style.display  = 'inline';
    memoryFlipped.push(card);
    if (memoryFlipped.length === 2) {
      memoryLocked = true;
      const [a, b] = memoryFlipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        a.style.background = '#2ecc71'; b.style.background = '#2ecc71';
        memoryMatched++; memoryFlipped = []; memoryLocked = false;
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
    navi.coins  += coinsWon; navi.joie = Math.min(MAX_STAT, navi.joie + 20);
    navi.energie = Math.max(0, navi.energie - 15);
    setTimeout(() => { openArcadeMenu(); saveData(); showMessage(`+${coinsWon} 🪙 !`, '#f1c40f'); }, 2500);
  }

  btnMemoryQuit?.addEventListener('click', () => { hideAllScreens(); openArcadeMenu(); });

  // ============================================================
  // --- ARCADE : PIERRE FEUILLE CISEAUX (CORRIGÉ) ---
  // ============================================================
  document.getElementById('btn-start-pfc').addEventListener('click', () => {
    hideAllScreens();
    pfcScreen.classList.remove('hidden');
    pfcPlayerEmoji.textContent = '❓'; pfcPetEmoji.textContent = '❓';
    pfcResult.textContent = ''; pfcStatus.textContent = 'Choisis ton arme 🥷';
  });

  pfcChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => playPfcMatch(btn.getAttribute('data-choice')));
  });

  function playPfcMatch(playerChoice) {
    if (navi.energie < 5) { pfcResult.textContent = 'Trop fatigué !'; pfcResult.style.color = '#e74c3c'; return; }
    const choices   = ['pierre','feuille','ciseaux'];
    const emojis    = { pierre:'🪨', feuille:'📄', ciseaux:'✂️' };
    const petChoice = choices[Math.floor(Math.random() * 3)];
    pfcPlayerEmoji.textContent = emojis[playerChoice];
    pfcPetEmoji.textContent    = emojis[petChoice];
    navi.energie -= 5; navi.faim -= 2;
    if (playerChoice === petChoice) {
      pfcResult.textContent = 'Égalité !'; pfcResult.style.color = '#bdc3c7';
      navi.joie = Math.min(MAX_STAT, navi.joie + 5); spawnParticle('⚖️');
    } else if ((playerChoice==='pierre'&&petChoice==='ciseaux')||(playerChoice==='feuille'&&petChoice==='pierre')||(playerChoice==='ciseaux'&&petChoice==='feuille')) {
      pfcResult.textContent = 'Victoire ! +10 🪙'; pfcResult.style.color = '#2ecc71';
      navi.coins += 10; navi.joie = Math.min(MAX_STAT, navi.joie + 15); navi.xp += 5; spawnParticle('🎉');
    } else {
      pfcResult.textContent = 'Défaite ! Mince...'; pfcResult.style.color = '#e74c3c';
      navi.joie = Math.max(0, navi.joie - 5); spawnParticle('😿');
    }
    saveData();
  }

  btnPfcQuit?.addEventListener('click', () => { hideAllScreens(); openArcadeMenu(); });

  // ============================================================
  // --- RÉACTIONS AUX ONGLETS ---
  // ============================================================
  function listenForTabReactions() {
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'TAB_REACTION' && msg.message) {
          showMessage(msg.message, '#a29bfe'); spawnParticle('💬');
        }
      });
    } catch(e) {}
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