const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Création automatique des tables à l'initialisation
const initDb = async () => {
  const queryText = `
    -- Table des Utilisateurs
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      referral_code VARCHAR(20) UNIQUE NOT NULL,
      referred_by VARCHAR(20),
      balance NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      service VARCHAR(50) NOT NULL,
      amount NUMERIC NOT NULL,
      recipient VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'En attente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryText);
    console.log("Base de données initialisée avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'initialisation de la base de données :", err);
  }
};

initDb();

module.exports = pool;
