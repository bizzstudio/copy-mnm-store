// BeforeStartPopup.jsx
import React, { useEffect, useState } from "react";
import City from "@component/select/City";
import DeliveryServices from "@services/DeliveryServices";
import { getNextDeliveryMessage } from "@utils/getNextDeliveryMessage";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";
import { useTranslations } from "next-intl";

const BeforeStartPopup = ({ onClose }) => {
    const t = useTranslations();

    // state עבור בחירת עיר
    const [chosenCity, setChosenCity] = useState(null);
    // state עבור הודעת המשלוח
    const [deliveryMessage, setDeliveryMessage] = useState("");
    // מצב שמראה אם אנחנו טוענים את נתוני המשלוח (ימים וכו')
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    // הטקסט של הכפתור בתחתית
    const [buttonText, setButtonText] = useState("אני מזמין/ה באיסוף עצמי");

    // בכל פעם שמשתמש בוחר עיר, נביא משרת ה־delivery את הנתונים ונחשב את ההודעה
    useEffect(() => {
        if (!chosenCity) {
            setDeliveryMessage("");
            setButtonText("אני מזמין/ה באיסוף עצמי");
            return;
        }

        // אם נבחרה עיר, נביא את הימים והמחיר
        const fetchDelivery = async () => {
            try {
                setLoadingDelivery(true);
                const res = await DeliveryServices.getByCityName(chosenCity.city_name_he);
                // console.log("res", res);
                const days = res?.days?.map((day) => day?.value) || [];
                const msg = getNextDeliveryMessage(chosenCity.city_name_he, days);
                setDeliveryMessage(msg);
                setButtonText("אישור");
            } catch (err) {
                console.error("Error fetching delivery data:", err);
                setDeliveryMessage(`מצטערים, אין עדיין משלוחים ל${chosenCity.city_name_he?.trim()}.`);
            } finally {
                setLoadingDelivery(false);
            }
        };

        fetchDelivery();
    }, [chosenCity]);

    // בלחיצה על הכפתור התחתון: נסגור את הפופאפ בכל מקרה
    const handleButtonClick = () => {
        onClose();
    };

    return (
        <div className="px-3 sm:px-11 py-8 max-w-md">
            {/* כותרת */}
            <div className="flex justify-between items-center mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                <MinimalTitle title={t('beforeStartTitle')} />
            </div>

            {/* טקסט הסבר */}
            <p className="text-center text-lg font-semibold mb-6">
                כדי שנוכל להגיד לך מתי המשלוח הקרוב לביתך,<br />
                איפה את/ה גר/ה?
            </p>

            {/* קומפוננטת העיר */}
            <div className="mb-6">
                <City setValue={setChosenCity} placeholder={null} />
            </div>

            {/* הצגת הודעת המשלוח (או מצב טוען) */}
            {loadingDelivery ? (
                <p className="text-center text-sm text-gray-500 mb-6">
                    טוען פרטי משלוח...
                </p>
            ) : (
                deliveryMessage && (
                    <p className="text-center text-base font-medium mb-6">
                        {deliveryMessage}
                    </p>
                )
            )}

            {/* הכפתור התחתון – סוגר את הפופאפ תמיד */}
            <MainBT onClick={handleButtonClick}>
                {buttonText}
            </MainBT>
        </div>
    );
};

export default BeforeStartPopup;