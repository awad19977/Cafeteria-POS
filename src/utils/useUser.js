import * as React from "react";

const useUser = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchUser = React.useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchUser = React.useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Also listen for localStorage changes (e.g., when user logs in/out in another tab)
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUser]);

  return {
    user,
    data: user,
    loading,
    refetch: refetchUser,
  };
};

export { useUser };
export default useUser;
