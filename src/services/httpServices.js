// src/services/httpServices.js
import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  timeout: 500000,
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
