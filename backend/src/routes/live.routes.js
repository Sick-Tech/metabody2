/**
 * LIVE ROUTES
 * Base: /api/v1/lives
 * ─────────────────────────────────────────────────────────────
 * [Aluno]
 * GET  /               → Listar lives (próximas + realizadas)
 * GET  /:id            → Detalhes de uma live
 *
 * [Admin]
 * POST /               → Criar live
 * PUT  /:id            → Editar live
 * DELETE /:id          → Remover live
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/live.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.get ('/',    requireAuth, ctrl.listLives);
router.get ('/:id', requireAuth, ctrl.getLive);

router.post  ('/',
  requireAdmin,
  [body('title').notEmpty(), body('scheduledAt').isISO8601(), body('instructor').notEmpty()],
  ctrl.createLive
);
router.put   ('/:id', requireAdmin, ctrl.updateLive);
router.delete('/:id', requireAdmin, ctrl.deleteLive);

module.exports = router;
