import sql from "@/app/api/utils/sql";

// Update menu item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description, price, category_id, is_available } = await request.json();

    if (!name || !price) {
      return Response.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const updatedItems = await sql`
      UPDATE menu_items 
      SET 
        name = ${name},
        description = ${description || ''},
        price = ${price},
        category_id = ${category_id},
        is_available = ${is_available !== undefined ? is_available : true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, category_id, name, description, price, is_available, image_url
    `;

    if (updatedItems.length === 0) {
      return Response.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      menuItem: updatedItems[0]
    });

  } catch (error) {
    console.error("Update menu item error:", error);
    return Response.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// Delete menu item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const deletedItems = await sql`
      DELETE FROM menu_items 
      WHERE id = ${id}
      RETURNING id
    `;

    if (deletedItems.length === 0) {
      return Response.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Menu item deleted successfully"
    });

  } catch (error) {
    console.error("Delete menu item error:", error);
    return Response.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}