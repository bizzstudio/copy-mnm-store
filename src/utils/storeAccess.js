/**
 * ברירת מחדל: חנות נעולה (חייבים התחברות).
 * כדי לפתוח את החנות לכולם בלי התחברות: NEXT_PUBLIC_STORE_REQUIRES_LOGIN=false
 * (ב-.env מקומי וב-Vercel → Environment Variables, ואז build מחדש.)
 */
export const isStoreLoginRequired = () => {
  const v = (process.env.NEXT_PUBLIC_STORE_REQUIRES_LOGIN || "")
    .toLowerCase()
    .trim();
  if (
    v === "false" ||
    v === "0" ||
    v === "off" ||
    v === "no"
  ) {
    return false;
  }
  return true;
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
