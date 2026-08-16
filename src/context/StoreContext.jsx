import { createContext, useContext, useEffect, useState } from "react";
const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
    setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []);
  }, []);

  const saveCart = (data) => {
    setCart(data);
    localStorage.setItem("cart", JSON.stringify(data));
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const updated = exists
        ? prev.map((p) =>
            p.id === product.id
              ? { ...p, quantity: (p.quantity || 1) + 1 }
              : p
          )
        : [...prev, { ...product, quantity: 1 }];

      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (id, action) => {
    setCart((prev) => {
      const updated = prev
        .map((p) =>
          p.id === id
            ? { ...p, quantity: action === "inc" ? p.quantity + 1 : p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0);

      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // ✅ all functions exposed
  const value = { cart, wishlist, saveCart, addToCart, removeFromCart, updateQuantity, clearCart };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);