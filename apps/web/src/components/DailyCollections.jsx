import { useState, useEffect } from "react";
import { Calendar, DollarSign, Lock, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DailyCollections({ user }) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.id) {
      fetchDailyCollection();
    }
  }, [user?.id, selectedDate]);

  const fetchDailyCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/daily?userId=${user.id}&date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily collection');
      }
      
      const data = await response.json();
      setCollection(data.collection);
    } catch (err) {
      console.error('Error fetching daily collection:', err);
      setError('Failed to load daily collection');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCollection = async () => {
    setClosing(true);
    setError(null);

    try {
      const response = await fetch('/api/collections/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          date: selectedDate,
          notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close collection');
      }

      // Refresh collection data
      await fetchDailyCollection();
      setNotes('');
    } catch (err) {
      console.error('Error closing collection:', err);
      setError(err.message || 'Failed to close collection');
    } finally {
      setClosing(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Daily Collections
        </h1>
        <div className="animate-pulse">
          <div className="h-32 bg-[#E4E8EE] dark:bg-[#333333] rounded-lg"></div>
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
            Daily Collections
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            Manage your daily cash collections
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
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {collection && (
        <div className="space-y-6">
          {/* Collection Status Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                Collection for {formatDate(selectedDate)}
              </h2>
              
              <div className="flex items-center gap-2">
                {collection.is_closed ? (
                  collection.is_collected_by_admin ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-[#E9F6F1] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]">
                      <CheckCircle size={16} />
                      Collected by Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]">
                      <Lock size={16} />
                      Closed - Awaiting Collection
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#E95D5D] dark:text-[#EF4444]">
                    <AlertCircle size={16} />
                    Open
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium mb-1">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF]">
                  {formatCurrency(collection.total_sales)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium mb-1">
                  Cash Amount
                </p>
                <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF]">
                  {formatCurrency(collection.cash_amount)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium mb-1">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF]">
                  {collection.transaction_count || 0}
                </p>
              </div>
            </div>

            {/* Collection Details */}
            {collection.is_closed && (
              <div className="border-t border-[#E4E8EE] dark:border-[#333333] pt-6">
                <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                  Collection Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#5D667E] dark:text-[#B0B0B0]">Closed At:</span>
                    <span className="ml-2 text-[#1F2739] dark:text-[#FFFFFF]">
                      {formatTime(collection.closed_at)}
                    </span>
                  </div>
                  
                  {collection.is_collected_by_admin && collection.collected_at && (
                    <div>
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">Collected At:</span>
                      <span className="ml-2 text-[#1F2739] dark:text-[#FFFFFF]">
                        {formatTime(collection.collected_at)}
                      </span>
                    </div>
                  )}
                </div>

                {collection.notes && (
                  <div className="mt-4">
                    <span className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">Notes:</span>
                    <div className="mt-1 p-3 bg-[#F7FAFC] dark:bg-[#262626] border border-[#E4E8EE] dark:border-[#333333] rounded-lg text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                      {collection.notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Collection Form */}
            {!collection.is_closed && (
              <div className="border-t border-[#E4E8EE] dark:border-[#333333] pt-6">
                <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-4">
                  Close Daily Collection
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about the collection..."
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none resize-none"
                    />
                  </div>

                  <div className="bg-[#FEF3C7] dark:bg-[#F59E0B]/20 border border-[#F59E0B]/30 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-[#D97706] dark:text-[#F59E0B] mt-0.5" />
                      <div className="text-sm text-[#92400E] dark:text-[#F59E0B]">
                        <p className="font-medium mb-1">Before closing your collection:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Count all cash in your register</li>
                          <li>Verify the amount matches your sales total</li>
                          <li>Once closed, you cannot reopen this collection</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseCollection}
                    disabled={closing}
                    className="w-full bg-[#0C8657] dark:bg-[#059669] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock size={16} />
                    {closing ? 'Closing Collection...' : 'Close Daily Collection'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
            <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-4">
              Daily Collection Process
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-[#0C8657] dark:text-[#22C55E]" />
                  For Cashiers
                </h4>
                <ul className="text-sm text-[#5D667E] dark:text-[#B0B0B0] space-y-1">
                  <li>1. Count all cash at end of shift</li>
                  <li>2. Verify amount matches sales total</li>
                  <li>3. Add any notes if needed</li>
                  <li>4. Click "Close Daily Collection"</li>
                  <li>5. Wait for admin to collect cash</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-[#D97706] dark:text-[#F59E0B]" />
                  For Administrators
                </h4>
                <ul className="text-sm text-[#5D667E] dark:text-[#B0B0B0] space-y-1">
                  <li>1. Review closed collections</li>
                  <li>2. Physically collect cash from cashier</li>
                  <li>3. Verify amount matches collection</li>
                  <li>4. Mark as collected in system</li>
                  <li>5. Store cash securely</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}