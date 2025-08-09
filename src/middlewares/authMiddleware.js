/**
* Authentication middleware with express-session
* @param {Object} options - Configuration options
* @returns {Function} Express middleware
 */
import { getTokenFromRequest, verifyToken } from '../utils/jwt.js';

export const authMiddleware = (options = {}) => {
  const config = {
    redirectTo: '/login',
    publicRoutes: ['/', '/login', '/signup', '/public', '/api-docs'],
    debug: process.env.NODE_ENV !== 'production',
    ...options
  };

  return (req, res, next) => {
    // Skip para métodos OPTIONS y HEAD
    if (['OPTIONS', 'HEAD'].includes(req.method)) {
      return next();
    }

    // Verificar rutas públicas
    const isPublic = config.publicRoutes.some(route => {
      return req.path === route || req.path.startsWith(route + '/');
    });

    if (isPublic) {
      return next();
    }

    // 1) Si hay sesión, úsala
    if (req.session && req.session.user) {
      req.user = req.session.user;
      res.locals.user = req.user;
      return next();
    }

    // 2) Intentar autenticar por JWT
    const token = getTokenFromRequest(req);
    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = payload;
        res.locals.user = req.user;
        return next();
      } catch (e) {
        if (config.debug) {
          console.warn(`[Auth] JWT inválido para ${req.path}:`, e.message);
        }
        // Si es API o petición no-GET, devolver 401 JSON; si es vista GET, redirigir
        if (req.method !== 'GET' || req.path.startsWith('/api') || req.accepts('json')) {
          return res.status(401).json({ error: 'Unauthorized', message: 'Token inválido o expirado' });
        }
        req.session.returnTo = req.originalUrl;
        return res.redirect(config.redirectTo);
      }
    }

    // 3) Sin sesión ni token
    if (config.debug) {
      console.log(`[Auth] Intento de acceso no autorizado a ${req.path}`);
    }
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.accepts('json')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Must be login before use the api key'
      });
    }
    req.session.returnTo = req.originalUrl;
    return res.redirect(config.redirectTo);
  };
};

// Helper para roles (opcional)
export const roleMiddleware = (requiredRoles = []) => {
  // Si no se especifican roles, permitir acceso a cualquier usuario autenticado
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }

  return (req, res, next) => {
    // 1. Verificar si hay usuario (debería estar autenticado por authMiddleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // 2. Verificar si el usuario tiene alguno de los roles requeridos
    const userRole = req.user.rol;
    
    // Si no se especificaron roles o el usuario tiene el rol requerido
    if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
      return next();
    }

    // 3. Acceso denegado
    console.warn(`Intento de acceso no autorizado: Usuario ${req.user.email} con rol ${userRole} intentó acceder a ${req.path} que requiere roles: ${requiredRoles.join(', ')}`);
    
    if (req.accepts('html')) {
      return res.status(403).render('error', { 
        message: 'No tienes permisos para acceder a esta página' 
      });
    } else {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'No tienes los permisos necesarios'
      });
    }
  };
};

// Alias comúnmente usados
export const isAdmin = roleMiddleware('ADMIN_ROLE');
export const isEditor = roleMiddleware('CITIZEN_ROLE');
export const isUser = roleMiddleware('ENTREPRENEUR_ROLE');
