const fs = require('fs');
const path = require('path');

// Voici un utilitaire facile pour générer des icônes placeholder
// afin de ne plus bloquer le chargement de l'extension Chrome.

// Une simple image PNG 1x1 transparente/rouge/bleue encodée en base64 pour berner Chrome
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const buffer = Buffer.from(base64Png, 'base64');
const dir = path.join(__dirname, 'icons');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

['icon16.png', 'icon48.png', 'icon128.png'].forEach(filename => {
    fs.writeFileSync(path.join(dir, filename), buffer);
    console.log(`✅ ${filename} créé avec succès !`);
});

console.log("\nLes icônes placeholder ont été générées dans le dossier /icons !");
console.log("Tu peux maintenant recharger l'extension dans Chrome !");
