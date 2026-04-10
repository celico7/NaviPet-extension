import { stateManager } from './state.js';
import { SHOP_BACKGROUNDS, SHOP_FOOD, SHOP_ACCESSORIES } from './constants.js';
import { ui } from './ui.js';

class ShopController {
  constructor() {
    this.currentTab = 'bgs';
    this.cacheDOM();
    this.bindEvents();
  }

  cacheDOM() {
    this.shopTabBgs = document.getElementById('shop-tab-bgs');
    this.shopTabFood = document.getElementById('shop-tab-food');
    this.shopTabAcc = document.getElementById('shop-tab-acc');
    this.shopItemsContainer = document.getElementById('shop-items');
    this.shopCoins = document.getElementById('shop-coins');
    this.btnShop = document.getElementById('btn-shop');
    this.btnShopQuit = document.getElementById('btn-shop-quit');

    // Inventaire
    this.inventoryPanel = document.getElementById('inventory-panel');
    this.inventoryItems = document.getElementById('inventory-items');
    this.inventoryEmpty = document.getElementById('inventory-empty');
    this.btnCloseInv = document.getElementById('btn-close-inventory');
    this.mainControls = document.getElementById('main-controls');
  }

  bindEvents() {
    this.shopTabBgs?.addEventListener('click', () => this.openShop('bgs'));
    this.shopTabFood?.addEventListener('click', () => this.openShop('food'));
    this.shopTabAcc?.addEventListener('click', () => this.openShop('acc'));
    
    this.btnShop?.addEventListener('click', () => this.openShop('bgs'));
    this.btnShopQuit?.addEventListener('click', () => {
      ui.showScreen('gameScreen');
    });

    this.btnCloseInv?.addEventListener('click', () => {
      if (this.inventoryPanel) this.inventoryPanel.classList.add('hidden');
      if (this.mainControls) this.mainControls.classList.remove('hidden');
    });
  }

  openShop(tab = 'bgs') {
    this.currentTab = tab;
    ui.showScreen('shopScreen');
    this.renderShopTab();
    this.updateShopTabUI();
  }

  updateShopTabUI() {
    [this.shopTabBgs, this.shopTabFood, this.shopTabAcc].forEach(t => t?.classList.remove('tab-active'));
    if (this.currentTab === 'bgs' && this.shopTabBgs) this.shopTabBgs.classList.add('tab-active');
    if (this.currentTab === 'food' && this.shopTabFood) this.shopTabFood.classList.add('tab-active');
    if (this.currentTab === 'acc' && this.shopTabAcc) this.shopTabAcc.classList.add('tab-active');
  }

  renderShopTab() {
    if (!this.shopItemsContainer) return;
    this.shopItemsContainer.innerHTML = '';
    
    const data = stateManager.data;
    if (this.shopCoins) this.shopCoins.textContent = data.coins;
    
    if (this.currentTab === 'bgs') this.renderBackgrounds(data);
    if (this.currentTab === 'food') this.renderFood(data);
    if (this.currentTab === 'acc') this.renderAccessories(data);
  }

  renderBackgrounds(data) {
    SHOP_BACKGROUNDS.forEach(item => {
      const isUnlocked = data.unlockedBackgrounds.includes(item.id);
      const isEquipped = data.currentBackground === item.id;
      const div = this.createShopRow(item.icon, item.name, isEquipped ? '#2ecc71' : 'var(--panel-bg)');
      const btn = this.createShopBtn();
      
      if (isEquipped) {
        btn.textContent = '✓ Équipé'; btn.disabled = true;
        btn.style.background = '#27ae60'; btn.style.color = 'white';
      } else if (isUnlocked) {
        btn.textContent = 'Équiper'; btn.style.background = '#3498db'; btn.style.color = 'white';
        btn.onclick = () => { 
          data.currentBackground = item.id; 
          stateManager.notify(); 
          this.renderShopTab(); 
        };
      } else {
        btn.textContent = `${item.price} 🪙`;
        btn.style.background = data.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled = data.coins < item.price;
        btn.onclick = () => {
          if (data.coins >= item.price) {
            data.coins -= item.price; 
            data.unlockedBackgrounds.push(item.id);
            data.currentBackground = item.id; 
            stateManager.notify(); 
            this.renderShopTab();
          }
        };
      }
      div.appendChild(btn); 
      this.shopItemsContainer.appendChild(div);
    });
  }

  renderFood(data) {
    const invDiv = document.createElement('div');
    invDiv.style.cssText = 'background:var(--panel-bg); padding:5px; border-radius:5px; border:2px solid var(--border-color); margin-bottom:10px; font-size:8px; text-align:center;';
    let invHtml = '<div style="color:#2ecc71; margin-bottom:5px; font-size:9px;">🎒 Ton Inventaire:</div>';
    let ownedItems = 0;
    SHOP_FOOD.forEach(f => {
      const count = data.inventory && data.inventory[f.id] ? data.inventory[f.id] : 0;
      if (count > 0) {
        ownedItems++;
        let srcMatch = f.icon.match(/src="([^"]+)"/);
        let src = srcMatch ? srcMatch[1] : f.icon;
        invHtml += `<span style="display:inline-block; margin-right:8px; margin-bottom:5px;"><img src="${src}" style="width:16px;height:16px;image-rendering:pixelated;vertical-align:middle;"> x${count}</span>`;
      }
    });
    if (ownedItems === 0) invHtml += '<span style="opacity:0.6;">Vide. Achète pour remplir !</span>';
    invDiv.innerHTML = invHtml;
    this.shopItemsContainer.appendChild(invDiv);
    
    SHOP_FOOD.forEach(item => {
      const isOwned = (data.inventory && data.inventory[item.id] > 0);
      const inventoryText = isOwned ? `<br><span style="color:#2ecc71;">Possédé: ${data.inventory[item.id]}</span>` : '';
      const div = this.createShopRow(item.icon, `${item.name} — ${item.desc}${inventoryText}`, 'var(--panel-bg)');
      const btn = this.createShopBtn();
      
      btn.textContent = `${item.price} 🪙`;
      btn.style.background = data.coins >= item.price ? '#2ecc71' : '#bdc3c7';
      btn.style.color = 'white'; 
      btn.disabled = data.coins < item.price;
      
      btn.onclick = () => {
        if (data.coins >= item.price) {
          data.coins -= item.price;
          if (!data.inventory) data.inventory = {};
          data.inventory[item.id] = (data.inventory[item.id] || 0) + 1;
          stateManager.notify();
          ui.showMessage(`+1 ${item.icon} (Acheté)`, '#f1c40f'); 
          this.renderShopTab();
        }
      };
      div.appendChild(btn); 
      this.shopItemsContainer.appendChild(div);
    });
  }

  renderAccessories(data) {
    SHOP_ACCESSORIES.forEach(item => {
      const isUnlocked = data.unlockedAccessories.includes(item.id);
      const isEquipped = data.currentAccessory === item.id;
      const div = this.createShopRow(item.icon, `${item.name} — ${item.desc}`, isEquipped ? '#a29bfe' : 'var(--panel-bg)');
      const btn = this.createShopBtn();
      
      if (isEquipped) {
        btn.textContent = '✓ Porté'; btn.disabled = true;
        btn.style.background = '#6c5ce7'; btn.style.color = 'white';
      } else if (isUnlocked) {
        btn.textContent = 'Porter'; btn.style.background = '#a29bfe'; btn.style.color = 'white';
        btn.onclick = () => { 
          data.currentAccessory = item.id; 
          stateManager.notify(); 
          this.renderShopTab(); 
        };
      } else {
        btn.textContent = `${item.price} 🪙`;
        btn.style.background = data.coins >= item.price ? '#f1c40f' : '#bdc3c7';
        btn.disabled = data.coins < item.price;
        btn.onclick = () => {
          if (data.coins >= item.price) {
            data.coins -= item.price; 
            data.unlockedAccessories.push(item.id);
            data.currentAccessory = item.id; 
            stateManager.notify(); 
            this.renderShopTab();
          }
        };
      }
      div.appendChild(btn); 
      this.shopItemsContainer.appendChild(div);
    });
  }

  createShopRow(icon, label, bgColor) {
    const div = document.createElement('div');
    div.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:10px;background-color:${bgColor};border:2px solid var(--border-color);border-radius:5px;gap:8px;`;
    const info = document.createElement('div');
    info.style.cssText = 'text-align:left;font-size:9px;flex-grow:1;';
    info.innerHTML = `<span style="font-size:18px;">${ui.getSpriteHtml(icon, '32px')}</span><br>${label}`;
    div.appendChild(info);
    return div;
  }

  createShopBtn() {
    const btn = document.createElement('button');
    btn.style.cssText = 'font-family:inherit;font-size:8px;padding:8px;cursor:pointer;border-radius:3px;border:1px solid rgba(0,0,0,0.2);white-space:nowrap;';
    return btn;
  }

  openInventory() {
    if (this.mainControls) this.mainControls.classList.add('hidden');
    if (this.inventoryPanel) this.inventoryPanel.classList.remove('hidden');
    this.renderInventory();
  }

  renderInventory() {
    if (!this.inventoryItems) return;
    this.inventoryItems.innerHTML = '';
    let hasItems = false;
    const data = stateManager.data;
    
    SHOP_FOOD.forEach(foodItem => {
      const count = data.inventory ? data.inventory[foodItem.id] : 0;
      if (count > 0) {
        hasItems = true;
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerHTML = `<span style="font-size:16px;">${ui.getSpriteHtml(foodItem.icon, '32px')}</span><br><span style="font-size:8px;">x${count}</span>`;
        btn.style.cssText = 'padding:5px; gap:2px; height:50px;';
        
        btn.onclick = () => {
          if (data.inventory[foodItem.id] > 0) {
            data.inventory[foodItem.id]--;
            stateManager.updateStat('faim', foodItem.faim || 0);
            stateManager.updateStat('joie', foodItem.joie || 0);
            stateManager.updateStat('energie', foodItem.energie || 0);
            
            ui.spawnParticle(foodItem.icon);
            ui.triggerAnimation('anim-eat');
            ui.showMessage(`Miam !`, '#2ecc71');
            stateManager.notify();
            
            // Émettre un événement personnalisé pour déclencher la quête
            document.dispatchEvent(new CustomEvent('navipet:action', { detail: { type: 'feed' } }));

            if (data.inventory[foodItem.id] <= 0) {
              this.renderInventory();
            } else {
              btn.innerHTML = `<span style="font-size:16px;">${ui.getSpriteHtml(foodItem.icon, '32px')}</span><br><span style="font-size:8px;">x${data.inventory[foodItem.id]}</span>`;
            }
          }
        };
        this.inventoryItems.appendChild(btn);
      }
    });

    if (this.inventoryEmpty) {
      this.inventoryEmpty.style.display = hasItems ? 'none' : 'block';
    }
  }
}

export const shop = new ShopController();
