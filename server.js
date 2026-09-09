const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('./db'); // Importation de la connexion DB

const app = express();
app.use(express.json());

// Fonction pour générer un code de parrainage unique
function generateReferralCode() {
  return 'GBBE-' + crypto.randomBytes(2).toString('hex').toUpperCase();
}

// 1. ROUTE D'INSCRIPTION
app.post('/api/register', async (req, res) => {
  const { phone, password, referralCode } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const myReferralCode = generateReferralCode();

    const newUser = await pool.query(
      `INSERT INTO users (phone, password, referral_code, referred_by) 
       VALUES ($1, $2, $3, $4) RETURNING id, phone, referral_code`,
      [phone, hashedPassword, myReferralCode, referralCode || null]
    );

    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Code d'erreur PostgreSQL pour doublon de téléphone
      return res.status(400).json({ error: "Ce numéro de téléphone est déjà inscrit." });
    }
    res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
});

// 2. ROUTE POUR ENREGISTRER UNE TRANSACTION
app.post('/api/transactions', async (req, res) => {
  const { userId, service, amount, recipient } = req.body;

  try {
    const newTx = await pool.query(
      `INSERT INTO transactions (user_id, service, amount, recipient) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, service, amount, recipient]
    );

    res.json({ success: true, transaction: newTx.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la transaction." });
  }
});

// 3. ROUTE POUR RÉCUPÉRER L'HISTORIQUE D'UN CLIENT
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await pool.query(
      `SELECT service, amount, recipient, status, created_at 
       FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, history: history.rows });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Serveur prêt sur le port ${PORT}));
