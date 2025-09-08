import { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store user data in localStorage for simple session management
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setUser(data.user);

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0C8657] dark:bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              Cafeteria POS
            </h1>
            <p className="text-[#5D667E] dark:text-[#B0B0B0]">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] dark:text-[#888888]"
                />
                <input
                  required
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] dark:text-[#888888]"
                />
                <input
                  required
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-[#E4E8EE] dark:border-[#333333] bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] rounded-lg focus:border-[#0C8657] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 text-[#E95D5D] dark:text-[#EF4444] p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0C8657] dark:bg-[#059669] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] active:bg-[#085339] dark:active:bg-[#065f46] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-[#F7FAFC] dark:bg-[#262626] border border-[#E4E8EE] dark:border-[#333333] rounded-lg p-4">
              <h4 className="font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                Default Login Credentials:
              </h4>
              <div className="text-sm text-[#5D667E] dark:text-[#B0B0B0] space-y-1">
                <div>
                  <strong>Admin:</strong> username: admin, password: admin123
                </div>
                <div>
                  <strong>Cashier 1:</strong> username: cashier1, password:
                  admin123
                </div>
                <div>
                  <strong>Cashier 2:</strong> username: cashier2, password:
                  admin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
