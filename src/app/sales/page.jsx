'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Calendar, DollarSign } from 'lucide-react';

export default function SalesPage() {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ total_transactions: 0, total_sales: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/';
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'cashier') {
      window.location.href = '/dashboard';
      return;
    }

    setUser(parsedUser);
    loadSales(parsedUser.id, selectedDate);
  }, [selectedDate]);

  const loadSales = async (cashierId, date) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales?cashier_id=${cashierId}&date=${date}`);
      if (!response.ok) throw new Error('Failed to load sales');
      
      const data = await response.json();
      setSales(data.sales);
      setSummary(data.summary);
    } catch (error) {
      console.error('Load sales error:', error);
      setError('Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const printSalesReport = () => {
    const reportContent = `
      DAILY SALES REPORT
      ==================
      Date: ${new Date(selectedDate).toLocaleDateString()}
      Cashier: ${user.full_name}
      
      SUMMARY:
      Total Transactions: ${summary.total_transactions}
      Total Sales: $${summary.total_sales}
      
      TRANSACTIONS:
      ${sales.map((sale, index) => 
        `${index + 1}. Time: ${new Date(sale.transaction_time).toLocaleTimeString()}
        Amount: $${sale.total_amount}
        Items: ${sale.items?.map(item => `${item.item_name} x${item.quantity}`).join(', ') || 'N/A'}
        `
      ).join('\n')}
      
      ==================
      Generated: ${new Date().toLocaleString()}
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${reportContent}</pre>`);
    printWindow.print();
    printWindow.close();
  };

  const goBack = () => {
    window.location.href = '/pos';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A9EFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] font-inter">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-2 bg-[#333333] border border-[#404040] rounded-[8px] text-[#E5E5E5] hover:bg-[#404040] transition-colors"
            >
              <ArrowLeft size={18} />
              Back to POS
            </button>
            <div>
              <h1 className="text-[24px] font-bold text-[#FFFFFF]">My Sales</h1>
              <p className="text-[14px] text-[#B0B0B0]">{user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#B0B0B0]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-[#404040] rounded-[8px] bg-[#262626] text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
              />
            </div>
            <button
              onClick={printSalesReport}
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] border border-[#404040] rounded-[8px] text-[#E5E5E5] hover:bg-[#404040] transition-colors"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
            <h3 className="text-[14px] text-[#B0B0B0] mb-2">Total Transactions</h3>
            <p className="text-[24px] font-bold text-[#4A9EFF]">{summary.total_transactions}</p>
          </div>
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
            <h3 className="text-[14px] text-[#B0B0B0] mb-2">Total Sales</h3>
            <p className="text-[24px] font-bold text-[#4A9EFF]">${summary.total_sales}</p>
          </div>
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
            <h3 className="text-[14px] text-[#B0B0B0] mb-2">Average Transaction</h3>
            <p className="text-[24px] font-bold text-[#4A9EFF]">
              ${summary.total_transactions > 0 ? (summary.total_sales / summary.total_transactions).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Sales List */}
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px]">
          <div className="p-6 border-b border-[#333333]">
            <h2 className="text-[20px] font-bold text-[#FFFFFF]">
              Sales for {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>

          {sales.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign size={48} className="text-[#666666] mx-auto mb-4" />
              <p className="text-[#666666] text-[16px]">No sales found for this date</p>
            </div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {sales.map((sale) => (
                <div key={sale.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#FFFFFF]">
                        Transaction #{sale.id}
                      </h3>
                      <p className="text-[14px] text-[#B0B0B0]">
                        {new Date(sale.transaction_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[20px] font-bold text-[#4A9EFF]">
                        ${sale.total_amount}
                      </p>
                      <p className="text-[12px] text-[#B0B0B0] uppercase">
                        {sale.payment_method}
                      </p>
                    </div>
                  </div>

                  {sale.items && sale.items.length > 0 && (
                    <div className="bg-[#262626] rounded-[8px] p-4">
                      <h4 className="text-[14px] font-medium text-[#E5E5E5] mb-3">Items:</h4>
                      <div className="space-y-2">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-[#E5E5E5]">
                              {item.item_name} x{item.quantity}
                            </span>
                            <span className="text-[#4A9EFF] font-medium">
                              ${item.total_price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-[8px]">
          {error}
        </div>
      )}
    </div>
  );
}