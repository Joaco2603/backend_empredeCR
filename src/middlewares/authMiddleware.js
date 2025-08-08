/**
* Authentication middleware with express-session
* @param {Object} options - Configuration options
* @returns {Function} Express middleware
 */
export const authMiddleware = (options = {}) => {
  const config = {
    redirectTo: '/login',
    publicRoutes: ['/', '/login', '/signup', '/auth', '/public', '/api-docs'],
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

    // Verificar sesión
    if (!req.session.user) {
      if (config.debug) {
        console.log(`[Auth] Intento de acceso no autorizado a ${req.path}`);
      }

      // API request
      if (req.path.startsWith('/api')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Debes iniciar sesión para acceder a este recurso'
        });
      }

      // Redirección para vistas
      req.session.returnTo = req.originalUrl;
      return res.redirect(config.redirectTo);
    }

    // Adjuntar usuario al request para mayor conveniencia
    req.user = req.session.user;
    next();
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
      return res.status(401).json({ error: 'No autenticado' });
    }

    // 2. Verificar si el usuario tiene alguno de los roles requeridos
    const userRole = req.user.role;
    
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
export const isAdmin = roleMiddleware('admin');
export const isEditor = roleMiddleware('citizen');
export const isUser = roleMiddleware('user');
