import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const type = url.searchParams.get('type') || 'daily';

    // Get current user info
    const currentUser = await sql`
      SELECT u.*, au.email as auth_email 
      FROM users u 
      JOIN auth_users au ON u.email = au.email 
      WHERE au.id = ${session.user.id}
    `;

    if (currentUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = currentUser[0];

    // Build date filter
    let dateFilter = '';
    let dateParams = [];
    let paramCount = 1;

    if (startDate && endDate) {
      dateFilter = `WHERE DATE(s.created_at) BETWEEN $${paramCount} AND $${paramCount + 1}`;
      dateParams = [startDate, endDate];
      paramCount += 2;
    } else if (startDate) {
      dateFilter = `WHERE DATE(s.created_at) >= $${paramCount}`;
      dateParams = [startDate];
      paramCount++;
    } else if (endDate) {
      dateFilter = `WHERE DATE(s.created_at) <= $${paramCount}`;
      dateParams = [endDate];
      paramCount++;
    } else {
      // Default to today
      dateFilter = `WHERE DATE(s.created_at) = CURRENT_DATE`;
    }

    // Add user filter for non-admin users
    if (user.role !== 'admin') {
      if (dateFilter.includes('WHERE')) {
        dateFilter += ` AND s.user_id = $${paramCount}`;
      } else {
        dateFilter = `WHERE s.user_id = $${paramCount}`;
      }
      dateParams.push(user.id);
    }

    if (type === 'daily') {
      // Daily sales summary
      const dailySalesQuery = `
        SELECT 
          DATE(s.created_at) as sale_date,
          COUNT(s.id) as total_transactions,
          SUM(s.total_amount) as total_revenue,
          AVG(s.total_amount) as avg_transaction,
          COUNT(DISTINCT s.user_id) as active_users
        FROM sales s
        ${dateFilter}
        GROUP BY DATE(s.created_at)
        ORDER BY sale_date DESC
      `;

      const dailySales = await sql(dailySalesQuery, dateParams);

      // Most sold items
      const popularItemsQuery = `
        SELECT 
          mi.name,
          mi.price,
          SUM(si.quantity) as total_sold,
          SUM(si.total_price) as total_revenue
        FROM sale_items si
        JOIN menu_items mi ON si.menu_item_id = mi.id
        JOIN sales s ON si.sale_id = s.id
        ${dateFilter}
        GROUP BY mi.id, mi.name, mi.price
        ORDER BY total_sold DESC
        LIMIT 10
      `;

      const popularItems = await sql(popularItemsQuery, dateParams);

      // Sales by user (admin only)
      let salesByUser = [];
      if (user.role === 'admin') {
        const userSalesQuery = `
          SELECT 
            u.name,
            u.email,
            COUNT(s.id) as total_transactions,
            SUM(s.total_amount) as total_revenue
          FROM users u
          LEFT JOIN sales s ON u.id = s.user_id ${dateFilter.replace('WHERE', 'AND')}
          GROUP BY u.id, u.name, u.email
          ORDER BY total_revenue DESC NULLS LAST
        `;

        salesByUser = await sql(userSalesQuery, dateParams);
      }

      return Response.json({
        type: 'daily',
        period: { startDate, endDate },
        summary: dailySales,
        popularItems,
        salesByUser
      });

    } else if (type === 'popular') {
      // Most popular items report
      const popularItemsQuery = `
        SELECT 
          mi.name,
          mi.price,
          mc.name as category_name,
          SUM(si.quantity) as total_sold,
          SUM(si.total_price) as total_revenue,
          COUNT(DISTINCT si.sale_id) as times_ordered,
          AVG(si.quantity) as avg_quantity_per_order
        FROM sale_items si
        JOIN menu_items mi ON si.menu_item_id = mi.id
        JOIN menu_categories mc ON mi.category_id = mc.id
        JOIN sales s ON si.sale_id = s.id
        ${dateFilter}
        GROUP BY mi.id, mi.name, mi.price, mc.name
        ORDER BY total_sold DESC
      `;

      const popularItems = await sql(popularItemsQuery, dateParams);

      return Response.json({
        type: 'popular',
        period: { startDate, endDate },
        items: popularItems
      });

    } else {
      return Response.json({ error: "Invalid report type" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error generating report:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}