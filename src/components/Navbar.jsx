import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHeart,
  FaShoppingCart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaChevronDown,
} from "react-icons/fa";
import StyleYourself from "../assets/StyleYourself.jpg";
import Sneaker from "../assets/sneaker3.jpg";
import rails from "../assets/rails.jpg";

import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Topbar from "./Topbar.jsx";

// ── Nav data ──
const shopColumns = [
  ["Shirts", "Jeans & Joggers", "Shoes & Sneakers", "Caps & Hats", "Jackets", "Traveling Boxes"],
  ["T-Shirts & Polo's", "Boxers & Singlets", "Perfumes", "Belts",],
];
const collectionColumns = [
  ["Vacation Edits", "Weekend Edits", "Denim Story"],
  ["Exclusive Line", "Polo Archive", "Scent & Accessories"],
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { darkMode, setDarkMode, T } = useTheme();
  const { cart = [], wishlist = [] } = useStore();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = wishlist.length;

  // Active route checker
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    {
      label: "Shop",
      to: "/shop",
      dropdown: {
        heading: "Shop By Category",
        columns: shopColumns,
        toSlug: (label) => `/shop?category=${encodeURIComponent(label)}`,
        viewAllTo: "/shop",
        featured: { image: Sneaker, tag: "Featured", title: "The Sneaker Vault" },
      },
    },
    {
      label: "Collections",
      to: "/Collection",
      dropdown: {
        heading: "Shop By Collection",
        columns: collectionColumns,
        toSlug: (label) => `/collection?tag=${encodeURIComponent(label)}`,
        viewAllTo: "/collections",
        featured: { image: rails, tag: "Just Landed", title: "New Arrivals" },
      },
    },
    { label: "Consultation", to: "/styling" },
    { label: "Reviews", to: "/review" },
    { label: "Contact", to: "/contact" },
  ];

  // Prevent scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const DarkToggle = () => (
    <div
      className={`flex items-center p-1 rounded-full border transition-colors ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-amber-500/20 border-amber-500/50"
      }`}
    >
      <button
        onClick={() => setDarkMode(false)}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          !darkMode
            ? "bg-amber-500 text-white shadow-sm"
            : "text-gray-700 dark:text-gray-400"
        }`}
      >
        ☀ Light
      </button>
      <button
        onClick={() => setDarkMode(true)}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          darkMode
            ? "bg-amber-600 text-white "
            : "text-gray-700 dark:text-gray-400"
        }`}
      >
        ☽ Dark
      </button>
    </div>
  );

  return (
    <>
      <Topbar />

      {/* ── Main Amber Navbar ── */}
      <div className="w-full bg-amber-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
         
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0">
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-600 bg-black shadow-lg">
                <img
                  src={StyleYourself}
                  alt="Style Yourself"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center leading-none">
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                StyleYourself
              </span>
              <span className="text-[10px] text-gray-800 tracking-wider uppercase font-semibold mt-0.5">
                Luxury Menswear, Abuja
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex gap-7 font-medium items-center relative">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative py-2"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.to}
                  className={`flex items-center gap-1 hover:text-white transition-colors text-sm font-semibold ${
                    isActive(link.to) ? "text-white" : "text-gray-900"
                  }`}
                >
                  {link.label}
                  {link.dropdown && <FaChevronDown size={10} className="mt-0.5" />}
                </Link>

                {/* Desktop Mega Dropdown */}
                {link.dropdown && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 w-[520px] bg-white dark:bg-gray-900 shadow-2xl rounded-xl p-6 border border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-6 z-50">
                    <div className="col-span-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">
                        {link.dropdown.heading}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {link.dropdown.columns.flat().map((item) => (
                          <Link
                            key={item}
                            to={link.dropdown.toSlug(item)}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                      <Link
                        to={link.dropdown.viewAllTo}
                        className="inline-block mt-4 text-xs font-bold text-amber-600 hover:underline uppercase tracking-wider"
                      >
                        View All →
                      </Link>
                    </div>

                    {/* Featured Item Preview */}
                    {link.dropdown.featured && (
                      <div className="relative rounded-lg overflow-hidden group/card bg-gray-100 dark:bg-gray-800">
                        <img
                          src={link.dropdown.featured.image}
                          alt={link.dropdown.featured.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                            {link.dropdown.featured.tag}
                          </span>
                          <span className="text-xs font-bold leading-tight">
                            {link.dropdown.featured.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <DarkToggle />
            <Link to="/wishlist" className="relative text-gray-900 transition-colors">
              <FaHeart className="text-xl" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-gray-900 transition-colors">
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden text-2xl text-gray-900 cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xl ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-80 dark:bg-gray-900">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-amber-400 leading-none">
              StyleYourself
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-400 italic mt-1">
              ...your style, your way
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 rounded-full dark:hover:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors"
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Navigation Items with Accordion Dropdowns */}
        <nav className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {navLinks.map((link) => (
            <div key={link.label} className="flex flex-col">
              <div className="flex items-center justify-between px-6 py-3.5">
                <Link
                  to={link.to}
                  onClick={() => !link.dropdown && setMenuOpen(false)}
                  // className="px-6 py-4 text-base font-medium text-gray-800 border-b border-gray-100 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  className={`text-base font-medium transition-colors ${
                    isActive(link.to)
                      ? "text-amber-600 dark:text-amber-400 font-bold"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {link.label}
                </Link>

                {link.dropdown && (
                  <button
                    onClick={() =>
                      setMobileSubOpen(mobileSubOpen === link.label ? null : link.label)
                    }
                    className="p-2 text-amber-600 dark:text-amber-400"
                    aria-label={`Toggle ${link.label} submenu`}
                  >
                    <FaChevronDown
                      size={12}
                      className={`transform transition-transform duration-200 ${
                        mobileSubOpen === link.label ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Submenu Accordion */}
              {link.dropdown && mobileSubOpen === link.label && (
                <div className="bg-amber-50/50 dark:bg-gray-800/50 px-6 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-b border-gray-100 dark:border-gray-800">
                  {link.dropdown.columns.flat().map((item) => (
                    <Link
                      key={item}
                      to={link.dropdown.toSlug(item)}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                  <Link
                    to={link.dropdown.viewAllTo}
                    onClick={() => setMenuOpen(false)}
                    className="col-span-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1"
                  >
                    View All Products →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Wishlist & Cart Quick Actions */}
        <div className="px-5 py-4 flex gap-3 border-b border-gray-100 dark:border-gray-800 mt-2">
          <Link
            to="/wishlist"
            onClick={() => setMenuOpen(false)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-colors"
          >
            <FaHeart className="text-red-500" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-400 text-gray-900 text-sm font-semibold hover:bg-amber-500 transition-colors shadow-sm"
          >
            <FaShoppingCart />
            Cart
            {cartCount > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Dark Mode Switcher */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dark Mode</span>
          <DarkToggle />
        </div>

        {/* Contact Information */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-3">
            Contact Info
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-gray-300">
            <a
              href="tel:+2349127170775"
              className="flex items-center gap-3 hover:text-amber-600 transition-colors"
            >
              <FaPhone size={13} className="text-amber-500 flex-shrink-0" />
              +234 912 717 0775
            </a>
            <a
              href="mailto:styleyourself@gmail.com"
              className="flex items-center gap-3 hover:text-amber-600 transition-colors"
            >
              <FaEnvelope size={13} className="text-amber-500 flex-shrink-0" />
              styleyourself@gmail.com
            </a>
            <span className="flex items-start gap-3">
              <FaMapMarkerAlt size={13} className="text-amber-500 flex-shrink-0 mt-1" />
              <span className="text-xs leading-relaxed">
                G.O Plaza Opposite Light Gold Estate phase 3 Lugbe Abuja, Nigeria.
              </span>
            </span>
            <span className="flex items-start gap-3">
              <FaMapMarkerAlt size={13} className="text-amber-500 flex-shrink-0 mt-1" />
              <span className="text-xs leading-relaxed">
                Shop A21 Vegas Mall & Apartment, Wuse, Abuja, Nigeria.
              </span>
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div className="px-5 py-4 mt-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-3">
            Follow Us
          </p>
          <div className="flex gap-3">
            {[
              { icon: <FaFacebook size={16} />, href: "#", label: "Facebook" },
              { icon: <FaInstagram size={16} />, href: "#", label: "Instagram" },
              { icon: <FaWhatsapp size={16} />, href: "#", label: "Whatsapp" },
              { icon: <FaTiktok size={16} />, href: "#", label: "TikTok" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;