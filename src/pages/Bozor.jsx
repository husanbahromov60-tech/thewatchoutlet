import React, { useState } from "react";
import Navbar from "../comps/Navbar";
import SearchBar from "./SearchBar";
import CarCard from "./CarCard";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import { LuRefreshCw } from "react-icons/lu";
import { useCars } from "./UseCars";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import BottomNav from "./BottomNav";

const Bozor = () => {
  const { cars, loading, refreshing, refresh } = useCars();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auksion bo'lmagan VA nomi hamda narxi mavjud bo'lgan to'g'ri e'lonlarni saralab olish
  const marketCars = cars.filter(
    (car) =>
      !car.isAuction &&
      car.type !== "auction" &&
      car.name &&
      car.name.trim() !== "" &&
      (car.price > 0 || car.totalPrice > 0)
  );

  return (
    <div>
      {/* <Navbar /> */}
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#f8fafc] border-slate-200 sticky top-0 z-40">
        <NavLink
          to="/"
          className="flex justify-center font-bold py-3.5 items-center w-25"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>
      </div>

      <SearchBar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
      />

      <div className="px-3 mt-2 pb-20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bozor</h2>
            <p className="text-xs text-slate-400">
              {marketCars.length} ta e'lon
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
          >
            <LuRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 bg-slate-200 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : marketCars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {marketCars.map((car) => (
              <CarCard key={car.id || car.carId || Math.random()} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            E'lonlar mavjud emas.
          </div>
        )}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cars={marketCars}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        cars={marketCars}
      />
      {/* Pastki Navigatsiya Menyusi */}
      <BottomNav />
    </div>
  );
};

export default Bozor;
