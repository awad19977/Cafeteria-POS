"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Printer,
  LogOut,
  DollarSign,
  X,
  BarChart3,
} from "lucide-react";

export default function POSPage() {
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashCollected, setCashCollected] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "cashier") {
      window.location.href = "/dashboard";
      return;
    }

    setUser(parsedUser);
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch("/api/menu");
      if (!response.ok) throw new Error("Failed to load menu");

      const data = await response.json();
      setMenuItems(data.menuItems);
      setCategories(data.categories);
    } catch (error) {
      console.error("Load menu error:", error);
      setError("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category_id === selectedCategory);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const processOrder = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        cashier_id: user.id,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payment_method: "cash",
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error("Transaction was not successful");
      }

      // Automatically print receipt after successful order
      try {
        printReceipt(data.transaction);
      } catch (printError) {
        console.error("Receipt printing failed:", printError);
        // Don't fail the entire transaction if printing fails
      }

      // Clear cart and show success
      setCart([]);
      alert(
        `Order #${data.transaction.id} processed successfully! Total: $${data.transaction.total_amount}\n\nReceipt has been printed automatically.`,
      );
    } catch (error) {
      console.error("Process order error:", error);
      setError(`Failed to process order: ${error.message}`);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  const printReceipt = (transaction = null) => {
    const currentTime = new Date();
    const transactionId = transaction?.id || "PENDING";

    const receiptContent = `
      =============================================
                   CAFETERIA RECEIPT
      =============================================
      
      Transaction #: ${transactionId}
      Date: ${currentTime.toLocaleDateString()}
      Time: ${currentTime.toLocaleTimeString()}
      Cashier: ${user.full_name}
      
      ---------------------------------------------
                        ITEMS
      ---------------------------------------------
      ${cart
        .map(
          (item) =>
            `${item.name.padEnd(25)} x${item.quantity.toString().padStart(2)}\n` +
            `  $${item.price.toFixed(2)} each   $${(item.price * item.quantity).toFixed(2)}`,
        )
        .join("\n\n")}
      
      ---------------------------------------------
      
      Subtotal:                    $${getTotalAmount().toFixed(2)}
      Tax:                         $0.00
      ---------------------------------------------
      TOTAL:                       $${getTotalAmount().toFixed(2)}
      
      Payment Method: Cash
      
      =============================================
      
      Thank you for your visit!
      Have a great day!
      
      =============================================
    `;

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=400,height=600");

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Transaction #${transactionId}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 10px;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Auto-print after a short delay to ensure content loads
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      // Fallback if popup blocker prevents window opening
      console.error(
        "Could not open print window. Please check popup settings.",
      );
      alert(
        "Receipt printing blocked. Please allow popups or use the manual print button.",
      );
    }
  };

  const handleCloseDay = async () => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashier_id: user.id,
          cash_collected: parseFloat(cashCollected),
          notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to close day");

      alert("Day closed successfully!");
      setShowCloseModal(false);
      setCashCollected("");
      setNotes("");
    } catch (error) {
      console.error("Close day error:", error);
      setError("Failed to close day");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
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
          <div>
            <h1 className="text-[24px] font-bold text-[#FFFFFF]">
              POS Terminal
            </h1>
            <p className="text-[14px] text-[#B0B0B0]">
              Welcome, {user?.full_name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/sales")}
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] border border-[#404040] rounded-[8px] text-[#E5E5E5] hover:bg-[#404040] transition-colors"
            >
              <BarChart3 size={18} />
              View Sales
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] border border-[#404040] rounded-[8px] text-[#E5E5E5] hover:bg-[#404040] transition-colors"
            >
              <DollarSign size={18} />
              Close Day
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-[8px] text-white hover:bg-red-700 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Menu Items */}
        <div className="flex-1 p-6">
          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-[8px] whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-[#4A9EFF] text-white"
                    : "bg-[#333333] text-[#B0B0B0] hover:bg-[#404040]"
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-[8px] whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#4A9EFF] text-white"
                      : "bg-[#333333] text-[#B0B0B0] hover:bg-[#404040]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-4 cursor-pointer hover:border-[#4A9EFF] transition-colors"
              >
                <div className="aspect-square bg-[#333333] rounded-[8px] mb-3 flex items-center justify-center">
                  <span className="text-[#666666] text-[12px]">No Image</span>
                </div>
                <h3 className="text-[16px] font-semibold text-[#FFFFFF] mb-1">
                  {item.name}
                </h3>
                <p className="text-[13px] text-[#B0B0B0] mb-2 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-[18px] font-bold text-[#4A9EFF]">
                  ${item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="w-[400px] bg-[#1E1E1E] border-l border-[#333333] p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart size={20} className="text-[#4A9EFF]" />
            <h2 className="text-[20px] font-bold text-[#FFFFFF]">
              Current Order
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#666666]">No items in cart</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#262626] rounded-[8px] p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[14px] font-semibold text-[#FFFFFF]">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="text-[#666666] hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-[#404040] flex items-center justify-center text-[#E5E5E5] hover:bg-[#555555]"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-[#FFFFFF] w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-[#404040] flex items-center justify-center text-[#E5E5E5] hover:bg-[#555555]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-[#4A9EFF] font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#333333] pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[18px] font-bold text-[#FFFFFF]">
                    Total:
                  </span>
                  <span className="text-[24px] font-bold text-[#4A9EFF]">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={processOrder}
                    className="w-full h-[44px] rounded-[8px] text-[15px] font-semibold text-white focus:outline-none hover:opacity-90 transition-all"
                    style={{
                      background:
                        "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)",
                    }}
                  >
                    Process Order
                  </button>
                  <button
                    onClick={printReceipt}
                    className="w-full h-[44px] rounded-[8px] text-[15px] font-semibold bg-[#333333] text-[#E5E5E5] border border-[#404040] hover:bg-[#404040] transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Print Receipt
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Close Day Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6 w-full max-w-md">
            <h3 className="text-[20px] font-bold text-[#FFFFFF] mb-4">
              Close Daily Collection
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">
                  Cash Collected ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashCollected}
                  onChange={(e) => setCashCollected(e.target.value)}
                  className="w-full h-[44px] px-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#E5E5E5] mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-[80px] px-4 py-2 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent resize-none"
                  placeholder="Any notes about the day..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold bg-[#333333] text-[#E5E5E5] border border-[#404040] hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseDay}
                disabled={!cashCollected}
                className="flex-1 h-[44px] rounded-[8px] text-[15px] font-semibold text-white focus:outline-none hover:opacity-90 transition-all disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)",
                }}
              >
                Close Day
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
