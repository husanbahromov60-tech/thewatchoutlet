import React, { useEffect, useState, useMemo } from "react";
import { FiX } from "react-icons/fi";
import CarCard from "./CarCard";

const FilterModal = ({ isOpen, onClose, cars = [] }) => {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [isOpen]);

  // Bazadagi soat ma'lumotlaridan brendlar ro'yxatini dinamik shakllantirish
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    cars.forEach((item) => {
      if (item?.brand && String(item.brand).trim() !== "") {
        brandsSet.add(String(item.brand).trim());
      }
    });
    return ["All", ...Array.from(brandsSet)];
  }, [cars]);

  if (!isOpen) return null;

  // Filtrlash mantiqi (Faqat Brend va Narx)
  const filteredCars = cars.filter((car) => {
    // Brend bo'yicha saralash
    if (selectedBrand !== "All") {
      const carBrand = String(car?.brand || "").toLowerCase();
      if (carBrand !== selectedBrand.toLowerCase()) return false;
    }

    // Narx bo'yicha saralash
    const carPrice = Number(car?.price || car?.totalPrice || 0);
    if (minPrice && carPrice < Number(minPrice)) return false;
    if (maxPrice && carPrice > Number(maxPrice)) return false;

    return true;
  });

  const handleReset = () => {
    setSelectedBrand("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="fixed inset-0 z-[10000000000] bg-[#112544] flex flex-col animate-in fade-in duration-200 h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/60 bg-[#0f192b] shadow-sm">
        <h3 className="text-lg font-bold text-white">Filtr va Natijalar</h3>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Kontent qismi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Inputlar paneli */}
        <div className="bg-[#0f192b] p-3.5 rounded-2xl border border-slate-700/80 space-y-4 shadow-sm">
          {/* Brendlar bo'yicha filtr */}
          <div>
            <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2">
              Brend bo'yicha
            </label>
            <div className="flex pl-[5px] items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedBrand === brand
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                      : "bg-[#162238] text-white border border-slate-600/60 hover:bg-[#1f2d4a]"
                  }`}
                >
                  {brand === "All" ? "All" : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Narxi bo'yicha filtr */}
          <div>
            <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
              Narxi ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Dan"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Filtrni tozalash
            </button>
          </div>
        </div>

        {/* Natijalar ko'rinishi */}
        <div>
          <p className="text-xs text-white mb-2">
            Topilgan natijalar:{" "}
            <span className="font-semibold text-white">
              {filteredCars.length} ta
            </span>
          </p>

          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-10">
              {filteredCars.map((car) => (
                <CarCard key={car.id || Math.random()} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Kiritilgan mezonlarga mos soat topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
