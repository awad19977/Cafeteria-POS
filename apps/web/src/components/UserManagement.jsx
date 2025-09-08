import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Shield, User, X } from "lucide-react";

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      // Refresh users list and close modal
      await fetchUsers();
      setShowCreateModal(false);
      setNewUser({
        username: "",
        name: "",
        email: "",
        role: "user",
        password: "",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleIcon = (role) => {
    return role === "admin" ? Shield : User;
  };

  const getRoleBadgeClass = (role) => {
    return role === "admin"
      ? "bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]"
      : "bg-[#E9F6F1] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          User Management
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#E4E8EE] dark:bg-[#333333] rounded"
            ></div>
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
            User Management
          </h1>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] mt-1">
            Manage system users and their permissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-[#5D667E] dark:text-[#B0B0B0]">
            {users.length} total users
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#0C8657] dark:bg-[#059669] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Total Users
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {users.length}
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
                Administrators
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FEF3C7] dark:bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
              <Shield
                size={24}
                className="text-[#D97706] dark:text-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5D667E] dark:text-[#B0B0B0] font-medium">
                Cashiers
              </p>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {users.filter((u) => u.role === "user").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E9F6F1] dark:bg-[#0C8657]/20 rounded-lg flex items-center justify-center">
              <User size={24} className="text-[#0C8657] dark:text-[#22C55E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            All Users
          </h2>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#DFF3EA] dark:bg-[#0C8657]/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Username
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#5D667E] dark:text-[#B0B0B0] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem, index) => {
                  const RoleIcon = getRoleIcon(userItem.role);
                  return (
                    <tr
                      key={userItem.id}
                      className={
                        index % 2 === 1
                          ? "bg-[#F7FAFC] dark:bg-[#262626]"
                          : "bg-white dark:bg-[#1E1E1E]"
                      }
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0C8657] dark:bg-[#059669] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {userItem.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm">
                              {userItem.name}
                            </h4>
                            <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                              ID: {userItem.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                        {userItem.username}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#1F2739] dark:text-[#FFFFFF]">
                        {userItem.email || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(userItem.role)}`}
                        >
                          <RoleIcon size={12} />
                          {userItem.role === "admin"
                            ? "Administrator"
                            : "Cashier"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#5D667E] dark:text-[#B0B0B0]">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[#E9F6F1] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users
              size={48}
              className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              No users found
            </h3>
            <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm mb-4">
              Get started by creating your first user account.
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#0C8657] dark:bg-[#059669] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Create First User
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                Create New User
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#5D667E] dark:text-[#B0B0B0] hover:text-[#1F2739] dark:hover:text-[#FFFFFF]"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Role *
                </label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                >
                  <option value="user">Cashier</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E4E8EE] dark:border-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded-lg hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#0C8657] dark:bg-[#059669] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Information */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-4">
          Role Permissions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E4E8EE] dark:border-[#333333] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield
                size={20}
                className="text-[#D97706] dark:text-[#F59E0B]"
              />
              <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                Administrator
              </h3>
            </div>
            <ul className="text-sm text-[#5D667E] dark:text-[#B0B0B0] space-y-1">
              <li>• Full access to all features</li>
              <li>• Create and manage users</li>
              <li>• View all sales and reports</li>
              <li>• Manage menu items and prices</li>
              <li>• Collect cash from cashiers</li>
              <li>• Access analytics and reports</li>
              <li>• Process sales transactions</li>
            </ul>
          </div>

          <div className="border border-[#E4E8EE] dark:border-[#333333] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
              <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                Cashier
              </h3>
            </div>
            <ul className="text-sm text-[#5D667E] dark:text-[#B0B0B0] space-y-1">
              <li>• Process sales transactions</li>
              <li>• View and print own sales reports</li>
              <li>• Close daily collections</li>
              <li>• Access point of sale system</li>
              <li>• View menu items and prices</li>
              <li>• Limited to own sales data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
