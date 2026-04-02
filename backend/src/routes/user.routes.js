/**
 * USER ROUTES (Aluno autenticado)
 * Base: /api/v1/users
 * ─────────────────────────────────────────────────────────────
 * GET  /me              → Perfil do aluno logado
 * PUT  /me              → Atualizar nome, avatar
 * PUT  /me/password     → Alterar senha
 * GET  /me/subscription → Plano ativo, validade, status
 */
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth); // todas exigem login

router.get ('/me',              ctrl.getMe);
router.put ('/me',
  [body('name').optional().notEmpty()],
  ctrl.updateMe
);
router.put ('/me/password',
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  ctrl.changePassword
);
router.get ('/me/subscription', ctrl.getMySubscription);

module.exports = router;
