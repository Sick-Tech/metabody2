const { query, pool } = require('../config/database');
const bcrypt    = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.getStats = async (_req, res) => {
  try {
  const [students, revenue, engagement] = await Promise.all([
    query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='active') active FROM subscriptions`),
    query(`SELECT COALESCE(SUM(price_paid),0) total FROM subscriptions WHERE DATE_TRUNC('month', starts_at) = DATE_TRUNC('month', NOW())`),
    query(`SELECT ROUND(AVG(percent)::numeric, 0) avg FROM progress_summary`),
  ]);
  res.json({
    totalStudents:  parseInt(students.rows[0].total),
    activeStudents: parseInt(students.rows[0].active),
    monthRevenue:   parseFloat(revenue.rows[0].total),
    engagement:     parseInt(engagement.rows[0].avg || 0),
  });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.getActivity = async (_req, res) => {
  try {
  const { rows } = await query(
    `SELECT type, description, created_at FROM activity_log ORDER BY created_at DESC LIMIT 20`
  );
  res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.listStudents = async (req, res) => {
  try {
  const search  = req.query.search || '';
  const status  = req.query.status  || null;
  const period  = req.query.period  || null;
  const limit   = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const page    = Math.max(parseInt(req.query.page) || 1, 1);
  const offset  = (page - 1) * limit;
  const [dataRes, countRes] = await Promise.all([
    query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.created_at, u.last_login,
              s.status, p.period, p.name as plan,
              (SELECT ROUND(AVG(percent)) FROM progress_summary WHERE user_id = u.id) progress
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE u.role = 'student'
         AND ($1 = '' OR u.name ILIKE $1 OR u.email ILIKE $1)
         AND ($2::text IS NULL OR s.status = $2)
         AND ($3::text IS NULL OR p.period = $3)
       ORDER BY u.created_at DESC
       LIMIT $4 OFFSET $5`,
      [`%${search}%`, status, period, limit, offset]
    ),
    query(
      `SELECT COUNT(*) total
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE u.role = 'student'
         AND ($1 = '' OR u.name ILIKE $1 OR u.email ILIKE $1)
         AND ($2::text IS NULL OR s.status = $2)
         AND ($3::text IS NULL OR p.period = $3)`,
      [`%${search}%`, status, period]
    ),
  ]);
  res.json({ data: dataRes.rows, total: parseInt(countRes.rows[0].total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.createStudent = async (req, res) => {
  const { name, email, password, planId, expiresAt } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password, 12);
    const id   = uuidv4();
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,'student')`,
      [id, name, email.toLowerCase(), hash]
    );
    if (planId) {
      const plan = await client.query(`SELECT price FROM plans WHERE id=$1`, [planId]);
      if (!plan.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Plano não encontrado.' });
      }
      const subExpires = expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, price_paid, expires_at) VALUES ($1,$2,$3,$4)`,
        [id, planId, plan.rows[0].price, subExpires]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id, name, email });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createStudent:', err);
    res.status(500).json({ error: 'Erro interno.' });
  } finally {
    client.release();
  }
};

exports.getStudent = async (req, res) => {
  try {
    const { rows } = await query(`SELECT id,name,email,avatar_url,created_at,last_login FROM users WHERE id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getStudent:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { rows } = await query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3 AND role='student' RETURNING id,name,email`,
      [name, email ? email.toLowerCase() : null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('updateStudent:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const result = await query(`DELETE FROM users WHERE id=$1 AND role='student'`, [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json({ message: 'Aluno removido.' });
  } catch (err) {
    console.error('deleteStudent:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { planId, expiresAt, status } = req.body;
    const result = await query(
      `UPDATE subscriptions SET plan_id=COALESCE($1,plan_id), expires_at=COALESCE($2,expires_at), status=COALESCE($3,status) WHERE user_id=$4`,
      [planId, expiresAt, status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Assinatura não encontrada.' });
    res.json({ message: 'Assinatura atualizada.' });
  } catch (err) {
    console.error('updateSubscription:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.getSettings = async (_req, res) => {
  try {
    const plans = await query(`SELECT id, name, period, price FROM plans ORDER BY price`);
    res.json({ plans: plans.rows });
  } catch (err) {
    console.error('getSettings:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updatePlans = async (req, res) => {
  const { plans } = req.body; // [{ id, price }]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of plans) {
      await client.query(`UPDATE plans SET price=$1 WHERE id=$2`, [p.price, p.id]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Preços atualizados.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updatePlans:', err);
    res.status(500).json({ error: 'Erro interno.' });
  } finally {
    client.release();
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await query(`UPDATE users SET name=$1, email=$2 WHERE id=$3`, [name, email ? email.toLowerCase() : null, req.user.id]);
    res.json({ message: 'Perfil atualizado.' });
  } catch (err) {
    console.error('updateAdminProfile:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 8 caracteres.' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, req.user.id]);
    res.json({ message: 'Senha alterada.' });
  } catch (err) {
    console.error('updateAdminPassword:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};
