import sql from "@/app/api/utils/sql";

// Get all users
export async function GET() {
  try {
    const users = await sql`
      SELECT id, username, role, full_name, is_active, created_at
      FROM users 
      ORDER BY created_at DESC
    `;

    return Response.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return Response.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request) {
  try {
    const { username, password, role, full_name } = await request.json();

    if (!username || !password || !role || !full_name) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!['admin', 'cashier'].includes(role)) {
      return Response.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUsers.length > 0) {
      return Response.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // For demo purposes, we'll store a simple hash
    // In production, use proper bcrypt hashing
    const password_hash = `hashed_${password}`;

    const newUsers = await sql`
      INSERT INTO users (username, password_hash, role, full_name)
      VALUES (${username}, ${password_hash}, ${role}, ${full_name})
      RETURNING id, username, role, full_name, is_active, created_at
    `;

    return Response.json({
      success: true,
      user: newUsers[0]
    });

  } catch (error) {
    console.error("Create user error:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}