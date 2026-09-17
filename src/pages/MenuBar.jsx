import React from "react";
import { Link, NavLink } from "react-router-dom";
import { LuCar, LuPlus, LuGavel, LuCalculator } from "react-icons/lu";
import { LiaCalculatorSolid } from "react-icons/lia";
import { FiWatch } from "react-icons/fi";

const MenuBar = () => {
  return (
    <div className="w-full px-4 py-3">
      {/* 
        grid-cols-2  -> Mobil qurilmalarda 2 tadan 2 qator
        md:grid-cols-4 -> Planshet va kompyuterda 1 qator
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NavLink
          to="/auction"
          className="flex  flex-col items-center justify-center p-3 bg-[#0f192b] rounded-2xl border-1 border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 group"
        >
          {/* Ikonka orqa foni va o'zi */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 bg-rose-50 group-hover:scale-110 transition-transform duration-200`}
          >
            <LuGavel className={`text-2xl text-rose-600`} />
          </div>

          {/* Sarlavha */}
          <span className="text-sm font-semibold leading-3 text-white text-center">
            Auksion
          </span>
        </NavLink>
        <NavLink
          to="/sell"
          className="flex  flex-col items-center justify-center p-3 bg-[#0f192b] rounded-2xl border-1 border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 group"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 bg-emerald-50 group-hover:scale-110 transition-transform duration-200`}
          >
            <LuPlus className={`text-2xl text-slate-800`} />
          </div>

          <span className="text-sm font-semibold leading-3 text-white text-center">
            Tez sotish
          </span>
        </NavLink>
        <NavLink
          to="/used-watches"
          className="flex  flex-col items-center justify-center p-3 bg-[#0f192b] rounded-2xl border-1 border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 group"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 bg-slate-100 group-hover:scale-110 transition-transform duration-200`}
          >
            <FiWatch className={`text-2xl text-slate-800`} />
          </div>

          <span className="text-sm font-semibold leading-3 text-white text-center">
            Б/у watches
          </span>
        </NavLink>
        <NavLink
          to="/nasiya"
          className="flex  flex-col items-center justify-center p-3 bg-[#0f192b] rounded-2xl border-1 border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 group"
        >
          {/* Ikonka orqa foni va o'zi */}
          <div
            className={`rounded-full flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200`}
          >
            <img
              className=" h-13 rounded-full "
              src="https://media.istockphoto.com/id/1364094307/vector/halal-vector-symbol-package-sticker-for-food-or-product-isolated-on-white.jpg?s=612x612&w=0&k=20&c=rnnHkTgNFJjcx2oKrM3XjWPRf-alil0D6Ev59BLAARA="
              alt="Halol Icon"
            />
          </div>

          {/* Sarlavha */}
          <span className="text-sm font-semibold leading-3 text-white text-center">
            Muddatliy to'lov
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default MenuBar;
