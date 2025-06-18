// src/components/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// Tạo context để quản lý theme
const ThemeContext = createContext();

// Tạo provider cho ThemeContext
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Kiểm tra localStorage để lưu theme người dùng đã chọn
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Lưu theme vào localStorage khi thay đổi
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook để dễ dàng sử dụng context
export const useTheme = () => useContext(ThemeContext);
