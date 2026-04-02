/**
 * TRAIL ROUTES (Trilhas & Módulos)
 * Base: /api/v1/trails
 * ─────────────────────────────────────────────────────────────
 * [Aluno]
 * GET  /                        → Listar trilhas publicadas
 * GET  /:id                     → Detalhes da trilha + módulos
 * GET  /:id/modules/:moduleId   → Dados do módulo + URL do vídeo (pré-assinada)
 *
 * [Admin]
 * POST /                        → Criar trilha
 * PUT  /:id                     → Editar trilha
 * DELETE /:id                   → Remover trilha
 * PUT  /:id/publish             → Publicar/despublicar trilha
 * POST /:id/modules             → Adicionar módulo à trilha
 * PUT  /:id/modules/:moduleId   → Editar módulo
 * DELETE /:id/modules/:moduleId → Remover módulo
 * PUT  /:id/modules/:moduleId/publish → Publicar/despublicar módulo
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/trail.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// Rotas de aluno
router.get('/',                         requireAuth,  ctrl.listTrails);
router.get('/:id',                      requireAuth,  ctrl.getTrail);
router.get('/:id/modules/:moduleId',    requireAuth,  ctrl.getModule);

// Rotas de admin
router.post('/',
  requireAdmin, [body('name').notEmpty(), body('description').notEmpty()],
  ctrl.createTrail
);
router.put   ('/:id',                      requireAdmin, ctrl.updateTrail);
router.delete('/:id',                      requireAdmin, ctrl.deleteTrail);
router.put   ('/:id/publish',              requireAdmin, ctrl.togglePublish);

router.post  ('/:id/modules',
  requireAdmin, [body('title').notEmpty(), body('order').isInt()],
  ctrl.addModule
);
router.put   ('/:id/modules/:moduleId',    requireAdmin, ctrl.updateModule);
router.delete('/:id/modules/:moduleId',    requireAdmin, ctrl.deleteModule);
router.put   ('/:id/modules/:moduleId/publish', requireAdmin, ctrl.toggleModulePublish);

module.exports = router;
