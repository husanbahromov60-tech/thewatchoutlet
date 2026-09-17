import { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";

export function useCars() {
  const [cars, setCars] = useState([]); // Faqat YANGI soatlar
  const [usedCars, setUsedCars] = useState([]); // Faqat B/U soatlar
  const [installmentCars, setInstallmentCars] = useState([]); // Muddatli to'lov
  const [allCars, setAllCars] = useState([]); // Barcha soatlar (Likelar va Qidiruv uchun)

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let newWatches = [];
    let usedWatches = [];
    let installmentWatches = [];

    const updateState = () => {
      setCars(newWatches);
      setUsedCars(usedWatches);
      setInstallmentCars(installmentWatches);

      // Duplikat ID'lar xatosini oldini olish uchun unique prefix qo'shamiz
      const combined = [...newWatches, ...usedWatches, ...installmentWatches];
      setAllCars(combined);
      setLoading(false);
      setRefreshing(false);
    };

    // 1. Faqat Yangi Soatlar (watches)
    const qWatches = query(collection(db, "watches"));
    const unsubWatches = onSnapshot(qWatches, (snapshot) => {
      newWatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isUsed: false,
        type: doc.data().type || "market",
      }));
      updateState();
    });

    // 2. Faqat B/U Soatlar (used_watches)
    const qUsed = query(collection(db, "used_watches"));
    const unsubUsed = onSnapshot(qUsed, (snapshot) => {
      usedWatches = snapshot.docs.map((doc) => ({
        id: `used_${doc.id}`, // ID takrorlanmasligi uchun
        originalId: doc.id,
        ...doc.data(),
        isUsed: true,
        type: "used",
      }));
      updateState();
    });

    // 3. Muddatli to'lov (installment_watches)
    const qInstallment = query(collection(db, "installment_watches"));
    const unsubInstallment = onSnapshot(qInstallment, (snapshot) => {
      installmentWatches = snapshot.docs.map((doc) => ({
        id: `inst_${doc.id}`,
        originalId: doc.id,
        ...doc.data(),
        isInstallment: true,
        type: "installment",
      }));
      updateState();
    });

    return () => {
      unsubWatches();
      unsubUsed();
      unsubInstallment();
    };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [snapWatches, snapUsed, snapInstallment] = await Promise.all([
        getDocs(query(collection(db, "watches"))),
        getDocs(query(collection(db, "used_watches"))),
        getDocs(query(collection(db, "installment_watches"))),
      ]);

      const newWatches = snapWatches.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isUsed: false,
      }));

      const usedWatches = snapUsed.docs.map((doc) => ({
        id: `used_${doc.id}`,
        originalId: doc.id,
        ...doc.data(),
        isUsed: true,
      }));

      const installmentWatches = snapInstallment.docs.map((doc) => ({
        id: `inst_${doc.id}`,
        originalId: doc.id,
        ...doc.data(),
        isInstallment: true,
      }));

      setCars(newWatches);
      setUsedCars(usedWatches);
      setInstallmentCars(installmentWatches);
      setAllCars([...newWatches, ...usedWatches, ...installmentWatches]);
    } catch (error) {
      console.error("Yangilashda xatolik:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
