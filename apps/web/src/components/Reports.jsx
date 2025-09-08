import { useState, useEffect } from "react";
import { Calendar, TrendingUp, Award, Users, Download } from "lucide-react";

export default function Reports({ user }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('daily');

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await fetch(`/api/reports?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportReport = () => {
    if (!reportData) return;

    let csvContent = '';
    
    if (reportType === 'daily') {
      csvContent = 'Date,Transactions,Revenue,Average Transaction,Active Users\n';
      reportData.summary.forEach(day => {
        csvContent += `${day.sale_date},${day.total_transactions},${day.total_revenue},${day.avg_transaction},${day.active_users}\n`;
      });
    } else if (reportType === 'popular') {
      csvContent = 'Item Name,Category,Total Sold,Revenue,Times Ordered,Avg Quantity\n';
      reportData.items.forEach(item => {
        csvContent += `${item.name},${item.category_name},${item.total_sold},${item.total_revenue},${item.times_ordered},${item.avg_quantity_per_order}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            Reports & Analytics
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            View detailed sales reports and popular items
          </p>
        </div>
        
        <button
          onClick={exportReport}
          disabled={!reportData}
          className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
            >
              <option value="daily">Daily Sales Summary</option>
              <option value="popular">Popular Items</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-[#E4E8EE] dark:bg-[#333333] rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-[#E4E8EE] dark:bg-[#333333] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : reportData ? (
        <>
          {reportType === 'daily' && (
            <>
              {/* Summary Cards */}
              {reportData.summary.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                          {formatCurrency(reportData.summary.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0))}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
                        <TrendingUp size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                          {reportData.summary.reduce((sum, day) => sum + parseInt(day.total_transactions || 0), 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
                        <Calendar size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
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
                          {formatCurrency(reportData.summary.reduce((sum, day) => sum + parseFloat(day.avg_transaction || 0), 0) / reportData.summary.length)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
                        <TrendingUp size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                          {Math.max(...reportData.summary.map(day => parseInt(day.active_users || 0)))}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
                        <Users size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Sales Table */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                  Daily Sales Summary
                </h2>

                {reportData.summary.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Transactions
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Avg Transaction
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Active Users
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.summary.map((day, index) => (
                          <tr key={day.sale_date} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                              {formatDate(day.sale_date)}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right">
                              {day.total_transactions}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                              {formatCurrency(day.total_revenue)}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right">
                              {formatCurrency(day.avg_transaction)}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right">
                              {day.active_users}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                      No sales data
                    </h3>
                    <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
                      No sales found for the selected date range.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Items */}
              {reportData.popularItems && reportData.popularItems.length > 0 && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                    Top Selling Items
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.popularItems.slice(0, 6).map((item, index) => (
                      <div key={item.name} className="bg-[#F7FAFC] dark:bg-[#262626] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                            #{index + 1}
                          </span>
                          <Award size={16} className="text-[#0C8657] dark:text-[#22C55E]" />
                        </div>
                        <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] mb-2">
                          {item.total_sold} sold • {formatCurrency(item.total_revenue)}
                        </p>
                        <div className="text-xs text-[#9DA5BC] dark:text-[#888888]">
                          {formatCurrency(item.price)} each
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales by User */}
              {reportData.salesByUser && reportData.salesByUser.length > 0 && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                    Sales by Cashier
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Cashier
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Transactions
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.salesByUser.map((userSale, index) => (
                          <tr key={userSale.email} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                              <div>
                                <div className="font-medium">{userSale.name}</div>
                                <div className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">{userSale.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right">
                              {userSale.total_transactions || 0}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                              {formatCurrency(userSale.total_revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {reportType === 'popular' && (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
              <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                Popular Items Report
              </h2>

              {reportData.items && reportData.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Item
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Total Sold
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                          Times Ordered
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.items.map((item, index) => (
                        <tr key={item.name} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                          <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#5D667E] dark:text-[#B0B0B0]">
                            {item.category_name}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                            {item.total_sold}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                            {formatCurrency(item.total_revenue)}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right">
                            {item.times_ordered}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                    No popular items
                  </h3>
                  <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
                    No items sold in the selected date range.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}