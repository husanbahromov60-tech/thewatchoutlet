import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { LuUsers, LuLock, LuSend, LuImage } from "react-icons/lu";
import { FiUploadCloud } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { sendBroadcast } from "../broadcastMessage";
import axios from "axios";

const ADMIN_PIN = "2026avtotek";
const IMGBB_API_KEY = "0bf75dea880937d78cf5e554ed16a2e1";

const Admin = () => {
  const [authorized, setAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // BROADCAST STATE'LARI
  const [broadcastText, setBroadcastText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Rasm faylini ImgBB'ga yuklash
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData
      );
      if (response.data && response.data.data) {
        setImageUrl(response.data.data.url);
      }
    } catch (error) {
      console.error("Rasm yuklashda xatolik:", error);
      alert("Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim() || users.length === 0 || sending) return;

    setSending(true);
    setBroadcastResult(null);
    setProgress({ sent: 0, total: users.length });

    const result = await sendBroadcast(
      users,
      broadcastText.trim(),
      imageUrl,
      (sent, total) => {
        setProgress({ sent, total });
      }
    );

    setBroadcastResult(result);
    setSending(false);
    setBroadcastText("");
    setImageUrl("");
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setAuthorized(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  useEffect(() => {
    if (!authorized) return;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("firstSeenAt", "desc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setUsers(list);
      } catch (error) {
        console.error("Foydalanuvchilarni olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [authorized]);

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "-";
    return timestamp.toDate().toLocaleString("ru-RU");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
        <form
          onSubmit={handlePinSubmit}
          className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-sm border border-slate-100"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 mx-auto">
            <LuLock size={20} className="text-slate-500" />
          </div>
          <h2 className="text-center font-bold text-slate-900 mb-4">
            Admin panel
          </h2>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            placeholder="Parolni kiriting"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none mb-2 ${
              pinError
                ? "border-rose-500 ring-1 ring-rose-500"
                : "border-slate-200 focus:border-blue-500"
            }`}
          />
          {pinError && (
            <p className="text-rose-500 text-xs mb-2">Parol noto'g'ri.</p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
          >
            Kirish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 pb-20">
      <div className="flex items-center gap-2 mb-1">
        <LuUsers size={22} className="text-blue-600" />
        <h1 className="text-xl font-bold text-slate-900">Foydalanuvchilar</h1>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Jami: <span className="font-bold text-slate-900">{users.length}</span>{" "}
        ta foydalanuvchi
      </p>

      {/* BROADCAST BOX */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <LuSend size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-900">
            Hammaga xabar yuborish
          </span>
        </div>

        {/* Fayl yuklash va URL kiritish bo'limi */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2.5 px-3 rounded-xl cursor-pointer transition-colors border border-dashed border-slate-300">
              <FiUploadCloud size={16} />
              <span>
                {uploadingImage
                  ? "Rasm yuklanmoqda..."
                  : "Rasmni qurilmadan tanlash"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage || sending}
                className="hidden"
              />
            </label>
          </div>

          {/* Tanlangan rasm ko'rinishi */}
          {imageUrl && (
            <div className="relative flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-xl">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0 text-xs text-blue-900 truncate">
                Rasm tayyor! (Sifatli yuklandi)
              </div>
              <FaCheckCircle
                className="text-blue-600 shrink-0 mr-1"
                size={18}
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs text-rose-500 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Qo'lda URL kiritish */}
          {!imageUrl && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <LuImage size={18} className="text-slate-400 shrink-0" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Yoki rasm URL havolasini kiriting"
                disabled={sending || uploadingImage}
                className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Matn maydoni */}
        <textarea
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          rows={3}
          placeholder={`Masalan: "Yangi mashina bugun qo'yildi! Ko'proq ma'lumot uchun botni oching."`}
          disabled={sending}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none mb-2 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleSendBroadcast}
          disabled={
            sending ||
            uploadingImage ||
            !broadcastText.trim() ||
            users.length === 0
          }
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 active:scale-98 transition-transform"
        >
          {sending
            ? `Yuborilmoqda... (${progress.sent}/${progress.total})`
            : `Hammaga yuborish (${users.length} ta)`}
        </button>

        {broadcastResult && !sending && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            ✅ {broadcastResult.successCount} ta yuborildi
            {broadcastResult.failCount > 0 &&
              ` · ❌ ${broadcastResult.failCount} ta yuborilmadi (bot bloklangan)`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 bg-slate-200 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold shrink-0">
                    {(user.firstName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {user.firstName} {user.lastName}
                    {user.username && (
                      <span className="text-slate-400 font-normal">
                        {" "}
                        @{user.username}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ID: {user.telegramId}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <div>Birinchi: {formatDate(user.firstSeenAt)}</div>
                <div>Oxirgi: {formatDate(user.lastSeenAt)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 text-sm py-16">
          Hozircha foydalanuvchilar yo'q.
        </div>
      )}
    </div>
  );
};

export default Admin;
