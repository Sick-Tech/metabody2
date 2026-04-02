const { query } = require('../config/database');

exports.listPlans = async (_req, res) => {
  try {
    const { rows } = await query(`SELECT id, name, period, price FROM plans ORDER BY price`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { price } = req.body;
    const { rows } = await query(
      `UPDATE plans SET price=$1 WHERE id=$2 RETURNING id, name, period, price`,
      [price, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Plano não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

