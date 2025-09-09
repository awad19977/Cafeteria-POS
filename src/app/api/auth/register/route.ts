import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name, email } = body || {};

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'username already taken' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, name: name ?? null, email: email ?? null },
      select: { id: true, username: true, name: true, email: true, createdAt: true },
    });

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[auth/register] error', err);
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}