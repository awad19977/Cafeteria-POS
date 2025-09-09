import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';

export default function CreateAuth() {
  const auth = async () => {
    const c = getContext();

    // Defensive checks for environment variables to avoid runtime errors
    const authSecret = process.env.AUTH_SECRET || null;
    const authUrl = typeof process.env.AUTH_URL === 'string' ? process.env.AUTH_URL : '';

    try {
      const token = await getToken({
        req: c.req.raw,
        secret: authSecret,
        secureCookie: authUrl.startsWith('https'),
      });

      if (token) {
        return {
          user: {
            id: token.sub,
            email: token.email,
            name: token.name,
            image: token.picture,
          },
          expires: token.exp ? token.exp.toString() : null,
        };
      }
    } catch (err) {
      // Log the error so server console shows the root cause instead of failing silently
      console.error('[CreateAuth] getToken error:', err);
    }

    return null;
  };

  return {
    auth,
  };
}