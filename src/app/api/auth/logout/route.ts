import { buildClearCookieHeader } from '../../../../lib/auth';

export async function POST() {
  const clearCookie = buildClearCookieHeader();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie },
  });
}