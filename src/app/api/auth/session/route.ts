import { prisma } from '../../../../lib/prisma';
import { parseCookies, verifySession } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies['app_session'];
    if (!token) {
      return new Response(JSON.stringify({ user: null, expires: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifySession(token);
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      return new Response(JSON.stringify({ user: null, expires: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const uid = Number((payload as any).userId);
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, username: true, name: true, email: true },
    });
    if (!user) {
      return new Response(JSON.stringify({ user: null, expires: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const expires = (payload as any).exp ? new Date((payload as any).exp * 1000).toISOString() : null;

    return new Response(JSON.stringify({ user, expires }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[auth/session] error', err);
    return new Response(JSON.stringify({ user: null, expires: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}