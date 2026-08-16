import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function WishList() {
  const { addToCart } = useStore();
  const [wishlist, setWishlist] = useState([]);
  const { T } = useTheme();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(saved);
  }, []);

  const handleRemove = (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <>
      <Navbar />

      <div
        className="min-h-screen py-12"
        style={{ background: T.bg, color: T.text }}
      >
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: T.text }}>
                My Wishlist
              </h1>
              <p className="text-sm mt-1" style={{ color: T.muted }}>
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-600"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {wishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                    style={{ background: T.card }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-56 w-full object-cover hover:scale-105 transition duration-300"
                      />
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-3 right-3 p-2 rounded-full shadow-md hover:opacity-80 transition text-red-500"
                        style={{ background: T.card }}
                      >
                        <Heart size={18} fill="currentColor" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3
                        className="font-semibold text-lg truncate"
                        style={{ color: T.text }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-sm" style={{ color: T.muted }}>
                        {item.category}
                      </p>
                      <p className="text-amber-500 font-bold mt-1">
                        ₦{item.price.toLocaleString()}
                      </p>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="mt-4 w-full bg-amber-400 hover:bg-amber-500 text-white py-2 rounded-full transition flex items-center justify-center gap-2 font-medium"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <Heart size={80} className="text-amber-300 mb-6" />
              <h2 className="text-2xl font-bold mb-2" style={{ color: T.text }}>
                Your wishlist is empty
              </h2>
              <p className="mb-8" style={{ color: T.muted }}>
                Save your favorite items to find them here later.
              </p>
              <Link
                to="/shop"
                className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-full transition"
              >
                Start Shopping
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default WishList;