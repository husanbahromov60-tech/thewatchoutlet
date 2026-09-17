// =============================================================
// LIKE / SAQLANGANLAR — localStorage asosida
//
// Hozircha backend yo'q, shuning uchun yoqtirilgan e'lonlar ID'lari
// brauzerning localStorage'ida saqlanadi. Sahifa yangilansa ham
// yo'qolmaydi.
// =============================================================

const STORAGE_KEY = "avtotek_liked_ids";
const EVENT_NAME = "avtotek-likes-changed";

// -------------------------------------------------------------
// Saqlangan ID'lar ro'yxatini olish
// -------------------------------------------------------------
export function getLikedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Like ro'yxatini o'qishda xatolik:", error);
    return [];
  }
}

// -------------------------------------------------------------
// Berilgan ID like qilinganmi?
// -------------------------------------------------------------
export function isCarLiked(carId) {
  if (!carId) return false;
  return getLikedIds().includes(carId);
}

// -------------------------------------------------------------
// Like holatini almashtirish (like <-> unlike)
// Yangi holatni (true/false) qaytaradi.
// -------------------------------------------------------------
export function toggleCarLike(carId) {
  if (!carId) return false;

  const current = getLikedIds();
  const alreadyLiked = current.includes(carId);

  const updated = alreadyLiked
    ? current.filter((id) => id !== carId)
    : [...current, carId];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Boshqa ochiq komponentlarga (masalan "Likelar" sahifasiga)
  // o'zgarish bo'lganini xabar qilish uchun
  window.dispatchEvent(new CustomEvent(EVENT_NAME));

  return !alreadyLiked;
}

// -------------------------------------------------------------
// Like ro'yxati o'zgarganda xabardor bo'lish uchun listener
// Qaytaradi: unsubscribe funksiyasi
// -------------------------------------------------------------
export function subscribeToLikeChanges(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
