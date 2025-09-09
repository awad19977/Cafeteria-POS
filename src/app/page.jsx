"use client";

import { useState } from "react";
import { User, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check if the API server is running correctly.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/pos";
      }
    } catch (error) {
      console.error("Login error:", error);

      // Provide better error messages for common issues
      if (error.message.includes("JSON")) {
        setError(
          "API server connection issue. Please ensure the development server is running properly.",
        );
      } else if (error.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Please check if the API is running.",
        );
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 font-inter">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-[#4A9EFF] flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded-full bg-[#E1F0FF]"></div>
          </div>
          <h1 className="text-[28px] font-bold text-[#FFFFFF] mb-2">
            Cafeteria POS
          </h1>
          <p className="text-[16px] text-[#B0B0B0]">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-[12px] p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-[14px] font-medium text-[#E5E5E5] mb-2"
              >
                Username
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-[44px] pl-10 pr-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[14px] font-medium text-[#E5E5E5] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[44px] pl-10 pr-4 border border-[#404040] rounded-[8px] bg-[#262626] text-[15px] text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20">
                <p className="text-[14px] text-red-400">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[44px] rounded-[8px] text-[15px] font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:ring-offset-2 focus:ring-offset-[#1E1E1E] hover:opacity-90 active:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(180deg, #4A9EFF 0%, #357ADF 100%)",
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#262626] border border-[#404040] rounded-[8px]">
            <h3 className="text-[14px] font-semibold text-[#E5E5E5] mb-2">
              Demo Credentials:
            </h3>
            <div className="text-[13px] text-[#B0B0B0] space-y-1">
              <p>
                <strong>Admin:</strong> username: admin, password: admin123
              </p>
              <p>
                <strong>Note:</strong> Only admin can create new users
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
