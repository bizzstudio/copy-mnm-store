import requests from "./httpServices";

const DeliveryServices = {
    // city: שם עיר. orderTotal: אופציונלי – סכום הזמנה אחרי הנחות; כשנשלח, השרת מחזיר shippingCost לפי כללי האזור.
    getByCityName: async (city, orderTotal) => {
        const total = orderTotal != null && !Number.isNaN(Number(orderTotal)) && Number(orderTotal) >= 0
            ? Number(Number(orderTotal).toFixed(2))
            : 0;
        const q = new URLSearchParams({ orderTotal: String(total) });
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            q.set('debug', '1');
            q.set('_', String(Date.now()));
        }
        const url = `/deliveries/getbycity/${encodeURIComponent(city)}?${q.toString()}`;
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log('[משלוח] שולח בקשה:', url);
        }
        const res = await requests.get(url);
        return res;
    },
    getAllDeliveries: async () => {
        const res = await requests.get("/deliveries");
        return res;
    }
}

export default DeliveryServices