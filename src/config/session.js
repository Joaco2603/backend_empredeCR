import session from 'express-session';
import { config } from './env.js';

export const sessionConfig = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax'
  },
  name: 'sessionId' // Nombre personalizado para la cookie
};

// Función de inicialización por si necesitas más control
export const initSession = (app) => {
  app.use(session(sessionConfig));
};