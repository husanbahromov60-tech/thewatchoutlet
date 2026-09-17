import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { getTelegramUser } from "../services/telegram";
import { checkUserApproval } from "../services/auctionService";
import BidModal from "../components/BidModal";
import {
  FaArrowLeft,
  FaGavel,
  FaUserCircle,
  FaHistory,
  FaShieldAlt,
} from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const user = getTelegramUser();

  // 1. FOYDALANUVCHI RUXSATINI TEKSHIRISH
  useEffect(() => {
    const checkApproval = async () => {
      if (user?.id) {
        const approved = await checkUserApproval(user.id);
        setIsApproved(approved);
      }
    };
    checkApproval();
  }, [user]);

  // 2. AUKSION MA'LUMOTLARINI REAL-VAQTDA OLISH
  useEffect(() => {
    if (!id) return;

    const auctionRef = doc(db, "auctions", id);
    const unsubscribe = onSnapshot(
      auctionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setAuction({ id: docSnap.id, ...docSnap.data() });
        } else {
          setAuction(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auksion ma'lumotlarini olishda xato:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 text-center py-20">
        <h2 className="text-lg font-bold text-slate-800">Auksion topilmadi!</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const images = auction.images || (auction.photo ? [auction.photo] : []);
  const currentPrice = Number(auction.currentPrice || auction.startPrice || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
        >
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-base font-bold text-slate-900 truncate max-w-[200px]">
          {auction.title}
        </h1>
        <div className="w-8" />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Rasm Galereyasi */}
        <div className="relative h-72 bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
          {images.length > 0 ? (
            <img
              src={images[activeImageIndex]}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Rasm mavjud emas
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeImageIndex === idx
                      ? "bg-white w-5"
                      : "bg-white/40 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Narx va Status paneli */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {auction.category || "Auksion"}
            </span>
            {auction.status === "active" ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <IoTimeOutline /> Faol
              </span>
            ) : (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
                Tugagan
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900">{auction.title}</h2>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Joriy Narx
              </span>
              <span className="text-2xl font-black text-emerald-600">
                ${currentPrice.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Minimal Qadam
              </span>
              <span className="text-lg font-bold text-slate-700">
                +${Number(auction.bidStep || 100).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Oxirgi stavka egasi */}
        {auction.lastBidder && (
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center gap-3">
            <FaUserCircle className="text-blue-600 text-3xl shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Oxirgi stavka bergan foydalanuvchi:
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">
                {auction.lastBidder.userName} (
                <span className="text-emerald-600">
                  ${Number(auction.lastBidder.amount).toLocaleString()}
                </span>
                )
              </p>
            </div>
          </div>
        )}

        {/* Tavsif */}
        {auction.description && (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tavsif va Ma'lumot
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>
          </div>
        )}

        {/* Stavkalar Tarixi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FaHistory /> Stavkalar Tarixi ({auction.bidsHistory?.length || 0})
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {auction.bidsHistory && auction.bidsHistory.length > 0 ? (
              [...auction.bidsHistory].reverse().map((bid, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                    👤 {bid.userName}
                  </span>
                  <span className="font-bold text-emerald-600">
                    ${Number(bid.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-3">
                Hali hech kim stavka bermadi. Birinchi bo'ling!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pastki Harakat Paneli */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setShowBidModal(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all"
          >
            <FaGavel /> Stavka Berish
          </button>
        </div>
      </div>

      {/* Stavka Urish Modali */}
      {showBidModal && (
        <BidModal
          auction={auction}
          isApproved={isApproved}
          onClose={() => setShowBidModal(false)}
        />
      )}
    </div>
  );
};

export default AuctionDetail;
