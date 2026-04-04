const { getUploadPresignedUrl, getDownloadPresignedUrl, deleteObject, uploadFileStream } = require('../config/s3');

// POST /api/v1/media/upload/direct?folder=videos&mimeType=video%2Fmp4
// O arquivo vem no body como stream binário — backend envia ao S3 sem CORS
exports.uploadDirect = async (req, res) => {
  try {
    const { folder, mimeType } = req.query;
    const contentLength = parseInt(req.headers['content-length'] || '0', 10) || undefined;
    const result = await uploadFileStream({ folder, mimeType, body: req, contentLength });
    res.json(result);
  } catch (err) {
    console.error('[uploadDirect]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Erro interno.' });
  }
};

// POST /api/v1/media/upload/video
exports.getVideoUploadUrl = async (req, res) => {
  try {
    const { mimeType } = req.body;
    const result = await getUploadPresignedUrl({ folder: 'videos', mimeType });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erro interno.' });
  }
};

// POST /api/v1/media/upload/image
exports.getImageUploadUrl = async (req, res) => {
  try {
    const { mimeType, folder } = req.body;
    const result = await getUploadPresignedUrl({ folder, mimeType });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erro interno.' });
  }
};

// GET /api/v1/media/video-url?key=videos/...
exports.getVideoStreamUrl = async (req, res) => {
  try {
    const key = req.query.key;
    if (!key || !key.startsWith('videos/')) {
      return res.status(400).json({ error: 'Chave inválida.' });
    }
    const url = await getDownloadPresignedUrl(key, 3600);
    res.json({ url, expiresIn: 3600 });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// DELETE /api/v1/media
exports.deleteMedia = async (req, res) => {
  const { key } = req.body;
  const VALID_PREFIXES = ['videos/', 'thumbnails/', 'avatars/', 'partners/'];
  if (!key || !VALID_PREFIXES.some(p => key.startsWith(p))) {
    return res.status(400).json({ error: 'Chave S3 inválida.' });
  }
  try {
    await deleteObject(key);
    res.json({ message: 'Arquivo removido.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover arquivo.' });
  }
};

