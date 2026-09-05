const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// 1. Sécurité des en-têtes HTTP (Protection contre XSS, Clickjacking, etc.)
app.use(helmet());

// 2. Gestion restreinte du CORS (N'autoriser que votre domaine frontend)
const allowedOrigins = [process.env.FRONTEND_URL || 'https://gbbe-app.onrender.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Accès refusé par la politique CORS'));
    }
  }
}));

// 3. Limiteur de débit (Rate Limiting : max 100 requêtes par 15 min par IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});
app.use(limiter);

// 4. Capture du corps brut (Raw Body) pour la vérification HMAC des webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Route de santé pour Render (Health Check)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 5. Route Webhook Sécurisée pour les paiements
app.post('/webhook/paydunya', (req, res) => {
  try {
    const signature = req.headers['x-paydunya-signature'] || req.headers['signature'];
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;

    // Vérification de la présence de la signature
    if (!signature) {
      console.warn("⚠️ Tentative d'accès au webhook sans signature.");
      return res.status(401).json({ error: "Signature manquante" });
    }

    // Calcul du HMAC SHA-512 (ou SHA-256 selon l'opérateur)
    const expectedSignature = crypto
      .createHmac('sha512', masterKey)
      .update(req.rawBody)
      .digest('hex');

    // Comparaison sécurisée contre les attaques de temps (Timing Attacks)
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isSignatureValid) {
      console.error("❌ Signature Webhook invalide !");
      return res.status(403).json({ error: "Signature invalide" });
    }

    // Traitement de l'événement si la signature est valide
    const payload = req.body;
    console.log("✅ Webhook valide reçu :", payload.data?.status || payload.status);

    if (payload.status === 'completed' || payload.data?.status === 'success') {
      // Exécuter ici la logique métier : créditer le compte, envoyer le pass, etc.
      console.log(Transaction ${payload.custom_data?.transaction_id} validée.);
    }

    // Répondre immédiatement au serveur de paiement
    res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("Erreur Webhook :", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur de production démarré sur le port ${PORT}`);
});
