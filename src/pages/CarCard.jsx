import React, { useEffect, useState } from "react";
import { LuHeart, LuCalendar } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import CarDetailModal from "./CarDetailModal.jsx";
import { isCarLiked, toggleCarLike } from "./Likes";
import PriceTag from "../comps/PriceTag";

const CarCard = ({ car: watch }) => {
  const watchTitle =
    watch?.name ||
    `${watch?.brand || ""} ${watch?.model || ""}`.trim() ||
    "Soat";

  const watchPrice = Number(
    watch?.price || watch?.startingPrice || watch?.totalPrice || 0
  );

  const [isLiked, setIsLiked] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const docId = watch?.id || watch?.watchId || watch?.messageId;

  useEffect(() => {
    if (docId) setIsLiked(isCarLiked(docId));
  }, [docId]);

  const handleToggleLike = (e) => {
    e.stopPropagation();
    if (docId) {
      const newState = toggleCarLike(docId);
      setIsLiked(newState);
    }
  };

  const imageUrl =
    watch?.image ||
    (Array.isArray(watch?.images) && watch.images.length > 0
      ? watch.images[0]
      : "");

  if (!watch || (!watchTitle && watchPrice === 0)) return null;

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-[#0f192b] rounded-2xl overflow-hidden border-[2px] border-[#657591] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      >
        {/* RASM */}
        <div className="relative w-full h-45 bg-slate-900 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={watchTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              Rasm yo'q
            </div>
          )}

          {/* BADGELAR (Brend va B/U) */}
          <div className="absolute flex-col top-2.5 left-2.5 flex items-start gap-1">
            {watch?.brand && (
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 uppercase">
                {watch.brand}
              </span>
            )}

            {/* Faqat isUsed haqiqatan true bo'lsa B/U chiqadi */}
            {watch?.isUsed === true && (
              <span className="bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-md  shadow-md tracking-wider">
                Б/у
              </span>
            )}
          </div>

          {/* LIKE TUGMASI */}
          <button
            type="button"
            onClick={handleToggleLike}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90 transition-all shadow-sm z-10"
          >
            {isLiked ? (
              <FaHeart className="text-rose-500 text-base" />
            ) : (
              <LuHeart className="text-base text-slate-700" />
            )}
          </button>
        </div>

        {/* MA'LUMOT */}
        <div className="p-2.5 flex flex-col flex-1 justify-between gap-2">
          <div>
            <h3 className="font-bold text-[13px] text-white leading-snug line-clamp-1 mb-1">
              {watchTitle}
            </h3>

            <PriceTag usd={watchPrice} size="sm" className="mb-1" />

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span>
                {watch?.mechanism || watch?.caseMaterial || "Mexanika"}
              </span>
              {watch?.diameter && (
                <>
                  <span>•</span>
                  <span>{watch.diameter}</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex justify-end items-center text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1 shrink-0">
              <LuCalendar className="text-slate-400" />
              <span>{watch?.date || "Bugun"}</span>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <CarDetailModal car={watch} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default CarCard;
