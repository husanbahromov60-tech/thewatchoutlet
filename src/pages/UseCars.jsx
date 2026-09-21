import { useState, useEffect, useCallback } from "react";

export function useCars() {
  const [cars, setCars] = useState([]);
  const [usedCars, setUsedCars] = useState([]);
  const [installmentCars, setInstallmentCars] = useState([]);
  const [allCars, setAllCars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firestore REST API orqali ma'lumot olish (VPN'siz va blokirovkasiz)
  const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  const fetchCollectionREST = async (collectionName) => {
    try {
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

  const fetchAll = useCallback(async () => {
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

      setCars(formattedNew);
      setUsedCars(formattedUsed);
      setInstallmentCars(formattedInstallment);
      setAllCars([...formattedNew, ...formattedUsed, ...formattedInstallment]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [PROJECT_ID]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
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
