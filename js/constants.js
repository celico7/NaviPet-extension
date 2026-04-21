// ============================================================
// --- CONSTANTES & DONNEES ---
// ============================================================

export const SPECIES_DATA = [
  { id: 'dragon', name: 'Dragon',  emojis: ['assets/sprites/pets/egg.png', '🦎', '🐉', '🐉', '🐉', '🐉'],  shiny: '✨🐉' },
  { id: 'dog',    name: 'Chien',   emojis: ['assets/sprites/pets/chiot.png', '🐕', '🐕', '🐕', '🐕', '🐕'],   shiny: '⭐🐕' },
  { id: 'cat',    name: 'Chat',    emojis: ['assets/sprites/pets/kitty.png', '🐈', '🐈', '🐈', '🐈', '🐈'],   shiny: '💫🐈' },
  { id: 'robot',  name: 'Robot',   emojis: ['assets/sprites/pets/robot-box.png', '🤖', '👾', '👾', '👾', '👾'],   shiny: '🌟👾' },
  { id: 'plant',  name: 'Plante',  emojis: ['assets/sprites/pets/pousse.png', '🌿', '🪴', '🌳', '🌳', '🌸'],  shiny: '🌟🌸' }
];

export const XP_PER_LEVEL   = 100;
export const DECAY_RATE_MIN = 5;
export const DECAY_AMOUNT   = 5;
export const MAX_STAT       = 100;

export const SHOP_BACKGROUNDS = [
  { id: 'bg-default', name: 'Pièce Simple',      price: 0,   icon: 'assets/sprites/shop/house.png', extraHtml: '' },
  { id: 'bg-forest',  name: 'Forêt Magique',     price: 50,  icon: 'assets/sprites/shop/tree.png', extraHtml: '<div style="position:absolute;bottom:5px;left:10px;font-size:24px;pointer-events:none;">🍄</div><div style="position:absolute;bottom:5px;right:15px;font-size:32px;pointer-events:none;">🏕️</div><div style="position:absolute;top:10px;right:30px;font-size:20px;pointer-events:none;opacity:0.7;">☁️</div>' },
  { id: 'bg-beach',   name: 'Plage Ensoleillée', price: 100, icon: 'assets/sprites/shop/beach.png', extraHtml: '<div style="position:absolute;top:10px;right:10px;width:32px;height:32px;pointer-events:none;"><img src="assets/sprites/ui/sun.png" style="width:100%;height:100%;image-rendering:pixelated;vertical-align:top;"></div><div style="position:absolute;bottom:5px;left:20px;font-size:28px;pointer-events:none;">🐚</div><div style="position:absolute;bottom:5px;right:20px;font-size:24px;pointer-events:none;">🦀</div>' },
  { id: 'bg-hacker',  name: 'Bureau Hacker',     price: 150, icon: 'assets/sprites/ui/computer.png', extraHtml: '<div style="position:absolute;top:50%;left:5px;font-size:24px;pointer-events:none;">🖥️</div><div style="position:absolute;bottom:5px;right:10px;font-size:20px;pointer-events:none;">☕</div><div style="position:absolute;top:10px;left:20px;color:#2ecc71;font-size:10px;font-family:monospace;pointer-events:none;">>_ hello_world<br>>_ hack.sh</div>' },
  { id: 'bg-space',   name: 'Station Spatiale',  price: 300, icon: 'assets/sprites/shop/fusee.png', extraHtml: '<div style="position:absolute;top:15px;left:15px;font-size:24px;pointer-events:none;animation:bob 4s infinite;">🛸</div><div style="position:absolute;bottom:20px;right:20px;font-size:32px;pointer-events:none;">🪐</div><div style="position:absolute;top:30px;right:40px;font-size:12px;pointer-events:none;color:yellow;">⭐</div>' }
];

export const SHOP_FOOD = [
  { id: 'food-apple',  name: 'Pomme',           price: 5,  icon: 'assets/sprites/shop/apple.png', faim: +35, joie: 0,   energie: -2,  desc: 'Le classique' },
  { id: 'food-pizza',  name: 'Pizza',           price: 15, icon: 'assets/sprites/shop/pizza.png', faim: +60, joie: +10, energie: -3,  desc: '+10 Joie bonus !' },
  { id: 'food-sushi',  name: 'Sushi',           price: 20, icon: 'assets/sprites/shop/sushis.png', faim: +50, joie: +15, energie: +5,  desc: '+5 Énergie bonus !' },
  { id: 'food-ramen',  name: 'Ramen',           price: 25, icon: 'assets/sprites/shop/ramen.png', faim: +70, joie: +5,  energie: +10, desc: 'Très nourrissant !' },
  { id: 'food-cake',   name: "Gâteau d'anniv",  price: 50, icon: 'assets/sprites/shop/cake.png', faim: +40, joie: +40, energie: +20, desc: 'Pour les occasions ✨' },
  { id: 'food-coffee', name: 'Café Turbo',      price: 30, icon: 'assets/sprites/shop/cafe.png', faim: -5,  joie: +5,  energie: +50, desc: 'Boost énergie max !' },
];

export const SHOP_ACCESSORIES = [
  { id: 'acc-none',       name: 'Aucun',              price: 0,   icon: '✖️',  emoji: '',   desc: "Retirer l'accessoire" },
  { id: 'acc-hat',        name: 'Chapeau',            price: 80,  icon: '🎩',  emoji: '🎩', desc: 'Très élégant !' },
  { id: 'acc-sunglasses', name: 'Lunettes',           price: 60,  icon: '🕶️',  emoji: '🕶️', desc: 'Trop stylé' },
  { id: 'acc-crown',      name: 'Couronne',           price: 200, icon: '👑',  emoji: '👑', desc: 'Royauté assurée !' },
  { id: 'acc-bow',        name: 'Nœud papillon',      price: 40,  icon: '🎀',  emoji: '🎀', desc: 'Mignon au max' },
  { id: 'acc-ninja',      name: 'Masque Ninja',       price: 120, icon: '🥷',  emoji: '🥷', desc: 'Mode furtif activé' },
  { id: 'acc-santa',      name: 'Chapeau Père Noël',  price: 150, icon: '🎅',  emoji: '🎅', desc: 'Ho ho ho !' },
  { id: 'acc-pajama',     name: 'Bonnet de Nuit',     price: 0,   icon: '😴',  emoji: '🌙', desc: 'Auto activé la nuit !' },
];

export const DEFAULT_STATE = {
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
  jumpHighScore: 0,
  unlockedBackgrounds: ['bg-default'],
  currentBackground: 'bg-default',
  unlockedAccessories: ['acc-none', 'acc-pajama'],
  currentAccessory: 'acc-none',
  quests: null,
  lastSaved: Date.now()
};

export const DAILY_QUESTS_POOL = [
  { id: 'work', title: 'Travailler 5 fois', target: 5, reward: 50 },
  { id: 'feed', title: 'Nourrir 3 fois', target: 3, reward: 20 },
  { id: 'play', title: 'Jouer 5 fois', target: 5, reward: 20 },
  { id: 'click', title: 'Caresser 10 fois', target: 10, reward: 15 }
];
