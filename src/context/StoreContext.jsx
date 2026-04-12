import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <StoreContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </StoreContext.Provider>
  );
}