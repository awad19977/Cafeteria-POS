import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  CreditCard,
  DollarSign,
  Printer,
} from "lucide-react";

export default function POS({ user }) {
  const [menu, setMenu] = useState({ items: [], categories: [] });
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu");

      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }

      const data = await response.json();
      setMenu(data);
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const saleData = {
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payment_method: paymentMethod,
        userId: user.id,
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process sale");
      }

      const sale = await response.json();

      // Clear cart and show success
      clearCart();
      alert(`Sale completed! Total: $${sale.total_amount}`);
    } catch (err) {
      console.error("Error processing sale:", err);
      setError("Failed to process sale. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    const receiptContent = `
      CAFETERIA POS
      ================
      Date: ${new Date().toLocaleString()}
      Cashier: ${user.name}
      
      Items:
      ${cart
        .map(
          (item) =>
            `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`,
        )
        .join("\n")}
      
      ================
      Total: $${calculateTotal().toFixed(2)}
      Payment: ${paymentMethod.toUpperCase()}
      
      Thank you!
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Receipt</title></head>
        <body style="font-family: monospace; white-space: pre-line;">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredItems =
    selectedCategory === "all"
      ? menu.items
      : menu.items.filter(
          (item) => item.category_id === parseInt(selectedCategory),
        );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Point of Sale
        </h1>
        <div className="animate-pulse">
          <div className="h-8 bg-[#E4E8EE] dark:bg-[#333333] rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 bg-[#E4E8EE] dark:bg-[#333333] rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Point of Sale
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#5D667E] dark:text-[#B0B0B0]">
            Cashier: {user.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#0C8657] dark:bg-[#059669] text-white"
                  : "bg-white dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] border border-[#E4E8EE] dark:border-[#333333] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20"
              }`}
            >
              All Items
            </button>
            {menu.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id.toString()
                    ? "bg-[#0C8657] dark:bg-[#059669] text-white"
                    : "bg-white dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] border border-[#E4E8EE] dark:border-[#333333] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm">
                    {item.name}
                  </h3>
                  <span className="text-[#0C8657] dark:text-[#22C55E] font-bold text-sm">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0] mb-3">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9DA5BC] dark:text-[#888888]">
                    {item.category_name}
                  </span>
                  <button className="w-8 h-8 bg-[#0C8657] dark:bg-[#059669] text-white rounded-full flex items-center justify-center hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
              Current Order
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[#E95D5D] dark:text-[#EF4444] hover:text-[#DC2626] dark:hover:text-[#DC2626] transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart
                size={48}
                className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-4"
              />
              <p className="text-[#5D667E] dark:text-[#B0B0B0] text-sm">
                Cart is empty. Add items to start an order.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#F7FAFC] dark:bg-[#262626] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#5D667E] dark:text-[#B0B0B0]">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 bg-[#E4E8EE] dark:bg-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded flex items-center justify-center hover:bg-[#DDD6FE] dark:hover:bg-[#404040] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 bg-[#0C8657] dark:bg-[#059669] text-white rounded flex items-center justify-center hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="font-medium text-[#1F2739] dark:text-[#FFFFFF] text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="border-t border-[#E4E8EE] dark:border-[#333333] pt-4">
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      paymentMethod === "cash"
                        ? "bg-[#0C8657] dark:bg-[#059669] text-white"
                        : "bg-[#F7FAFC] dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20"
                    }`}
                  >
                    <DollarSign size={16} />
                    <span className="text-sm">Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      paymentMethod === "card"
                        ? "bg-[#0C8657] dark:bg-[#059669] text-white"
                        : "bg-[#F7FAFC] dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20"
                    }`}
                  >
                    <CreditCard size={16} />
                    <span className="text-sm">Card</span>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-[#E4E8EE] dark:border-[#333333] pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Total
                  </span>
                  <span className="text-xl font-bold text-[#0C8657] dark:text-[#22C55E]">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={processSale}
                    disabled={processing}
                    className="w-full bg-[#0C8657] dark:bg-[#059669] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] active:bg-[#085339] dark:active:bg-[#065f46] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "Processing..." : "Complete Sale"}
                  </button>

                  <button
                    onClick={printReceipt}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#262626] text-[#5D667E] dark:text-[#B0B0B0] py-2 px-4 rounded-lg font-medium border border-[#E4E8EE] dark:border-[#333333] hover:bg-[#F7FAFC] dark:hover:bg-[#333333] transition-colors"
                  >
                    <Printer size={16} />
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
