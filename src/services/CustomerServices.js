// src/services/CustomerServices.js
import requests from "./httpServices";

const CustomerServices = {
  customerLogin: async (body) => {
    return requests.post("/customer/login", body);
  },

  verifyEmailAddress: async (body) => {
    return requests.post("/customer/verify-email", body);
  },

  registerCustomer: async (token, body) => {
    return requests.post(`/customer/register/${token}`, body);
  },

  signUpWithProvider: async (body) => {
    return requests.post(`/customer/signup-with-google`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/customer/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/customer/reset-password", body);
  },

  changePassword: async (body) => {
    return requests.post("/customer/change-password", body);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  sendContactUsMessage: async (body) => {
    return requests.post("/customer/contact-us", body);
  },

  validateToken: async () => {
    return requests.get("/customer/validate-token");
  },

  getCurrentCustomer: async () => {
    return requests.get("/customer/me");
  },
};

export default CustomerServices;
