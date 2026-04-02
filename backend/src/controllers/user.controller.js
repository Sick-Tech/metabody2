const { query } = require('../config/database');
const bcrypt    = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
  const { rows } = await query(
    `SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updateMe = async (req, res) => {
  try {
  const { name, avatarUrl } = req.body;
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url) WHERE id = $3 RETURNING id, name, avatar_url`,
    [name, avatarUrl, req.user.id]
  );
  res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
  }
  const { rows } = await query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
  if (!await bcrypt.compare(currentPassword, rows[0].password_hash)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, req.user.id]);
  res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
  const { rows } = await query(
    `SELECT s.id, p.name as plan, p.period, s.price_paid, s.starts_at, s.expires_at, s.status
     FROM subscriptions s JOIN plans p ON s.plan_id = p.id
     WHERE s.user_id = $1 AND s.status = 'active' ORDER BY s.expires_at DESC LIMIT 1`,
    [req.user.id]
  );
  res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};
