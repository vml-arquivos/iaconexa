import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral para todas as rotas
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requisições
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Não aplicar rate limit em health check
    return req.path === '/api/health';
  },
});

/**
 * Rate limiter mais restritivo para login
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

/**
 * Rate limiter para APIs de escrita
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisições
  message: 'Muitas requisições de escrita, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Apenas para POST, PUT, DELETE
    return !['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  },
});
