# NaviPet - Ton Compagnon Virtuel de Développement

NaviPet est une extension Chrome interactive sous forme de petit animal de compagnie virtuel (façon Tamagotchi) qui vit dans votre navigateur. Prenez soin de lui, nourrissez-le, jouez avec lui et gagnez des DevCoins en travaillant !

## Fonctionnalités
- **Évolution :** Votre NaviPet gagne de l'XP et évolue avec le temps.
- **Économie :** Gagnez des DevCoins en "travaillant" pour pouvoir acheter de la nourriture.
- **Cycle Jour/Nuit :** L'interface s'adapte automatiquement à l'heure de votre journée.
- **Sauvegarde Hors-ligne :** Votre pet continue de vivre, d'avoir faim et de se fatiguer même quand l'extension est fermée.

## Comment installer l'extension (Mode Développeur)

NaviPet n'est pas encore sur le Chrome Web Store. Pour l'installer localement sur votre navigateur (Chrome, Brave, Edge), suivez ces étapes :

1. **Cloner ou télécharger le code**
   Clonez ce dépôt ou téléchargez le dossier contenant les fichiers (`manifest.json`, `popup.html`, `popup.js`, etc.).

2. **Ouvrir la page des extensions**
   - Sur Chrome/Brave : Tapez `chrome://extensions/` dans la barre d'adresse et appuyez sur Entrée (ou `brave://extensions/`).
   - Sur Edge : Tapez `edge://extensions/`.

3. **Activer le Mode Développeur**
   En haut à droite de la page des extensions, activez le bouton **"Mode développeur"** (Developer mode).

4. **Charger l'extension non empaquetée**
   - Cliquez sur le bouton **"Charger l'extension non empaquetée"** (Load unpacked) qui vient d'apparaître en haut à gauche.
   - Sélectionnez le dossier `NaviPet-extension` (celui qui contient le fichier `manifest.json`).

5. **Profiter !**
   - L'icône de NaviPet apparaît désormais dans la barre d'extensions de votre navigateur (en haut à droite, vous pouvez l'épingler avec l'icône de puzzle).
   - Cliquez dessus pour découvrir votre nouveau compagnon !

## Comment développer et mettre à jour ?
Si vous modifiez le code (HTML, JS, CSS) :
1. Sauvegardez vos fichiers.
2. Rouvrez la bulle de l'extension pour voir les changements immédiats du HTML/JS/CSS de la popup.
3. *Note : Si vous modifiez le `manifest.json` ou si des bugs persistent, cliquez sur l'icône "Actualiser" de NaviPet sur la page `chrome://extensions/`.*