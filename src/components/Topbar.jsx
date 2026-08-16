import { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

const Topbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full">

      {/* Top Bar */}
      <div className="bg-amber-800 text-white text-sm px-4 md:px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center sm:text-left">
          <span className="cursor-pointer hover:text-yellow-400">
            styleyourself@gmail.com
          </span>
          <span className="mx-2"></span>
          <span className="cursor-pointer hover:text-yellow-400">
            +234 912 717 0775
          </span>
        </div>

        <div className="flex gap-4 text-lg">
          <a href="https://web.facebook.com/@styleyourselfltd">
            <FaFacebook className="cursor-pointer hover:text-yellow-400" />
          </a>
          <a href="https://www.instagram.com/styleyourselfltd/">
            <FaInstagram className="cursor-pointer hover:text-yellow-400" />
          </a>
         <a
            href="https://www.tiktok.com//@styleyourselfltd"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok className="cursor-pointer hover:text-yellow-400" />
          </a>
        </div>
      </div>

    </div>
  );
};

export default Topbar;