import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const menuItems = await sql`
      SELECT 
        mi.*,
        mc.name as category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.is_available = true
      ORDER BY mc.name, mi.name
    `;

    const categories = await sql`
      SELECT * FROM menu_categories ORDER BY name
    `;

    return Response.json({ items: menuItems, categories });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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

    const body = await request.json();
    const { category_id, name, description, price, is_available = true } = body;

    if (!category_id || !name || !price) {
      return Response.json({ error: "Category, name, and price are required" }, { status: 400 });
    }

    const newItem = await sql`
      INSERT INTO menu_items (category_id, name, description, price, is_available) 
      VALUES (${category_id}, ${name}, ${description}, ${price}, ${is_available}) 
      RETURNING *
    `;

    return Response.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}