const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques du dossier courant
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lancement du serveur (ligne corrigée sans erreur de syntaxe)
app.listen(PORT, () => {
  console.log("Serveur GBBE opérationnel sur le port " + PORT);
});
