/**
 * נעילת כניסה לאתר שלמה (רק מודאל/הפניה) — אופציונלי.
 * ברירת מחדל: אתר פתוח; מחירים/עגלה מוגבלים בנפרד בקוד.
 * להפעלה: NEXT_PUBLIC_STORE_REQUIRES_LOGIN=true
 */
export const isStoreLoginRequired = () => {
  const v = (process.env.NEXT_PUBLIC_STORE_REQUIRES_LOGIN || "")
    .toLowerCase()
    .trim();
  return v === "true" || v === "1" || v === "yes" || v === "on";
};

/**
 * מחלץ טוקן מ-cookie userInfo (אותה לוגיקה כמו ב-getUserTokenFromCookies).
 */
export function getTokenFromUserInfoCookieValue(raw) {
  if (!raw || typeof raw !== "string") return "";
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return typeof parsed?.token === "string" ? parsed.token : "";
  } catch {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed?.token === "string" ? parsed.token : "";
    } catch {
      return "";
    }
  }
}

/** לקוח מחובר (טוקן בהקשר או ב-cookie) */
export function hasCustomerSession(userInfo, userInfoCookieRaw) {
  if (userInfo?.token) return true;
  return !!getTokenFromUserInfoCookieValue(userInfoCookieRaw || "");
}

/** פרמטר query שפותח את מודאל ההתחברות הקיים (ללא דף נפרד) */
export const STORE_LOGIN_METHOD_QUERY = "login-bussines";

export const URL_LOGIN_QUERY_METHODS = [
  "login-regular",
  "login-bussines",
  "register",
  "reset-password",
];

/** כניסה לחנות נעולה: דף הבית + פתיחת מודאל התחברות */
export function getStoreLoginEntryUrl(redirectPath) {
  const base = `/?method=${STORE_LOGIN_METHOD_QUERY}`;
  if (
    typeof redirectPath === "string" &&
    redirectPath !== "/" &&
    redirectPath.startsWith("/")
  ) {
    return `${base}&redirect=${encodeURIComponent(redirectPath)}`;
  }
  return base;
}

/** לאחר התנתקות או כשאין הרשאה – לאן לנתב */
export function getPostLogoutPath() {
  return isStoreLoginRequired()
    ? `/?method=${STORE_LOGIN_METHOD_QUERY}`
    : "/";
}
