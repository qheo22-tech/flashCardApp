// contexts/ThemeContext.js
import React, { createContext } from "react";
import { useColorScheme } from "react-native";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const scheme = useColorScheme(); // "light" | "dark"

  const colors = {
    background: scheme === "dark" ? "#000" : "#fff",
    text: scheme === "dark" ? "#fff" : "#000",
    placeholder: scheme === "dark" ? "#aaa" : "#888",
    card: scheme === "dark" ? "#1c1c1e" : "#fff",
    border: scheme === "dark" ? "#333" : "#ccc",
    accent: "#007AFF", // (선택) 버튼 강조 색상
  };

  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}
