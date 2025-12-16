import requests from "./httpServices";

const DeliveryServices = {
    getByCityName: async (city) => {
        const res = await requests.get("/deliveries/getbycity/" + city);
        return res;
    },
    getAllDeliveries: async () => {
        const res = await requests.get("/deliveries");
        return res;
    }
}

export default DeliveryServices