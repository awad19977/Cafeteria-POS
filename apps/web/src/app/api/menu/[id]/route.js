import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const { category_id, name, description, price, is_available } = body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (category_id !== undefined) {
      updates.push(`category_id = $${paramCount}`);
      values.push(category_id);
      paramCount++;
    }
    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount}`);
      values.push(is_available);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE menu_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updatedItem = await sql(query, values);

    if (updatedItem.length === 0) {
      return Response.json({ error: "Menu item not found" }, { status: 404 });
    }

    return Response.json(updatedItem[0]);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;

    const deletedItem = await sql`
      DELETE FROM menu_items WHERE id = ${id} RETURNING *
    `;

    if (deletedItem.length === 0) {
      return Response.json({ error: "Menu item not found" }, { status: 404 });
    }

    return Response.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}