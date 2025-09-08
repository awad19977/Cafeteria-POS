import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Simple session check using localStorage data
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('userId');

    // For now, we'll allow all requests since we're using localStorage auth
    // In production, you'd want to implement proper session management

    // Build query based on filters
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    // Filter by user if provided
    if (userId) {
      whereConditions.push(`s.user_id = $${paramCount}`);
      queryParams.push(userId);
      paramCount++;
    }

    // Filter by date if provided
    if (date) {
      whereConditions.push(`DATE(s.created_at) = $${paramCount}`);
      queryParams.push(date);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const salesQuery = `
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        COUNT(si.id) as item_count
      FROM sales s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      ${whereClause}
      GROUP BY s.id, u.name, u.email
      ORDER BY s.created_at DESC
    `;

    const sales = await sql(salesQuery, queryParams);

    // Get sale items for each sale
    for (let sale of sales) {
      const items = await sql`
        SELECT 
          si.*,
          mi.name as item_name,
          mi.description as item_description
        FROM sale_items si
        JOIN menu_items mi ON si.menu_item_id = mi.id
        WHERE si.sale_id = ${sale.id}
        ORDER BY si.created_at
      `;
      sale.items = items;
    }

    return Response.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // For now, we'll get user info from request body since we're using localStorage auth
    const body = await request.json();
    const { items, payment_method = 'cash', userId } = body;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get user info
    const currentUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    if (currentUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = currentUser[0];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (!item.menu_item_id || !item.quantity || !item.unit_price) {
        return Response.json({ error: "Invalid item data" }, { status: 400 });
      }
      totalAmount += item.quantity * item.unit_price;
    }

    // Create sale and sale items in a transaction
    const [sale] = await sql.transaction([
      sql`
        INSERT INTO sales (user_id, total_amount, payment_method) 
        VALUES (${user.id}, ${totalAmount}, ${payment_method}) 
        RETURNING *
      `
    ]);

    // Insert sale items
    for (const item of items) {
      const totalPrice = item.quantity * item.unit_price;
      await sql`
        INSERT INTO sale_items (sale_id, menu_item_id, quantity, unit_price, total_price)
        VALUES (${sale.id}, ${item.menu_item_id}, ${item.quantity}, ${item.unit_price}, ${totalPrice})
      `;
    }

    // Update or create daily collection
    const today = new Date().toISOString().split('T')[0];
    const cashAmount = payment_method === 'cash' ? totalAmount : 0;
    
    const existingCollection = await sql`
      SELECT * FROM daily_collections 
      WHERE user_id = ${user.id} AND collection_date = ${today}
    `;

    if (existingCollection.length > 0) {
      // Update existing collection
      await sql`
        UPDATE daily_collections 
        SET total_sales = total_sales + ${totalAmount}, 
            cash_amount = cash_amount + ${cashAmount}
        WHERE user_id = ${user.id} AND collection_date = ${today}
      `;
    } else {
      // Create new collection
      await sql`
        INSERT INTO daily_collections (user_id, collection_date, total_sales, cash_amount)
        VALUES (${user.id}, ${today}, ${totalAmount}, ${cashAmount})
      `;
    }

    // Fetch the complete sale with items
    const completeSale = await sql`
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email
      FROM sales s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sale.id}
    `;

    const saleItems = await sql`
      SELECT 
        si.*,
        mi.name as item_name,
        mi.description as item_description
      FROM sale_items si
      JOIN menu_items mi ON si.menu_item_id = mi.id
      WHERE si.sale_id = ${sale.id}
    `;

    const result = completeSale[0];
    result.items = saleItems;

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}