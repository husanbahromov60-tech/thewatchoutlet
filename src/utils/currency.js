// ============================================================
// VALYUTA KURSI — MARKAZLASHGAN JOY
// Kurs o'zgarganda FAQAT shu bitta qatorni yangilang — butun loyihada
// (CarCard, AuctionCard, InstallmentCard, detail modallar va h.k.)
// avtomatik ravishda yangi kurs bilan hisoblanadi.
// ============================================================
export const USD_TO_UZS_RATE = 12700;

/**
 * Dollar summasini so'mga aylantirib, o'qilishi qulay matn qilib qaytaradi.
 * Masalan: formatUZS(35000) -> "444 500 000 so'm"
 */
export function formatUZS(usdAmount) {
  const uzsValue = Math.round(Number(usdAmount || 0) * USD_TO_UZS_RATE);
  return uzsValue.toLocaleString("ru-RU") + " uzs";
}

/**
 * Faqat raqamni (so'm birligisiz) qaytaradi — agar boshqacha formatlash
 * kerak bo'lib qolsa (masalan kartochka tashqarisida) shundan foydalaning.
 */
export function usdToUzsNumber(usdAmount) {
  return Math.round(Number(usdAmount || 0) * USD_TO_UZS_RATE);
}
