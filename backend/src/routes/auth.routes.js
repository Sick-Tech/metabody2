/**
 * AUTH ROUTES
 * Base: /api/v1/auth
 * ─────────────────────────────────────────────────────────────
 * POST  /login              → Login aluno (email + senha)
 * POST  /admin/login        → Login admin
 * POST  /logout             → Invalidar refresh token
 * POST  /refresh            → Renovar access token via refresh token
 * POST  /forgot-password    → Enviar email de recuperação
 * POST  /reset-password     → Redefinir senha com token do email
 */
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  ctrl.login
);

router.post('/admin/login',
  [body('email').isEmail(), body('password').notEmpty()],
  ctrl.adminLogin
);

router.post('/logout',   requireAuth, ctrl.logout);
router.post('/refresh',               ctrl.refresh);
router.post('/forgot-password',
  [body('email').isEmail()],
  ctrl.forgotPassword
);
router.post('/reset-password',
  [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })],
  ctrl.resetPassword
);

module.exports = router;
