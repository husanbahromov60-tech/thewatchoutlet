import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTelegramPlane } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

// logo
import brendLogo from "../assets/brendLogo.png";

// icons
import { MdMenuOpen, MdClose } from "react-icons/md";
import {
  LuHouse,
  LuShoppingBag,
  LuHeart,
  LuPhoneCall,
  LuInfo,
  LuGavel,
} from "react-icons/lu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Modal ochilganda orqa fonga scroll bo'lishni taqiqlash (Lock Body Scroll)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <nav className="flex justify-between items-center px-3.5 py-3.5 bg-[#0f192b] border-b border-slate-200  top-0 z-40">
        {/* Logo */}
        <div className="flex justify-center items-center gap-1.25">
          {/* <Link to="/">
            <img
              className="h-13.5"
              src={`https://i.ibb.co/d4hwTVg5/photo-1788807555396-0.webp`}
              alt="Logo"
            />
          </Link> */}
          <h1 className=" font-bold text-white text-1xl">The Watch Outlet</h1>
        </div>

        {/* text */}
        {/* <div>
          <p className="text-center leading-3.5 text-[15px] font-bold">
            Tekshirilgani, To'g'ri Tanlov <br />
            <span className="text-[9px] text-slate-500 font-medium">
              Ishonchliy Bozor
            </span>
          </p>
        </div> */}

        {/* links / Menu Button */}
        <div>
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 text-white hover:bg-slate-100 rounded-lg active:scale-90 transition-all cursor-pointer flex items-center justify-center"
          >
            <MdMenuOpen size={28} />
          </button>
        </div>
      </nav>

      {/* ----------------- SIDEBAR & BACKDROP (Framer Motion) ----------------- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Orqa qorayuvchi fon (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[10000000000] bg-slate-900/50 backdrop-blur-sm"
            />

            {/* O'ng tarafdan chiquvchi Oyna (Sidebar) */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[1000000000000] w-72 h-full bg-[#112544] shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header: Sarlavha va Yopish tugmasi */}
                <div className="flex items-center bg-[#0f192b] justify-between p-4 border-b border-slate-100">
                  <span className="font-bold text-white text-base">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-white hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    <MdClose size={24} />
                  </button>
                </div>

                {/* Sahifalarga o'tish linklari */}
                <div className="p-4 space-y-1">
                  <NavLink
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-[#0f192b] text-white font-semibold"
                          : "text-slate-400 hover:bg-slate-50"
                      }`
                    }
                  >
                    <LuHouse size={20} />
                    <span>Bosh sahifa</span>
                  </NavLink>

                  <NavLink
                    to="/auction"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-white font-semibold"
                          : "text-slate-400 hover:bg-slate-50"
                      }`
                    }
                  >
                    <LuGavel size={20} />
                    <span>Auction</span>
                  </NavLink>

                  <NavLink
                    to="/favorites"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-[#0f192b] text-white font-semibold"
                          : "text-slate-400 hover:bg-slate-50"
                      }`
                    }
                  >
                    <LuHeart size={20} />
                    <span>Saqlanganlar</span>
                  </NavLink>

                  <NavLink
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-white font-semibold"
                          : "text-slate-400 hover:bg-slate-50"
                      }`
                    }
                  >
                    <LuInfo size={20} />
                    <span>Biz haqimizda</span>
                  </NavLink>
                </div>
              </div>

              <div className=" flex flex-col gap-2.5 px-5 mb-5 ">
                {/* Pastki qism: Bog'lanish */}
                <div className="">
                  <a
                    href="https://t.me/avtotekuz"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0f192b] text-white font-semibold text-sm active:scale-95 transition-all"
                  >
                    <FaTelegramPlane size={18} />
                    <span>Telegram</span>
                  </a>
                </div>
                {/* Pastki qism: Bog'lanish */}
                <div className="">
                  <a
                    href="https://t.me/xusan728"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0f192b] text-white font-semibold text-sm  active:scale-95 transition-all"
                  >
                    <FaTelegramPlane size={18} />
                    <span>Telegram Admin</span>
                  </a>
                </div>
                {/* Pastki qism: Bog'lanish */}
                <div className="">
                  <a
                    href="https://www.instagram.com/avtotek.uz/"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0f192b] text-white font-semibold text-sm active:scale-95 transition-all"
                  >
                    <FaInstagram size={18} />
                    <span>Instagram</span>
                  </a>
                </div>
                {/* Pastki qism: Bog'lanish */}
                <div className="">
                  <a
                    href="tel:+998900770728"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0f192b] text-white font-semibold text-sm  active:scale-95 transition-all"
                  >
                    <LuPhoneCall size={18} />
                    <span>+998-90-077-07-28</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
