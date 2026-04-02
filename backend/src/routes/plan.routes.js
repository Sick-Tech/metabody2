/**
 * PLAN ROUTES
 * Base: /api/v1/plans
 * ─────────────────────────────────────────────────────────────
 * GET  /       → Listar planos disponíveis e preços (público)
 * PUT  /:id    → Atualizar preço de um plano (admin)
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/plan.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/',     ctrl.listPlans);
router.put('/:id',  requireAdmin, [body('price').isFloat({ min: 0 })], ctrl.updatePlan);

module.exports = router;
