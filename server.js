// Enregistrer une transaction
app.post('/api/transactions', async (req, res) => {
  const { userPhone, sourceNet, sourcePhone, destNet, destPhone, amount } = req.body;
  try {
    await pool.query('INSERT INTO transactions (user_phone, source_net, source_phone, dest_net, dest_phone, amount) VALUES ($1, $2, $3, $4, $5, $6)', [userPhone, sourceNet, sourcePhone, destNet, destPhone, amount]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Récupérer l'historique des transactions d'un utilisateur
app.get('/api/transactions/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_phone = $1 ORDER BY created_at DESC', [phone]);
    res.json({ success: true, transactions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
