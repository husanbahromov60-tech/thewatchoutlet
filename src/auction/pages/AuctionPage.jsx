import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { getTelegramUser } from "../services/telegram";
import { checkUserApproval } from "../services/auctionService";
import AuctionCard from "../components/AuctionCard";
import AuctionDetailModal from "../components/AuctionDetailModal";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import BottomNav from "../../pages/BottomNav";

const AuctionPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  const user = getTelegramUser();

  // FOYDALANUVCHI RUXSATINI TEKSHIRISH
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (user?.id) {
        const approved = await checkUserApproval(user.id);
        setIsApproved(approved);
      }
    };
    fetchApprovalStatus();
  }, [user]);

  // FAOL AUKSIONLARNI OLISH
  useEffect(() => {
    try {
      const q = query(
        collection(db, "auctions"),
        where("isAuction", "==", true)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((item) => item.status !== "no-active");

          setAuctions(list);
          setLoading(false);
        },
        (error) => {
          console.error("Auksionlarni yuklashda xato:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore ulanish xatosi:", err);
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#112544] pb-24">
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#0f192b] border-white sticky top-0 z-40">
        <NavLink
          to="/"
          className="flex text-white justify-start font-bold py-3 items-center w-25"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>
      </div>
      <div className="mb-3 px-[7px] mt-[10px] ">
        <h1 className="text-2xl font-black text-white">Auksionlar</h1>
        <p className="text-xs text-white mt-0.5">
          Eng so'nggi takliflar va auksion savdolari
        </p>
      </div>

      {loading ? (
        <div className="grid px-[7px] grid-cols-2 gap-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-[#0f192b] rounded-2xl h-64 animate-pulse border p-3"
            />
          ))}
        </div>
      ) : auctions && auctions.length > 0 ? (
        <div className="grid px-[7px] grid-cols-2 gap-2">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id || auction.messageId}
              item={auction}
              onClick={() => setSelectedAuction(auction)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-sm">
          Hozircha faol auksionlar mavjud emas
        </div>
      )}

      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          isApproved={isApproved}
          onClose={() => setSelectedAuction(null)}
        />
      )}
      <BottomNav />
    </div>
  );
};

export default AuctionPage;
