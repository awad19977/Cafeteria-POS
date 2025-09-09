import sql from "@/app/api/utils/sql";

// Get reports data
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const reportType = url.searchParams.get('type') || 'daily';

    let dateCondition;
    if (reportType === 'daily') {
      dateCondition = sql`st.transaction_date = ${date}`;
    } else if (reportType === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      dateCondition = sql`st.transaction_date BETWEEN ${weekStart.toISOString().split('T')[0]} AND ${weekEnd.toISOString().split('T')[0]}`;
    } else if (reportType === 'monthly') {
      const monthStart = new Date(date);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      dateCondition = sql`st.transaction_date BETWEEN ${monthStart.toISOString().split('T')[0]} AND ${monthEnd.toISOString().split('T')[0]}`;
    }

    // Daily sales summary
    const dailySales = await sql`
      SELECT 
        st.transaction_date,
        COUNT(*) as total_transactions,
        SUM(st.total_amount) as total_sales,
        u.full_name as cashier_name,
        st.cashier_id
      FROM sales_transactions st
      JOIN users u ON st.cashier_id = u.id
      WHERE ${dateCondition}
      GROUP BY st.transaction_date, st.cashier_id, u.full_name
      ORDER BY st.transaction_date DESC, u.full_name
    `;

    // Most sold items
    const mostSoldItems = await sql`
      SELECT 
        mi.name as item_name,
        SUM(sti.quantity) as total_quantity,
        SUM(sti.total_price) as total_revenue,
        AVG(sti.unit_price) as avg_price
      FROM sales_transaction_items sti
      JOIN menu_items mi ON sti.menu_item_id = mi.id
      JOIN sales_transactions st ON sti.transaction_id = st.id
      WHERE ${dateCondition}
      GROUP BY mi.id, mi.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `;

    // Category performance
    const categoryPerformance = await sql`
      SELECT 
        mc.name as category_name,
        COUNT(sti.id) as items_sold,
        SUM(sti.total_price) as category_revenue
      FROM sales_transaction_items sti
      JOIN menu_items mi ON sti.menu_item_id = mi.id
      JOIN menu_categories mc ON mi.category_id = mc.id
      JOIN sales_transactions st ON sti.transaction_id = st.id
      WHERE ${dateCondition}
      GROUP BY mc.id, mc.name
      ORDER BY category_revenue DESC
    `;

    // Hourly sales pattern
    const hourlySales = await sql`
      SELECT 
        EXTRACT(HOUR FROM st.transaction_time) as hour,
        COUNT(*) as transactions,
        SUM(st.total_amount) as sales
      FROM sales_transactions st
      WHERE ${dateCondition}
      GROUP BY EXTRACT(HOUR FROM st.transaction_time)
      ORDER BY hour
    `;

    return Response.json({
      dailySales,
      mostSoldItems,
      categoryPerformance,
      hourlySales,
      reportType,
      date
    });

  } catch (error) {
    console.error("Get reports error:", error);
    return Response.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}