/**
 * PROGRESS ROUTES (Progresso do aluno nas trilhas)
 * Base: /api/v1/progress
 * ─────────────────────────────────────────────────────────────
 * GET  /                        → Progresso do aluno em todas as trilhas
 *                                 Resp: [{ trailId, trailName, completedModules, totalModules, percent }]
 *
 * GET  /trails/:trailId         → Progresso detalhado em uma trilha
 *                                 Resp: { trailId, modules: [{ moduleId, completed, watchedAt }] }
 *
 * POST /trails/:trailId/modules/:moduleId/complete
 *                               → Marcar módulo como concluído
 *
 * DELETE /trails/:trailId/modules/:moduleId/complete
 *                               → Desmarcar módulo (refazer)
 */
const router = require('express').Router();
const ctrl   = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get ('/',                                                  ctrl.getAllProgress);
router.get ('/trails/:trailId',                                   ctrl.getTrailProgress);
router.post('/trails/:trailId/modules/:moduleId/complete',        ctrl.completeModule);
router.delete('/trails/:trailId/modules/:moduleId/complete',      ctrl.uncompleteModule);

module.exports = router;
