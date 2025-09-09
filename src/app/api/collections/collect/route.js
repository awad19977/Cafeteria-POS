import sql from "@/app/api/utils/sql";

// Admin collect cash from cashier
export async function POST(request) {
  try {
    const { collection_id, admin_id, notes } = await request.json();

    if (!collection_id || !admin_id) {
      return Response.json(
        { error: "Collection ID and admin ID are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE daily_collections 
      SET 
        collected_by_admin = ${admin_id},
        collected_at = CURRENT_TIMESTAMP,
        notes = COALESCE(notes, '') || ${notes ? ` | Admin notes: ${notes}` : ''}
      WHERE id = ${collection_id} AND is_closed = true
      RETURNING id, cashier_id, total_sales, cash_collected, collected_at
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Collection not found or not closed" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      collection: result[0]
    });

  } catch (error) {
    console.error("Collect cash error:", error);
    return Response.json(
      { error: "Failed to collect cash" },
      { status: 500 }
    );
  }
}