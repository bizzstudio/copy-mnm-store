import requests from "./httpServices";

const OfferServices = {
  getOfferById: async (id) => {
    return requests.get(`/offers/${id}`);
  },

  getAllOffers: async () => {
    return requests.get(`/offers`);
  },
};

export default OfferServices;
