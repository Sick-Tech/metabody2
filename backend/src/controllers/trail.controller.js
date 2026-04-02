const { query }    = require('../config/database');
const { getDownloadPresignedUrl } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) { res.status(500).json({ error: 'Erro interno.' }); }
};

exports.listTrails = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT t.id, t.name, t.description, t.thumbnail_url, t.published,
            COUNT(m.id) total_modules
     FROM trails t LEFT JOIN modules m ON m.trail_id = t.id AND m.published = true
     WHERE t.published = true GROUP BY t.id ORDER BY t.created_at`
  );
  res.json(rows);
});

exports.getTrail = wrap(async (req, res) => {
  const [trail, modules] = await Promise.all([
    query(`SELECT * FROM trails WHERE id=$1 AND published=true`, [req.params.id]),
    query(`SELECT id,title,description,duration_min,order_num,published FROM modules WHERE trail_id=$1 ORDER BY order_num`, [req.params.id]),
  ]);
  if (!trail.rows[0]) return res.status(404).json({ error: 'Trilha não encontrada.' });
  res.json({ ...trail.rows[0], modules: modules.rows });
});

exports.getModule = wrap(async (req, res) => {
  const { rows } = await query(
    `SELECT m.* FROM modules m JOIN trails t ON t.id=m.trail_id
     WHERE m.id=$1 AND m.trail_id=$2 AND m.published=true AND t.published=true`,
    [req.params.moduleId, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Módulo não encontrado.' });
  const module = rows[0];
  if (module.video_s3_key) {
    module.videoUrl = await getDownloadPresignedUrl(module.video_s3_key, 3600);
  }
  delete module.video_s3_key;
  res.json(module);
});

exports.createTrail = wrap(async (req, res) => {
  const { name, description, thumbnailUrl } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO trails (id,name,description,thumbnail_url,published) VALUES ($1,$2,$3,$4,false) RETURNING *`,
    [id, name, description, thumbnailUrl]
  );
  res.status(201).json(rows[0]);
});

exports.updateTrail = wrap(async (req, res) => {
  const { name, description, thumbnailUrl } = req.body;
  const { rows } = await query(
    `UPDATE trails SET name=COALESCE($1,name), description=COALESCE($2,description), thumbnail_url=COALESCE($3,thumbnail_url) WHERE id=$4 RETURNING *`,
    [name, description, thumbnailUrl, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Trilha não encontrada.' });
  res.json(rows[0]);
});

exports.deleteTrail = wrap(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM trails WHERE id=$1`, [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Trilha não encontrada.' });
  res.json({ message: 'Trilha removida.' });
});

exports.togglePublish = wrap(async (req, res) => {
  const { rows } = await query(
    `UPDATE trails SET published = NOT published WHERE id=$1 RETURNING id, published`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Trilha não encontrada.' });
  res.json(rows[0]);
});

exports.addModule = wrap(async (req, res) => {
  const { title, description, durationMin, orderNum, videoS3Key } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO modules (id,trail_id,title,description,duration_min,order_num,video_s3_key,published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,false) RETURNING id,title,order_num,published`,
    [id, req.params.id, title, description, durationMin, orderNum, videoS3Key]
  );
  res.status(201).json(rows[0]);
});

exports.updateModule = wrap(async (req, res) => {
  const { title, description, durationMin, orderNum, videoS3Key } = req.body;
  const { rows } = await query(
    `UPDATE modules SET title=COALESCE($1,title), description=COALESCE($2,description),
     duration_min=COALESCE($3,duration_min), order_num=COALESCE($4,order_num),
     video_s3_key=COALESCE($5,video_s3_key) WHERE id=$6 AND trail_id=$7 RETURNING *`,
    [title, description, durationMin, orderNum, videoS3Key, req.params.moduleId, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Módulo não encontrado.' });
  res.json(rows[0]);
});

exports.deleteModule = wrap(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM modules WHERE id=$1 AND trail_id=$2`, [req.params.moduleId, req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Módulo não encontrado.' });
  res.json({ message: 'Módulo removido.' });
});

exports.toggleModulePublish = wrap(async (req, res) => {
  const { rows } = await query(
    `UPDATE modules SET published = NOT published WHERE id=$1 RETURNING id, published`,
    [req.params.moduleId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Módulo não encontrado.' });
  res.json(rows[0]);
});

exports.getTrail = async (req, res) => {
  const [trail, modules] = await Promise.all([
    query(`SELECT * FROM trails WHERE id=$1 AND published=true`, [req.params.id]),
    query(`SELECT id,title,description,duration_min,order_num,published FROM modules WHERE trail_id=$1 ORDER BY order_num`, [req.params.id]),
  ]);
  if (!trail.rows[0]) return res.status(404).json({ error: 'Trilha não encontrada.' });
  res.json({ ...trail.rows[0], modules: modules.rows });
};

exports.getModule = async (req, res) => {
  const { rows } = await query(
    `SELECT m.* FROM modules m JOIN trails t ON t.id=m.trail_id
     WHERE m.id=$1 AND m.trail_id=$2 AND m.published=true AND t.published=true`,
    [req.params.moduleId, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Módulo não encontrado.' });
  const module = rows[0];
  // URL temporária do vídeo (1h de validade)
  if (module.video_s3_key) {
    module.videoUrl = await getDownloadPresignedUrl(module.video_s3_key, 3600);
  }
  delete module.video_s3_key; // nunca expor a chave S3
  res.json(module);
};

exports.createTrail = async (req, res) => {
  const { name, description, thumbnailUrl } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO trails (id,name,description,thumbnail_url,published) VALUES ($1,$2,$3,$4,false) RETURNING *`,
    [id, name, description, thumbnailUrl]
  );
  res.status(201).json(rows[0]);
};

exports.updateTrail = async (req, res) => {
  const { name, description, thumbnailUrl } = req.body;
  const { rows } = await query(
    `UPDATE trails SET name=COALESCE($1,name), description=COALESCE($2,description), thumbnail_url=COALESCE($3,thumbnail_url) WHERE id=$4 RETURNING *`,
    [name, description, thumbnailUrl, req.params.id]
  );
  res.json(rows[0]);
};

exports.deleteTrail = async (req, res) => {
  await query(`DELETE FROM trails WHERE id=$1`, [req.params.id]);
  res.json({ message: 'Trilha removida.' });
};

exports.togglePublish = async (req, res) => {
  const { rows } = await query(
    `UPDATE trails SET published = NOT published WHERE id=$1 RETURNING id, published`,
    [req.params.id]
  );
  res.json(rows[0]);
};

exports.addModule = async (req, res) => {
  const { title, description, durationMin, orderNum, videoS3Key } = req.body;
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO modules (id,trail_id,title,description,duration_min,order_num,video_s3_key,published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,false) RETURNING id,title,order_num,published`,
    [id, req.params.id, title, description, durationMin, orderNum, videoS3Key]
  );
  res.status(201).json(rows[0]);
};

exports.updateModule = async (req, res) => {
  const { title, description, durationMin, orderNum, videoS3Key } = req.body;
  const { rows } = await query(
    `UPDATE modules SET title=COALESCE($1,title), description=COALESCE($2,description),
     duration_min=COALESCE($3,duration_min), order_num=COALESCE($4,order_num),
     video_s3_key=COALESCE($5,video_s3_key) WHERE id=$6 AND trail_id=$7 RETURNING *`,
    [title, description, durationMin, orderNum, videoS3Key, req.params.moduleId, req.params.id]
  );
  res.json(rows[0]);
};

exports.deleteModule = async (req, res) => {
  await query(`DELETE FROM modules WHERE id=$1 AND trail_id=$2`, [req.params.moduleId, req.params.id]);
  res.json({ message: 'Módulo removido.' });
};

exports.toggleModulePublish = async (req, res) => {
  const { rows } = await query(
    `UPDATE modules SET published = NOT published WHERE id=$1 RETURNING id, published`,
    [req.params.moduleId]
  );
  res.json(rows[0]);
};
