import { useState, useEffect } from "react";
import { Calendar, Printer, Download, DollarSign, ShoppingCart } from "lucide-react";

export default function SalesReport({ user }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSales();
  }, [selectedDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales?date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const totalTransactions = sales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    return { totalRevenue, totalTransactions, avgTransaction };
  };

  const printReport = () => {
    const { totalRevenue, totalTransactions, avgTransaction } = calculateTotals();
    
    const reportContent = `
      CAFETERIA POS - SALES REPORT
      ============================
      Date: ${new Date(selectedDate).toLocaleDateString()}
      Cashier: ${user.name}
      Generated: ${new Date().toLocaleString()}
      
      SUMMARY
      -------
      Total Revenue: ${formatCurrency(totalRevenue)}
      Total Transactions: ${totalTransactions}
      Average Transaction: ${formatCurrency(avgTransaction)}
      
      TRANSACTIONS
      ------------
      ${sales.map(sale => 
        `${formatTime(sale.created_at)} - ${sale.item_count} items - ${formatCurrency(sale.total_amount)} (${sale.payment_method})`
      ).join('\n')}
      
      ============================
      End of Report
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Sales Report - ${selectedDate}</title></head>
        <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
          ${reportContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const { totalRevenue, totalTransactions, avgTransaction } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            My Sales Report
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            View and print your daily sales
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#5D667E] dark:text-[#B0B0B0]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
            />
          </div>
          
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Transactions
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Avg Transaction
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {formatCurrency(avgTransaction)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
          Sales Transactions
        </h2>

        {error && (
          <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-[#E4E8EE] dark:bg-[#333333] rounded"></div>
              </div>
            ))}
          </div>
        ) : sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale.id} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                      {formatTime(sale.created_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                      {sale.item_count} items
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] capitalize">
                      {sale.payment_method}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {sale.items && sale.items.length > 0 && (
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                              {item.quantity}x {item.item_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              No sales found
            </h3>
            <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
              No sales were made on {new Date(selectedDate).toLocaleDateString()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}