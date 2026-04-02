const { query }    = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) { res.status(500).json({ error: 'Erro interno.' }); }
};

exports.listLives = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT id, title, description, scheduled_at, duration_min, instructor, status
     FROM lives ORDER BY scheduled_at DESC`
  );
  res.json(rows);
});

exports.getLive = wrap(async (req, res) => {
  const { rows } = await query(`SELECT * FROM lives WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Live não encontrada.' });
  res.json(rows[0]);
});

exports.createLive = wrap(async (req, res) => {
  const { title, description, scheduledAt, durationMin, instructor } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO lives (id,title,description,scheduled_at,duration_min,instructor,status)
     VALUES ($1,$2,$3,$4,$5,$6,'upcoming') RETURNING *`,
    [id, title, description, scheduledAt, durationMin, instructor]
  );
  res.status(201).json(rows[0]);
});

exports.updateLive = wrap(async (req, res) => {
  const { title, description, scheduledAt, durationMin, instructor, status } = req.body;
  const { rows } = await query(
    `UPDATE lives SET title=COALESCE($1,title), description=COALESCE($2,description),
     scheduled_at=COALESCE($3,scheduled_at), duration_min=COALESCE($4,duration_min),
     instructor=COALESCE($5,instructor), status=COALESCE($6,status)
     WHERE id=$7 RETURNING *`,
    [title, description, scheduledAt, durationMin, instructor, status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Live não encontrada.' });
  res.json(rows[0]);
});

exports.deleteLive = wrap(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM lives WHERE id=$1`, [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Live não encontrada.' });
  res.json({ message: 'Live removida.' });
});

exports.getLive = async (req, res) => {
  const { rows } = await query(`SELECT * FROM lives WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Live não encontrada.' });
  res.json(rows[0]);
};

exports.createLive = async (req, res) => {
  const { title, description, scheduledAt, durationMin, instructor } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO lives (id,title,description,scheduled_at,duration_min,instructor,status)
     VALUES ($1,$2,$3,$4,$5,$6,'upcoming') RETURNING *`,
    [id, title, description, scheduledAt, durationMin, instructor]
  );
  res.status(201).json(rows[0]);
};

exports.updateLive = async (req, res) => {
  const { title, description, scheduledAt, durationMin, instructor, status } = req.body;
  const { rows } = await query(
    `UPDATE lives SET title=COALESCE($1,title), description=COALESCE($2,description),
     scheduled_at=COALESCE($3,scheduled_at), duration_min=COALESCE($4,duration_min),
     instructor=COALESCE($5,instructor), status=COALESCE($6,status)
     WHERE id=$7 RETURNING *`,
    [title, description, scheduledAt, durationMin, instructor, status, req.params.id]
  );
  res.json(rows[0]);
};

exports.deleteLive = async (req, res) => {
  await query(`DELETE FROM lives WHERE id=$1`, [req.params.id]);
  res.json({ message: 'Live removida.' });
};


