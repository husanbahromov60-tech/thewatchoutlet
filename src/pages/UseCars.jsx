import { useState, useEffect, useCallback, useRef } from "react";

// PROJECT_ID va keshni hook'dan tashqarida e'lon qilamiz.
// Bu React re-render bo'lganda ortiqcha sikllar va qayta yuklashlarning oldini oladi.
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// So'rovlarni keshlab turish uchun (Firebase limitini tejash)
let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minut kesh vaqti

export function useCars() {
  const [cars, setCars] = useState([]);
  const [usedCars, setUsedCars] = useState([]);
  const [installmentCars, setInstallmentCars] = useState([]);
  const [allCars, setAllCars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firestore REST API orqali ma'lumot olish
  const fetchCollectionREST = async (collectionName) => {
    try {
      if (!PROJECT_ID) {
        console.error("PROJECT_ID topilmadi! .env faylingizni tekshiring.");
        return [];
      }

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}`
      );
      if (!response.ok) return [];

      const data = await response.json();
      if (!data.documents) return [];

      return data.documents.map((doc) => {
        // Document ID'sini olish
        const id = doc.name.split("/").pop();

        // Firestore REST obyektidan oddiy JSON'ga o'girish
        const fields = doc.fields || {};
        const parsedData = {};

        Object.keys(fields).forEach((key) => {
          const valueObj = fields[key];
          const valueType = Object.keys(valueObj)[0];
          parsedData[key] = valueObj[valueType];
        });

        return { id, ...parsedData };
      });
    } catch (e) {
      console.error(`${collectionName} yuklashda xatolik:`, e);
      return [];
    }
  };

  const fetchAll = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Agar kesh mavjud bo'lsa va 1 minut o'tmagan bo'lsa (forceRefresh bo'lmasa), keshdan olamiz
    if (!forceRefresh && cacheData && now - lastFetchTime < CACHE_DURATION) {
      setCars(cacheData.cars);
      setUsedCars(cacheData.usedCars);
      setInstallmentCars(cacheData.installmentCars);
      setAllCars(cacheData.allCars);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [newWatches, usedWatchesRaw, installmentWatchesRaw] =
        await Promise.all([
          fetchCollectionREST("watches"),
          fetchCollectionREST("used_watches"),
          fetchCollectionREST("installment_watches"),
        ]);

      const formattedNew = newWatches.map((w) => ({
        ...w,
        isUsed: false,
        type: w.type || "market",
      }));

      const formattedUsed = usedWatchesRaw.map((w) => ({
        ...w,
        id: `used_${w.id}`,
        originalId: w.id,
        isUsed: true,
        type: "used",
      }));

      const formattedInstallment = installmentWatchesRaw.map((w) => ({
        ...w,
        id: `inst_${w.id}`,
        originalId: w.id,
        isInstallment: true,
        type: "installment",
      }));

      const combinedAll = [
        ...formattedNew,
        ...formattedUsed,
        ...formattedInstallment,
      ];

      // Keshni yangilaymiz
      cacheData = {
        cars: formattedNew,
        usedCars: formattedUsed,
        installmentCars: formattedInstallment,
        allCars: combinedAll,
      };
      lastFetchTime = Date.now();

      setCars(formattedNew);
      setUsedCars(formattedUsed);
      setInstallmentCars(formattedInstallment);
      setAllCars(combinedAll);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Bo'sh dependency - cheksiz siklning oldini oladi

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll(true); // Qo'lda yangilanganda keshni buzib yangi ma'lumot oladi
  }, [fetchAll]);

  return {
    cars,
    usedCars,
    installmentCars,
    allCars,
    loading,
    refreshing,
    refresh,
  };
}

export default useCars;
