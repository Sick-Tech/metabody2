const { query } = require('../config/database');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) { res.status(500).json({ error: 'Erro interno.' }); }
};

exports.getAllProgress = wrap(async (req, res) => {
  const { rows } = await query(
    `SELECT t.id trail_id, t.name trail_name,
            COUNT(m.id) total_modules,
            COUNT(p.module_id) completed_modules,
            ROUND(COUNT(p.module_id)::numeric / NULLIF(COUNT(m.id),0) * 100) percent
     FROM trails t
     JOIN modules m ON m.trail_id = t.id AND m.published = true
     LEFT JOIN module_progress p ON p.module_id = m.id AND p.user_id = $1
     WHERE t.published = true
     GROUP BY t.id, t.name ORDER BY t.name`,
    [req.user.id]
  );
  res.json(rows);
});

exports.getTrailProgress = wrap(async (req, res) => {
  const { rows } = await query(
    `SELECT m.id module_id, m.title, m.order_num,
            p.completed, p.watched_at
     FROM modules m
     LEFT JOIN module_progress p ON p.module_id = m.id AND p.user_id = $1
     WHERE m.trail_id = $2 AND m.published = true
     ORDER BY m.order_num`,
    [req.user.id, req.params.trailId]
  );
  res.json(rows);
});

exports.completeModule = wrap(async (req, res) => {
  await query(
    `INSERT INTO module_progress (user_id, module_id, completed, watched_at)
     VALUES ($1,$2,true,NOW())
     ON CONFLICT (user_id, module_id) DO UPDATE SET completed=true, watched_at=NOW()`,
    [req.user.id, req.params.moduleId]
  );
  res.json({ message: 'Módulo marcado como concluído.' });
});

exports.uncompleteModule = wrap(async (req, res) => {
  await query(
    `UPDATE module_progress SET completed=false WHERE user_id=$1 AND module_id=$2`,
    [req.user.id, req.params.moduleId]
  );
  res.json({ message: 'Progresso removido.' });
});

exports.getTrailProgress = async (req, res) => {
  const { rows } = await query(
    `SELECT m.id module_id, m.title, m.order_num,
            p.completed, p.watched_at
     FROM modules m
     LEFT JOIN module_progress p ON p.module_id = m.id AND p.user_id = $1
     WHERE m.trail_id = $2 AND m.published = true
     ORDER BY m.order_num`,
    [req.user.id, req.params.trailId]
  );
  res.json(rows);
};

exports.completeModule = async (req, res) => {
  await query(
    `INSERT INTO module_progress (user_id, module_id, completed, watched_at)
     VALUES ($1,$2,true,NOW())
     ON CONFLICT (user_id, module_id) DO UPDATE SET completed=true, watched_at=NOW()`,
    [req.user.id, req.params.moduleId]
  );
  res.json({ message: 'Módulo marcado como concluído.' });
};

exports.uncompleteModule = async (req, res) => {
  await query(
    `UPDATE module_progress SET completed=false WHERE user_id=$1 AND module_id=$2`,
    [req.user.id, req.params.moduleId]
  );
  res.json({ message: 'Progresso removido.' });
};
