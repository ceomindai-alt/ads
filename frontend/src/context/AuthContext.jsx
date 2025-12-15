import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      setUser(res.data.user);
      setIsAuthenticated(true);

      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out");
  };

  const isAdmin = user?.accountType === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
