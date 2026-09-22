import { useState, useEffect, useCallback } from "react";

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const CACHE_KEY = "watches_local_cache_v6";
const CACHE_TIME_KEY = "watches_local_cache_time_v6";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutlik localStorage kesh

// Firestore REST qiymatlarini oddiy JS obyektiga o'tkazish
const parseFirestoreFields = (fields) => {
  if (!fields) return {};
  const result = {};

  Object.keys(fields).forEach((key) => {
    const valueObj = fields[key];
    if (!valueObj) return;

    if ("stringValue" in valueObj) result[key] = valueObj.stringValue;
    else if ("integerValue" in valueObj)
      result[key] = Number(valueObj.integerValue);
    else if ("doubleValue" in valueObj)
      result[key] = Number(valueObj.doubleValue);
    else if ("booleanValue" in valueObj) result[key] = valueObj.booleanValue;
    else if ("arrayValue" in valueObj) {
      const values = valueObj.arrayValue.values || [];
      result[key] = values.map((v) => {
        if (!v) return null;
        if ("mapValue" in v) return parseFirestoreFields(v.mapValue.fields);
        const firstKey = Object.keys(v)[0];
        return v[firstKey];
      });
    } else if ("mapValue" in valueObj) {
      result[key] = parseFirestoreFields(valueObj.mapValue.fields);
    } else if ("nullValue" in valueObj) {
      result[key] = null;
    } else {
      const firstKey = Object.keys(valueObj)[0];
      result[key] = valueObj[firstKey];
    }
  });

  return result;
};

export function useCars() {
  const [cars, setCars] = useState([]);
  const [usedCars, setUsedCars] = useState([]);
  const [installmentCars, setInstallmentCars] = useState([]);
  const [allCars, setAllCars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firestore REST API orqali "watches" kolleksiyasini to'liq yuklash
  const fetchCollectionREST = async (collectionName) => {
    try {
      if (!PROJECT_ID) {
        console.error("PROJECT_ID topilmadi! .env faylini tekshiring.");
        return [];
      }

      let allDocs = [];
      let pageToken = "";

      do {
        let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=100`;
        if (pageToken) {
          url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        const response = await fetch(url);
        if (!response.ok) break;

        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
          allDocs = [...allDocs, ...data.documents];
        }

        pageToken = data.nextPageToken || "";
      } while (pageToken);

      return allDocs.map((doc) => {
        const id = doc.name.split("/").pop();
        const parsedData = parseFirestoreFields(doc.fields);
        return { id, ...parsedData };
      });
    } catch (e) {
      console.error(`${collectionName} yuklashda xatolik:`, e);
      return [];
    }
  };

  const fetchAll = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const savedCache = localStorage.getItem(CACHE_KEY);
    const savedTime = localStorage.getItem(CACHE_TIME_KEY);

    // Keshni tekshirish
    if (
      !forceRefresh &&
      savedCache &&
      savedTime &&
      now - Number(savedTime) < CACHE_DURATION
    ) {
      try {
        const parsed = JSON.parse(savedCache);
        setCars(parsed.cars || []);
        setUsedCars(parsed.usedCars || []);
        setInstallmentCars(parsed.installmentCars || []);
        setAllCars(parsed.allCars || []);
        setLoading(false);
        setRefreshing(false);
        return;
      } catch (e) {
        console.error("Keshni o'qishda xatolik:", e);
      }
    }

    try {
      // "watches" kolleksiyasidan barcha 350+ ta soatlarni olish
      const allWatchesRaw = await fetchCollectionREST("watches");

      const formattedNew = [];
      const formattedUsed = [];
      const formattedInstallment = [];

      const combinedAll = allWatchesRaw.map((w) => {
        const type = String(w.type || "").toLowerCase();

        const isUsed =
          w.isUsed === true ||
          type === "used" ||
          type === "ishlatilgan" ||
          type === "b/u";
        const isInstallment =
          w.isInstallment === true ||
          type === "installment" ||
          type === "nasiya";

        const item = {
          ...w,
          isUsed,
          isInstallment,
          type: type || "market",
        };

        if (isUsed) {
          formattedUsed.push(item);
        } else if (isInstallment) {
          formattedInstallment.push(item);
        } else {
          formattedNew.push(item);
        }

        return item;
      });

      const cachePayload = {
        cars: formattedNew,
        usedCars: formattedUsed,
        installmentCars: formattedInstallment,
        allCars: combinedAll,
      };

      // LocalStorage brauzer xotirasiga saqlash
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      localStorage.setItem(CACHE_TIME_KEY, now.toString());

      setCars(formattedNew);
      setUsedCars(formattedUsed);
      setInstallmentCars(formattedInstallment);
      setAllCars(combinedAll);
    } catch (err) {
      console.error("Soatlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll(true);
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
