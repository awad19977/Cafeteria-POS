import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user info and check if admin
    const currentUser = await sql`
      SELECT u.*, au.email as auth_email 
      FROM users u 
      JOIN auth_users au ON u.email = au.email 
      WHERE au.id = ${session.user.id}
    `;

    if (currentUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = currentUser[0];

    // Only admins can view all users
    if (user.role !== 'admin') {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await sql`SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role = 'user' } = body;

    if (!email || !name) {
      return Response.json({ error: "Email and name are required" }, { status: 400 });
    }

    // Check if user is admin
    const currentUser = await sql`
      SELECT u.role 
      FROM users u 
      JOIN auth_users au ON u.email = au.email 
      WHERE au.id = ${session.user.id}
    `;

    if (currentUser.length === 0 || currentUser[0].role !== 'admin') {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const newUser = await sql`
      INSERT INTO users (email, name, role) 
      VALUES (${email}, ${name}, ${role}) 
      RETURNING *
    `;

    return Response.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}