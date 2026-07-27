// src/component/splash/SplashScreen.jsx
// מסך פתיחה: הלוגו נכנס, נשאר לרגע ואז נעלם.
// מוצג פעם אחת לכל ביקור באתר (session) — לא בכל מעבר בין דפים.

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "splashSeen";

// משכי האנימציה (מילישניות) — חייבים להתאים ל-CSS ב-custom.css
const HOLD_MS = 1400; // כמה זמן הלוגו נשאר על המסך
const FADE_MS = 600; // משך ההיעלמות

const SplashScreen = ({ logo, alt = "" }) => {
  // מתחילים כמוצג גם בשרת וגם בלקוח, כדי שלא תהיה אי-התאמה בהידרציה
  const [phase, setPhase] = useState("visible"); // visible | leaving | done
  const timers = useRef([]);

  useEffect(() => {
    // כבר נצפה בביקור הזה — מסירים מיד בלי אנימציה
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // דפדפן שחוסם אחסון — פשוט נציג את המסך
    }

    if (seen) {
      setPhase("done");
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // לא קריטי
    }

    // מי שביקש להפחית תנועה מקבל הצצה קצרה בלבד
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const hold = reduced ? 300 : HOLD_MS;
    const fade = reduced ? 150 : FADE_MS;

    timers.current.push(setTimeout(() => setPhase("leaving"), hold));
    timers.current.push(setTimeout(() => setPhase("done"), hold + fade));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  // נועל גלילה כל עוד המסך מוצג
  useEffect(() => {
    if (phase === "done") return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`splash-screen ${phase === "leaving" ? "splash-leaving" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="splash-inner">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={alt} className="splash-logo" />
        ) : (
          <span className="splash-fallback">
            <span className="splash-fallback-bizz">Bizz</span>
            <span className="splash-fallback-expo">Expo</span>
          </span>
        )}
        <span className="splash-bar" aria-hidden="true" />
      </div>
    </div>
  );
};

export default SplashScreen;
