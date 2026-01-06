// src/services/OrderServices.js
import requests from "./httpServices";

const OrderServices = {
  addOrder: async (body, headers) => {
    return requests.post("/order/add", body, headers);
  },

  addGuestOrder: async (body, headers) => {
    return requests.post("/order/add-guest", body, headers);
  },

  createPaymentIntent: async (body) => {
    return requests.post("/order/create-payment-intent", body);
  },

  getOrderCustomer: async ({ page = 1, limit = 8 }) => {
    return requests.get(`/order?limit=${limit}&page=${page}`);
  },

  getOrderById: async (id, token = null) => {
    // אם יש טוקן, מוסיפים אותו כקווארי פרמטר
    const url = token ? `/order/${id}?token=${token}` : `/order/${id}`;
    return requests.get(url);
  },

  addCashierOrder: async (body, headers) => {
    return requests.post("/cashier-orders", body, headers);
  },
};

export default OrderServices;