import { useCallback } from "react";

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

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Login failed");
        }

        const data = await response.json();

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect if callbackUrl provided
        if (callbackUrl) {
          window.location.href = callbackUrl;
        } else {
          // Redirect based on role
          if (data.user.role === "admin") {
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
    // Not implemented in current system
    throw new Error("Sign up not implemented in current system");
  }, []);

  const signInWithGoogle = useCallback(() => {
    // Not implemented in current system
    throw new Error("Google sign in not implemented in current system");
  }, []);

  const signInWithFacebook = useCallback(() => {
    // Not implemented in current system
    throw new Error("Facebook sign in not implemented in current system");
  }, []);

  const signInWithTwitter = useCallback(() => {
    // Not implemented in current system
    throw new Error("Twitter sign in not implemented in current system");
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("user");
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
