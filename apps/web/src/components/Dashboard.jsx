import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Users, Calendar } from "lucide-react";

export default function Dashboard({ user }) {
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/sales?date=${today}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s stats');
      }
      
      const sales = await response.json();
      
      // Calculate stats
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
      const totalTransactions = sales.length;
      const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      
      setTodayStats({
        totalRevenue,
        totalTransactions,
        avgTransaction,
        sales
      });
    } catch (err) {
      console.error('Error fetching today stats:', err);
      setError('Failed to load today\'s statistics');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            Dashboard
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[#E4E8EE] dark:bg-[#333333] rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-[#E4E8EE] dark:bg-[#333333] rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            Dashboard
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            Welcome back, {user.name}! Here's your overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#5D667E] dark:text-[#B0B0B0]">
          <Calendar size={16} />
          <span className="text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Today's Revenue
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {todayStats ? formatCurrency(todayStats.totalRevenue) : '$0.00'}
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
                {todayStats ? todayStats.totalTransactions : 0}
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
                {todayStats ? formatCurrency(todayStats.avgTransaction) : '$0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                  {todayStats ? new Set(todayStats.sales.map(s => s.user_id)).size : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
          Recent Sales
        </h2>
        
        {error && (
          <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {todayStats && todayStats.sales.length > 0 ? (
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
                  {user.role === 'admin' && (
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                      Cashier
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {todayStats.sales.slice(0, 10).map((sale, index) => (
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
                    {user.role === 'admin' && (
                      <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                        {sale.user_name}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              No sales today
            </h3>
            <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
              Start making sales to see them appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}