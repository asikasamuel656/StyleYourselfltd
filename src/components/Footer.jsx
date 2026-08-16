import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-[#222]">
      
      {/* Main grid */}
      <div className="px-6 sm:px-12 lg:px-20 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-10 border-b border-[#1e1e1e]">
          
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-xl font-bold tracking-widest">StyleYourself</span>
            <p className="mt-2 text-xs text-gray-500 italic tracking-wide">...your style, your way</p>
            <p className="mt-4 text-xs text-[#555] leading-relaxed max-w-xs">
              Fashion store where style meets confidence..
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-400">
              Quick Links
            </span>
            <div className="flex flex-col gap-2.5 mt-4">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "Cart", to: "/cart" },
                { label: "Wishlist", to: "/wishlist" },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-[0.82rem] text-gray-300 hover:text-white hover:pl-1 transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support / Legal */}
          <div>
            <span className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-400">
              Support
            </span>
            <div className="flex flex-col gap-2.5 mt-4">
            {[
                { label: "FAQs", to: "/customer/faqs" },
                { label: "Shipping & Delivery", to: "/customer/delivery" },
                { label: "Returns & Refunds", to: "/customer/return-refund" },
                { label: "Privacy Policy", to: "/customer/privacy-policy" },
                ].map(({ label, to }) => (
            <Link
                key={label}
                to={to}
                className="text-[0.82rem] text-gray-300 hover:text-white hover:pl-1 transition-all duration-200"
            >
                {label}
            </Link>
            ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-6">
          <span className="text-[0.7rem] text-[#444] tracking-wide">
            &copy; 2026 StyleYourself. All rights reserved.
          </span>
          <div className="flex gap-5">
            {[
                { label: "Privacy", to: "/customer/privacy-policy" },
                { label: "Refunds", to: "/customer/return-refund" },
                { label: "FAQs", to: "/customer/faqs" },
            ].map(({ label, to }) => (
            <Link
                key={label}
                to={to}
                className="text-[0.7rem] text-[#444] hover:text-gray-400 transition-colors duration-200"
            >
                {label}
            </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;