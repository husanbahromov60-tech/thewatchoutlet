import React, { useEffect, useState, useRef, useCallback } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import CarCard from "./CarCard";

const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  cars = [],
}) => {
  // PAGINATION STATELARI (15 tadan bo'lib yuklash uchun)
  const [visibleCount, setVisibleCount] = useState(15);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef(null);

  // 1. Scroll block qilish
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // 2. Qidiruv matni o'zgarganda sanagichni qayta 15 taga reset qilish
  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, isOpen]);

  // 3. Filtrlash mantiqi (React Hook'lardan keyin bajariladi)
  const safeCars = Array.isArray(cars) ? cars : [];
  const filteredCars = safeCars.filter((car) => {
    if (!car) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();

    const name = String(car.name || "").toLowerCase();
    const cardTitle = String(car.cardTitle || "").toLowerCase();
    const title = String(car.title || "").toLowerCase();
    const brand = String(car.brand || "").toLowerCase();
    const model = String(car.model || "").toLowerCase();

    const refCode = String(
      car.refCode || car.ref_code || car["Ref. Code"] || ""
    ).toLowerCase();
    const id = String(car.id || "").toLowerCase();
    const watchId = String(car.watchId || "").toLowerCase();
    const listingId = String(car.listingId || "").toLowerCase();

    return (
      name.includes(query) ||
      cardTitle.includes(query) ||
      title.includes(query) ||
      brand.includes(query) ||
      model.includes(query) ||
      refCode.includes(query) ||
      id.includes(query) ||
      watchId.includes(query) ||
      listingId.includes(query)
    );
  });

  // 4. Pastga tushganda keyingi 15 tasini yuklash (Infinite Scroll)
  const lastElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredCars.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 15);
            setIsLoadingMore(false);
          }, 200);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, visibleCount, filteredCars.length]
  );

  // 5. Modal yopiq bo'lsa ekranga hech narsa chiqarmaydi
  if (!isOpen) return null;

  // Faqat kerakli 15 tasini kesib olish
  const visibleCars = filteredCars.slice(0, visibleCount);

  return (
    <div className="fixed inset-0 z-[10000000000000000000] bg-[#112544] flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-[#0f192b] shadow-sm">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Soat nomi yoki Ref. Code..."
            className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-2 text-white hover:bg-slate-100/10 rounded-xl transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery.trim() && (
          <p className="text-xs text-slate-400 mb-3">
            Topilgan natijalar:{" "}
            <span className="font-semibold text-slate-300">
              {filteredCars.length} ta
            </span>
          </p>
        )}

        {filteredCars.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-6">
              {visibleCars.map((car, index) => {
                const isLast = index === visibleCars.length - 1;
                return (
                  <div
                    key={car.id || index}
                    ref={isLast ? lastElementRef : null}
                  >
                    <CarCard car={car} />
                  </div>
                );
              })}
            </div>

            {/* PASTDAGI LOADING INDICATOR */}
            {(isLoadingMore || visibleCount < filteredCars.length) && (
              <div className="flex justify-center items-center pb-10 pt-2">
                <div className="flex items-center gap-2 bg-[#0f192b] border border-[#657591] px-4 py-2 rounded-full shadow-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-300 font-medium">
                    Yana yuklanmoqda...
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            "{searchQuery}" bo'yicha hech narsa topilmadi.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
