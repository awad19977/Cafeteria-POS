import sql from "@/app/api/utils/sql";

// Get daily collection for user
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get or create daily collection
    let collections = await sql`
      SELECT * FROM daily_collections 
      WHERE user_id = ${userId} AND collection_date = ${date}
    `;

    if (collections.length === 0) {
      // Create new daily collection
      collections = await sql`
        INSERT INTO daily_collections (user_id, collection_date, total_sales, cash_amount)
        VALUES (${userId}, ${date}, 0, 0)
        RETURNING *
      `;
    }

    // Get sales for this user today
    const sales = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as transaction_count
      FROM sales 
      WHERE user_id = ${userId} 
      AND DATE(created_at) = ${date}
    `;

    const collection = collections[0];
    const salesData = sales[0];

    // Update collection with latest sales data
    await sql`
      UPDATE daily_collections 
      SET total_sales = ${salesData.total_sales}, cash_amount = ${salesData.total_sales}
      WHERE id = ${collection.id}
    `;

    return new Response(JSON.stringify({ 
      collection: {
        ...collection,
        total_sales: parseFloat(salesData.total_sales),
        cash_amount: parseFloat(salesData.total_sales),
        transaction_count: parseInt(salesData.transaction_count)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get daily collection error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Close daily collection
export async function POST(request) {
  try {
    const { userId, date, notes } = await request.json();
    const collectionDate = date || new Date().toISOString().split('T')[0];

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get daily collection
    const collections = await sql`
      SELECT * FROM daily_collections 
      WHERE user_id = ${userId} AND collection_date = ${collectionDate}
    `;

    if (collections.length === 0) {
      return new Response(JSON.stringify({ error: 'No collection found for this date' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const collection = collections[0];

    if (collection.is_closed) {
      return new Response(JSON.stringify({ error: 'Collection already closed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Close the collection
    const updatedCollections = await sql`
      UPDATE daily_collections 
      SET is_closed = true, closed_at = CURRENT_TIMESTAMP, notes = ${notes || ''}
      WHERE id = ${collection.id}
      RETURNING *
    `;

    return new Response(JSON.stringify({ 
      collection: updatedCollections[0],
      message: 'Daily collection closed successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Close daily collection error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}