import React from "react";
import { NavLink } from "react-router-dom";
// LuHome -> LuHouse ga, LuStore -> LuShoppingBag ga almashtirildi
import {
  LuHouse,
  LuShoppingBag,
  LuPlus,
  LuHeart,
  LuGavel,
} from "react-icons/lu";
import { FaTelegramPlane } from "react-icons/fa";
import { FiWatch } from "react-icons/fi";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f192b] backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-2 h-16 flex justify-between items-center relative">
        {/* 1. Asosiy */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuHouse className="text-xl mb-0.5" />
          <span className="text-[10px]">Asosiy</span>
        </NavLink>

        {/* 2. Bozor */}
        <NavLink
          to="/used-watches"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <FiWatch className="text-xl mb-0.5" />
          <span className="text-[10px]">Б/у watches</span>
        </NavLink>

        {/* 3. Sotish (O'rtadagi katta tugma) */}
        <NavLink
          to="/auction"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuGavel className="text-xl mb-0.5" />
          <span className="text-[10px]">Auksion</span>
        </NavLink>

        {/* 4. Likelar */}
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuHeart className="text-xl mb-0.5" />
          <span className="text-[10px]">Likelar</span>
        </NavLink>

        {/* 5. Telegram */}
        <a
          href="https://t.me/avtotekuz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-sky-500 transition-all duration-200"
        >
          <FaTelegramPlane className="text-xl mb-0.5 text-sky-500" />
          <span className="text-[10px]">Telegram</span>
        </a>
      </div>
    </div>
  );
};

export default BottomNav;
