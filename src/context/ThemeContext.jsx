import { createContext, useContext, useState, useEffect } from "react";

const DARK = {
  bg: "#111827", surface: "#1F2937", border: "#374151",
  text: "#F9FAFB", muted: "#9CA3AF", sub: "#6B7280",
  card: "#1F2937", inputBg: "#111827",
};
const LIGHT = {
  bg: "#F9FAFB", surface: "#FFFFFF", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", sub: "#9CA3AF",
  card: "#FFFFFF", inputBg: "#F9FAFB",
};
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const T = darkMode ? DARK : LIGHT;

  // Also keep the class for any Tailwind dark: classes you already have
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    // Apply bg to the whole page directly
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
    document.body.style.transition = "background 0.3s, color 0.3s";
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, T, DARK, LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);