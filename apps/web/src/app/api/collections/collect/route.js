import sql from "@/app/api/utils/sql";

// Admin collect cash from cashier
export async function POST(request) {
  try {
    const { adminId, cashierId, date, amountCollected, notes } = await request.json();
    const collectionDate = date || new Date().toISOString().split('T')[0];

    if (!adminId || !cashierId || !amountCollected) {
      return new Response(JSON.stringify({ error: 'Admin ID, Cashier ID, and amount are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get daily collection for the cashier
    const collections = await sql`
      SELECT * FROM daily_collections 
      WHERE user_id = ${cashierId} AND collection_date = ${collectionDate}
    `;

    if (collections.length === 0) {
      return new Response(JSON.stringify({ error: 'No collection found for this cashier and date' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const collection = collections[0];

    if (!collection.is_closed) {
      return new Response(JSON.stringify({ error: 'Collection must be closed by cashier first' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (collection.is_collected_by_admin) {
      return new Response(JSON.stringify({ error: 'Cash already collected for this date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create cash collection record
    const cashCollections = await sql`
      INSERT INTO cash_collections (admin_id, cashier_id, collection_date, amount_collected, daily_collection_id, notes)
      VALUES (${adminId}, ${cashierId}, ${collectionDate}, ${amountCollected}, ${collection.id}, ${notes || ''})
      RETURNING *
    `;

    // Mark daily collection as collected
    await sql`
      UPDATE daily_collections 
      SET is_collected_by_admin = true, collected_at = CURRENT_TIMESTAMP, collected_by = ${adminId}
      WHERE id = ${collection.id}
    `;

    return new Response(JSON.stringify({ 
      cashCollection: cashCollections[0],
      message: 'Cash collected successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cash collection error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Get all collections for admin view
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get all daily collections with user information
    const collections = await sql`
      SELECT 
        dc.*,
        u.name as cashier_name,
        u.username as cashier_username,
        cc.amount_collected,
        cc.created_at as collected_at_actual,
        admin.name as collected_by_name
      FROM daily_collections dc
      JOIN users u ON dc.user_id = u.id
      LEFT JOIN cash_collections cc ON dc.id = cc.daily_collection_id
      LEFT JOIN users admin ON dc.collected_by = admin.id
      WHERE dc.collection_date = ${date}
      ORDER BY u.name
    `;

    return new Response(JSON.stringify({ 
      collections,
      date 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get collections error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}