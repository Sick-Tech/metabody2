/**
 * MEDIA ROUTES (Upload/Download via AWS S3)
 * Base: /api/v1/media
 * ─────────────────────────────────────────────────────────────
 * POST /upload/video     → Retorna URL pré-assinada para upload de vídeo de módulo
 *                          Body: { mimeType: "video/mp4", moduleId }
 *                          Resp: { uploadUrl, key, publicUrl }
 *
 * POST /upload/image     → Retorna URL pré-assinada para upload de imagem (thumb, avatar, logo parceiro)
 *                          Body: { mimeType: "image/jpeg", folder: "thumbnails|avatars|partners" }
 *                          Resp: { uploadUrl, key, publicUrl }
 *
 * GET  /video-url         → Retorna URL pré-assinada temporária para assistir um vídeo privado
 *                          Query: ?key=videos/module-id/uuid.mp4
 *                          (evita URL pública permanente de vídeos pagos)
 *
 * DELETE /               → Remove arquivo do S3 (admin)
 *                          Body: { key }
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/media.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.post('/upload/video',
  requireAdmin,
  [body('mimeType').equals('video/mp4')],
  ctrl.getVideoUploadUrl
);

router.post('/upload/image',
  requireAuth,
  [body('mimeType').isIn(['image/jpeg', 'image/png', 'image/webp']), body('folder').notEmpty()],
  ctrl.getImageUploadUrl
);

// Upload direto via backend (evita CORS no S3)
// Body: raw binary do arquivo | Query: ?folder=videos&mimeType=video%2Fmp4
router.post('/upload/direct', requireAdmin, ctrl.uploadDirect);

router.get('/video-url',   requireAuth,  ctrl.getVideoStreamUrl); // ?key=videos/...

router.delete('/',
  requireAdmin,
  [body('key').notEmpty()],
  ctrl.deleteMedia
);

module.exports = router;
