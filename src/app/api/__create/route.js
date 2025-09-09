export async function GET() {
  return Response.json({ ok: true, message: "dev stub GET", path: new URL(Request?.url || "http://dev").pathname }, { status: 200 });
}
export async function POST(request) {
  const payload = await request.json().catch(()=>null);
  console.log("[dev-stub] POST", payload);
  return Response.json({ ok: true, message: "dev stub POST", payload }, { status: 200 });
}
