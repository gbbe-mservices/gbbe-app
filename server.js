const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(helmet());

const allowedOrigins = [process.env.FRONTEND_URL || 'https://gbbe-app.onrender.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acces refuse par la politique CORS'));
    }
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requetes, veuillez reessayer plus tard." }
});
app.use(limiter);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.get('/', (req, res) => {
  res.send('Serveur Backend GBBE en cours d execution.');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/webhook/paydunya', (req, res) => {
  try {
    const signature = req.headers['x-paydunya-signature'] || req.headers['signature'];
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;

    if (!signature) {
      return res.status(401).json({ error: "Signature manquante" });
    }

    const expectedSignature = crypto
      .createHmac('sha512', masterKey)
      .update(req.rawBody)
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isSignatureValid) {
      return res.status(403).json({ error: "Signature invalide" });
    }

    const payload = req.body;
    console.log("Webhook valide recu :", payload.status);

    res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("Erreur Webhook :", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Serveur demarre sur le port ' + PORT);
});
