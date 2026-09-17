import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import InstallmentCard from "./InstallmentCard";

const InstallmentFilterModal = ({
  cars = [],
  isOpen,
  onClose,
  onSelectCar,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    priceMin: "",
    priceMax: "",
    downPaymentMin: "",
    downPaymentMax: "",
    monthlyPaymentMin: "",
    monthlyPaymentMax: "",
    yearMin: "",
    yearMax: "",
    location: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      priceMin: "",
      priceMax: "",
      downPaymentMin: "",
      downPaymentMax: "",
      monthlyPaymentMin: "",
      monthlyPaymentMax: "",
      yearMin: "",
      yearMax: "",
      location: "",
    });
  };

  const getMonthlyPayment = (item) => {
    if (!item.totalPrice || !item.maxPeriod) return 0;
    const remainingPrice = item.totalPrice - (item.minDownPayment || 0);
    const interest = item.annualInterest
      ? remainingPrice * (item.annualInterest / 100) * (item.maxPeriod / 12)
      : 0;
    return Math.round((remainingPrice + interest) / item.maxPeriod);
  };

  const filteredCars = cars.filter((car) => {
    const searchMatch =
      !filters.search ||
      (car.name || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (car.vin || "").toLowerCase().includes(filters.search.toLowerCase());

    const totalPrice = Number(car.totalPrice || 0);
    const priceMinMatch =
      !filters.priceMin || totalPrice >= Number(filters.priceMin);
    const priceMaxMatch =
      !filters.priceMax || totalPrice <= Number(filters.priceMax);

    const downPayment = Number(car.minDownPayment || 0);
    const downPaymentMinMatch =
      !filters.downPaymentMin || downPayment >= Number(filters.downPaymentMin);
    const downPaymentMaxMatch =
      !filters.downPaymentMax || downPayment <= Number(filters.downPaymentMax);

    const monthlyPayment = getMonthlyPayment(car);
    const monthlyMinMatch =
      !filters.monthlyPaymentMin ||
      monthlyPayment >= Number(filters.monthlyPaymentMin);
    const monthlyMaxMatch =
      !filters.monthlyPaymentMax ||
      monthlyPayment <= Number(filters.monthlyPaymentMax);

    const year = Number(car.year || 0);
    const yearMinMatch = !filters.yearMin || year >= Number(filters.yearMin);
    const yearMaxMatch = !filters.yearMax || year <= Number(filters.yearMax);

    const locationMatch =
      !filters.location ||
      (car.location || "").toLowerCase() === filters.location.toLowerCase();

    return (
      searchMatch &&
      priceMinMatch &&
      priceMaxMatch &&
      downPaymentMinMatch &&
      downPaymentMaxMatch &&
      monthlyMinMatch &&
      monthlyMaxMatch &&
      yearMinMatch &&
      yearMaxMatch &&
      locationMatch
    );
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white w-screen h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
        <h2 className="text-xl font-bold text-slate-800">Filtr va Natijalar</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 active:scale-95 transition-all"
        >
          <IoMdClose size={24} />
        </button>
      </div>

      {/* Kontent */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-4">
          {/* Nomi / VIN */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Mashina rusumi / nomi / VIN
            </label>
            <div className="relative">
              <FiSearch
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Masalan: Spark, Cobalt, VIN raqam..."
                value={filters.search}
                onChange={(e) => handleInputChange("search", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Boshlang'ich to'lov */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Boshlang'ich to'lov ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Dan"
                value={filters.downPaymentMin}
                onChange={(e) =>
                  handleInputChange("downPaymentMin", e.target.value)
                }
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={filters.downPaymentMax}
                onChange={(e) =>
                  handleInputChange("downPaymentMax", e.target.value)
                }
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Oylik to'lov */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Oylik to'lov ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Dan"
                value={filters.monthlyPaymentMin}
                onChange={(e) =>
                  handleInputChange("monthlyPaymentMin", e.target.value)
                }
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={filters.monthlyPaymentMax}
                onChange={(e) =>
                  handleInputChange("monthlyPaymentMax", e.target.value)
                }
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Umumiy narxi */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Umumiy narxi ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Dan"
                value={filters.priceMin}
                onChange={(e) => handleInputChange("priceMin", e.target.value)}
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={filters.priceMax}
                onChange={(e) => handleInputChange("priceMax", e.target.value)}
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Yil */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Ishlab chiqarilgan yili
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Dan"
                value={filters.yearMin}
                onChange={(e) => handleInputChange("yearMin", e.target.value)}
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={filters.yearMax}
                onChange={(e) => handleInputChange("yearMax", e.target.value)}
                className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Shahar */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              Shahar / Viloyat
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full p-2.5 bg-white text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="">Barcha shaharlar</option>
              <option value="Toshkent">Toshkent</option>
              <option value="Samarqand">Samarqand</option>
              <option value="Andijon">Andijon</option>
              <option value="Farg'ona">Farg'ona</option>
              <option value="Namangan">Namangan</option>
              <option value="Xorazm">Xorazm</option>
              <option value="Buxoro">Buxoro</option>
            </select>
          </div>

          {/* Tozalash */}
          <div className="text-right pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Barcha filtr bo'limlarini tozalash
            </button>
          </div>
        </div>

        {/* Natijalar Ro'yxati */}
        <div className="pt-2 pb-12">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">
            Topilgan natijalar:{" "}
            <span className="text-slate-900 font-bold">
              {filteredCars.length} ta
            </span>
          </h3>

          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredCars.map((car) => (
                <InstallmentCard
                  key={car.id || car.messageId}
                  item={car}
                  onClick={() => onSelectCar(car)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Filtrga mos natijalar topilmadi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallmentFilterModal;
