import { useState, useEffect } from "react";
import { Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, User, X } from "lucide-react";

export default function CashCollections({ user }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [collectForm, setCollectForm] = useState({
    amountCollected: '',
    notes: ''
  });

  useEffect(() => {
    fetchCollections();
  }, [selectedDate]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/collect?date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
      const data = await response.json();
      setCollections(data.collections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCollectModal = (collection) => {
    setSelectedCollection(collection);
    setCollectForm({
      amountCollected: collection.cash_amount?.toString() || '',
      notes: ''
    });
    setShowCollectModal(true);
  };

  const handleCollectCash = async (e) => {
    e.preventDefault();
    setCollecting(true);
    setError(null);

    try {
      const response = await fetch('/api/collections/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user.id,
          cashierId: selectedCollection.user_id,
          date: selectedDate,
          amountCollected: parseFloat(collectForm.amountCollected),
          notes: collectForm.notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to collect cash');
      }

      // Refresh collections and close modal
      await fetchCollections();
      setShowCollectModal(false);
      setSelectedCollection(null);
      setCollectForm({ amountCollected: '', notes: '' });
    } catch (err) {
      console.error('Error collecting cash:', err);
      setError(err.message || 'Failed to collect cash');
    } finally {
      setCollecting(false);
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

  const getStatusBadge = (collection) => {
    if (collection.is_collected_by_admin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#E9F6F1] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]">
          <CheckCircle size={12} />
          Collected
        </span>
      );
    } else if (collection.is_closed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]">
          <Clock size={12} />
          Ready for Collection
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#E95D5D] dark:text-[#EF4444]">
          <AlertCircle size={12} />
          Not Closed
        </span>
      );
    }
  };

  const totalPendingAmount = collections
    .filter(c => c.is_closed && !c.is_collected_by_admin)
    .reduce((sum, c) => sum + (parseFloat(c.cash_amount) || 0), 0);

  const totalCollectedAmount = collections
    .filter(c => c.is_collected_by_admin)
    .reduce((sum, c) => sum + (parseFloat(c.amount_collected) || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Cash Collections
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#E4E8EE] dark:bg-[#333333] rounded-lg"></div>
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
            Cash Collections
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            Collect cash from cashiers' daily collections
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Total Cashiers
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {collections.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Pending Collection
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {formatCurrency(totalPendingAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FEF3C7] dark:bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-[#D97706] dark:text-[#F59E0B]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Total Collected
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {formatCurrency(totalCollectedAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            Collections for {formatDate(selectedDate)}
          </h2>
        </div>

        {collections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Cashier
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Sales Total
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Cash Amount
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Collection Time
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection, index) => (
                  <tr key={collection.id} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0C8657] dark:bg-[#059669] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {collection.cashier_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm">
                            {collection.cashier_name}
                          </h4>
                          <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                            @{collection.cashier_username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                      {formatCurrency(collection.total_sales)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                      {formatCurrency(collection.cash_amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(collection)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#5D667E] dark:text-[#B0B0B0]">
                      {collection.is_closed ? (
                        <div>
                          <div>Closed: {formatTime(collection.closed_at)}</div>
                          {collection.is_collected_by_admin && collection.collected_at_actual && (
                            <div className="text-xs mt-1">
                              Collected: {formatTime(collection.collected_at_actual)}
                            </div>
                          )}
                        </div>
                      ) : (
                        'Not closed yet'
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {collection.is_closed && !collection.is_collected_by_admin ? (
                        <button
                          onClick={() => handleOpenCollectModal(collection)}
                          className="bg-[#0C8657] dark:bg-[#059669] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
                        >
                          Collect Cash
                        </button>
                      ) : collection.is_collected_by_admin ? (
                        <span className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                          Collected by {collection.collected_by_name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                          Waiting for close
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              No collections found
            </h3>
            <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
              No daily collections found for {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </div>

      {/* Collect Cash Modal */}
      {showCollectModal && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                Collect Cash from {selectedCollection.cashier_name}
              </h3>
              <button
                onClick={() => setShowCollectModal(false)}
                className="text-[#5D667E] dark:text-[#B0B0B0] hover:text-[#1F2739] dark:hover:text-[#FFFFFF]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Collection Summary */}
            <div className="bg-[#F7FAFC] dark:bg-[#262626] border border-[#E4E8EE] dark:border-[#333333] rounded-lg p-4 mb-6">
              <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-3">
                Collection Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">Date:</span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">Total Sales:</span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">{formatCurrency(selectedCollection.total_sales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">Expected Cash:</span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">{formatCurrency(selectedCollection.cash_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">Closed At:</span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">{formatTime(selectedCollection.closed_at)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCollectCash} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                  Amount Collected *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={collectForm.amountCollected}
                  onChange={(e) => setCollectForm({ ...collectForm, amountCollected: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                  placeholder="Enter collected amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                  Collection Notes (Optional)
                </label>
                <textarea
                  value={collectForm.notes}
                  onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })}
                  placeholder="Add any notes about the collection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none resize-none"
                />
              </div>

              {selectedCollection.notes && (
                <div className="bg-[#F7FAFC] dark:bg-[#262626] border border-[#E4E8EE] dark:border-[#333333] rounded-lg p-3">
                  <h5 className="text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                    Cashier's Notes:
                  </h5>
                  <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0]">
                    {selectedCollection.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E4E8EE] dark:border-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded-lg hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collecting}
                  className="flex-1 bg-[#0C8657] dark:bg-[#059669] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {collecting ? 'Collecting...' : 'Collect Cash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}