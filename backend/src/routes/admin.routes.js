/**
 * ADMIN ROUTES
 * Base: /api/v1/admin
 * Todas as rotas exigem role = 'admin'
 * ─────────────────────────────────────────────────────────────
 * GET  /stats                    → KPIs: total alunos, ativos, receita, engajamento
 * GET  /activity                 → Feed de atividades recentes
 *
 * --- Gestão de Alunos ---
 * GET  /students                 → Listar alunos (paginação, busca, filtros)
 * POST /students                 → Criar novo aluno
 * GET  /students/:id             → Detalhes de um aluno
 * PUT  /students/:id             → Editar aluno
 * DELETE /students/:id           → Remover aluno
 * PUT  /students/:id/subscription → Atualizar plano/validade do aluno
 *
 * --- Configurações ---
 * GET  /settings                 → Ler configurações (planos, perfil admin)
 * PUT  /settings/plans           → Atualizar preços dos planos
 * PUT  /settings/profile         → Atualizar perfil do admin
 * PUT  /settings/password        → Alterar senha do admin
 */
const router = require('express').Router();
const { body, query } = require('express-validator');
const ctrl = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.use(requireAdmin); // bloqueia tudo sem ser admin

// Dashboard
router.get('/stats',    ctrl.getStats);
router.get('/activity', ctrl.getActivity);

// Alunos
router.get   ('/students',           ctrl.listStudents);
router.post  ('/students',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 })],
  ctrl.createStudent
);
router.get   ('/students/:id',       ctrl.getStudent);
router.put   ('/students/:id',       ctrl.updateStudent);
router.delete('/students/:id',       ctrl.deleteStudent);
router.put   ('/students/:id/subscription', ctrl.updateSubscription);
router.get   ('/students/:id/progress',      ctrl.getStudentProgress);

// Configurações
router.get('/settings',          ctrl.getSettings);
router.put('/settings/plans',    ctrl.updatePlans);
router.put('/settings/profile',  ctrl.updateAdminProfile);
router.put('/settings/password', ctrl.updateAdminPassword);

module.exports = router;
