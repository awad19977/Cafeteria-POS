import sql from "@/app/api/utils/sql";

// Get sales data
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const cashierId = url.searchParams.get("cashier_id");
    const date =
      url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    let salesQuery;
    let params = [date];

    if (cashierId) {
      salesQuery = sql`
        SELECT 
          st.id,
          st.total_amount,
          st.transaction_time,
          st.payment_method,
          u.full_name as cashier_name,
          json_agg(
            json_build_object(
              'item_name', mi.name,
              'quantity', sti.quantity,
              'unit_price', sti.unit_price,
              'total_price', sti.total_price
            )
          ) as items
        FROM sales_transactions st
        JOIN users u ON st.cashier_id = u.id
        LEFT JOIN sales_transaction_items sti ON st.id = sti.transaction_id
        LEFT JOIN menu_items mi ON sti.menu_item_id = mi.id
        WHERE st.transaction_date = ${date} AND st.cashier_id = ${cashierId}
        GROUP BY st.id, st.total_amount, st.transaction_time, st.payment_method, u.full_name
        ORDER BY st.transaction_time DESC
      `;
    } else {
      salesQuery = sql`
        SELECT 
          st.id,
          st.total_amount,
          st.transaction_time,
          st.payment_method,
          st.cashier_id,
          u.full_name as cashier_name,
          json_agg(
            json_build_object(
              'item_name', mi.name,
              'quantity', sti.quantity,
              'unit_price', sti.unit_price,
              'total_price', sti.total_price
            )
          ) as items
        FROM sales_transactions st
        JOIN users u ON st.cashier_id = u.id
        LEFT JOIN sales_transaction_items sti ON st.id = sti.transaction_id
        LEFT JOIN menu_items mi ON sti.menu_item_id = mi.id
        WHERE st.transaction_date = ${date}
        GROUP BY st.id, st.total_amount, st.transaction_time, st.payment_method, st.cashier_id, u.full_name
        ORDER BY st.transaction_time DESC
      `;
    }

    const sales = await salesQuery;

    // Get summary data
    const summaryQuery = cashierId
      ? sql`
          SELECT 
            COUNT(*) as total_transactions,
            COALESCE(SUM(total_amount), 0) as total_sales
          FROM sales_transactions 
          WHERE transaction_date = ${date} AND cashier_id = ${cashierId}
        `
      : sql`
          SELECT 
            COUNT(*) as total_transactions,
            COALESCE(SUM(total_amount), 0) as total_sales
          FROM sales_transactions 
          WHERE transaction_date = ${date}
        `;

    const summary = await summaryQuery;

    return Response.json({
      sales,
      summary: summary[0],
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return Response.json(
      { error: "Failed to fetch sales data" },
      { status: 500 },
    );
  }
}

// Create new sale transaction
export async function POST(request) {
  try {
    const { cashier_id, items, payment_method = "cash" } = await request.json();

    if (!cashier_id || !items || items.length === 0) {
      return Response.json(
        { error: "Cashier ID and items are required" },
        { status: 400 },
      );
    }

    // Calculate total amount
    const total_amount = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    // Start transaction
    const [newTransaction] = await sql.transaction([
      sql`
        INSERT INTO sales_transactions (cashier_id, total_amount, payment_method)
        VALUES (${cashier_id}, ${total_amount}, ${payment_method})
        RETURNING id, total_amount, transaction_time
      `,
    ]);

    const transactionId = newTransaction.id;

    // Insert transaction items using individual queries
    for (const item of items) {
      await sql`
        INSERT INTO sales_transaction_items (
          transaction_id, 
          menu_item_id, 
          quantity, 
          unit_price, 
          total_price
        )
        VALUES (
          ${transactionId}, 
          ${item.menu_item_id}, 
          ${item.quantity}, 
          ${item.unit_price}, 
          ${item.quantity * item.unit_price}
        )
      `;
    }

    return Response.json(
      {
        success: true,
        transaction: newTransaction,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Create sale error:", error);
    return Response.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
