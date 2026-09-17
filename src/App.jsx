import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Asosiy Sahifalar
import Home from "./pages/Home";
import BottomNav from "./pages/BottomNav";
import About from "./pages/About";
import LikedProduct from "./pages/LikedProduct";
import Bozor from "./pages/Bozor";
import Admin from "./pages/Admin";
import InstallmentPage from "./pages/InstallmentPage"; // YANGI QO'SHILDI

// Auksion Moduli Sahifalari va Komponentlari
import AuctionPage from "./auction/pages/AuctionPage";
import AuctionDetail from "./auction/pages/AuctionDetail";
import AdminApproval from "./auction/admin/AdminApproval";
import TelegramGuard from "./auction/components/TelegramGuard";

import { trackTelegramUser } from "./trackUser";
import UsedWatches from "./pages/UsedWatches";
import SellWatch from "./pages/SellCar";

const App = () => {
  useEffect(() => {
    trackTelegramUser();
  }, []);

  return (
    <div className="min-h-screen text-slate-900 font-sans relative">
      {/* Global Toast Bildirishnomalari */}
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />

      {/* Marshrutlar (Routes) */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sell" element={<SellWatch />} />
        <Route path="/bozor" element={<Bozor />} />
        <Route path="/nasiya" element={<InstallmentPage />} />{" "}
        <Route path="/used-watches" element={<UsedWatches />} />
        {/* YANGI ROUTE */}
        <Route path="/favorites" element={<LikedProduct />} />
        {/* Telegram auksion ro'yxati sahifasi */}
        <Route
          path="/auction"
          element={
            <TelegramGuard>
              <AuctionPage />
            </TelegramGuard>
          }
        />
        {/* Bitta auksionning batafsil sahifasi (/auction/id) */}
        <Route
          path="/auction/:id"
          element={
            <TelegramGuard>
              <AuctionDetail />
            </TelegramGuard>
          }
        />
        {/* Admin sahifalar */}
        <Route path="/admin-avtotek-2026" element={<Admin />} />
        <Route path="/admin/auction-users" element={<AdminApproval />} />
      </Routes>

      {/* Pastki Navigatsiya Menyusi */}
      {/* <BottomNav /> */}
    </div>
  );
};

export default App;
