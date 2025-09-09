import sql from "@/app/api/utils/sql";

// Add GET method for testing/debugging
export async function GET(request) {
  return Response.json({ message: "Login API is working" }, { status: 200 });
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Get user by username
    const users = await sql`
      SELECT id, username, password_hash, role, full_name, is_active
      FROM users 
      WHERE username = ${username} AND is_active = true
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const user = users[0];

    // Simplified password verification for demo
    // Check if password matches either the plain text or the hash stored
    let isValidPassword = false;

    // For demo admin user
    if (user.username === "admin" && password === "admin123") {
      isValidPassword = true;
    }
    // For simple stored passwords (demo)
    else if (user.password_hash === password) {
      isValidPassword = true;
    }
    // For users created through the admin interface with simple hashing
    else if (user.password_hash === `hashed_${password}`) {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
