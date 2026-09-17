import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuX,
  LuMapPin,
  LuCalendar,
  LuWatch,
  LuMaximize,
  LuShieldCheck,
  LuPalette,
  LuSettings2,
  LuChevronLeft,
  LuChevronRight,
  LuExpand,
  LuDroplet,
} from "react-icons/lu";
import { FaInstagram, FaYoutube, FaTelegramPlane } from "react-icons/fa";
import PriceTag from "../comps/PriceTag";

const StatChip = ({ icon: Icon, label, value }) => {
  const hasValue = value && value !== "" && value !== "-";
  return (
    <div className="bg-[#0f192b] rounded-2xl p-3 flex flex-col gap-1.5 min-w-0 shadow-sm border border-slate-700/60">
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon size={14} className="text-amber-400" />}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span
        className={`text-sm font-bold truncate ${
          hasValue ? "text-white" : "text-slate-500 font-medium"
        }`}
      >
        {hasValue ? value : "Kiritilmagan"}
      </span>
    </div>
  );
};

/* 1. KATTALASHTIRILGAN GALEREYA (FULLSCREEN) */
const FullscreenGallery = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const goNext = () => setIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (e, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold) {
      goPrev();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999999] bg-black flex flex-col justify-between select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* TEPADAGI BAR */}
      <div
        className="w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold shadow-md">
            {index + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform shadow-2xl"
        >
          <LuX size={24} />
        </button>
      </div>

      {/* ASOSIY KATTA RASM */}
      <div
        className="w-full flex-1 flex items-center justify-center p-2 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={`fs-img-${index}`}
          src={images[index]}
          alt=""
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="max-w-full max-h-[82vh] object-contain select-none rounded-md cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-50"
            >
              <LuChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-50"
            >
              <LuChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* PASTDAGI NUQTALAR */}
      <div
        className="w-full pb-6 pt-2 flex justify-center gap-2 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 &&
          images.map((_, i) => (
            <div
              key={`fs-dot-${i}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
      </div>
    </motion.div>
  );
};

/* 2. ASOSIY WATCH DETAIL MODAL */
const CarDetailModal = ({ car: watch, onClose }) => {
  const images =
    watch?.images && watch.images.length > 0
      ? watch.images
      : watch?.image
      ? [watch.image]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!watch) return null;

  const instagramUrl = watch.instagram || watch.Instagram || "";
  const youtubeUrl = watch.youtube || watch.Youtube || watch.YouTube || "";
  const telegramContact = watch.telegram || watch.contact || "";

  const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold) {
      goPrev();
    } else {
      setShowGallery(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000000] bg-[#112544] w-full h-full overflow-y-auto select-none"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="w-full min-h-full flex flex-col relative pb-10">
          {/* RASMLAR CONTAINER */}
          <div className="relative w-full h-[38vh] bg-slate-900 shrink-0 overflow-hidden">
            {images.length > 0 ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <motion.img
                  key={`main-watch-img-${activeIndex}`}
                  src={images[activeIndex]}
                  alt={watch.name || watch.brand}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  className="w-full h-full object-cover select-none cursor-grab active:cursor-grabbing"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Rasm mavjud emas
              </div>
            )}

            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* CHIQISH TUGMASI */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30"
            >
              <LuX size={22} />
            </button>

            {/* KATTALASHTIRISH TUGMASI */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGallery(true);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30"
              >
                <LuExpand size={19} />
              </button>
            )}

            {/* INDIKATOR VA NUQTALAR */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 z-20 pointer-events-none">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                {images.map((_, i) => (
                  <button
                    key={`dot-btn-${i}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ASOSIY MA'LUMOTLAR */}
          <div className="px-4 pt-5 bg-[#112544] mb-[30px] rounded-t-3xl relative z-10 -mt-4 flex-1">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                {watch.name ||
                  `${watch.brand || ""} ${watch.model || ""}`.trim() ||
                  "Soat"}
              </h2>
            </div>
            {watch.listingId && (
              <div className="text-[11px] text-amber-400 font-mono mb-1">
                ID: #{watch.listingId}
              </div>
            )}
            <PriceTag usd={watch.price} size="lg" className="mb-4" />

            {/* IJTIMOIY TARMOQLAR VA BOG'LANISH */}
            {(instagramUrl || youtubeUrl || telegramContact) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {telegramContact && (
                  <a
                    href={
                      telegramContact.startsWith("http")
                        ? telegramContact
                        : `https://t.me/${telegramContact.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-sky-500 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md cursor-pointer"
                  >
                    <FaTelegramPlane size={18} /> Telegram
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md cursor-pointer"
                  >
                    <FaInstagram size={18} /> Instagram
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-red-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md cursor-pointer"
                  >
                    <FaYoutube size={18} /> Youtube
                  </a>
                )}
              </div>
            )}

            {/* SOAT XUSUSIYATLARI */}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Soat Xususiyatlari
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <StatChip icon={LuWatch} label="Brend" value={watch.brand} />
              <StatChip icon={LuSettings2} label="Model" value={watch.model} />
              <StatChip
                icon={LuSettings2}
                label="Mexanizm"
                value={watch.mechanism}
              />
              <StatChip
                icon={LuMaximize}
                label="Diametr"
                value={watch.diameter}
              />
              <StatChip
                icon={LuShieldCheck}
                label="Korpus"
                value={watch.caseMaterial || watch.case}
              />
              <StatChip
                icon={LuPalette}
                label="Kamar / Braslet"
                value={watch.strapMaterial || watch.strap}
              />
              <StatChip icon={LuPalette} label="Shisha" value={watch.glass} />
              <StatChip
                icon={LuDroplet}
                label="Suvdan himoya"
                value={watch.waterResistance}
              />
            </div>

            {/* MANZIL VA SANA */}
            <div className="flex items-center justify-between text-sm text-slate-400 mb-5 px-1">
              {/* <div className="flex items-center gap-1.5">
                <LuMapPin size={16} className="text-amber-400" />
                <span>{watch.location || "O'zbekiston"}</span>
              </div> */}
              <div className="flex items-center gap-1.5">
                <LuCalendar size={16} className="text-amber-400" />
                <span>{watch.date || "Bugun"}</span>
              </div>
            </div>

            {/* TAVSIF / DESCRIPTION */}
            {watch.description && (
              <div className="mb-10">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Tavsif
                </div>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#0f192b] p-3.5 rounded-2xl border border-slate-700/60 shadow-sm">
                  {watch.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN MODAL */}
      {showGallery && (
        <FullscreenGallery
          images={images}
          startIndex={activeIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default CarDetailModal;
