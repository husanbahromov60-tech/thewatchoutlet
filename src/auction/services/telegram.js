import { FaLessThanEqual } from "react-icons/fa6";

// Test rejimini boshqarish: true bo'lsa brauzerda test qiladi, false bo'lsa haqiqiy Telegram WebApp ishlaydi
const IS_TEST_MODE = false;

// Test foydalanuvchisi obyektining namuna ko'rinishi
const TEST_USER = {
  id: 123456798,
  first_name: "Test User",
  username: "testuser",
};

// Telegram WebApp obyektini xavfsiz olish
export const tg =
  typeof window !== "undefined" ? window.Telegram?.WebApp : null;

// Telegram ilovasi ichida ochilganini tekshirish
export const isTelegramWebApp = () => {
  if (IS_TEST_MODE) return true;
  return Boolean(tg && tg.initData && tg.initDataUnsafe?.user);
};

// Kirgan foydalanuvchi ma'lumotlarini olish
export const getTelegramUser = () => {
  if (IS_TEST_MODE) return TEST_USER;
  if (isTelegramWebApp()) {
    return tg.initDataUnsafe.user;
  }
  return null;
};

// Telegram tugmalarini va interfeysini sozlash
export const initTelegramApp = () => {
  if (tg && !IS_TEST_MODE) {
    tg.ready();
    tg.expand(); // Ekran bo'ylab yoyish
  }
};
