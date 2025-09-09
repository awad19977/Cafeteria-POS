export async function GET(request) {
  // For the current authentication system using localStorage,
  // we'll return user info based on a simple session check

  // In a real production app, you'd want proper JWT handling,
  // but for this demo system we'll keep it simple

  // Since this system uses localStorage on the frontend,
  // this endpoint mainly serves as a health check
  return new Response(
    JSON.stringify({
      message: "Auth system is using localStorage-based authentication",
      system: "custom",
      status: "active",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}