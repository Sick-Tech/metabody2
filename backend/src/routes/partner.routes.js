/**
 * PARTNER ROUTES
 * Base: /api/v1/partners
 * ─────────────────────────────────────────────────────────────
 * [Aluno]
 * GET  /          → Listar parceiros ativos
 * GET  /:id       → Detalhes + link/cupom de desconto
 *
 * [Admin]
 * GET  /admin/all → Listar todos (incluindo inativos)
 * POST /          → Criar parceiro
 * PUT  /:id       → Editar parceiro
 * DELETE /:id     → Remover parceiro
 * PUT  /:id/toggle → Ativar/desativar parceiro
 */
const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/partner.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.get('/',         requireAuth,  ctrl.listPartners);
router.get('/admin/all',requireAdmin, ctrl.listAllPartners);
router.get('/:id',      requireAuth,  ctrl.getPartner);

router.post  ('/',
  requireAdmin,
  [body('name').notEmpty(), body('category').notEmpty(), body('discount').notEmpty()],
  ctrl.createPartner
);
router.put   ('/:id',        requireAdmin, ctrl.updatePartner);
router.delete('/:id',        requireAdmin, ctrl.deletePartner);
router.put   ('/:id/toggle', requireAdmin, ctrl.togglePartner);

module.exports = router;
