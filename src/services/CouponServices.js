import requests from "./httpServices";

const CouponServices = {
  getAllCoupons: async () => {
    return requests.get("/coupon");
  },
  getShowingCoupons: async () => {
    return requests.get("/coupon/show");
  },
  useCoupon: async ({ couponCode }) => {
    return requests.put(`/coupon/use/${couponCode}`);
  },
};

export default CouponServices;
