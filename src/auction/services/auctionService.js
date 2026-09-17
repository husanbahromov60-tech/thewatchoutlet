import { db } from "./firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// 1. Foydalanuvchiga Auksion uchun ruxsat berish (Admin Approval)
export const approveUserForAuction = async (telegramId, userData = {}) => {
  if (!telegramId) throw new Error("Telegram ID kiritilmadi!");

  try {
    // MUHIM: bu kolleksiya nomi "useAuction.js" hookidagi nom bilan
    // AYNAN bir xil bo'lishi shart ("auction_approved_users"), aks holda
    // admin tasdiqlagan ruxsat saytda ko'rinmay qoladi.
    const userRef = doc(db, "auction_approved_users", String(telegramId));
    await setDoc(
      userRef,
      {
        telegramId: String(telegramId),
        name:
          userData.first_name ||
          userData.name ||
          userData.username ||
          "Foydalanuvchi",
        username: userData.username || "",
        isApproved: true,
        approvedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Foydalanuvchiga ruxsat berishda xatolik:", error);
    throw error;
  }
};

// 1.1 Foydalanuvchini auksiondan ruxsatdan olib tashlash (Admin Revoke)
export const revokeUserApproval = async (telegramId) => {
  if (!telegramId) throw new Error("Telegram ID kiritilmadi!");

  try {
    const userRef = doc(db, "auction_approved_users", String(telegramId));
    await setDoc(
      userRef,
      {
        isApproved: false,
        revokedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Ruxsatni bekor qilishda xatolik:", error);
    throw error;
  }
};

// 2. Foydalanuvchining auksion ruxsati bor-yo'qligini tekshirish
export const checkUserApproval = async (telegramId) => {
  if (!telegramId) return false;
  try {
    const userRef = doc(db, "auction_approved_users", String(telegramId));
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().isApproved === true;
    }
    return false;
  } catch (error) {
    console.error("Ruxsatni tekshirishda xatolik:", error);
    return false;
  }
};

// 3. Stavka urish (Realtime Bid) - Vaqt, status va RUXSAT tekshiruvi bilan
export const placeBid = async ({
  auctionId,
  user,
  amount,
  currentPrice,
  bidStep,
  endTime,
}) => {
  if (!auctionId) throw new Error("Auksion ID si ko'rsatilmadi!");

  const userId = user?.id || user?.telegramId;
  if (!userId) {
    throw new Error("Foydalanuvchi ID si topilmadi!");
  }

  // 0. Xavfsizlik: Foydalanuvchida ruxsat borligini tekshirish
  const isApproved = await checkUserApproval(userId);
  if (!isApproved) {
    throw new Error(
      "Sizda auksionda qatnashish uchun ruxsat yo'q! Avval admin tasdiqlashi kerak."
    );
  }

  try {
    const auctionRef = doc(db, "auctions", auctionId);
    const auctionSnap = await getDoc(auctionRef);

    if (!auctionSnap.exists()) {
      throw new Error("Auksion topilmadi!");
    }

    const auctionData = auctionSnap.data();
    const finalEndTime = endTime || auctionData.endTime;

    // 1. Vaqt tugaganligini tekshirish
    if (finalEndTime) {
      const isExpired = new Date(finalEndTime).getTime() <= Date.now();
      if (isExpired) {
        throw new Error(
          "Auksion vaqti tugagan! Ortiq stavka qabul qilinmaydi."
        );
      }
    }

    // 2. Auksion holati active emasligini tekshirish
    if (auctionData.status && auctionData.status !== "active") {
      throw new Error("Ushbu auksion hozirda faol emas!");
    }

    const activePrice = Number(auctionData.currentPrice || currentPrice || 0);
    const activeBidStep = Number(auctionData.bidStep || bidStep || 0);
    // MUHIM: minimal stavka — joriy narx + stavka qadami (bidStep), shunchaki
    // "joriy narxdan biroz yuqori" emas. Bu — frontendda (AuctionDetailModal)
    // tuzatilgan bug'ning server tarafidagi ikkinchi himoya qatlami: hatto
    // kimdir frontend tekshiruvini chetlab o'tsa ham, bu yerda to'xtatiladi.
    const minValidBid = activePrice + activeBidStep;

    const finalBidAmount = amount
      ? Number(amount)
      : activePrice + activeBidStep;

    // 3. Yangi stavka minimal qiymatdan (joriy narx + qadam) past emasligini tekshirish
    if (finalBidAmount < minValidBid) {
      throw new Error(
        `Stavka kamida $${minValidBid.toLocaleString()} bo'lishi kerak!`
      );
    }

    const bidData = {
      userId: String(userId),
      userName: `${user?.first_name || user?.name || "Foydalanuvchi"} ${
        user?.last_name || ""
      }`.trim(),
      username: user?.username || "",
      photoUrl: user?.photo_url || "",
      amount: finalBidAmount,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(auctionRef, {
      currentPrice: finalBidAmount,
      lastBidder: bidData,
      totalBids: increment(1),
      bidsHistory: arrayUnion(bidData),
    });

    return true;
  } catch (error) {
    console.error("Stavka urishda xatolik:", error);
    throw error;
  }
};
