import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseConfig"; // loyihangizdagi firebaseConfig yo'li

const useUsedWatches = () => {
  const [usedCars, setUsedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firestore'dan 'used_watches' kolleksiyasini eshitamiz
    const q = query(collection(db, "used_watches"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const watchesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Faqat 'no-active' yoki 'sotildi' bo'lmaganlarini saralaymiz
        const activeWatches = watchesList.filter(
          (item) =>
            item.status !== "no-active" &&
            item.status !== "noactive" &&
            item.status !== "sotildi"
        );

        setUsedCars(activeWatches);
        setLoading(false);
      },
      (error) => {
        console.error("used_watches ma'lumotlarini olishda xatolik:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { usedCars, loading };
};

export default useUsedWatches;
