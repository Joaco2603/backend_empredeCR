import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const DEFAULT_EXPIRES_IN = config.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = config.JWT_SECRET || 'change-this-secret';

export function signToken(payload = {}, options = {}) {
  const { expiresIn = DEFAULT_EXPIRES_IN, ...jwtOptions } = options;
  return jwt.sign(payload, JWT_SECRET, { expiresIn, ...jwtOptions });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getTokenFromRequest(req) {
  // 1) Cookie token
  const rawCookie = req.headers['cookie'];
  if (typeof rawCookie === 'string') {
    const cookies = Object.fromEntries(
      rawCookie.split(';').map(part => {
        const [k, ...rest] = part.trim().split('=');
        return [decodeURIComponent(k), decodeURIComponent(rest.join('='))];
      })
    );
    if (cookies.token) {
      return cookies.token;
    }
  }

  return null;
}

