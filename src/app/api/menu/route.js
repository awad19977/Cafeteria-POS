import sql from "@/app/api/utils/sql";

// Get all menu items with categories
export async function GET() {
  try {
    const menuItems = await sql`
      SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.is_available,
        mi.image_url,
        mc.name as category_name,
        mc.id as category_id
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mc.is_active = true
      ORDER BY mc.display_order, mi.name
    `;

    const categories = await sql`
      SELECT id, name, display_order
      FROM menu_categories
      WHERE is_active = true
      ORDER BY display_order
    `;

    return Response.json({ 
      menuItems,
      categories
    });
  } catch (error) {
    console.error("Get menu error:", error);
    return Response.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// Create new menu item
export async function POST(request) {
  try {
    const { category_id, name, description, price, image_url } = await request.json();

    if (!category_id || !name || !price) {
      return Response.json(
        { error: "Category, name, and price are required" },
        { status: 400 }
      );
    }

    const newItems = await sql`
      INSERT INTO menu_items (category_id, name, description, price, image_url)
      VALUES (${category_id}, ${name}, ${description || ''}, ${price}, ${image_url || ''})
      RETURNING id, category_id, name, description, price, is_available, image_url
    `;

    return Response.json({
      success: true,
      menuItem: newItems[0]
    });

  } catch (error) {
    console.error("Create menu item error:", error);
    return Response.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}