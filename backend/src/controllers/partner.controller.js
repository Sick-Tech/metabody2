const { query }    = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) {
    console.error('partner error:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/* Listagem pública (apenas ativos) */
exports.listPartners = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT id, name, category, discount, logo_url, description, coupon_url, active
     FROM partners WHERE active = true ORDER BY name`
  );
  res.json(rows);
});

/* Listagem admin (todos) */
exports.listAllPartners = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT id, name, category, discount, logo_url, description, coupon_url, active
     FROM partners ORDER BY name`
  );
  res.json(rows);
});

/* Buscar um parceiro (admin: sem filtro de active) */
exports.getPartner = wrap(async (req, res) => {
  const { rows } = await query(`SELECT * FROM partners WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});

/* Criar parceiro */
exports.createPartner = wrap(async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  if (!name || !category || !discount) {
    return res.status(400).json({ error: 'Nome, categoria e benefício são obrigatórios.' });
  }
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO partners (id, name, category, discount, logo_url, description, coupon_url, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
    [id, name, category, discount, logoUrl || null, description || null, couponUrl || null]
  );
  res.status(201).json(rows[0]);
});

/* Atualizar parceiro */
exports.updatePartner = wrap(async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  const { rows } = await query(
    `UPDATE partners
     SET name        = COALESCE($1, name),
         category    = COALESCE($2, category),
         discount    = COALESCE($3, discount),
         logo_url    = COALESCE($4, logo_url),
         description = COALESCE($5, description),
         coupon_url  = COALESCE($6, coupon_url),
         updated_at  = NOW()
     WHERE id = $7 RETURNING *`,
    [name || null, category || null, discount || null, logoUrl || null, description || null, couponUrl || null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});

/* Remover parceiro */
exports.deletePartner = wrap(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM partners WHERE id = $1`, [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json({ message: 'Parceiro removido.' });
});

/* Ativar / desativar parceiro */
exports.togglePartner = wrap(async (req, res) => {
  const { rows } = await query(
    `UPDATE partners SET active = NOT active, updated_at = NOW()
     WHERE id = $1 RETURNING id, active`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});
