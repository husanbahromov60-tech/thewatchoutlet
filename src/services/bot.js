import { Telegraf } from "telegraf";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Lokal .env faylini yuklash
dotenv.config();

// 1. Firebase Admin Sozlanmasi
let serviceAccount = null;

// .env ichidagi FIREBASE_SERVICE_ACCOUNT to'g'ri private_key'ga ega ekanligini tekshirish
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const parsed =
      typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;

    if (parsed && (parsed.private_key || parsed.privateKey)) {
      serviceAccount = parsed;
    }
  } catch (e) {
    // .env parsing xatosi bo'lsa, xatolik berilmaydi va lokal faylga o'tiladi
  }
}

// Agar .env ichida yaroqli kalit bo'lmasa, lokal serviceAccountKey.json faylidan o'qiladi
if (!serviceAccount) {
  const localKeyPath = path.join(
    process.cwd(),
    "src",
    "services",
    "serviceAccountKey.json"
  );
  if (fs.existsSync(localKeyPath)) {
    try {
      const rawData = fs.readFileSync(localKeyPath, "utf8");
      serviceAccount = JSON.parse(rawData);
    } catch (e) {
      console.error("❌ serviceAccountKey.json faylini o'qishda xatolik:", e);
    }
  }
}

if (!serviceAccount) {
  console.error(
    "❌ Firebase Service Account topilmadi! (.env yoki serviceAccountKey.json tayyorligini tekshiring)"
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// 2. Telegram Bot Sozlanmasi
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// 3. Hub Post Parser Funksiyasi
function parseWatchPost(text, messageId) {
  if (!text) return null;

  const lines = text.split("\n");
  const data = {
    id: `post_${messageId}`,
    messageId: messageId,
    updatedAt: new Date(),
  };

  let isAuction = false;
  let isInstallment = false;
  let isUsed = false;
  let type = "market";

  const images = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("---")) return;

    const lowerLine = trimmedLine.toLowerCase();

    // TYPE
    if (lowerLine.startsWith("type:")) {
      const typeVal = trimmedLine.split(":")[1].trim().toLowerCase();
      if (typeVal === "auction") {
        isAuction = true;
        type = "auction";
      } else if (typeVal === "installment") {
        isInstallment = true;
        type = "installment";
      } else if (typeVal === "used") {
        isUsed = true;
        type = "used";
      } else {
        type = "market";
      }
    }

    if (trimmedLine.includes("🔥 AUCTION POST 🔥")) {
      isAuction = true;
      type = "auction";
    }
    if (trimmedLine.includes("🏦 INSTALLMENT POST 🏦")) {
      isInstallment = true;
      type = "installment";
    }
    if (trimmedLine.includes("🔄 USED WATCH POST 🔄")) {
      isUsed = true;
      type = "used";
    }

    // DATA FIELDS
    if (lowerLine.startsWith("id:"))
      data.watchId = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("status:"))
      data.status = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim()
        .toLowerCase();
    if (lowerLine.startsWith("brand:"))
      data.brand = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("card title:"))
      data.name = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (
      lowerLine.startsWith("ref. code / model:") ||
      lowerLine.startsWith("ref. code:")
    ) {
      data.model = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    }

    // PRICES
    if (lowerLine.startsWith("price:"))
      data.price = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (lowerLine.startsWith("total price:")) {
      data.totalPrice = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
      data.price = data.totalPrice;
    }
    if (lowerLine.startsWith("start price:")) {
      data.startingPrice = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
      data.price = data.startingPrice;
    }
    if (lowerLine.startsWith("bid step:"))
      data.bidStep = Number(trimmedLine.replace(/[^0-9]/g, "")) || 50;
    if (lowerLine.startsWith("end time:"))
      data.endTime = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();

    // INSTALLMENT
    if (lowerLine.startsWith("min. down payment:"))
      data.minDownPayment = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (lowerLine.startsWith("annual rate:"))
      data.annualInterest = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (lowerLine.startsWith("min. term:"))
      data.minPeriod = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (lowerLine.startsWith("max. term:"))
      data.maxPeriod = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;

    // SPECS
    if (lowerLine.startsWith("case material:"))
      data.caseMaterial = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();
    if (lowerLine.startsWith("mechanism:"))
      data.mechanism = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();
    if (lowerLine.startsWith("glass:"))
      data.glass = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("bracelet/strap:"))
      data.strap = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("gender:"))
      data.gender = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("case size:"))
      data.diameter = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();
    if (lowerLine.startsWith("water resistance:"))
      data.waterResistance = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();

    // META
    if (lowerLine.startsWith("date:"))
      data.date = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("instagram:"))
      data.instagram = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();
    if (lowerLine.startsWith("youtube:"))
      data.youtube = trimmedLine.substring(trimmedLine.indexOf(":") + 1).trim();
    if (lowerLine.startsWith("description:"))
      data.description = trimmedLine
        .substring(trimmedLine.indexOf(":") + 1)
        .trim();

    // IMAGES (Image1:, Image2: yoki matn ichidagi URL-lar)
    if (lowerLine.includes("http://") || lowerLine.includes("https://")) {
      const urlMatches = trimmedLine.match(/(https?:\/\/[^\s]+)/g);
      if (urlMatches) {
        urlMatches.forEach((url) => images.push(url));
      }
    }
  });

  data.isAuction = isAuction;
  data.isInstallment = isInstallment;
  data.isUsed = isUsed;
  data.type = type;
  data.images = images;
  data.image = images[0] || "";

  return data;
}

// 4. Telegram Event-larni Eshitish (Kanal va Shaxsiy xabarlar)
bot.on(["message", "channel_post", "edited_channel_post"], async (ctx) => {
  try {
    const post = ctx.channelPost || ctx.editedChannelPost || ctx.message;
    const text = post.caption || post.text || "";

    if (!text || !text.trim()) return;

    const watchData = parseWatchPost(text, post.message_id);
    if (!watchData || (!watchData.name && !watchData.brand)) return;

    let targetCollection = "watches";
    if (watchData.isAuction) targetCollection = "auctions";
    else if (watchData.isInstallment) targetCollection = "installment_watches";
    else if (watchData.isUsed) targetCollection = "used_watches";

    await db
      .collection(targetCollection)
      .doc(`post_${post.message_id}`)
      .set(watchData, { merge: true });

    console.log(`✅ Saqlandi [${targetCollection}]: post_${post.message_id}`);
  } catch (err) {
    console.error("❌ Firestore Error:", err);
  }
});

// 5. Render / Web Service uchun HTTP Health Check Server
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Watch Bot Active");
  })
  .listen(PORT, () => {
    console.log(`🌐 Web server ${PORT}-portda ishlamoqda...`);
  });

// 6. Botni Ishga Tushirish
bot
  .launch()
  .then(() => console.log("🤖 Watch Outlet Bot muvaffaqiyatli ishga tushdi!"))
  .catch((err) => console.error("❌ Botni ishga tushirishda xatolik:", err));

// Graceful Shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
