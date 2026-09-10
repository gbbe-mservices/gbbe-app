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
        user_phone VARCHAR(15),
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

app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE phone = $1 AND password = $2', [phone, password]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Numéro ou mot de passe incorrect." });
    }
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(`
      INSERT INTO otps (phone, code, expires_at) VALUES ($1, $2, $3)
      ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3
    `, [phone, otpCode, expiresAt]);

    console.log("OTP pour " + phone + " : " + otpCode);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  try {
    const otpRes = await pool.query('SELECT * FROM otps WHERE phone = $1 AND code = $2 AND expires_at > NOW()', [phone, code]);
    if (otpRes.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Code OTP invalide ou expiré." });
    }
    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
    res.json({ success: true, phone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/transactions', async (req, res) => {
  const { userPhone, sourceNet, sourcePhone, destNet, destPhone, amount } = req.body;
  try {
    await pool.query('INSERT INTO transactions (user_phone, source_net, source_phone, dest_net, dest_phone, amount) VALUES ($1, $2, $3, $4, $5, $6)', [userPhone, sourceNet, sourcePhone, destNet, destPhone, amount]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/transactions/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_phone = $1 ORDER BY created_at DESC', [phone]);
    res.json({ success: true, transactions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log("Serveur actif sur le port " + PORT);
});
