import { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export function useCars() {
  const [cars, setCars] = useState([]); // Faqat YANGI soatlar
  const [usedCars, setUsedCars] = useState([]); // Faqat B/U soatlar
  const [installmentCars, setInstallmentCars] = useState([]); // Muddatli to'lov
  const [allCars, setAllCars] = useState([]); // Barcha soatlar

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Xavfsiz va bir marta ma'lumot olish funksiyasi
  const fetchAllWatches = useCallback(async () => {
    try {
      // 1. Asosiy soatlar
      const snapWatches = await getDocs(collection(db, "watches"));
      const newWatches = snapWatches.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isUsed: false,
        type: doc.data().type || "market",
      }));

      // 2. B/U soatlar (agar kolleksiya bo'lmasa bo'sh massiv qaytaradi)
      let usedWatches = [];
      try {
        const snapUsed = await getDocs(collection(db, "used_watches"));
        usedWatches = snapUsed.docs.map((doc) => ({
          id: `used_${doc.id}`,
          originalId: doc.id,
          ...doc.data(),
          isUsed: true,
          type: "used",
        }));
      } catch (e) {
        console.warn("used_watches kolleksiyasi topilmadi:", e);
      }

      // 3. Muddatli to'lov soatlari
      let installmentWatches = [];
      try {
        const snapInstallment = await getDocs(
          collection(db, "installment_watches")
        );
        installmentWatches = snapInstallment.docs.map((doc) => ({
          id: `inst_${doc.id}`,
          originalId: doc.id,
          ...doc.data(),
          isInstallment: true,
          type: "installment",
        }));
      } catch (e) {
        console.warn("installment_watches kolleksiyasi topilmadi:", e);
      }

      // State'larni yangilash
      setCars(newWatches);
      setUsedCars(usedWatches);
      setInstallmentCars(installmentWatches);

      const combined = [...newWatches, ...usedWatches, ...installmentWatches];
      setAllCars(combined);
    } catch (error) {
      console.error("Firestore ma'lumotlarini olishda xatolik:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllWatches();
  }, [fetchAllWatches]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllWatches();
  }, [fetchAllWatches]);

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

// import { useState, useEffect, useCallback } from "react";
// import { db } from "../firebaseConfig";
// import { collection, onSnapshot, query, getDocs } from "firebase/firestore";

// export function useCars() {
//   const [cars, setCars] = useState([]); // Faqat YANGI soatlar
//   const [usedCars, setUsedCars] = useState([]); // Faqat B/U soatlar
//   const [installmentCars, setInstallmentCars] = useState([]); // Muddatli to'lov
//   const [allCars, setAllCars] = useState([]); // Barcha soatlar (Likelar va Qidiruv uchun)

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     let newWatches = [];
//     let usedWatches = [];
//     let installmentWatches = [];

//     const updateState = () => {
//       setCars(newWatches);
//       setUsedCars(usedWatches);
//       setInstallmentCars(installmentWatches);

//       // Duplikat ID'lar xatosini oldini olish uchun unique prefix qo'shamiz
//       const combined = [...newWatches, ...usedWatches, ...installmentWatches];
//       setAllCars(combined);
//       setLoading(false);
//       setRefreshing(false);
//     };

//     // 1. Faqat Yangi Soatlar (watches)
//     const qWatches = query(collection(db, "watches"));
//     const unsubWatches = onSnapshot(qWatches, (snapshot) => {
//       newWatches = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         isUsed: false,
//         type: doc.data().type || "market",
//       }));
//       updateState();
//     });

//     // 2. Faqat B/U Soatlar (used_watches)
//     const qUsed = query(collection(db, "used_watches"));
//     const unsubUsed = onSnapshot(qUsed, (snapshot) => {
//       usedWatches = snapshot.docs.map((doc) => ({
//         id: `used_${doc.id}`, // ID takrorlanmasligi uchun
//         originalId: doc.id,
//         ...doc.data(),
//         isUsed: true,
//         type: "used",
//       }));
//       updateState();
//     });

//     // 3. Muddatli to'lov (installment_watches)
//     const qInstallment = query(collection(db, "installment_watches"));
//     const unsubInstallment = onSnapshot(qInstallment, (snapshot) => {
//       installmentWatches = snapshot.docs.map((doc) => ({
//         id: `inst_${doc.id}`,
//         originalId: doc.id,
//         ...doc.data(),
//         isInstallment: true,
//         type: "installment",
//       }));
//       updateState();
//     });

//     return () => {
//       unsubWatches();
//       unsubUsed();
//       unsubInstallment();
//     };
//   }, []);

//   const refresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       const [snapWatches, snapUsed, snapInstallment] = await Promise.all([
//         getDocs(query(collection(db, "watches"))),
//         getDocs(query(collection(db, "used_watches"))),
//         getDocs(query(collection(db, "installment_watches"))),
//       ]);

//       const newWatches = snapWatches.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         isUsed: false,
//       }));

//       const usedWatches = snapUsed.docs.map((doc) => ({
//         id: `used_${doc.id}`,
//         originalId: doc.id,
//         ...doc.data(),
//         isUsed: true,
//       }));

//       const installmentWatches = snapInstallment.docs.map((doc) => ({
//         id: `inst_${doc.id}`,
//         originalId: doc.id,
//         ...doc.data(),
//         isInstallment: true,
//       }));

//       setCars(newWatches);
//       setUsedCars(usedWatches);
//       setInstallmentCars(installmentWatches);
//       setAllCars([...newWatches, ...usedWatches, ...installmentWatches]);
//     } catch (error) {
//       console.error("Yangilashda xatolik:", error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, []);

//   return {
//     cars,
//     usedCars,
//     installmentCars,
//     allCars,
//     loading,
//     refreshing,
//     refresh,
//   };
// }

// export default useCars;
