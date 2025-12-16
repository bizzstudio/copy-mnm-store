import requests from "./httpServices";

const PopupServices = {
  getAllPopups: async () => {
    return requests.get("/popup/all");
  },
};

export default PopupServices;
