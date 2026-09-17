import React from "react";
import { FaPaperPlane, FaShieldAlt } from "react-icons/fa";
import { isTelegramWebApp } from "../services/telegram";
import BottomNav from "../../pages/BottomNav";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const TelegramGuard = ({ children, botUrl = "https://t.me/Avtotekuzbot" }) => {
  // Agar Telegram Mini App ichidan ochilgan bo'lsa, kontentni ko'rsatamiz
  if (isTelegramWebApp()) {
    return children;
  }

  // Brauzer orqali kirgan bo'lsa, blokirovka va yo'naltirish oynasi
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#0f192b] border-slate-200 absolute top-0 z-40">
        <NavLink
          to="/"
          className="flex justify-start text-white font-bold py-3 items-center w-25"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>
      </div>
      <div className="bg-slate-800 border border-slate-700/60 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
          <FaShieldAlt size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-white">
            Faqat Telegram orqali!
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Auksionda qatnashish va narx taklif qilish uchun ilovani Telegram
            Botimiz orqali oching.
          </p>
        </div>

        <a
          href={botUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-600/25"
        >
          <FaPaperPlane size={14} /> Telegram Botga o'tish
        </a>
      </div>
      {/* Pastki Navigatsiya Menyusi */}
      <BottomNav />
    </div>
  );
};

export default TelegramGuard;
