import React, { useState } from "react";
import { placeBid } from "../services/auctionService";
import { getTelegramUser } from "../services/telegram";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FaBolt, FaHistory, FaLock, FaPaperPlane } from "react-icons/fa";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const BidModal = ({ auction, onClose, isApproved }) => {
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  if (!auction) return null;

  const user = getTelegramUser() || {
    id: "test_user",
    first_name: "Test User",
  };

  const step = Number(auction.bidStep) || 100;
  const currentPrice = Number(auction.currentPrice) || 0;

  // ARIZA TOPSHIRISH (Ruxsat bo'lmagan foydalanuvchilar uchun)
  const handleSendRequest = async () => {
    setLoading(true);
    try {
      const requestRef = doc(db, "auction_requests", String(user.id));
      await setDoc(requestRef, {
        telegramId: String(user.id),
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "Foydalanuvchi",
        username: user.username || "",
        photo_url: user.photo_url || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setRequestSent(true);
      toast.success("✅ Arizangiz Adminga yuborildi! Tasdiqlanishini kuting.", {
        position: "top-center",
        theme: "dark",
      });
    } catch (error) {
      console.error("Ariza yuborishda xato:", error);
      toast.error("Ariza yuborishda xatolik bo'ldi!", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  // STAVKA URISH
  const handleBid = async (multiplier = 1) => {
    if (!isApproved) {
      toast.error("⚠️ Auksionda qatnashish uchun Admin ruxsati kerak!", {
        position: "top-center",
        theme: "dark",
      });
      return;
    }

    setLoading(true);

    try {
      const newPrice = currentPrice + step * multiplier;

      await placeBid({
        auctionId: auction.id,
        user,
        amount: newPrice,
      });

      toast.success(
        `🔥 Stavka qabul qilindi! ($${newPrice.toLocaleString()})`,
        {
          position: "top-center",
          theme: "dark",
        }
      );
      onClose();
    } catch (err) {
      console.error("Stavka xatosi:", err);
      toast.error(err.message || "Stavka urishda xatolik yuz berdi!", {
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-700 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-700/60 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaBolt className="text-amber-400" /> Stavka Berish
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-700/50 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        <p className="text-sky-400 font-semibold text-sm mb-3 truncate">
          {auction.title}
        </p>

        {/* Price Display */}
        <div className="flex justify-between items-center bg-slate-900 p-3.5 rounded-2xl border border-slate-700/50 mb-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">
            Hozirgi narx
          </span>
          <span className="text-2xl font-black text-emerald-400">
            ${currentPrice.toLocaleString()}
          </span>
        </div>

        {/* AGAR RUXSAT BO'LSA - STAVKA TUGMALARI */}
        {isApproved ? (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[1, 2, 5].map((multiplier) => (
              <button
                key={multiplier}
                disabled={loading}
                onClick={() => handleBid(multiplier)}
                className="py-3.5 bg-sky-600 hover:bg-sky-500 active:scale-95 disabled:opacity-50 text-white font-black rounded-xl text-base shadow-lg shadow-sky-600/20 transition-all flex flex-col items-center justify-center"
              >
                <span>+${(step * multiplier).toLocaleString()}</span>
                <span className="text-[10px] font-normal opacity-80">
                  (${(currentPrice + step * multiplier).toLocaleString()})
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* AGAR RUXSAT BO'LMASA - ARIZA YUBORISH OYNASI */
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 text-center">
            <FaLock className="text-amber-400 text-2xl mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm mb-1">
              Auksionda qatnashish cheklangan
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Stavka urish uchun administrator tomonidan ruxsat berilishi kerak.
            </p>

            {requestSent ? (
              <div className="bg-emerald-500/20 text-emerald-400 py-2.5 px-4 rounded-xl text-xs font-bold border border-emerald-500/30">
                ⏳ Ariza yuborildi. Tasdiqlanishini kuting!
              </div>
            ) : (
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <FaPaperPlane /> Ruxsat so'rab ariza yuborish
              </button>
            )}
          </div>
        )}

        {/* Bid History */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FaHistory /> Oxirgi Stavkalar
          </span>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 max-h-32 overflow-y-auto space-y-2">
            {auction.bidsHistory && auction.bidsHistory.length > 0 ? (
              [...auction.bidsHistory]
                .reverse()
                .slice(0, 5)
                .map((bid, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs text-slate-300 border-b border-slate-800/80 pb-1.5 last:border-none last:pb-0"
                  >
                    <span className="font-medium text-slate-400 truncate max-w-[180px]">
                      👤 {bid.userName}
                    </span>
                    <span className="font-bold text-emerald-400">
                      ${Number(bid.amount).toLocaleString()}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-xs text-center py-2">
                Hali stavkalar berilmagan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidModal;
