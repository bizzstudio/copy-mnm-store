// src/utils/getNextDeliveryMessage.js
import dayjs from "dayjs";
import "dayjs/locale/he";
dayjs.locale("he"); // עברית עבור dayjs
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// הלוגיקה המלאה לחישוב מתי המשלוח הבא, מועתקת (או דומה) לזו שיש ב-DeliveryMsgModal
export function getNextDeliveryMessage(cityNameHe, shippingDays) {
    // const shippingDays = ['6']; // בדיקה לימי שישי בלבד
    if (!cityNameHe || !shippingDays?.length) {
        return "לא זמינים פרטי משלוח לעיר זו.";
    };

    // לוגיקת מציאת יום המשלוח הבא – זהה ל-DeliveryMsgModal
    const now = dayjs();
    const systemDay = now.day() + 1; // 1..7 (dayjs: 0=Sunday)
    const currentHour = now.hour();

    // פונקציה עזר
    const getHebrewDayName = (dayNumber) => {
        const daysMap = [
            "ראשון",
            "שני",
            "שלישי",
            "רביעי",
            "חמישי",
            "שישי",
            "שבת",
        ];
        return daysMap[dayNumber - 1];
    };

    // חיפוש יום משלוח
    const findNextShippingDay = (startDay) => {
        for (let i = 0; i < 14; i++) {
            const dayToCheck = ((startDay - 1 + i) % 7) + 1; // 1..7
            if (shippingDays.includes(String(dayToCheck))) {
                return dayToCheck;
            }
        }
        return null;
    };

    // פונקציה למציאת היום הבא
    const getNextShippingDate = (currentSystemDay, currentHour, shippingDays, plus = 0) => {
        let searchFromDay = currentSystemDay;
        const isFriday = currentSystemDay === 6;
        const cutoff = isFriday ? 10 : 13;

        // אם עברנו את שעת החיתוך, מחפשים החל ממחר
        if (currentHour >= cutoff) {
            searchFromDay = (currentSystemDay % 7) + 1;
        }

        const nextDay = findNextShippingDay(searchFromDay + plus);
        if (!nextDay) return {};

        let daysToAdd = 0;
        let checkDay = currentSystemDay;

        while (checkDay !== nextDay) {
            checkDay = (checkDay % 7) + 1;
            daysToAdd++;
        }

        // אם יש רק יום משלוח אחד והוא יוצא היום עצמו, נוסיף שבוע
        const onlyOneShippingDay = shippingDays.length === 1;
        const isSameDay = nextDay === currentSystemDay;
        if (isSameDay && onlyOneShippingDay) {
            daysToAdd += 7;
        }

        const targetDate = now.add(daysToAdd, "day");
        const isNextFriday = nextDay === 6;
        const cutoffHour = isNextFriday ? "16:00" : "21:30";

        return {
            dayName: getHebrewDayName(nextDay),
            date: targetDate.format("DD/MM"),
            hour: cutoffHour,
        };
    };

    // בדיקה אם היום עצמו במשלוח
    const isTodayShippingDay = shippingDays.includes(String(systemDay));
    let finalMessage = "";
    const isFriday = systemDay === 6; // שישי
    const fridayCutoff = 10;
    const midweekCutoff = 13;

    let result = {
        dayName: "",
        date: "",
        hour: "",
        message: "",
    };

    if (isTodayShippingDay) {
        if (isFriday) {
            // יום שישי
            if (currentHour < fridayCutoff) {
                // עוד אפשר היום
                const nextShipping = getNextShippingDate(systemDay, currentHour, shippingDays, 1);
                if (nextShipping.dayName) {
                    // finalMessage = `משלוח ל${cityNameHe} צפוי להגיע היום (${now.format("DD/MM")}) עד השעה 13, ואם יהיה עומס - ישלח ביום ${nextShipping.dayName} (${nextShipping.date}) עד ${nextShipping.hour}.`;
                    finalMessage = `הזמנות ליישובך יסופקו היום עד השעה 16:00.`;
                    result = {
                        ...nextShipping,
                        message: finalMessage,
                    };
                } else {
                    finalMessage = `אין ימי משלוח זמינים עבור ${cityNameHe}.`;
                    result.message = finalMessage;
                }
            } else {
                // עבר cutoff
                const nextShipping = getNextShippingDate(systemDay, currentHour, shippingDays);
                if (nextShipping.dayName) {
                    // finalMessage = `משלוח ל${cityNameHe} ייצא ביום ${nextShipping.dayName} (${nextShipping.date}) עד השעה ${nextShipping.hour}.`;
                    finalMessage = `הזמנות ליישובך יסופקו ביום ${nextShipping.dayName} (${nextShipping.date}) עד השעה 21:30.`;
                    result = {
                        ...nextShipping,
                        message: finalMessage,
                    };
                } else {
                    finalMessage = `אין ימי משלוח זמינים עבור ${cityNameHe}.`;
                    result.message = finalMessage;
                }
            }
        } else {
            // יום רגיל
            if (currentHour < midweekCutoff) {
                const nextShipping = getNextShippingDate(systemDay, currentHour, shippingDays, 1);
                if (nextShipping.dayName) {
                    // finalMessage = `משלוח ל${cityNameHe} צפוי להגיע היום (${now.format("DD/MM")}) עד השעה 22, ואם יהיה עומס - ישלח ביום ${nextShipping.dayName} (${nextShipping.date}) עד ${nextShipping.hour}.`;
                    finalMessage = `הזמנות ליישובך יסופקו היום עד השעה 21:30.`;
                    result = {
                        ...nextShipping,
                        message: finalMessage,
                    };
                } else {
                    finalMessage = `אין ימי משלוח זמינים עבור ${cityNameHe}.`;
                    result.message = finalMessage;
                }
            } else {
                const nextShipping = getNextShippingDate(systemDay, currentHour, shippingDays);
                if (nextShipping.dayName) {
                    // finalMessage = `משלוח ל${cityNameHe} ייצא ביום ${nextShipping.dayName} (${nextShipping.date}) עד השעה ${nextShipping.hour}.`;
                    finalMessage = `הזמנות ליישובך יסופקו ביום ${nextShipping.dayName} (${nextShipping.date}) עד השעה ${nextShipping.dayName === 'שישי' ? '16:00' : '21:30'}.`;
                    result = {
                        ...nextShipping,
                        message: finalMessage,
                    };
                } else {
                    finalMessage = `אין ימי משלוח זמינים עבור ${cityNameHe}.`;
                    result.message = finalMessage;
                }
            }
        }
    } else {
        // היום לא במשלוח - מוצאים את הבא
        const nextShipping = getNextShippingDate(systemDay, currentHour, shippingDays);
        if (nextShipping.dayName) {
            finalMessage = `המשלוח הקרוב ל${cityNameHe} יהיה ביום ${nextShipping.dayName} (${nextShipping.date}) עד השעה ${nextShipping.hour}.`;
            result = {
                ...nextShipping,
                message: finalMessage,
            };
        } else {
            finalMessage = `אין ימי משלוח זמינים עבור ${cityNameHe}.`;
            result.message = finalMessage;
        }
    };

    // 🔴 מקרה קיצון – תל אביב‑יפו
    const isTelAviv = cityNameHe?.trim().startsWith("תל אביב");

    if (isTelAviv && result.dayName && result.date) {
        const originalDate = dayjs(result.date, "DD/MM");
        const updatedDate = originalDate.add(1, "day");
        const updatedDayName = getHebrewDayName(updatedDate.day() + 1);

        result.message = result.message
            .replace(result.dayName, updatedDayName)
            .replace(result.date, updatedDate.format("DD/MM"))
            .replace(/עד השעה \d\d:\d\d/, "בין 00:00 ל-06:00 (בשעות הלילה)");

        result.dayName = updatedDayName;
        result.date = updatedDate.format("DD/MM");
        result.hour = "בין 00:00 ל-06:00";
    }

    return result.message;
};