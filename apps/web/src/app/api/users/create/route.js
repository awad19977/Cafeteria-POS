import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { username, name, email, role, password } = await request.json();

    if (!username || !name || !role || !password) {
      return new Response(JSON.stringify({ error: 'Username, name, role, and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if username already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: 'Username already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new user
    const newUsers = await sql`
      INSERT INTO users (username, name, email, role, password_hash)
      VALUES (${username}, ${name}, ${email || ''}, ${role}, ${password})
      RETURNING id, username, name, email, role, created_at
    `;

    const newUser = newUsers[0];
    
    return new Response(JSON.stringify({ 
      user: newUser,
      message: 'User created successfully' 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}