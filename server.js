const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialisation des tables PostgreSQL
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(15) PRIMARY KEY,
        code VARCHAR(6),
        expires_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        source_net VARCHAR(20),
        source_phone VARCHAR(15),
        dest_net VARCHAR(20),
        dest_phone VARCHAR(15),
        amount NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tables prêtes dans PostgreSQL.");
  } catch (err) {
    console.error("Erreur d'initialisation DB:", err);
  }
}
initDB();

// --- INSCRIPTION ---
app.post('/api/register', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Ce numéro est déjà inscrit." });
    }

    await pool.query('INSERT INTO users (phone, password) VALUES ($1, $2)', [phone, password]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- CONNEXION (Étape 1 : Vérifie le mot de passe et envoie l'OTP) ---
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE phone = $1 AND password = $2', [phone, password]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Numéro ou mot de passe incorrect." });
    }

    // Générer un code OTP à 4 ou 6 chiffres (ex: 4821)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expire dans 5 minutes

    // Enregistrer ou mettre à jour l'OTP dans la base
    await pool.query(`
      INSERT INTO otps (phone, code, expires_at) VALUES ($1, $2, $3)
      ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3
    `, [phone, otpCode, expiresAt]);

    // TODO: Intégrer ici une API SMS (ex: Twilio, Orange API, etc.) pour envoyer le code.
    // Pour l'instant, on l'affiche dans les logs du serveur Render pour les tests :
    console.log([OTP pour ${phone}] : ${otpCode});

    res.json({ success: true, message: "Code OTP envoyé (vérifiez les logs du serveur pour le test)" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- VALIDATION OTP (Étape 2 : Connecte définitivement l'utilisateur) ---
app.post('/api/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  try {
    const otpRes = await pool.query('SELECT * FROM otps WHERE phone = $1 AND code = $2 AND expires_at > NOW()', [phone, code]);
    
    if (otpRes.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Code OTP invalide ou expiré." });
    }

    // Nettoyer l'OTP utilisé
    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);

    res.json({ success: true, phone, message: "Authentification réussie !" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Enregistrement de transaction
app.post('/api/transactions', async (req, res) => {
  const { sourceNet, sourcePhone, destNet, destPhone, amount } = req.body;
  try {
    await pool.query(
      INSERT INTO transactions (source_net, source_phone, dest_net, dest_phone, amount) VALUES ($1, $2, $3, $4, $5),
      [sourceNet, sourcePhone, destNet, destPhone, amount]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log("Serveur GBBE-MULTISERVICES actif sur le port " + PORT);
});
