import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuX,
  LuExpand,
  LuLock,
  LuPhone,
  LuSend,
  LuClock,
  LuShieldAlert,
  LuWatch,
  LuLayers,
  LuCpu,
  LuShield,
  LuMaximize,
  LuDroplet,
  LuTrendingUp,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { FaCircleCheck } from "react-icons/fa6";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

import { placeBid, checkUserApproval } from "../services/auctionService";
import { getTelegramUser } from "../services/telegram";
import { toast } from "react-toastify";
import CountdownTimer from "./CountdownTimer";

// Valyuta kursi
const USD_RATE = 12700;

/* 1. KATTALASHTIRILGAN RASM REJIMI (FULLSCREEN GALLERY) */
const FullscreenGallery = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const goNext = () => setIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (event, info) => {
    const threshold = 40;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10000000000000] bg-black flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent"
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
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform shadow-2xl"
        >
          <LuX size={24} />
        </button>
      </div>

      <motion.div
        key={`fs-auction-img-${index}`}
        className="w-full flex-1 flex items-center justify-center p-2 relative select-none"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={images[index]}
          alt=""
          className="max-w-full max-h-[80vh] object-contain select-none rounded-md"
          draggable={false}
        />
      </motion.div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-20"
          >
            <LuChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-20"
          >
            <LuChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="w-full pb-6 pt-2 flex justify-center gap-2 z-20"
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

/* 2. TO'LIQ EKRANLI AUCTION DETAIL MODAL */
const AuctionDetailModal = ({ auction, onClose, isApproved: propApproved }) => {
  if (!auction) return null;

  const [loading, setLoading] = useState(false);
  const [requestSending, setRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Foydalanuvchining ruxsat holatini lokal ravishda tekshirish
  const [approvedState, setApprovedState] = useState(propApproved || false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  const tgUser =
    getTelegramUser() || window.Telegram?.WebApp?.initDataUnsafe?.user;
  const inMiniApp = Boolean(tgUser?.id);

  // Real-time yoki Firestore orqali ruxsatni qayta tekshirib olish
  useEffect(() => {
    let isMounted = true;
    const verifyUser = async () => {
      if (tgUser?.id) {
        const approved = await checkUserApproval(tgUser.id);
        if (isMounted) {
          setApprovedState(approved);
          setCheckingApproval(false);
        }
      } else {
        if (isMounted) setCheckingApproval(false);
      }
    };
    verifyUser();
    return () => {
      isMounted = false;
    };
  }, [tgUser?.id]);

  const currentPrice = Number(
    auction.currentPrice || auction.startingPrice || auction.startPrice || 0
  );
  const minValidBid = currentPrice + (Number(auction.bidStep) || 10);
  const [customBid, setCustomBid] = useState("");

  const isAuctionEnded = auction?.endTime
    ? new Date(
        typeof auction.endTime === "string"
          ? auction.endTime.replace(" ", "T")
          : auction.endTime
      ).getTime() <= Date.now()
    : false;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const images =
    auction.images && auction.images.length > 0
      ? auction.images
      : [auction.image || auction.Image1 || "https://via.placeholder.com/400"];

  const openLink = (url) => {
    if (!url) return;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const goNext = () => setActiveImgIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (event, info) => {
    const threshold = 30;
    // Agar surish (drag) masofasi juda kichik bo'lsa, uni oddiy "click" (bosish) deb hisoblaymiz
    if (Math.abs(info.offset.x) < 5 && Math.abs(info.offset.y) < 5) {
      setShowGallery(true);
      return;
    }
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  // ADMINGA BOG'LANISH VA ARIZA YUBORISH
  const handleRequestAccess = async () => {
    if (!tgUser?.id) {
      toast.error("Telegram Mini App orqali kiring!");
      return;
    }

    setRequestSending(true);
    try {
      const requestRef = doc(db, "auction_requests", String(tgUser.id));
      await setDoc(
        requestRef,
        {
          telegramId: String(tgUser.id),
          name:
            `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim() ||
            "Foydalanuvchi",
          username: tgUser.username || "",
          photo_url: tgUser.photo_url || "",
          requestedAt: serverTimestamp(),
          status: "pending",
        },
        { merge: true }
      );

      setRequestSent(true);
      toast.success("Arizangiz adminga yuborildi!");
      openLink("https://t.me/avtotek_admin");
    } catch (err) {
      console.error("Ariza yuborishda xato:", err);
      toast.error("Ariza yuborishda xatolik yuz berdi!");
    } finally {
      setRequestSending(false);
    }
  };

  // STAVKA YUBORISH
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (isAuctionEnded) {
      toast.error("Auksion vaqti tugagan!");
      return;
    }

    const bidValue = Number(customBid);

    if (!approvedState) {
      toast.warning(
        "Auksionda qatnashish uchun akkountingiz tasdiqlanishi shart!"
      );
      return;
    }

    if (bidValue < minValidBid) {
      toast.error(
        `Stavka kamida $${minValidBid.toLocaleString()} bo'lishi kerak!`
      );
      return;
    }

    setLoading(true);
    try {
      await placeBid({
        auctionId: auction.id,
        user: tgUser,
        amount: bidValue,
        endTime: auction.endTime,
      });
      toast.success(`Stavka qabul qilindi: $${bidValue}`);
      setCustomBid("");
    } catch (err) {
      console.error("Stavka yuborishda xato:", err);
      toast.error(err?.message || "Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  const bidNumber = Number(customBid);
  const isValidBid = customBid !== "" && bidNumber >= minValidBid;

  const watchTitle =
    auction.cardTitle || auction.title || auction.name || "Auksion Soati";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000000000000] bg-[#112544] w-full h-full overflow-y-auto"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="w-full min-h-full flex flex-col relative mb-[100px] pb-10">
          {/* SLIDER VA RASMLAR */}
          <div className="relative w-full h-[36vh] bg-slate-900 shrink-0 overflow-hidden">
            <motion.div
              key={`auction-img-${activeImgIndex}`}
              className="w-full h-full cursor-pointer relative z-0"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              onDragEnd={handleDragEnd}
              onClick={() => setShowGallery(true)}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <img
                src={images[activeImgIndex]}
                alt={watchTitle}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </motion.div>

            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* Yopish tugmasi */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30 cursor-pointer"
            >
              <LuX size={22} />
            </button>

            {/* Kattalashtirish (Expand) tugmasi */}
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30 cursor-pointer"
            >
              <LuExpand size={19} />
            </button>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 z-10">
                {activeImgIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="px-4 pt-5 bg-[#112544] mb-[30px] rounded-t-3xl relative z-10 -mt-4 flex-1">
            <h2 className="text-2xl font-extrabold text-white leading-tight mb-1">
              {watchTitle}
            </h2>

            {/* ASOSIY NARX VA UZS QIYMATI */}
            <div className="mb-3">
              <div className="text-white font-black text-3xl leading-none">
                ${currentPrice.toLocaleString()}
              </div>
              <div className="text-slate-400 font-bold text-xs mt-1">
                ≈ {(currentPrice * USD_RATE).toLocaleString()} UZS
              </div>
            </div>

            {/* OXIRGI STAVKA EGISI KO'RINIShI */}
            {auction.lastBidder && (
              <div className="bg-[#0f192b] border border-emerald-400 p-3 rounded-2xl flex items-center justify-between mb-4 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {auction.lastBidder.photoUrl ? (
                    <img
                      src={auction.lastBidder.photoUrl}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-400"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                      {auction.lastBidder.userName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-slate-300 block text-[10px]">
                      Oxirgi stavka egasi
                    </span>
                    <strong className="text-white font-semibold truncate block">
                      {auction.lastBidder.userName}
                    </strong>
                    {auction.lastBidder.userId && (
                      <span className="text-slate-300 font-mono text-[9px] block truncate">
                        ID: {auction.lastBidder.userId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-500 font-extrabold text-sm block">
                    ${auction.lastBidder.amount?.toLocaleString()}
                  </span>
                  <span className="text-emerald-600/80 font-bold text-[10px] block">
                    ≈{" "}
                    {(
                      (auction.lastBidder.amount || 0) * USD_RATE
                    ).toLocaleString()}{" "}
                    UZS
                  </span>
                </div>
              </div>
            )}

            {/* TAYMER */}
            <div className="bg-[#0f192b] p-3.5 rounded-2xl border border-indigo-900/50 flex justify-between items-center text-sm mb-4 shadow-sm">
              <span className="text-white font-semibold">Tugash vaqti:</span>
              <CountdownTimer endTime={auction.endTime} />
            </div>

            {/* HOLATLAR BO'YICHA STAVKA QISMI */}
            {checkingApproval ? (
              <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                Ruxsat holati tekshirilmoqda...
              </div>
            ) : isAuctionEnded ? (
              <div className="bg-red-950/40 border mb-[15px] border-red-800 rounded-2xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
                  <LuLock size={18} /> Auksion vaqti yakunlandi!
                </div>
                <p className="text-xs text-red-300 font-medium">
                  Ushbu soat uchun stavkalar qabul qilish to'xtatildi.
                </p>
              </div>
            ) : !inMiniApp ? (
              <div className="bg-amber-950/40 border border-amber-800 rounded-2xl p-4 text-center space-y-3">
                <LuLock className="mx-auto text-amber-400" size={28} />
                <p className="text-xs text-amber-200 font-semibold">
                  Auksionda qatnashish va narx taklif qilish uchun ilovani
                  Telegram Mini App orqali oching!
                </p>
                <button
                  onClick={() => openLink("https://t.me/avtotek_bot/app")}
                  className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <LuSend /> Telegram Mini App da ochish
                </button>
              </div>
            ) : !approvedState ? (
              /* --- QOIDALAR VA ADMINGA BOG'LANISH QISMI --- */
              <div className="bg-slate-900 mb-[30px] text-white rounded-3xl p-5 shadow-xl space-y-4 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wide">
                  <LuShieldAlert size={20} /> Auksion Qoidalari & Ruxsat
                </div>

                <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <p>
                    📌 <strong>1-qoida:</strong> Stavka berilgach, uni bekor
                    qilish imkoni yo'q.
                  </p>
                  <p>
                    📌 <strong>2-qoida:</strong> G'olib bo'lganingizdan so'ng 24
                    soat ichida bog'lanmasangiz, akkount bloklanadi.
                  </p>
                  <p>
                    📌 <strong>3-qoida:</strong> Narx berish uchun Telegram ID
                    orqali ma'muriyat tasdiqidan o'tish shart.
                  </p>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Sizning Chat ID (Telegram ID):
                  </span>
                  <strong className="text-amber-400 font-mono text-sm">
                    {tgUser?.id || "Noma'lum"}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleRequestAccess}
                    disabled={requestSending}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl active:scale-95 transition-all shadow-lg shadow-blue-600/30"
                  >
                    {requestSending ? (
                      "Yuborilmoqda..."
                    ) : requestSent ? (
                      <>
                        <LuClock size={16} /> Ko'rib chiqilmoqda
                      </>
                    ) : (
                      <>
                        <LuSend size={16} /> Adminga yuborish
                      </>
                    )}
                  </button>

                  <a
                    href="tel:+998901234567"
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <LuPhone size={16} /> Qo'ng'iroq
                  </a>
                </div>
              </div>
            ) : (
              /* --- STAVKA BERISH QISMI --- */
              <form
                onSubmit={handleBidSubmit}
                className="space-y-2 pt-3 border-t mb-[30px] border-slate-700/50"
              >
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-2">
                  <FaCircleCheck size={16} /> Akkountingiz auksion uchun
                  tasdiqlangan
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    O'zingiz stavka kiriting (Minimal: ${minValidBid}):
                  </label>
                  {customBid !== "" && !isNaN(customBid) && (
                    <span className="text-[11px] font-bold text-white">
                      ≈ {(Number(customBid) * USD_RATE).toLocaleString()} UZS
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={`masalan: ${minValidBid}`}
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    className={`flex-1 p-3 rounded-xl border-2 bg-[#0f192b] font-bold text-white text-base outline-none transition-all ${
                      customBid === ""
                        ? "border-slate-700"
                        : isValidBid
                        ? "border-emerald-500 text-emerald-400"
                        : "border-red-500 text-red-400"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!isValidBid || loading}
                    className={`px-5 py-3 font-bold rounded-xl text-white transition-all ${
                      isValidBid
                        ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/30"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "..." : "Yuborish"}
                  </button>
                </div>
              </form>
            )}

            {/* INSTAGRAM & YOUTUBE */}
            {(auction.instagram || auction.youtube) && (
              <div className="flex gap-2 mb-5">
                {auction.instagram && (
                  <button
                    onClick={() => openLink(auction.instagram)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md"
                  >
                    <FaInstagram size={18} /> Instagram
                  </button>
                )}
                {auction.youtube && (
                  <button
                    onClick={() => openLink(auction.youtube)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-red-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md"
                  >
                    <FaYoutube size={18} /> YouTube
                  </button>
                )}
              </div>
            )}

            {/* XUSUSIYATLAR GRIDI (SOAT PARAMETRLARI) */}
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
              Xususiyatlari
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuWatch className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Brend
                  </span>
                  <strong className="text-white">
                    {auction.brand || auction.Brand || "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuLayers className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Korpus materiali
                  </span>
                  <strong className="text-white">
                    {auction.caseMaterial || auction.CaseMaterial || "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuCpu className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Mexanizm
                  </span>
                  <strong className="text-white">
                    {auction.mechanism || auction.Mechanism || "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuShield className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">Oyna</span>
                  <strong className="text-white">
                    {auction.glass || auction.Glass || "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuMaximize className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Korpus o'lchami
                  </span>
                  <strong className="text-white">
                    {auction.caseSize ||
                      auction.CaseSize ||
                      auction.case_size ||
                      auction.size ||
                      auction.diameter ||
                      "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs">
                <LuDroplet className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Suvga chidamlilik
                  </span>
                  <strong className="text-white">
                    {auction.waterResistance || auction.WaterResistance || "-"}
                  </strong>
                </div>
              </div>

              <div className="bg-[#0f192b] p-3 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-2 text-xs col-span-2">
                <LuTrendingUp className="text-indigo-400 shrink-0" size={16} />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">
                    Stavka qadami
                  </span>
                  <strong className="text-white">
                    {auction.bidStep ? `$${auction.bidStep}` : "+$10"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN GALLERY MODAL */}
      {showGallery && (
        <FullscreenGallery
          images={images}
          startIndex={activeImgIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default AuctionDetailModal;
