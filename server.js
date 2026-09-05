const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Base de données temporaire GBBE MULTI-SERVICES
const gbbeTransactions = [];
const TAUX_COMMISSION = 0.015;
const ADMIN_PASSWORD = "Maman@@@2028"; // Nouveau mot de passe mis à jour

// Route API : Enregistrer un transfert
app.post('/api/gbbe/transfert', async (req, res) => {
    const { phoneEmetteur, reseauEmetteur, phoneDestinataire, reseauDestinataire, montant } = req.body;

    if (!phoneEmetteur || !reseauEmetteur || !phoneDestinataire || !reseauDestinataire || !montant) {
        return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires." });
    }

    const montantEnvoye = parseFloat(montant);
    const commissionGBBE = montantEnvoye * TAUX_COMMISSION;
    const montantTotalADebiter = montantEnvoye + commissionGBBE;
    const transactionId = "GBBE_" + Date.now();

    const newTransaction = {
        id: transactionId,
        date: new Date().toLocaleString('fr-FR'),
        phoneEmetteur,
        reseauEmetteur,
        phoneDestinataire,
        reseauDestinataire,
        montantEnvoye,
        commissionGBBE,
        montantTotalADebiter,
        statut: "EN_ATTENTE"
    };

    gbbeTransactions.push(newTransaction);

    res.json({
        success: true,
        message: "Opération initialisée par GBBE MULTI-SERVICES.",
        transactionId: transactionId,
        details: {
            montant: montantEnvoye,
            frais: commissionGBBE,
            totalDebite: montantTotalADebiter
        }
    });
});

// Route API : Dashboard Admin
app.post('/api/admin/transactions', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }
    res.json({ success: true, transactions: gbbeTransactions });
});

// Route principale
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
