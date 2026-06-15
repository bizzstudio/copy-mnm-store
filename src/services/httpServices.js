// src/services/httpServices.js
import axios from 'axios';
import Cookies from 'js-cookie';

// בצד-שרת (getServerSideProps רץ בתוך הקונטיינר) פונים ל-backend דרך רשת הדוקר
// (INTERNAL_API_BASE_URL=http://backend:3028/api). בצד-לקוח (דפדפן) פונים לכתובת
// הציבורית (NEXT_PUBLIC_API_BASE_URL). INTERNAL_API_BASE_URL אינו NEXT_PUBLIC ולכן
// נקרא בזמן ריצה ולא נצרב ל-bundle של הדפדפן.
const baseURL =
  (typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL) || "/api";

const instance = axios.create({
  baseURL,
  timeout: 20000, // 20 שניות – כישלון מהיר במקום המתנה ארוכה
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let userInfo;
  
  // Check if we're in a browser environment (client-side)
  if (typeof window !== 'undefined' && Cookies.get('userInfo')) {
    try {
      userInfo = JSON.parse(Cookies.get('userInfo'));
    } catch (error) {
      console.error('Error parsing userInfo cookie:', error);
    }
  }

  // Merge headers instead of replacing them
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(userInfo?.token && { authorization: `Bearer ${userInfo.token}` }),
    },
  };
});

// console.log(process.env.API_BASE_URL);
const responseBody = (response) => response.data;

const requests = {
  get: (url, body, headers) => instance.get(url, body, headers).then(responseBody),

  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),

  put: (url, body, headers) => instance.put(url, body, headers).then(responseBody),
};

export default requests;
