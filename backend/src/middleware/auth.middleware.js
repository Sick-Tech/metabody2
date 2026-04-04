const jwt = require('jsonwebtoken');

const SECRET         = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Middleware: verifica JWT de acesso no header Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
  // Prioriza Authorization header (admin/API); cookie httpOnly como fallback (alunos)
  const headerToken  = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const cookieToken  = req.cookies?.mb_access;
  const token = headerToken || cookieToken;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso obrigatório.' });
  }
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * Middleware: apenas admins
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    next();
  });
}

function signAccessToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { requireAuth, requireAdmin, signAccessToken, signRefreshToken, verifyRefreshToken };
