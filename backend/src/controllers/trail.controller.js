const { query }    = require('../config/database');
const { getDownloadPresignedUrl } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (err) {
    console.error(`[Trail Controller] ${fn.name || '?'}:`, err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Erro interno.' });
  }
};

exports.listTrails = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT t.id, t.name, t.description, t.thumbnail_url, t.published,
            COUNT(m.id)::int AS total_modules
     FROM trails t LEFT JOIN modules m ON m.trail_id = t.id AND m.published = true
     WHERE t.published = true GROUP BY t.id ORDER BY t.created_at`
  );
  res.json(rows);
});

exports.listAllTrails = wrap(async (_req, res) => {
  const { rows } = await query(
    `SELECT t.id, t.name, t.description, t.thumbnail_url, t.published,
            COUNT(m.id)::int AS total_modules
     FROM trails t LEFT JOIN modules m ON m.trail_id = t.id
     GROUP BY t.id ORDER BY t.created_at`
  );
  res.json(rows);
});

exports.getTrailAdmin = wrap(async (req, res) => {
  const [trail, modules] = await Promise.all([
    query(`SELECT * FROM trails WHERE id=$1`, [req.params.id]),
    query(`SELECT id,title,description,duration_min,order_num,published,thumbnail_url FROM modules WHERE trail_id=$1 ORDER BY order_num`, [req.params.id]),
  ]);
  if (!trail.rows[0]) return res.status(404).json({ error: 'Trilha não encontrada.' });

  // Busca vídeos — tabela pode ainda não existir em ambientes sem migração
  let videoRows = [];
  try {
    const { rows } = await query(
      `SELECT mv.id, mv.module_id, mv.title, mv.duration_min, mv.order_num
       FROM module_videos mv JOIN modules m ON m.id=mv.module_id
       WHERE m.trail_id=$1 ORDER BY mv.module_id, mv.order_num`,
      [req.params.id]
    );
    videoRows = rows;
  } catch (e) {
    console.warn('[getTrailAdmin] module_videos indisponível:', e.message);
  }

  const videosByModule = {};
  videoRows.forEach(v => {
    if (!videosByModule[v.module_id]) videosByModule[v.module_id] = [];
    videosByModule[v.module_id].push(v);
  });
  const modulesWithVideos = modules.rows.map(m => ({ ...m, videos: videosByModule[m.id] || [] }));
  res.json({ ...trail.rows[0], modules: modulesWithVideos });
});

exports.getTrail = wrap(async (req, res) => {
  const [trail, modules] = await Promise.all([
    query(`SELECT * FROM trails WHERE id=$1 AND published=true`, [req.params.id]),
    query(`SELECT id,title,description,duration_min,order_num,published,thumbnail_url FROM modules WHERE trail_id=$1 AND published=true ORDER BY order_num`, [req.params.id]),
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
  const module = { ...rows[0] };
  // Videos from module_videos table
  const { rows: videoRows } = await query(
    `SELECT id, title, s3_key, duration_min, order_num FROM module_videos WHERE module_id=$1 ORDER BY order_num`,
    [module.id]
  );
  const videos = await Promise.all(videoRows.map(async v => {
    const item = { id: v.id, title: v.title, duration_min: v.duration_min, order_num: v.order_num };
    if (v.s3_key) item.videoUrl = await getDownloadPresignedUrl(v.s3_key, 3600);
    return item;
  }));
  // Legacy: if no module_videos but has video_s3_key, expose it
  if (!videos.length && module.video_s3_key) {
    module.videoUrl = await getDownloadPresignedUrl(module.video_s3_key, 3600);
  }
  delete module.video_s3_key;
  module.videos = videos;
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
  const { title, description, durationMin, videoS3Key } = req.body;
  let { orderNum } = req.body;

  // Se não forneceu ordem ou há conflito, usa next disponível
  if (orderNum == null || isNaN(Number(orderNum))) {
    const { rows: maxRow } = await query(
      `SELECT COALESCE(MAX(order_num), 0) + 1 AS next FROM modules WHERE trail_id=$1`,
      [req.params.id]
    );
    orderNum = maxRow[0].next;
  } else {
    // Verifica se order_num já está em uso e ajusta se necessário
    const { rows: conflict } = await query(
      `SELECT 1 FROM modules WHERE trail_id=$1 AND order_num=$2`,
      [req.params.id, Number(orderNum)]
    );
    if (conflict.length) {
      const { rows: maxRow } = await query(
        `SELECT COALESCE(MAX(order_num), 0) + 1 AS next FROM modules WHERE trail_id=$1`,
        [req.params.id]
      );
      orderNum = maxRow[0].next;
    }
  }

  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO modules (id,trail_id,title,description,duration_min,order_num,video_s3_key,published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,false) RETURNING id,title,order_num,published`,
    [id, req.params.id, title, description, durationMin ?? null, Number(orderNum), videoS3Key ?? null]
  );
  res.status(201).json(rows[0]);
});

exports.updateModule = wrap(async (req, res) => {
  const { title, description, durationMin, orderNum, videoS3Key, thumbnailUrl } = req.body;
  const { rows } = await query(
    `UPDATE modules SET title=COALESCE($1,title), description=COALESCE($2,description),
     duration_min=COALESCE($3,duration_min), order_num=COALESCE($4,order_num),
     video_s3_key=COALESCE($5,video_s3_key),
     thumbnail_url=COALESCE($8,thumbnail_url)
     WHERE id=$6 AND trail_id=$7 RETURNING *`,
    [title, description, durationMin, orderNum, videoS3Key, req.params.moduleId, req.params.id, thumbnailUrl ?? null]
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

exports.addModuleVideo = wrap(async (req, res) => {
  const { title, s3Key, durationMin } = req.body;
  const { id: trailId, moduleId } = req.params;
  const { rows: mRows } = await query(
    `SELECT id FROM modules WHERE id=$1 AND trail_id=$2`, [moduleId, trailId]
  );
  if (!mRows[0]) return res.status(404).json({ error: 'Módulo não encontrado.' });
  const { rows: orderRows } = await query(
    `SELECT COALESCE(MAX(order_num),0)+1 AS next FROM module_videos WHERE module_id=$1`, [moduleId]
  );
  const { rows } = await query(
    `INSERT INTO module_videos (id,module_id,title,s3_key,duration_min,order_num)
     VALUES (uuid_generate_v4(),$1,$2,$3,$4,$5) RETURNING id,title,duration_min,order_num`,
    [moduleId, title || '', s3Key || null, durationMin ? parseInt(durationMin) : null, orderRows[0].next]
  );
  res.status(201).json(rows[0]);
});

exports.deleteModuleVideo = wrap(async (req, res) => {
  const { moduleId, videoId } = req.params;
  const { rowCount } = await query(
    `DELETE FROM module_videos WHERE id=$1 AND module_id=$2`, [videoId, moduleId]
  );
  if (!rowCount) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  res.json({ deleted: true });
});

// fim do módulo
