export async function GET() {
  try {
    console.log("[/api/auth/expo-web-success] GET called");
  } catch (e) {}
  return Response.json({ ok: true, message: "expo-web-success route is alive" }, { status: 200 });
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => null);
    console.log("[/api/auth/expo-web-success] POST payload:", payload);
  } catch (e) {}
  return Response.json({ ok: true, message: "expo-web-success POST handled" }, { status: 200 });
}