import sql from "@/app/api/utils/sql";

// Get daily collections
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const collections = await sql`
      SELECT 
        dc.id,
        dc.cashier_id,
        dc.collection_date,
        dc.total_sales,
        dc.cash_collected,
        dc.is_closed,
        dc.closed_at,
        dc.collected_by_admin,
        dc.collected_at,
        dc.notes,
        u.full_name as cashier_name,
        admin.full_name as collected_by_name
      FROM daily_collections dc
      JOIN users u ON dc.cashier_id = u.id
      LEFT JOIN users admin ON dc.collected_by_admin = admin.id
      WHERE dc.collection_date = ${date}
      ORDER BY dc.created_at DESC
    `;

    return Response.json({ collections });

  } catch (error) {
    console.error("Get collections error:", error);
    return Response.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// Close daily collection (cashier)
export async function POST(request) {
  try {
    const { cashier_id, cash_collected, notes } = await request.json();
    const date = new Date().toISOString().split('T')[0];

    if (!cashier_id || cash_collected === undefined) {
      return Response.json(
        { error: "Cashier ID and cash collected amount are required" },
        { status: 400 }
      );
    }

    // Get total sales for the day
    const salesSummary = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM sales_transactions 
      WHERE cashier_id = ${cashier_id} AND transaction_date = ${date}
    `;

    const total_sales = salesSummary[0].total_sales;

    // Check if collection already exists for today
    const existingCollection = await sql`
      SELECT id FROM daily_collections 
      WHERE cashier_id = ${cashier_id} AND collection_date = ${date}
    `;

    let result;
    if (existingCollection.length > 0) {
      // Update existing collection
      result = await sql`
        UPDATE daily_collections 
        SET 
          total_sales = ${total_sales},
          cash_collected = ${cash_collected},
          is_closed = true,
          closed_at = CURRENT_TIMESTAMP,
          notes = ${notes || ''}
        WHERE cashier_id = ${cashier_id} AND collection_date = ${date}
        RETURNING id, total_sales, cash_collected, is_closed, closed_at
      `;
    } else {
      // Create new collection
      result = await sql`
        INSERT INTO daily_collections (
          cashier_id, 
          collection_date, 
          total_sales, 
          cash_collected, 
          is_closed, 
          closed_at, 
          notes
        )
        VALUES (
          ${cashier_id}, 
          ${date}, 
          ${total_sales}, 
          ${cash_collected}, 
          true, 
          CURRENT_TIMESTAMP, 
          ${notes || ''}
        )
        RETURNING id, total_sales, cash_collected, is_closed, closed_at
      `;
    }

    return Response.json({
      success: true,
      collection: result[0]
    });

  } catch (error) {
    console.error("Close collection error:", error);
    return Response.json(
      { error: "Failed to close collection" },
      { status: 500 }
    );
  }
}