import { useRouter } from "next/router";
import { useMemo, useState } from "react";

const useFilter = (data) => {
  const [pending, setPending] = useState([]);
  const [Processing, setProcessing] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [sortedField, setSortedField] = useState("Popular");
  const router = useRouter();

  // console.log("sortedfield", sortedField, data);

  const productData = useMemo(() => {
    let services = data;
    //filter user order
    if (router.pathname === "/user/dashboard") {
      const orderPending = services?.filter(
        (statusP) => statusP.status === "Pending"
      );
      setPending(orderPending);

      const orderProcessing = services?.filter(
        (statusO) => statusO.status === "Processing"
      );
      setProcessing(orderProcessing);

      const orderDelivered = services?.filter(
        (statusD) => statusD.status === "Delivered"
      );
      setDelivered(orderDelivered);
    }

    //service sorting with low and high price
    if (sortedField === "Low") {
      services = services?.sort((a, b) => {
        const priceA = a.prices?.price || 0;
        const priceB = b.prices?.price || 0;
        return priceA - priceB;
      });
    }
    if (sortedField === "High") {
      services = services?.sort((a, b) => {
        const priceA = a.prices?.price || 0;
        const priceB = b.prices?.price || 0;
        return priceB - priceA;
      });
    }

    // מיון לפי פופולריות (מכירות) עם עדיפות לברקוד
    if (sortedField === "Popular") {
      services = services?.sort((a, b) => {
        const barcodeA = a.barcode;
        const barcodeB = b.barcode;
        
        // אם לשני המוצרים יש ברקוד - מיון לפי ברקוד (מספר נמוך ראשון)
        if (barcodeA && barcodeB) {
          const numA = parseInt(barcodeA) || 9999;
          const numB = parseInt(barcodeB) || 9999;
          return numA - numB;
        }
        
        // אם רק למוצר A יש ברקוד - הוא קודם
        if (barcodeA && !barcodeB) {
          return -1;
        }
        
        // אם רק למוצר B יש ברקוד - הוא קודם
        if (!barcodeA && barcodeB) {
          return 1;
        }
        
        // אם לשניהם אין ברקוד - מיון לפי מכירות (יורד)
        const salesA = a.sales || 0;
        const salesB = b.sales || 0;
        // מיון יורד - הכי נמכר ראשון
        return salesB - salesA;
      });
    }

    // מיון אלפביתי
    if (sortedField === "Alphabetical") {
      services = services?.sort((a, b) => {
        const nameA = (a.title?.he || a.title?.en || a.title || '').toLowerCase();
        const nameB = (b.title?.he || b.title?.en || b.title || '').toLowerCase();
        return nameA.localeCompare(nameB, 'he');
      });
    }

    return services;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedField, data]);

  return {
    productData,
    pending,
    Processing,
    delivered,
    sortedField,
    setSortedField,
  };
};

export default useFilter;
