import { useCallback } from "react";

const STORAGE_KEY = "currentUser";

function useAuth() {
  const signInWithCredentials = useCallback(
    async ({ username, password, callbackUrl }) => {
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
          throw new Error(data.error || data.message || "Login failed");
        }

        // Store user data in localStorage under the agreed key
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));

        // Redirect if callbackUrl provided
        if (callbackUrl) {
          window.location.href = callbackUrl;
        } else {
          // Redirect based on role
          if (data.user && data.user.role === "admin") {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/pos";
          }
        }

        return { ok: true, user: data.user };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    },
    [],
  );

  const signUpWithCredentials = useCallback(() => {
    throw new Error("Sign up not implemented in current system");
  }, []);

  const signInWithGoogle = useCallback(() => {
    throw new Error("Google sign in not implemented in current system");
  }, []);

  const signInWithFacebook = useCallback(() => {
    throw new Error("Facebook sign in not implemented in current system");
  }, []);

  const signInWithTwitter = useCallback(() => {
    throw new Error("Twitter sign in not implemented in current system");
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  };
}

export default useAuth;
