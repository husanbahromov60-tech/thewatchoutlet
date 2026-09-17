import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  LuImagePlus,
  LuTrash2,
  LuWatch,
  LuCalendar,
  LuDollarSign,
  LuMapPin,
  LuPhone,
  LuSend,
  LuTag,
  LuShield,
  LuSettings2,
  LuLayers,
} from "react-icons/lu";
import { IoAlertCircleOutline, IoArrowBack } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import BottomNav from "./BottomNav";

// TELEGRAM BOT SOZLAMALARI
const BOT_TOKEN = "7520383994:AAHqawvOgeQy4_PElPubf1-QKACPFcVt4u0";
const CHAT_ID = "-5482180699";

const LOCATIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Samarqand",
  "Buxoro",
  "Navoiy",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Xorazm",
  "Qoraqalpog'iston",
];

const BRANDS = [
  "Longines",
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Omega",
  "Cartier",
  "HUB LOT",
  "BREITLING",
  "TAG Heuer",
  "Tissot",
  "Boshqa brend",
];

const SellWatch = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form inputlari
  const [formData, setFormData] = useState({
    brand: "Rolex",
    model: "",
    refCode: "",
    price: "",
    year: "",
    mechanism: "Avtomat (Mechanic)",
    caseMaterial: "Zanglamaydigan po'lat (Steel)",
    glass: "Saffir (Sapphire)",
    condition: "Yangi (Unworn)",
    ownerName: "O'zimniki",
    location: "Toshkent shahri",
    phone: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  // Rasm preview yaratish va xotirani optimallashtirish
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Rasmlarni yuklash (max 10)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.warning("Ko'pi bilan 10 ta rasm yuklashingiz mumkin!");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const requiredFields = ["model", "price", "phone"];

    requiredFields.forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = true;
      }
    });

    if (images.length < 4) {
      toast.error("Kamida 4 ta rasm yuklanishi shart!");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);

    try {
      const messageText = `
⌚ *YANGI SOAT E'LONI*

🏷 *Brend:* ${formData.brand}
📌 *Model:* ${formData.model}
🔢 *Ref / Kod:* ${formData.refCode || "Kiritilmagan"}
💰 *Narxi:* $${formData.price}
📅 *Yili:* ${formData.year ? `${formData.year}-yil` : "Kiritilmagan"}
⚙️ *Mexanizm:* ${formData.mechanism}
🛡 *Korpus:* ${formData.caseMaterial}
💎 *Oyna:* ${formData.glass}
✨ *Holati:* ${formData.condition}
👤 *Ega:* ${formData.ownerName}
📍 *Joylashuv:* ${formData.location}
📞 *Tel:* ${formData.phone}

📝 *Qo'shimcha:*
${formData.description || "Izoh yo'q"}
      `;

      // 1. Text xabarni yuborish
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: "Markdown",
      });

      // 2. Rasmlarni Telegramga yuborish
      if (images.length > 0) {
        const formDataMedia = new FormData();
        formDataMedia.append("chat_id", CHAT_ID);

        const mediaGroup = images.map((_, index) => ({
          type: "photo",
          media: `attach://file${index}`,
        }));

        formDataMedia.append("media", JSON.stringify(mediaGroup));

        images.forEach((file, index) => {
          formDataMedia.append(`file${index}`, file);
        });

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`,
          formDataMedia
        );
      }

      toast.success("Soat e'loni muvaffaqiyatli yuborildi!");

      setFormData({
        brand: "Rolex",
        model: "",
        refCode: "",
        price: "",
        year: "",
        mechanism: "Avtomat (Mechanic)",
        caseMaterial: "Zanglamaydigan po'lat (Steel)",
        glass: "Saffir (Sapphire)",
        condition: "Yangi (Unworn)",
        ownerName: "O'zimniki",
        location: "Toshkent shahri",
        phone: "",
        description: "",
      });
      setImages([]);
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi! Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto relative pt-0 px-4 py-6 pb-28 bg-[#112544] min-h-screen text-white"
    >
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />

      {/* HEADER NAV */}
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#112544]/90 backdrop-blur-md border-slate-800 sticky top-0 z-40 py-1">
        <NavLink
          to="/"
          className="flex items-center gap-1 font-bold py-3 text-slate-300 hover:text-white transition-colors"
        >
          <IoArrowBack size={24} />
          <span>Orqaga</span>
        </NavLink>
      </div>

      <h1 className="text-2xl font-black text-white mb-1 mt-3 tracking-tight">
        Soat Sotish
      </h1>
      <p className="text-xs text-slate-400 mb-5">
        Qimmatbaho soatingiz ma'lumotlarini kiriting va xaridorlarga taklif
        qiling.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. RASMLAR YUKLASH BO'LIMI */}
        <div className="bg-[#0f192b] p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <LuImagePlus className="text-blue-400 text-lg" />
              Soat rasmlari
            </span>
            <span
              className={`text-xs font-semibold ${
                images.length < 4 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {images.length}/10 (kamida 4 ta)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-950/50 text-blue-300 p-2.5 rounded-xl text-xs mb-3 border border-blue-800/40">
            <IoAlertCircleOutline className="text-base shrink-0 text-blue-400" />
            <span>
              Kamida 4 ta har xil rakursdan olingan aniq rasmlarni yuklang.
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {images.map((file, idx) => (
              <div
                key={idx}
                className="relative h-20 rounded-xl overflow-hidden border border-slate-700 group"
              >
                <img
                  src={imagePreviews[idx]}
                  alt="watch"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full text-xs shadow-md hover:bg-rose-600 transition-all"
                >
                  <LuTrash2 />
                </button>
              </div>
            ))}

            {images.length < 10 && (
              <label className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-[#112544]/50 transition-all text-slate-400 hover:text-blue-400">
                <LuImagePlus className="text-xl" />
                <span className="text-[10px] mt-1 font-medium">Qo'shish</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* 2. BREND VA MODEL */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Brend
            </label>
            <div className="relative">
              <LuWatch className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b} className="bg-[#0f192b]">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Model nomi *
            </label>
            <div className="relative">
              <LuTag className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="text"
                name="model"
                placeholder="Submariner Date"
                value={formData.model}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all ${
                  errors.model
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-800 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3. REF KODI VA NARXI */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Ref. kodi (Model kodi)
            </label>
            <div className="relative">
              <LuTag className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="text"
                name="refCode"
                placeholder="126610LN"
                value={formData.refCode}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Narxi ($) *
            </label>
            <div className="relative">
              <LuDollarSign className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="number"
                name="price"
                placeholder="13500"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all ${
                  errors.price
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-800 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. MEXANIZM VA KORPUS MATERIALI */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Mexanizmi
            </label>
            <div className="relative">
              <LuSettings2 className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="mechanism"
                value={formData.mechanism}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Avtomat (Automatic)">Avtomat (Automatic)</option>
                <option value="Mexanik (Manual)">Mexanik (Manual)</option>
                <option value="Kvars (Kvarz)">Kvars (Quartz)</option>
                <option value="Smart">Smart</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Korpus materiali
            </label>
            <div className="relative">
              <LuLayers className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="caseMaterial"
                value={formData.caseMaterial}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Zanglamaydigan po'lat (Steel)">
                  Po'lat (Steel)
                </option>
                <option value="Oltin (Gold)">Oltin (Gold)</option>
                <option value="Titanium">Titanium</option>
                <option value="Keramika (Ceramic)">Keramika (Ceramic)</option>
                <option value="Platina (Platinum)">Platina (Platinum)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. HOLATI VA CHIQARILGAN YILI */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Holati
            </label>
            <div className="relative">
              <LuShield className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Yangi (Unworn)">Yangi (Unworn)</option>
                <option value="A'lo (Mint)">A'lo (Mint)</option>
                <option value="Yaxshi (Used)">Yaxshi (Used)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Chiqarilgan yili
            </label>
            <div className="relative">
              <LuCalendar className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="number"
                name="year"
                placeholder="2023"
                value={formData.year}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 6. VILOYAT VA TELEFON */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Viloyat / Shahar
            </label>
            <div className="relative">
              <LuMapPin className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0f192b]">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              Telefon raqamingiz *
            </label>
            <div className="relative">
              <LuPhone className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="tel"
                name="phone"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f192b] border rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all ${
                  errors.phone
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-800 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 7. QO'SHIMCHA MA'LUMOT */}
        <div>
          <label className="text-xs font-medium text-slate-300 mb-1 block">
            Qo'shimcha ma'lumotlar (Hujjatlari, kafolati va b.)
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Kafolat qog'ozi va original qutisi bor. Umuman ta'mirlanmagan..."
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-[#0f192b] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Yuborilmoqda...</span>
          ) : (
            <>
              <LuSend className="text-lg" />
              <span>E'lonni Yuborish</span>
            </>
          )}
        </button>
      </form>

      <BottomNav />
    </motion.div>
  );
};

export default SellWatch;
