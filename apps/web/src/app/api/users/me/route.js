import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user info from our users table
    const currentUser = await sql`
      SELECT u.*, au.email as auth_email 
      FROM users u 
      JOIN auth_users au ON u.email = au.email 
      WHERE au.id = ${session.user.id}
    `;

    if (currentUser.length === 0) {
      // User exists in auth but not in our users table, create them with default role
      const newUser = await sql`
        INSERT INTO users (email, name, role) 
        VALUES (${session.user.email}, ${session.user.name || 'User'}, 'user') 
        RETURNING *
      `;
      
      return Response.json(newUser[0]);
    }

    return Response.json(currentUser[0]);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}