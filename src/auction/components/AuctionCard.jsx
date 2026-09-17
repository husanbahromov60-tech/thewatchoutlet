import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import CountdownTimer from "./CountdownTimer";
import PriceTag from "../../comps/PriceTag";

const AuctionCard = ({ item, onClick }) => {
  if (!item) return null;

  // Telegram bot va Firestore ma'lumotlarini standartlashtirish
  const imageUrl =
    item.images && item.images.length > 0
      ? item.images[0]
      : item.image || item.Image1 || "https://via.placeholder.com/300";

  const displayPrice =
    item.currentPrice ||
    item.startingPrice ||
    item.startPrice ||
    item.price ||
    0;

  const title = item.cardTitle || item.title || item.name || "Nomsiz soat";
  const mechanism = item.mechanism || item.Mechanism || "Mexanik";
  const caseSize = item.caseSize || item.CaseSize || "41mm";

  // =========================================================
  // AUKSION TUGASH SANI VA SOATINI FORMATLASH
  // =========================================================
  const formatEndDate = (rawDate) => {
    if (!rawDate) return "Noma'lum";

    let dateObj = null;

    // 1. Firestore Timestamp bo'lsa
    if (typeof rawDate?.toDate === "function") {
      dateObj = rawDate.toDate();
    }
    // 2. { seconds: ... } shaklidagi Timestamp bo'lsa
    else if (rawDate?.seconds) {
      dateObj = new Date(rawDate.seconds * 1000);
    }
    // 3. String (Masalan: "2026-09-12 16:49" yoki ISO string)
    else if (typeof rawDate === "string") {
      dateObj = new Date(rawDate.replace(" ", "T"));
    }
    // 4. Boshqa holatlar
    else {
      dateObj = new Date(rawDate);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return String(rawDate);
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const rawEndTime =
    item.endTime || item.auctionEnd || item.endDate || item.endTimeStr;
  const endDateTime = formatEndDate(rawEndTime);

  return (
    <div
      onClick={onClick}
      className="bg-[#0f192b] rounded-2xl overflow-hidden border-[2px] border-[#657591] shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between cursor-pointer active:scale-98"
    >
      <div className="relative w-full h-44 bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
          🔥 Auksion
        </span>
      </div>

      <div className="p-2 flex-1 flex flex-col gap-[5px] justify-between">
        <div>
          <h3 className="font-bold text-white text-sm truncate">{title}</h3>
          <div className="text-blue-600 font-extrabold text-base">
            <PriceTag usd={displayPrice} size="sm" />
          </div>
          {/* Mashina yili va km o'rniga soat parametrlari */}
          <div className="text-[11px] text-slate-400 font-medium capitalize">
            {mechanism} • {caseSize}
          </div>
        </div>

        <div className="flex justify-end items-center text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
          <span className="flex items-center gap-1 font-semibold text-slate-400">
            <FaCalendarAlt className="text-indigo-400" /> {endDateTime}
          </span>
        </div>

        <div className="bg-[#112544] rounded-xl p-1.5 flex items-center justify-between text-xs mt-1 border border-indigo-900/50">
          <span className="text-white font-semibold text-[11px]">Qoldi:</span>
          <h3 className="animate-pulse text-red-500 font-bold">
            <CountdownTimer endTime={rawEndTime} />
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
