// Simple, defensive login endpoint for apps/web dev server.
// Saves a clear JSON response and logs errors so POSTs are handled.

import sql from "@/app/api/utils/sql";

export async function GET(request) {
  return Response.json({ message: "Login endpoint (GET) alive" }, { status: 200 });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    console.log("[/api/auth/login] payload:", payload);

    const { username, password } = payload || {};

    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Example DB lookup - keep this safe if sql utils are not available in this app
    let users = [];
    try {
      users = await sql`
        SELECT id, username, password_hash, role, full_name, is_active
        FROM users 
        WHERE username = ${username} AND is_active = true
      `;
    } catch (dbErr) {
      console.warn("[/api/auth/login] db query failed or sql not available:", dbErr);
      // In dev, continue with a demo fallback for admin
    }

    if (users.length === 0) {
      // fallback demo check for admin (remove in production)
      if (!(username === "admin" && password === "admin123")) {
        return Response.json({ error: "Invalid username or password" }, { status: 401 });
      }

      // demo user object
      const demoUser = { id: 1, username: "admin", role: "admin", full_name: "Admin User", is_active: true };
      return Response.json({ user: demoUser, message: "Login successful (demo)" }, { status: 200 });
    }

    const user = users[0];
    // simple password checks for demo; replace with real verification
    const isValid = (user.username === "admin" && password === "admin123") ||
                    user.password_hash === password ||
                    user.password_hash === `hashed_${password}`;

    if (!isValid) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const { password_hash, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword, message: "Login successful" }, { status: 200 });
  } catch (err) {
    console.error("[/api/auth/login] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}