const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Service des fichiers statiques (frontend)
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(Serveur GBBE opérationnel sur le port ${PORT});
});
