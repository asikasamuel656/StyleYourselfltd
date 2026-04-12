import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaBars,
  FaTimes,
  FaSearch,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";

import { StoreContext } from "../context/StoreContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const context = useContext(StoreContext) || {};

const cart = context.cart || [];
const wishlist = context.wishlist || [];
const darkMode = context.darkMode || false;
const setDarkMode = context.setDarkMode || (() => {});

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="w-full">

      {/* Top Bar */}
      <div className="bg-amber-800 text-white text-sm px-4 md:px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          <span className="hover:text-yellow-400">
            styleyourself@gmail.com
          </span>
          <span className="ml-2 hover:text-yellow-400">
            +234 912 717 0775
          </span>
        </div>

        <div className="flex gap-4 text-lg">
          <FaTwitter className="cursor-pointer hover:text-yellow-400" />
          <FaFacebook className="cursor-pointer hover:text-yellow-400" />
          <FaInstagram className="cursor-pointer hover:text-yellow-400" />
          <FaTiktok className="cursor-pointer hover:text-yellow-400" />
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`transition-all duration-300 ${
          isHome
            ? "bg-amber-400"
            : "bg-white dark:bg-gray-900 shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="font-bold text-lg sm:text-xl">
            StyleYourself
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-8 font-medium items-center">

            <Link to="/" className="hover:text-white">Home</Link>
            <a href="#About" className="hover:text-white">About</a>
            <a href="#Collection" className="hover:text-white">Collection</a>
            <a href="#Sale" className="hover:text-white">Sale</a>
            <a href="#Reviews" className="hover:text-white">Reviews</a>
            <a href="#Contact" className="hover:text-white">Contact</a>

            {/* SHOP LINK */}
            <Link to="/shop" className="hover:text-white">
              Shop
            </Link>

            {/* DARK MODE */}
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* WISHLIST */}
            <Link to="/wishlist" className="relative">
              <FaHeart />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link to="/cart" className="relative">
              <FaShoppingCart />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs px-1 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center border-2 border-black rounded-full px-3 py-1">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-2 text-sm font-bold"
            />
            <FaSearch />
          </div>

          {/* Hamburger */}
          <div
            className="lg:hidden text-2xl cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden flex flex-col items-center gap-5 pb-6 text-lg font-medium">

            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>

            <a href="#About">About</a>
            <a href="#Collection">Collection</a>
            <a href="#Sale">Sale</a>
            <a href="#Reviews">Reviews</a>
            <a href="#Contact">Contact</a>

            {/* Dark Mode */}
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
              Wishlist ({wishlist.length})
            </Link>

            {/* Cart */}
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart ({cart.length})
            </Link>

            {/* Mobile Search */}
            <div className="flex items-center border border-black rounded-full px-3 py-1 mt-2">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none px-2 text-sm"
              />
              <FaSearch />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;