import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

/* ======================================================
   CONTEXT SETUP
====================================================== */
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ======================================================
   PROVIDER
====================================================== */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ======================================================
     AUTH HEADER (SAFE)
  ====================================================== */
  const setAuthHeader = (token) => {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  };

  /* ======================================================
     CLEAR AUTH
  ====================================================== */
  const clearAuth = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /* ======================================================
     LOAD USER ON APP START
  ====================================================== */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    setAuthHeader(token);

    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* ======================================================
     LOGIN
  ====================================================== */
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password
      });

      const token = res.data.token;

      localStorage.setItem("token", token);
      setAuthHeader(token);

      setUser(res.data.user);
      setIsAuthenticated(true);

      toast.success("Login successful");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  /* ======================================================
     LOGOUT
  ====================================================== */
  const logout = () => {
    clearAuth();
    toast.info("Logged out");
  };

  /* ======================================================
     ROLE HELPERS (UI ONLY)
  ====================================================== */
  const isAdmin = user?.accountType === "admin";
  const isUser = user?.accountType === "user";

  /* ======================================================
     PROVIDER VALUE
  ====================================================== */
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        isAdmin,
        isUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
