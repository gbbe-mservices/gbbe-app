const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Service des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Base de données temporaire GBBE MULTI-SERVICES
const gbbeTransactions = {};
const TAUX_COMMISSION = 0.015;

// Route API
app.post('/api/gbbe/transfert', async (req, res) => {
    const { phoneEmetteur, reseauEmetteur, phoneDestinataire, reseauDestinataire, montant } = req.body;

    if (!phoneEmetteur || !reseauEmetteur || !phoneDestinataire || !reseauDestinataire || !montant) {
        return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires." });
    }

    const montantEnvoye = parseFloat(montant);
    const commissionGBBE = montantEnvoye * TAUX_COMMISSION;
    const montantTotalADebiter = montantEnvoye + commissionGBBE;

    const transactionId = "GBBE_" + Date.now();

    gbbeTransactions[transactionId] = {
        phoneEmetteur,
        reseauEmetteur,
        phoneDestinataire,
        reseauDestinataire,
        montantEnvoye,
        commissionGBBE,
        montantTotalADebiter,
        statut: "EN_ATTENTE_DEBIT_CLIENT"
    };

    res.json({
        success: true,
        message: "Opération initialisée par GBBE MULTI-SERVICES. Veuillez valider le retrait sur votre téléphone.",
        transactionId: transactionId,
        details: {
            montant: montantEnvoye,
            frais: commissionGBBE,
            totalDebite: montantTotalADebiter
        }
    });
});

// Route principale : renvoie index.html (dans public/ ou à la racine)
app.get('*', (req, res) => {
    const publicPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(publicPath)) {
        res.sendFile(publicPath);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`--- Serveur GBBE MULTI-SERVICES prêt sur le port ${PORT} ---`);
});
