// Dev catch-all for /api/* — returns JSON for every API request so client won't choke on HTML.
// Save at: E:\web\src\app\api\[...all]\route.js

export async function GET(request) {
  try {
    const url = new URL(request.url);
    console.log("[dev-catch-all] GET", url.pathname);
    return Response.json({ ok: false, message: "dev-catch-all GET", path: url.pathname }, { status: 200 });
  } catch (err) {
    console.error("[dev-catch-all] GET error:", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const payload = await request.json().catch(() => null);
    console.log("[dev-catch-all] POST", url.pathname, "payload:", payload);
    return Response.json({ ok: false, message: "dev-catch-all POST", path: url.pathname, payload }, { status: 200 });
  } catch (err) {
    console.error("[dev-catch-all] POST error:", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }
}

export async function PUT(request) { return POST(request); }
export async function DELETE(request) { return POST(request); }