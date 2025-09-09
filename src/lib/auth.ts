import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'app_session';
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) throw new Error('AUTH_SECRET is not set in environment');

export function signSession(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn });
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, AUTH_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export function buildSetCookieHeader(token: string, maxAgeSeconds = 7 * 24 * 60 * 60) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  // HttpOnly, SameSite=Lax, Path=/; max-age in seconds
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; ${secure}Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function buildClearCookieHeader() {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  // Expire the cookie immediately
  return `${AUTH_COOKIE_NAME}=; HttpOnly; ${secure}Path=/; Max-Age=0; SameSite=Lax`;
}

export function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((chunk) => {
      const idx = chunk.indexOf('=');
      if (idx === -1) return ['', ''];
      const k = chunk.slice(0, idx).trim();
      const v = chunk.slice(idx + 1).trim();
      return [k, v];
    })
  );
}