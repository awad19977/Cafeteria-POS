import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ShoppingCart,
  Home,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Users,
  ChefHat,
  LogOut,
  ChevronLeft,
  Loader2,
  Calendar,
  Wallet,
} from "lucide-react";

// Import components
import Dashboard from "../components/Dashboard";
import POS from "../components/POS";
import SalesReport from "../components/SalesReport";
import MenuManagement from "../components/MenuManagement";
import Reports from "../components/Reports";
import UserManagement from "../components/UserManagement";
import DailyCollections from "../components/DailyCollections";
import CashCollections from "../components/CashCollections";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check for user session from localStorage
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    window.location.href = "/account/signin";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-[#0C8657] dark:text-[#22C55E] animate-spin mx-auto mb-4"
          />
          <h3 className="text-lg font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
            Loading...
          </h3>
          <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
            Please wait while we load your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "pos", label: "Point of Sale", icon: ShoppingCart },
      { id: "collections", label: "Daily Collections", icon: Calendar },
      { id: "sales", label: "My Sales", icon: DollarSign },
    ];

    const adminItems = [
      { id: "menu", label: "Menu Management", icon: ChefHat },
      { id: "cash-collections", label: "Cash Collections", icon: Wallet },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "users", label: "User Management", icon: Users },
    ];

    return user?.role === "admin" ? [...baseItems, ...adminItems] : baseItems;
  };

  const navigationItems = getNavigationItems();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "pos":
        return <POS user={user} />;
      case "collections":
        return <DailyCollections user={user} />;
      case "cash-collections":
        return user?.role === "admin" ? (
          <CashCollections user={user} />
        ) : (
          <Dashboard user={user} />
        );
      case "sales":
        return <SalesReport user={user} />;
      case "menu":
        return user?.role === "admin" ? (
          <MenuManagement user={user} />
        ) : (
          <Dashboard user={user} />
        );
      case "reports":
        return user?.role === "admin" ? (
          <Reports user={user} />
        ) : (
          <Dashboard user={user} />
        );
      case "users":
        return user?.role === "admin" ? (
          <UserManagement user={user} />
        ) : (
          <Dashboard user={user} />
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-[#1E1E1E] transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 border-r border-[#E4E8EE] dark:border-[#333333] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block flex flex-col`}
      >
        {/* Header */}
        <div className={`${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-0 left-0 right-0 bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center justify-between px-4 z-50">
            <h1 className="text-xl font-semibold text-white mb-0">
              Cafeteria POS
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/80 hover:text-white active:text-white/60 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {/* Collapsed state button */}
        <div
          className={`${sidebarOpen ? "hidden" : "block"} p-4 border-b border-[#E4E8EE] dark:border-[#333333] hidden lg:block`}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#9DA5BC] dark:text-[#888888] hover:text-[#5D667E] dark:hover:text-[#B0B0B0] active:text-[#1F2739] dark:active:text-[#FFFFFF] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* User info */}
        <div
          className={`${sidebarOpen ? "block" : "hidden lg:block"} bg-white dark:bg-[#1E1E1E] p-4 border-b border-[#E4E8EE] dark:border-[#333333]`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0C8657] dark:bg-[#059669] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm truncate">
                {user?.name}
              </h3>
              <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                @{user?.username} •{" "}
                {user?.role === "admin" ? "Administrator" : "Cashier"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === item.id
                  ? "bg-[#DFF3EA] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E]"
                  : "text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 hover:text-[#0C8657] dark:hover:text-[#22C55E]"
              }`}
            >
              <item.icon
                size={16}
                className={
                  activeTab === item.id
                    ? "text-[#0C8657] dark:text-[#22C55E]"
                    : "text-[#0C8657] dark:text-[#22C55E]"
                }
              />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#E4E8EE] dark:border-[#333333]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#E95D5D] dark:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/20 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-1 rounded transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80"
              />
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-white placeholder-white/80 focus:border-b border-white/30 hover:bg-white/5 focus:bg-white/10 transition-colors"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button className="sm:hidden hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-1 rounded transition-colors">
              <Search size={20} />
            </button>

            <button className="relative hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-1 rounded transition-colors">
              <Bell size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="hidden md:block">{user?.name}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F6F8FA] dark:bg-[#121212]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
