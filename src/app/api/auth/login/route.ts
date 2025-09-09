import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { signSession, buildSetCookieHeader } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = signSession({ userId: user.id, username: user.username }, '7d');
    const setCookie = buildSetCookieHeader(token, 7 * 24 * 60 * 60);

    const safeUser = { id: user.id, username: user.username, name: user.name ?? null, email: user.email ?? null };
    return new Response(JSON.stringify({ user: safeUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookie },
    });
  } catch (err: any) {
    console.error('[auth/login] error', err);
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}