import React from "react";
import { formatUZS } from "../utils/currency";

// Kartalarda (CarCard, AuctionCard, InstallmentCard) va detail
// modallarda bir xil narx ko'rinishini ta'minlash uchun yagona komponent.
// size: "xs" (juda ixcham joylar) | "sm" (kartalar uchun) | "lg" (detail sahifa/modal uchun)
const PriceTag = ({ usd, size = "sm", className = "" }) => {
  const priceUsd = Number(usd || 0);

  const sizes = {
    xs: { usd: "text-[13px]", uzs: "text-[9px]" },
    sm: { usd: "text-[17px]", uzs: "text-[10px]" },
    lg: { usd: "text-[28px]", uzs: "text-[12px]" },
  };
  const s = sizes[size] || sizes.sm;

  return (
    <div className={`flex items-baseline gap-1.5 flex-wrap ${className}`}>
      <span className={` text-white font-extrabold ${s.usd}`}>
        ${priceUsd.toLocaleString()}
      </span>
      <span className={`text-slate-400 font-medium ${s.uzs}`}>
        {formatUZS(priceUsd)}
      </span>
    </div>
  );
};

export default PriceTag;

// text-blue-600
