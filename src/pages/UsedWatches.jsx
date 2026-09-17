import React, { useState, useMemo } from "react";
import Navbar from "../comps/Navbar";
import SearchBar from "./SearchBar";
import CarCard from "./CarCard";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import useUsedWatches from "./UseUsedWatches"; // Yangi hook
import BottomNav from "./BottomNav";
import { IoIosArrowBack } from "react-icons/io";
import { NavLink } from "react-router-dom";

const UsedWatches = () => {
  const { usedCars, loading } = useUsedWatches();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");

  // Mavjud brendlar ro'yxati
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    (usedCars || []).forEach((item) => {
      if (item?.brand && String(item.brand).trim() !== "") {
        brandsSet.add(String(item.brand).trim());
      }
    });
    return ["All", ...Array.from(brandsSet)];
  }, [usedCars]);

  // Tanlangan brend bo'yicha saralash
  const displayProducts = useMemo(() => {
    if (selectedBrand === "All") return usedCars;
    return usedCars.filter(
      (item) =>
        item?.brand &&
        String(item.brand).toLowerCase() === selectedBrand.toLowerCase()
    );
  }, [usedCars, selectedBrand]);

  return (
    <div className="min-h-screen bg-[#112544]">
      {/* <Navbar /> */}
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#0f192b] border-white z-40">
        <NavLink
          to="/"
          className="flex text-white justify-start font-bold py-3 items-center w-25"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>
      </div>

      <div className="mt-2">
        <SearchBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenFilter={() => setIsFilterOpen(true)}
        />
      </div>

      {/* Brendlar filtri */}
      <div className="sticky border-[1px] border-[#657591] top-0 z-[1000000] mt-[5px] mx-[5px] rounded-[15px] bg-[#0b1329]/95 backdrop-blur-md px-3 py-2">
        <div className="flex items-center gap-2 pl-[3px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {availableBrands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedBrand === brand
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                  : "bg-[#0f192b] text-white border border-slate-400/60 hover:bg-[#182640]"
              }`}
            >
              {brand === "All" ? "All" : brand}
            </button>
          ))}
        </div>
      </div>

      {/* Mahsulotlar ro'yxati */}
      <div className="px-3 mt-3 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 bg-[#0f192b] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayProducts.map((product) => (
              <CarCard key={product.id || Math.random()} car={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            B/u soatlar topilmadi.
          </div>
        )}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cars={usedCars}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        cars={usedCars}
      />

      <BottomNav />
    </div>
  );
};

export default UsedWatches;
