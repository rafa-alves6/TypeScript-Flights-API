import { useState, type ReactNode } from "react";
import api from "../services/api";
import type { User, LoginResponse } from "../types/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("flight_user");
    const storedToken = sessionStorage.getItem("flight_token");
    if (storedUser && storedToken) {
      return JSON.parse(storedUser) as User;
    }
    return null;
  });

  const login = async (username: string, password: string) => {
    const response = await api.post<LoginResponse>("/login", {
      username,
      password,
    });
    const { token, user: userData } = response.data;

    sessionStorage.setItem("flight_token", token);
    sessionStorage.setItem("flight_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("flight_token");
    sessionStorage.removeItem("flight_user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem("flight_user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "regular" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isOperator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
