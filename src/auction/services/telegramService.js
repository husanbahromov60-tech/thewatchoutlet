import axios from "axios";

// Token va Mini App linki .env faylidan olinadi
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const MINI_APP_URL =
  import.meta.env.VITE_MINI_APP_URL || "https://t.me/thewatchoutletbot";
const CHANNEL_ID = "@auctionForTheWatchOutlet";

// Kanalga yangi auksion xabarini yuborish
export const postAuctionToChannel = async (auction) => {
  if (!BOT_TOKEN) {
    console.error("❌ VITE_TELEGRAM_BOT_TOKEN .env faylida topilmadi!");
    return;
  }

  const { title, startingPrice, bidStep, endTime, images } = auction;

  const caption = `🔥 **YANGI AUKSION BOSHLANDI!**

🚗 **Mashina:** ${title}
💰 **Boshlang'ich narx:** $${startingPrice?.toLocaleString()}
📈 **Stavka adad (qadam):** $${bidStep}
⏳ **Tugash vaqti:** ${new Date(endTime).toLocaleString()}

👇 **Auksionda qatnashish va stavka berish uchun quyidagi tugmani bosing:**`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🔨 Auksionda Qatnashish",
          url: MINI_APP_URL,
        },
      ],
    ],
  };

  try {
    const imageUrl = images && images.length > 0 ? images[0] : null;

    if (imageUrl) {
      // Rasmli xabar yuborish
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        chat_id: CHANNEL_ID,
        photo: imageUrl,
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard,
      });
    } else {
      // Oddiy matnli xabar
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHANNEL_ID,
        text: caption,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard,
      });
    }
  } catch (error) {
    console.error("Telegram kanalga yuborishda xatolik:", error);
  }
};
