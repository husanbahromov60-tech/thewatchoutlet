import React, { useEffect, useState } from "react";
import { LuHeart } from "react-icons/lu";

import Navbar from "../comps/Navbar";
import CarCard from "./CarCard";
import { useCars } from "./UseCars";
import { getLikedIds, subscribeToLikeChanges } from "./Likes";
import BottomNav from "./BottomNav";

const LikedProduct = () => {
  // barcha soatlarni (Yangi + B/U + Nasiya) allCars orqali olamiz
  const { allCars, loading } = useCars();

  const [likedIds, setLikedIds] = useState(() => getLikedIds());

  useEffect(() => {
    const unsubscribe = subscribeToLikeChanges(() => {
      setLikedIds(getLikedIds());
    });
    return unsubscribe;
  }, []);

  // Liked IDs ichida car.id yoki car.originalId borligini tekshiramiz
  const likedCars = allCars.filter(
    (car) =>
      likedIds.includes(car.id) ||
      (car.originalId && likedIds.includes(car.originalId))
  );

  return (
    <div className="min-h-screen bg-[#112544]">
      <Navbar />

      <div className="px-3 mt-3 pb-20">
        <h2 className="text-lg font-bold text-white mb-3">Saqlanganlar</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-64 bg-[#0f192b] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : likedCars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {likedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <LuHeart size={26} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">
              Hozircha yoqtirgan soatlaringiz yo'q.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Soatning yurakcha belgisini bosib saqlab qo'ying.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LikedProduct;
