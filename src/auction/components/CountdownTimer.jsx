import React, { useState, useEffect, useRef } from "react";

const CountdownTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  // onExpire qayta-qayta chaqirilib ketmasligi uchun flag
  const hasExpiredCalled = useRef(false);

  useEffect(() => {
    // Har safar endTime o'zgarganda flagni qayta tiklaymiz
    hasExpiredCalled.current = false;

    const calculateTimeLeft = () => {
      if (!endTime) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      let endMs = 0;

      // 1. Firestore Timestamp bo'lsa (.toDate())
      if (typeof endTime?.toDate === "function") {
        endMs = endTime.toDate().getTime();
      }
      // 2. { seconds: ... } obyekt bo'lsa
      else if (endTime?.seconds) {
        endMs = endTime.seconds * 1000;
      }
      // 3. String ("2026-09-10T18:00:00") yoki Number bo'lsa
      else {
        endMs = new Date(endTime).getTime();
      }

      const nowMs = Date.now();
      const difference = endMs - nowMs;

      // Vaqt tugagan bo'lsa
      if (isNaN(difference) || difference <= 0) {
        if (onExpire && !hasExpiredCalled.current) {
          hasExpiredCalled.current = true;
          onExpire();
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      // Kun, soat, daqiqa va soniyalarni aniq ajratish
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { days, hours, minutes, seconds, isExpired: false };
    };

    // Boshlanishida bir marta ishlatamiz
    setTimeLeft(calculateTimeLeft());

    // Har 1 soniyada taymerni yangilaymiz
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);

      if (updated.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  // Auksion tugagan bo'lsa
  if (timeLeft.isExpired) {
    return (
      <span style={{ color: "#ef4444", fontWeight: "bold" }}>
        Auksion tugadi
      </span>
    );
  }

  const format = (num) => String(num).padStart(2, "0");

  return (
    <span style={{ color: "red", fontWeight: "bold", fontFamily: "monospace" }}>
      ⏱ {timeLeft.days > 0 ? `${timeLeft.days}Д ` : ""}
      {format(timeLeft.hours)}:{format(timeLeft.minutes)}:
      {format(timeLeft.seconds)}
    </span>
  );
};

export default CountdownTimer;
