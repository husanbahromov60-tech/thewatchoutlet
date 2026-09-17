import axios from "axios";

const CHANNEL_USERNAME = "dataBaseForTheWatchOutlet";
const PROXY_TIMEOUT = 20000;
const NOT_PROVIDED = "";

export const fetchWatchesFromTelegram = async () => {
  try {
    const targetUrl = `https://t.me/s/${CHANNEL_USERNAME}`;

    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(
        targetUrl
      )}`,
    ];

    let htmlText = "";

    async function tryProxy(proxyUrl) {
      console.log("Telegram proxy tekshirilmoqda:", proxyUrl);

      const response = await axios.get(proxyUrl, {
        timeout: PROXY_TIMEOUT,
      });

      let data = response.data;

      if (data && typeof data === "object" && data.contents) {
        data = data.contents;
      }

      if (typeof data === "string" && data.includes("tgme_widget_message")) {
        console.log("Telegram HTML muvaffaqiyatli olindi:", proxyUrl);
        return data;
      }

      throw new Error("Proksi noto'g'ri formatda javob berdi: " + proxyUrl);
    }

    try {
      htmlText = await Promise.any(proxies.map((url) => tryProxy(url)));
    } catch (aggregateError) {
      console.warn(
        "Uchala proksi ham ishlamadi:",
        aggregateError?.errors || aggregateError
      );
    }

    if (!htmlText) {
      console.error("Telegram kanalidan HTML olinmadi.");
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const messages = doc.querySelectorAll(".tgme_widget_message");

    console.log("Telegram postlari soni:", messages.length);

    const parsedWatches = [];

    messages.forEach((msg, index) => {
      const textNode = msg.querySelector(".tgme_widget_message_text");

      if (!textNode) {
        return;
      }

      let name = "";
      let watchId = "";
      let price = 0;
      let year = "2024";
      let location = "Toshkent sh.";
      let date = "Bugun";
      let status = "active"; // Sukut bo'yicha faol

      // Soat xarakteristikalari
      let brand = NOT_PROVIDED;
      let model = NOT_PROVIDED;
      let mechanism = NOT_PROVIDED;
      let diameter = NOT_PROVIDED;
      let caseMaterial = NOT_PROVIDED;
      let strap = NOT_PROVIDED;
      let waterResistance = NOT_PROVIDED;
      let glass = NOT_PROVIDED;

      let instagram = NOT_PROVIDED;
      let youtube = NOT_PROVIDED;
      let description = NOT_PROVIDED;

      const images = [];

      const anchors = textNode.querySelectorAll("a");
      const anchorImageUrls = [];

      for (const anchor of anchors) {
        const href = anchor.getAttribute("href") || "";
        const isImage =
          href.includes("ibb.co") ||
          /\.(webp|jpg|jpeg|png)(\?.*)?$/i.test(href);

        if (isImage) {
          anchorImageUrls.push(href);
        }
      }

      let formattedHtml = textNode.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<div>/gi, "");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formattedHtml;

      const text = tempDiv.innerText || tempDiv.textContent || "";

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const lowerLine = cleanLine.toLowerCase();

        // -----------------------------------------------------
        // HOLAT / STATUS TEKSHIRUVI
        // -----------------------------------------------------
        if (lowerLine.startsWith("holat:") || lowerLine.startsWith("status:")) {
          const val = cleanLine
            .substring(cleanLine.indexOf(":") + 1)
            .trim()
            .toLowerCase();
          if (
            val === "no-active" ||
            val === "noactive" ||
            val === "sotildi" ||
            val === "inactive"
          ) {
            status = "no-active";
          }
        }

        // ID
        else if (lowerLine.startsWith("id:")) {
          watchId = cleanLine.replace(/^id:/i, "").trim();
        }
        // NOMI
        else if (lowerLine.startsWith("nomi:")) {
          name = cleanLine.replace(/^nomi:/i, "").trim();
        }
        // BREND
        else if (lowerLine.startsWith("brend:")) {
          brand = cleanLine.replace(/^brend:/i, "").trim();
        }
        // MODEL
        else if (lowerLine.startsWith("model:")) {
          model = cleanLine.replace(/^model:/i, "").trim();
        }
        // NARXI
        else if (lowerLine.startsWith("narxi:")) {
          const value = cleanLine.replace(/^narxi:/i, "").replace(/[^\d]/g, "");
          price = value ? parseInt(value, 10) : 0;
        }
        // YILI
        else if (lowerLine.startsWith("yili:")) {
          year = cleanLine.replace(/^yili:/i, "").trim();
        }
        // MEXANIZM
        else if (lowerLine.startsWith("mexanizm:")) {
          mechanism = cleanLine.replace(/^mexanizm:/i, "").trim();
        }
        // DIAMETR
        else if (lowerLine.startsWith("diametr:")) {
          diameter = cleanLine.replace(/^diametr:/i, "").trim();
        }
        // KORPUS
        else if (lowerLine.startsWith("korpus:")) {
          caseMaterial = cleanLine.replace(/^korpus:/i, "").trim();
        }
        // KAMAR
        else if (lowerLine.startsWith("kamar:")) {
          strap = cleanLine.replace(/^kamar:/i, "").trim();
        }
        // SUVDAN HIMOYA
        else if (
          lowerLine.startsWith("suvdan himoya:") ||
          lowerLine.startsWith("suvdan_himoya:")
        ) {
          waterResistance = cleanLine
            .substring(cleanLine.indexOf(":") + 1)
            .trim();
        }
        // SHISHA
        else if (lowerLine.startsWith("shisha:")) {
          glass = cleanLine.replace(/^shisha:/i, "").trim();
        }
        // JOY
        else if (lowerLine.startsWith("joy:")) {
          location = cleanLine.replace(/^joy:/i, "").trim();
        }
        // SANA
        else if (lowerLine.startsWith("sana:")) {
          date = cleanLine.replace(/^sana:/i, "").trim();
        }
        // INSTAGRAM
        else if (lowerLine.startsWith("instagram:")) {
          instagram = cleanLine.replace(/^instagram:/i, "").trim();
        }
        // YOUTUBE
        else if (lowerLine.startsWith("youtube:")) {
          youtube = cleanLine.replace(/^youtube:/i, "").trim();
        }
        // TAVSIF
        else if (lowerLine.startsWith("tavsif:")) {
          description = cleanLine.replace(/^tavsif:/i, "").trim();
        }
        // RASMLAR
        else if (/^rasm\d*:/i.test(lowerLine)) {
          let extractedUrl = cleanLine.replace(/^rasm\d*:/i, "").trim();
          extractedUrl = extractedUrl.replace(/[),.]+$/, "");

          if (
            extractedUrl.startsWith("http://") ||
            extractedUrl.startsWith("https://")
          ) {
            images.push(extractedUrl);
          }
        }
      });

      if (images.length === 0 && anchorImageUrls.length > 0) {
        images.push(...anchorImageUrls);
      }

      if (images.length === 0) {
        const photoNode = msg.querySelector(".tgme_widget_message_photo_wrap");
        if (photoNode) {
          const style = photoNode.getAttribute("style") || "";
          const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            images.push(urlMatch[1]);
          }
        }
      }

      // FAQUAT 'no-active' BO'LMAGAN SOATLARNI QO'SHISH
      if (name && status !== "no-active") {
        const watch = {
          id: watchId || `${index}-${name}`,
          listingId: watchId || "",
          name,
          brand,
          model,
          price,
          year,
          mechanism,
          diameter,
          caseMaterial,
          strap,
          waterResistance,
          glass,
          location,
          date,
          status,
          instagram,
          youtube,
          description,
          images,
          image: images[0] || "",
        };

        parsedWatches.push(watch);
      }
    });

    parsedWatches.reverse();
    return parsedWatches;
  } catch (error) {
    console.error("Telegramdan ma'lumot olishda xatolik:", error);
    return [];
  }
};
