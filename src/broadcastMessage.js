import axios from "axios";

// Token va URL loyihadagi .env faylidan olinadi
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
// const WEB_APP_URL =
//   import.meta.env.VITE_WEB_APP_URL || "https://thewatchoutlet.netlify.app";
const DELAY_BETWEEN_MESSAGES = 150; // Telegram limitidan oshib ketmaslik uchun 150ms

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendBroadcast(users, messageText, imageUrl, onProgress) {
  let successCount = 0;
  let failCount = 0;

  if (!BOT_TOKEN) {
    console.error("❌ VITE_TELEGRAM_BOT_TOKEN .env faylida topilmadi!");
    return { successCount: 0, failCount: users.length };
  }

  const cleanUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const isValidImageUrl =
    cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://");

  // const replyMarkup = {
  //   inline_keyboard: [
  //     [
  //       {
  //         text: "🚀 Botni ishga tushirish",
  //         web_app: { url: WEB_APP_URL },
  //       },
  //     ],
  //   ],
  // };

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (!user.telegramId) continue;

    try {
      if (isValidImageUrl) {
        const isWebp = cleanUrl.toLowerCase().includes(".webp");
        const endpoint = isWebp ? "sendDocument" : "sendPhoto";
        const payloadKey = isWebp ? "document" : "photo";

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`,
          {
            chat_id: user.telegramId,
            [payloadKey]: cleanUrl,
            caption: messageText,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }
        );
      } else {
        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
          {
            chat_id: user.telegramId,
            text: messageText,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }
        );
      }
      successCount += 1;
    } catch (error) {
      console.warn(
        "Xabar yuborilmadi ID:",
        user.telegramId,
        "Sabab:",
        error?.response?.data?.description || error.message
      );
      failCount += 1;
    }

    if (onProgress) {
      onProgress(i + 1, users.length);
    }

    if (i < users.length - 1) {
      await sleep(DELAY_BETWEEN_MESSAGES);
    }
  }

  return { successCount, failCount };
}
