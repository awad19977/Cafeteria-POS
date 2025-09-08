import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, ChefHat } from "lucide-react";

export default function MenuManagement({ user }) {
  const [menu, setMenu] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      
      const data = await response.json();
      setMenu(data);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingItem ? 'update' : 'create'} menu item`);
      }

      // Refresh menu
      await fetchMenu();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        is_available: true
      });
      setEditingItem(null);
      setShowAddForm(false);
      
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError(`Failed to ${editingItem ? 'update' : 'create'} menu item`);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      is_available: item.is_available
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }

      // Refresh menu
      await fetchMenu();
      
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item');
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true
    });
    setEditingItem(null);
    setShowAddForm(false);
    setError(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Menu Management
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[#E4E8EE] dark:bg-[#333333] rounded"></div>
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
            Menu Management
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            Add, edit, and manage menu items and prices
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
        >
          <Plus size={16} />
          Add Menu Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={cancelEdit}
              className="text-[#5D667E] dark:text-[#B0B0B0] hover:text-[#1F2739] dark:hover:text-[#FFFFFF] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                placeholder="Enter item name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                required
              >
                <option value="">Select category</option>
                {menu.categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-[#0C8657] border-[#E4E8EE] dark:border-[#333333] rounded focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
                Available for sale
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none resize-none"
                placeholder="Enter item description (optional)"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
              >
                <Save size={16} />
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-[#F7FAFC] dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] border border-[#E4E8EE] dark:border-[#333333] rounded-lg hover:bg-[#E4E8EE] dark:hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
          Menu Items ({menu.items.length})
        </h2>

        {menu.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {menu.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 1 ? "bg-[#F7FAFC] dark:bg-[#262626]" : "bg-white dark:bg-[#1E1E1E]"}>
                    <td className="px-4 py-4">
                      <div>
                        <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0] mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                      {item.category_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF] text-right font-medium">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.is_available
                          ? 'bg-[#E9F6F1] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]'
                          : 'bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#E95D5D] dark:text-[#EF4444]'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-[#0C8657] dark:text-[#22C55E] hover:bg-[#E9F6F1] dark:hover:bg-[#0C8657]/20 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[#E95D5D] dark:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ChefHat size={48} className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              No menu items yet
            </h3>
            <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm mb-4">
              Add your first menu item to get started.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors mx-auto"
            >
              <Plus size={16} />
              Add First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}