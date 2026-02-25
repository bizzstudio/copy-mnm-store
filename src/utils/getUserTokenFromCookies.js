export const getUserTokenFromCookies = (cookies = {}) => {
  try {
    const rawUserInfo = cookies?.userInfo ? decodeURIComponent(cookies.userInfo) : "";
    return rawUserInfo ? JSON.parse(rawUserInfo)?.token || "" : "";
  } catch (_error) {
    return "";
  }
};

