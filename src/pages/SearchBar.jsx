import React from "react";
import { FiSearch, FiSliders } from "react-icons/fi";

const SearchBar = ({ onOpenSearch, onOpenFilter }) => {
  return (
    <div className="px-3 pb-1">
      <div className="flex items-center gap-2">
        {/* Qidiruv tugmasi (Border va Soya bilan) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-slate-400 text-sm shadow-sm hover:border-blue-400/50 hover:shadow-md transition-all active:scale-[0.99]"
        >
          <FiSearch size={18} className="text-slate-400 flex-shrink-0" />
          <span className="truncate text-xs font-medium text-slate-400">
            Soat nomi yoki Ref. Code bo'yicha topish...
          </span>
        </button>

        {/* Filtr tugmasi */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200/90 rounded-2xl text-slate-600 shadow-sm hover:border-blue-400/50 hover:text-blue-600 active:scale-95 transition-all flex-shrink-0"
        >
          <FiSliders size={18} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
