const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Permet de lire les données JSON et formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sert les fichiers statiques (index.html, style.css, app.js, etc.)
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur GBBE opérationnel sur le port ${PORT}`);
});
