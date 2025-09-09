'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Menu, 
  BarChart3, 
  DollarSign, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  Printer,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reports, setReports] = useState(null);

  // Form states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'cashier', full_name: '' });
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', category_id: '' });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/';
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      window.location.href = '/pos';
      return;
    }

    setUser(parsedUser);
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUsers(),
        loadMenu(),
        loadSales(),
        loadCollections(),
        loadReports()
      ]);
    } catch (error) {
      console.error('Load data error:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to load menu');
      const data = await response.json();
      setMenuItems(data.menuItems);
      setCategories(data.categories);
    } catch (error) {
      console.error('Load menu error:', error);
    }
  };

  const loadSales = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/sales?date=${today}`);
      if (!response.ok) throw new Error('Failed to load sales');
      const data = await response.json();
      setSales(data.sales);
    } catch (error) {
      console.error('Load sales error:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/collections?date=${today}`);
      if (!response.ok) throw new Error('Failed to load collections');
      const data = await response.json();
      setCollections(data.collections);
    } catch (error) {
      console.error('Load collections error:', error);
    }
  };

  const loadReports = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/reports?date=${today}&type=daily`);
      if (!response.ok) throw new Error('Failed to load reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Load reports error:', error);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) throw new Error('Failed to create user');

      setShowUserModal(false);
      setUserForm({ username: '', password: '', role: 'cashier', full_name: '' });
      loadUsers();
    } catch (error) {
      console.error('Create user error:', error);
      setError('Failed to create user');
    }
  };

  const createMenuItem = async () => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });

      if (!response.ok) throw new Error('Failed to create menu item');

      setShowMenuModal(false);
      setMenuForm({ name: '', description: '', price: '', category_id: '' });
      loadMenu();
    } catch (error) {
      console.error('Create menu item error:', error);
      setError('Failed to create menu item');
    }
  };

  const updateMenuItem = async () => {
    try {
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });

      if (!response.ok) throw new Error('Failed to update menu item');

      setShowMenuModal(false);
      setEditingItem(null);
      setMenuForm({ name: '', description: '', price: '', category_id: '' });
      loadMenu();
    } catch (error) {
      console.error('Update menu item error:', error);
      setError('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete menu item');
      loadMenu();
    } catch (error) {
      console.error('Delete menu item error:', error);
      setError('Failed to delete menu item');
    }
  };

  const collectCash = async (collectionId) => {
    try {
      const response = await fetch('/api/collections/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_id: collectionId,
          admin_id: user.id,
          notes: 'Collected by admin'
        })
      });

      if (!response.ok) throw new Error('Failed to collect cash');

      loadCollections();
    } catch (error) {
      console.error('Collect cash error:', error);
      setError('Failed to collect cash');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const printReport = () => {
    if (!reports) return;

    const reportContent = `
      DAILY SALES REPORT
      ==================
      Date: ${new Date().toLocaleDateString()}
      Generated by: ${user.full_name}
      
      SALES SUMMARY:
      ${reports.dailySales.map(sale => 
        `${sale.cashier_name}: ${sale.total_transactions} transactions, $${sale.total_sales}`
      ).join('\n')}
      
      MOST SOLD ITEMS:
      ${reports.mostSoldItems.slice(0, 5).map((item, index) => 
        `${index + 1}. ${item.item_name}: ${item.total_quantity} sold, $${item.total_revenue}`
      ).join('\n')}
      
      CATEGORY PERFORMANCE:
      ${reports.categoryPerformance.map(cat => 
        `${cat.category_name}: $${cat.category_revenue}`
      ).join('\n')}
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${reportContent}</pre>`);
    printWindow.print();
    printWindow.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A9EFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'menu', label: 'Menu Management', icon: Menu },
    { id: 'collections', label: 'Cash Collections', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-[#121212] font-inter">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#FFFFFF]">Admin Dashboard</h1>
            <p className="text-[14px] text-[#B0B0B0]">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-[8px] text-white hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1E1E1E] border-b border-[#333333]">
        <div className="px-6 py-2">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[8px] whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#4A9EFF] text-white'
                      : 'text-[#B0B0B0] hover:bg-[#333333] hover:text-[#E5E5E5]'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-[20px] font-bold text-[#FFFFFF]">Today's Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
                <h3 className="text-[14px] text-[#B0B0B0] mb-2">Total Sales</h3>
                <p className="text-[24px] font-bold text-[#4A9EFF]">
                  ${reports?.dailySales.reduce((sum, sale) => sum + parseFloat(sale.total_sales || 0), 0).toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
                <h3 className="text-[14px] text-[#B0B0B0] mb-2">Transactions</h3>
                <p className="text-[24px] font-bold text-[#4A9EFF]">
                  {reports?.dailySales.reduce((sum, sale) => sum + parseInt(sale.total_transactions || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
                <h3 className="text-[14px] text-[#B0B0B0] mb-2">Active Cashiers</h3>
                <p className="text-[24px] font-bold text-[#4A9EFF]">
                  {users.filter(u => u.role === 'cashier' && u.is_active).length}
                </p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4">
                <h3 className="text-[14px] text-[#B0B0B0] mb-2">Menu Items</h3>
                <p className="text-[24px] font-bold text-[#4A9EFF]">{menuItems.length}</p>
              </div>
            </div>

            {reports?.mostSoldItems && reports.mostSoldItems.length > 0 && (
              <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6">
                <h3 className="text-[18px] font-bold text-[#FFFFFF] mb-4">Top Selling Items Today</h3>
                <div className="space-y-3">
                  {reports.mostSoldItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-[#E5E5E5]">{index + 1}. {item.item_name}</span>
                      <div className="text-right">
                        <span className="text-[#4A9EFF] font-semibold">{item.total_quantity} sold</span>
                        <span className="text-[#B0B0B0] ml-2">${item.total_revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-[#FFFFFF]">User Management</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-white font-semibold"
                style={{ background: "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)" }}
              >
                <Plus size={18} />
                Add User
              </button>
            </div>

            <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#262626]">
                    <tr>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Username</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Full Name</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Role</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Status</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-t border-[#333333]">
                        <td className="p-4 text-[#E5E5E5]">{user.username}</td>
                        <td className="p-4 text-[#E5E5E5]">{user.full_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                            user.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-[#B0B0B0]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-[#FFFFFF]">Menu Management</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setMenuForm({ name: '', description: '', price: '', category_id: '' });
                  setShowMenuModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-white font-semibold"
                style={{ background: "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)" }}
              >
                <Plus size={18} />
                Add Menu Item
              </button>
            </div>

            <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#262626]">
                    <tr>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Name</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Category</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Price</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Available</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id} className="border-t border-[#333333]">
                        <td className="p-4">
                          <div>
                            <div className="text-[#E5E5E5] font-medium">{item.name}</div>
                            <div className="text-[#B0B0B0] text-[12px]">{item.description}</div>
                          </div>
                        </td>
                        <td className="p-4 text-[#E5E5E5]">{item.category_name}</td>
                        <td className="p-4 text-[#4A9EFF] font-semibold">${item.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                            item.is_available 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setMenuForm({
                                  name: item.name,
                                  description: item.description,
                                  price: item.price,
                                  category_id: item.category_id
                                });
                                setShowMenuModal(true);
                              }}
                              className="p-1 text-[#B0B0B0] hover:text-[#4A9EFF]"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteMenuItem(item.id)}
                              className="p-1 text-[#B0B0B0] hover:text-red-400"
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
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="space-y-6">
            <h2 className="text-[20px] font-bold text-[#FFFFFF]">Cash Collections</h2>

            <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#262626]">
                    <tr>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Cashier</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Total Sales</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Cash Collected</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Status</th>
                      <th className="text-left p-4 text-[#B0B0B0] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map(collection => (
                      <tr key={collection.id} className="border-t border-[#333333]">
                        <td className="p-4 text-[#E5E5E5]">{collection.cashier_name}</td>
                        <td className="p-4 text-[#4A9EFF] font-semibold">${collection.total_sales}</td>
                        <td className="p-4 text-[#E5E5E5]">${collection.cash_collected}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                            collection.collected_at 
                              ? 'bg-green-500/20 text-green-400' 
                              : collection.is_closed
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {collection.collected_at ? 'Collected' : collection.is_closed ? 'Ready' : 'Open'}
                          </span>
                        </td>
                        <td className="p-4">
                          {collection.is_closed && !collection.collected_at && (
                            <button
                              onClick={() => collectCash(collection.id)}
                              className="px-3 py-1 bg-[#4A9EFF] text-white rounded text-[12px] font-medium hover:opacity-90"
                            >
                              Collect Cash
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-[#FFFFFF]">Reports</h2>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-[#333333] border border-[#404040] rounded-[8px] text-[#E5E5E5] hover:bg-[#404040] transition-colors"
              >
                <Printer size={18} />
                Print Report
              </button>
            </div>

            {reports && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6">
                  <h3 className="text-[18px] font-bold text-[#FFFFFF] mb-4">Daily Sales by Cashier</h3>
                  <div className="space-y-3">
                    {reports.dailySales.map((sale, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-[#E5E5E5]">{sale.cashier_name}</span>
                        <div className="text-right">
                          <div className="text-[#4A9EFF] font-semibold">${sale.total_sales}</div>
                          <div className="text-[#B0B0B0] text-[12px]">{sale.total_transactions} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6">
                  <h3 className="text-[18px] font-bold text-[#FFFFFF] mb-4">Category Performance</h3>
                  <div className="space-y-3">
                    {reports.categoryPerformance.map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-[#E5E5E5]">{category.category_name}</span>
                        <div className="text-right">
                          <div className="text-[#4A9EFF] font-semibold">${category.category_revenue}</div>
                          <div className="text-[#B0B0B0] text-[12px]">{category.items_sold} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6 w-full max-w-md">
            <h3 className="text-[20px] font-bold text-[#FFFFFF] mb-4">Add New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Password</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold bg-[#333333] text-[#E5E5E5] border border-[#404040] hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold text-white focus:outline-none hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)" }}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6 w-full max-w-md">
            <h3 className="text-[20px] font-bold text-[#FFFFFF] mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Name</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                  className="w-full h-[80px] px-4 py-2 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent resize-none"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">Category</label>
                <select
                  value={menuForm.category_id}
                  onChange={(e) => setMenuForm({...menuForm, category_id: e.target.value})}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMenuModal(false)}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold bg-[#333333] text-[#E5E5E5] border border-[#404040] hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? updateMenuItem : createMenuItem}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold text-white focus:outline-none hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)" }}
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-[8px]">
          {error}
        </div>
      )}
    </div>
  );
}