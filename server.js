const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Base de données temporaire GBBE MULTI-SERVICES
const gbbeTransactions = {};

// TAUX DE COMMISSION GBBE MULTI-SERVICES (Exemple : 1.5%)
const TAUX_COMMISSION = 0.015;

// 1. ROUTE : Initialiser une opération de transfert GBBE
app.post('/api/gbbe/transfert', async (req, res) => {
    const { phoneEmetteur, reseauEmetteur, phoneDestinataire, reseauDestinataire, montant } = req.body;
    
    const montantEnvoye = parseFloat(montant);
    if (isNaN(montantEnvoye) || montantEnvoye <= 0) {
        return res.status(400).json({ success: false, message: "Montant invalide." });
    }

    // Calcul des frais et du montant net
    const commissionGBBE = Math.round(montantEnvoye * TAUX_COMMISSION);
    const montantTotalADebiter = montantEnvoye + commissionGBBE;

    // Référence unique enregistrée sous la marque GBBE
    const transactionId = 'GBBE_' + Date.now();

    gbbeTransactions[transactionId] = {
        id: transactionId,
        phoneEmetteur,
        reseauEmetteur,
        phoneDestinataire,
        reseauDestinataire,
        montantBrut: montantEnvoye,
        fraisGBBE: commissionGBBE,
        statut: 'EN_ATTENTE_DEBIT',
        date: new Date().toISOString()
    };

    console.log('[GBBE MULTI-SERVICES] Nouvelle transaction créée : ' + transactionId);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` --- Serveur GBBE MULTI-SERVICES prêt sur le port ${PORT} ---`);
});
