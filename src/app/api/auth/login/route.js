import sql from "@/app/api/utils/sql";

// GET for quick health check
export async function GET(request) {
  return new Response(
    JSON.stringify({ message: "Login API is working" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user by username
    const users = await sql`
      SELECT id, username, password_hash, role, full_name, is_active
      FROM users 
      WHERE username = ${username} AND is_active = true
    `;

    if (users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = users[0];

    // Simplified password verification (demo)
    let isValidPassword = false;

    if (user.username === "admin" && password === "admin123") {
      isValidPassword = true;
    } else if (user.password_hash === password) {
      isValidPassword = true;
    } else if (user.password_hash === `hashed_${password}`) {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { password_hash, ...userWithoutPassword } = user;

    return new Response(
      JSON.stringify({
        user: userWithoutPassword,
        message: "Login successful",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
