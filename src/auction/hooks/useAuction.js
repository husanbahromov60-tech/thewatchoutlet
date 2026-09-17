import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { getTelegramUser } from "../services/telegram";

export const useAuction = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  const user = getTelegramUser();

  useEffect(() => {
    const unsubscribeAuctions = onSnapshot(
      collection(db, "auctions"),
      (snapshot) => {
        const list = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Faqat active holatdagilarni filtrlash:
          .filter((item) => item.status === "active");

        setAuctions(list);
        setLoading(false);
      },
      (error) => {
        console.error("Auksionlarni yuklashda xatolik:", error);
        setLoading(false);
      }
    );

    let unsubscribeUser = () => {};
    if (user?.id) {
      const userRef = doc(db, "auction_approved_users", String(user.id));
      unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        setIsApproved(docSnap.exists());
      });
    }

    return () => {
      unsubscribeAuctions();
      unsubscribeUser();
    };
  }, [user?.id]);

  return { auctions, loading, isApproved };
};
