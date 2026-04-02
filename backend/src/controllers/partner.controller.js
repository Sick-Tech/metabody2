const { query }    = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) { res.status(500).json({ error: 'Erro interno.' }); }
};

exports.listPartners = wrap(async (_req, res) => {
  const { rows } = await query(`SELECT id,name,category,discount,logo_url,description,coupon_url FROM partners WHERE active=true ORDER BY name`);
  res.json(rows);
});

exports.listAllPartners = wrap(async (_req, res) => {
  const { rows } = await query(`SELECT * FROM partners ORDER BY name`);
  res.json(rows);
});

exports.getPartner = wrap(async (req, res) => {
  const { rows } = await query(`SELECT * FROM partners WHERE id=$1 AND active=true`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});

exports.createPartner = wrap(async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO partners (id,name,category,discount,logo_url,description,coupon_url,active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
    [id, name, category, discount, logoUrl, description, couponUrl]
  );
  res.status(201).json(rows[0]);
});

exports.updatePartner = wrap(async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  const { rows } = await query(
    `UPDATE partners SET name=COALESCE($1,name), category=COALESCE($2,category),
     discount=COALESCE($3,discount), logo_url=COALESCE($4,logo_url),
     description=COALESCE($5,description), coupon_url=COALESCE($6,coupon_url)
     WHERE id=$7 RETURNING *`,
    [name, category, discount, logoUrl, description, couponUrl, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});

exports.deletePartner = wrap(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM partners WHERE id=$1`, [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json({ message: 'Parceiro removido.' });
});

exports.togglePartner = wrap(async (req, res) => {
  const { rows } = await query(
    `UPDATE partners SET active = NOT active WHERE id=$1 RETURNING id, active`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
});

exports.listAllPartners = async (_req, res) => {
  const { rows } = await query(`SELECT * FROM partners ORDER BY name`);
  res.json(rows);
};

exports.getPartner = async (req, res) => {
  const { rows } = await query(`SELECT * FROM partners WHERE id=$1 AND active=true`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Parceiro não encontrado.' });
  res.json(rows[0]);
};

exports.createPartner = async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO partners (id,name,category,discount,logo_url,description,coupon_url,active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
    [id, name, category, discount, logoUrl, description, couponUrl]
  );
  res.status(201).json(rows[0]);
};

exports.updatePartner = async (req, res) => {
  const { name, category, discount, logoUrl, description, couponUrl } = req.body;
  const { rows } = await query(
    `UPDATE partners SET name=COALESCE($1,name), category=COALESCE($2,category),
     discount=COALESCE($3,discount), logo_url=COALESCE($4,logo_url),
     description=COALESCE($5,description), coupon_url=COALESCE($6,coupon_url)
     WHERE id=$7 RETURNING *`,
    [name, category, discount, logoUrl, description, couponUrl, req.params.id]
  );
  res.json(rows[0]);
};

exports.deletePartner = async (req, res) => {
  await query(`DELETE FROM partners WHERE id=$1`, [req.params.id]);
  res.json({ message: 'Parceiro removido.' });
};

exports.togglePartner = async (req, res) => {
  const { rows } = await query(
    `UPDATE partners SET active = NOT active WHERE id=$1 RETURNING id, active`,
    [req.params.id]
  );
  res.json(rows[0]);
};
