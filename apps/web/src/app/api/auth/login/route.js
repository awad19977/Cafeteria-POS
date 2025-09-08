import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user by username
    const users = await sql`
      SELECT id, username, name, email, role, password_hash 
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];

    // For now, simple password check (in production, use bcrypt)
    // Password is 'admin123' for all users currently
    if (password !== 'admin123') {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;
    
    return new Response(JSON.stringify({ 
      user: userWithoutPassword,
      message: 'Login successful' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}