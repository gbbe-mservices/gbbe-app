const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour décoder le JSON et les formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (index.html, style.css, app.js, etc.)
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur GBBE en cours d'exécution sur le port ${PORT});
});
