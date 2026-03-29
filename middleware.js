import { NextResponse } from "next/server";
import {
  getTokenFromUserInfoCookieValue,
  isStoreLoginRequired,
  STORE_LOGIN_METHOD_QUERY,
  URL_LOGIN_QUERY_METHODS,
} from "./src/utils/storeAccess.js";

const LOGIN_METHOD_SET = new Set(URL_LOGIN_QUERY_METHODS);

export function middleware(request) {
  if (!isStoreLoginRequired()) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const methodParam = request.nextUrl.searchParams.get("method");

  if (pathname.startsWith("/user/forget-password")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/user/email-verification")) {
    return NextResponse.next();
  }

  const userInfoCookie = request.cookies.get("userInfo")?.value ?? "";
  if (getTokenFromUserInfoCookieValue(userInfoCookie)) {
    return NextResponse.next();
  }

  // דף בית עם ?method=... — מודאל התחברות (לא דף נפרד)
  if (pathname === "/" && methodParam && LOGIN_METHOD_SET.has(methodParam)) {
    return NextResponse.next();
  }

  // קישור ישן /store-login → מפנה ב-getServerSideProps
  if (pathname === "/store-login") {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/";
  loginUrl.search = "";
  loginUrl.searchParams.set("method", STORE_LOGIN_METHOD_QUERY);
  const destination = `${pathname}${search || ""}`;
  if (pathname !== "/" || (search && search.length > 1)) {
    loginUrl.searchParams.set("redirect", destination);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webmanifest|ico|txt|xml)$).*)",
  ],
};
