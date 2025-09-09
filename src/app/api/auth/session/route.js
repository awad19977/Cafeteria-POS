export async function GET(request) {
  // Log incoming request for debugging
  try {
    // Some runtimes do not allow reading all headers; this is best-effort
    console.log("[/api/auth/session] GET called:", { url: request.url });
  } catch (e) {}

  // Return a stable response with the shape Auth.js expects when there is no server session.
  // This prevents Auth.js client from receiving an unexpected response and throwing.
  return new Response(
    JSON.stringify({
      user: null,
      expires: null,
      message: "This app uses localStorage-based authentication, not server sessions",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(request) {
  try {
    console.log("[/api/auth/session] POST called");
  } catch (e) {}

  return new Response(
    JSON.stringify({
      user: null,
      expires: null,
      message: "This app uses localStorage-based authentication, not server sessions",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
