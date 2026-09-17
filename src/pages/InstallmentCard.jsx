import React from "react";
import PriceTag from "../comps/PriceTag";
import { formatUZS } from "../utils/currency";

const InstallmentCard = ({ item, onClick }) => {
  if (!item) return null;

  // Rasmni xavfsiz olish
  const image =
    item.images && item.images.length > 0 ? item.images[0] : item.image || "";

  // Umumiy narx (botdan totalPrice yoki price bo'lib kelishi mumkin)
  const totalPrice = Number(item.totalPrice || item.price || 0);
  const minDownPayment = Number(item.minDownPayment || 0);
  const maxPeriod = Number(item.maxPeriod || item.minPeriod || 12);
  const annualInterest = Number(item.annualInterest || 0);

  // Minimal oylik to'lovni hisoblash
  const calculateApproxMonthly = () => {
    if (!totalPrice || !maxPeriod) return 0;
    const remainingPrice = totalPrice - minDownPayment;
    if (remainingPrice <= 0) return 0;

    const interest = annualInterest
      ? remainingPrice * (annualInterest / 100) * (maxPeriod / 12)
      : 0;

    return Math.round((remainingPrice + interest) / maxPeriod);
  };

  const approxMonthly = calculateApproxMonthly();

  return (
    <div
      onClick={onClick}
      className="bg-[#0f192b] rounded-2xl overflow-hidden border border-slate-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Rasm qismi */}
        <div className="relative h-44 bg-slate-900 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={item.name || item.brand}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Rasm yo'q
            </div>
          )}
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Nasiya Savdo
          </span>
        </div>

        {/* Ma'lumot qismi */}
        <div className="p-2.5 space-y-1.5">
          <div>
            <h3 className="font-extrabold text-[13px] text-white truncate leading-snug">
              {item.brand
                ? `${item.brand} ${item.name || ""}`
                : item.name || "Nomi ko'rsatilmagan"}
            </h3>
          </div>

          {/* Boshlang'ich to'lov */}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300 font-medium">Boshlang'ich:</span>
            <span className="font-bold text-white">
              ${minDownPayment.toLocaleString()}
            </span>
          </div>

          {/* Oylik to'lov */}
          <div className="bg-[#112544] rounded-xl px-2.5 py-2 flex items-center justify-between border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">
              ({maxPeriod} oy)
            </span>
            <div className="text-right leading-tight">
              <div className="text-[16px] font-black text-emerald-400 leading-none">
                ${approxMonthly.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">
                ≈ {formatUZS(approxMonthly)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Umumiy narx */}
      <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-800">
        <div className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">
          Umumiy narxi
        </div>
        <PriceTag usd={totalPrice} size="xs" />
      </div>
    </div>
  );
};

export default InstallmentCard;
