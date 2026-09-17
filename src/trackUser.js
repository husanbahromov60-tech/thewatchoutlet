import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function trackTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.log("Telegram WebApp topilmadi — brauzerda oddiy ochilgan.");
      return;
    }

    tg.ready();

    const user = tg.initDataUnsafe?.user;
    if (!user || !user.id) {
      console.log("Telegram foydalanuvchi ma'lumoti topilmadi.");
      return;
    }

    const userId = String(user.id);
    const userRef = doc(db, "users", userId);

    const existingDoc = await getDoc(userRef);

    if (existingDoc.exists()) {
      await setDoc(
        userRef,
        {
          lastSeenAt: serverTimestamp(),
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          username: user.username || "",
          photoUrl: user.photo_url || "",
        },
        { merge: true }
      );
      console.log("Foydalanuvchi tanildi, ma'lumotlar yangilandi:", userId);
    } else {
      await setDoc(userRef, {
        telegramId: userId,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        username: user.username || "",
        languageCode: user.language_code || "",
        photoUrl: user.photo_url || "",
        firstSeenAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      });
      console.log("Yangi foydalanuvchi qayd qilindi:", userId);
    }
  } catch (error) {
    console.error("Foydalanuvchini qayd qilishda xatolik:", error);
  }
}
