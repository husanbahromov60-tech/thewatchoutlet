import React, { useState, useEffect } from "react";
import {
  approveUserForAuction,
  revokeUserApproval,
} from "../services/auctionService";
import { toast } from "react-toastify";
import {
  FaUserCheck,
  FaUserPlus,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaTrash,
  FaUserSlash,
  FaGavel,
} from "react-icons/fa";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";

const AdminApproval = () => {
  const [telegramId, setTelegramId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  // Har bir Telegram ID bo'yicha stavkalar statistikasi: { [telegramId]: { count, lastAmount, lastAuctionTitle } }
  const [userBidStats, setUserBidStats] = useState({});

  // REAL-VAQTDA ARIZALARNI CHIQARISH
  useEffect(() => {
    const q = query(collection(db, "auction_requests"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(list);
    });

    return () => unsubscribe();
  }, []);

  // BARCHA AUKSIONLARDAGI STAVKALARNI FOYDALANUVCHI BO'YICHA YIG'ISH
  useEffect(() => {
    const q = query(collection(db, "auctions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stats = {};

      snapshot.docs.forEach((docSnap) => {
        const auctionData = docSnap.data();
        const bids = auctionData.bidsHistory || [];

        bids.forEach((bid) => {
          const uid = String(bid.userId ?? "");
          if (!uid) return;

          if (!stats[uid]) {
            stats[uid] = { count: 0, lastAmount: 0, lastAuctionTitle: "" };
          }
          stats[uid].count += 1;

          // Eng oxirgi (eng katta) stavkani ko'rsatish uchun
          if (bid.amount >= stats[uid].lastAmount) {
            stats[uid].lastAmount = bid.amount;
            stats[uid].lastAuctionTitle =
              auctionData.name || auctionData.carId || "Auksion";
          }
        });
      });

      setUserBidStats(stats);
    });

    return () => unsubscribe();
  }, []);

  // ARIZANI TASDIQLASH (RO'YXATDAN)
  const handleApproveFromList = async (req) => {
    try {
      await approveUserForAuction(String(req.telegramId), {
        first_name: req.name || "Foydalanuvchi",
        username: req.username || "",
      });

      const requestRef = doc(db, "auction_requests", req.id);
      await updateDoc(requestRef, { status: "approved" });

      toast.success(`✅ ${req.name} (ID: ${req.telegramId}) tasdiqlandi!`);
    } catch (error) {
      console.error("Tasdiqlashda xato:", error);
      toast.error("Tasdiqlashda xatolik yuz berdi!");
    }
  };

  // ARIZANI O'CHIRISH
  const handleDeleteRequest = async (id) => {
    try {
      await deleteDoc(doc(db, "auction_requests", id));
      toast.info("Ariza o'chirildi.");
    } catch (error) {
      console.error("O'chirishda xato:", error);
      toast.error("Arizani o'chirishda xatolik!");
    }
  };

  // TASDIQLANGAN FOYDALANUVCHINI RUXSATDAN OLIB TASHLASH
  const handleRevoke = async (req) => {
    try {
      await revokeUserApproval(String(req.telegramId));

      const requestRef = doc(db, "auction_requests", req.id);
      await updateDoc(requestRef, { status: "pending" });

      toast.info(`🚫 ${req.name} ruxsatdan olib tashlandi.`);
    } catch (error) {
      console.error("Ruxsatni bekor qilishda xato:", error);
      toast.error("Ruxsatni bekor qilishda xatolik yuz berdi!");
    }
  };

  // QO'LDA TELEGRAM ID ORQALI TASDIQLASH
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      toast.error("Telegram ID kiriting!");
      return;
    }

    setLoading(true);
    try {
      await approveUserForAuction(telegramId.trim(), {
        first_name: userName.trim() || "Foydalanuvchi",
      });
      toast.success(`✅ User (${telegramId}) auksionga tasdiqlandi!`);
      setTelegramId("");
      setUserName("");
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Tasdiqlashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto m-4 space-y-4">
      {/* QO'LDA ID KIRITISH QISMI */}
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-800">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <FaShieldAlt className="text-blue-600 text-xl" />
          <h2 className="text-lg font-bold text-slate-900">
            Admin: Auksion Ruxsatnomasi
          </h2>
        </div>

        <form onSubmit={handleApprove} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Telegram ID
            </label>
            <input
              type="number"
              placeholder="Masalan: 123456789"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Ismi / Nikneymi (Ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Masalan: Ali Valiyev"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            {loading ? (
              <FaUserCheck className="animate-spin" />
            ) : (
              <FaUserPlus />
            )}
            Ruxsat berish
          </button>
        </form>
      </div>

      {/* ARIZA TOPSHIRGAN FOYDALANUVCHILAR RO'YXATI */}
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-800">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FaClock className="text-amber-500 text-lg" />
            <h3 className="text-base font-bold text-slate-900">
              Kelib tushgan arizalar
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {requests.length} ta
          </span>
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Hozircha arizalar yo'q
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {req.photo_url ? (
                    <img
                      src={req.photo_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0 border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0 text-sm">
                      {req.name?.charAt(0) || "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {req.name || "Noma'lum user"}
                    </h4>
                    {req.username && (
                      <span className="text-[11px] text-sky-600 block truncate">
                        @{req.username}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono block">
                      ID: {req.telegramId}
                    </span>
                    {/* STAVKALAR STATISTIKASI — faqat stavka bergan bo'lsa ko'rinadi */}
                    {userBidStats[String(req.telegramId)] && (
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                        <FaGavel size={9} />
                        Stavkalar: {
                          userBidStats[String(req.telegramId)].count
                        }{" "}
                        ta • oxirgisi: $
                        {Number(
                          userBidStats[String(req.telegramId)].lastAmount
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {req.status === "approved" ? (
                    <>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <FaCheckCircle /> Tasdiqlandi
                      </span>
                      <button
                        onClick={() => handleRevoke(req)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 text-xs font-bold rounded-lg transition-transform border border-red-200 flex items-center gap-1"
                        title="Ruxsatni bekor qilish"
                      >
                        <FaUserSlash />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleApproveFromList(req)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-transform shadow-sm flex items-center gap-1"
                    >
                      <FaUserCheck /> Tasdiqlash
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteRequest(req.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Arizani o'chirish"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;
