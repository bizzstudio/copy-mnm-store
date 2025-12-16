# 🧩 אינטגרציית Flashy - מדריך השימוש

## סקירה כללית
האינטגרציה עם Flashy Marketing Automation הוטמעה בהצלחה בחנות התמרים. המערכת כוללת tracking מלא של אירועי משתמש, עגלת קניות, רכישות ועוד.

## 📁 קבצים שנוצרו/עודכנו

### קבצים חדשים:
- `src/services/flashy.js` - קובץ שירותים מרכזי לכל פונקציות Flashy
- `env.local.example` - דוגמה לקובץ משתני סביבה

### קבצים שעודכנו:
- `src/pages/_app.js` - הוספת Flashy Pixel ו-page view tracking
- `src/hooks/useCart.jsx` - הוספת cart tracking
- `src/context/UserContext.js` - הוספת user identification
- `src/component/modal/ProductModal.js` - הוספת product modal tracking
- `src/pages/success/index.jsx` - הוספת purchase tracking
- `src/hooks/useCheckoutSubmit.js` - שמירת פרטי הזמנה ל-sessionStorage

## 🚀 התקנה והגדרה

### 1. הגדרת משתני סביבה
```bash
# העתק את הקובץ לדוגמה
cp env.local.example .env.local

# ערוך את הקובץ והוסף את ה-Account ID שלך
NEXT_PUBLIC_FLASHY_ACCOUNT_ID=your_actual_account_id_here
```

### 2. קבלת Account ID מ-Flashy
1. התחבר לחשבון Flashy שלך
2. עבור ל-Settings > Integration
3. העתק את ה-Account ID
4. הוסף אותו לקובץ `.env.local`

## 🎯 אירועים שמועברים ל-Flashy

### 1. Page Views
- **עמוד מוצר**: `ViewContent` עם product ID
- **עמוד קטגוריה**: `CustomEvent` עם שם הקטגוריה
- **עמוד מבצעים**: `CustomEvent` עם "ViewOffersPage"
- **עמוד בלוגים**: `CustomEvent` עם "ViewBlogList"
- **עמודים רגילים**: `PageView`

### 2. Product Modal Views
- **פתיחת מודאל מוצר**: `ViewContent` + `CustomEvent` עם "OpenedProductModal"

### 3. Cart Updates
- **עדכון עגלה**: `UpdateCart` עם product IDs, סכום ומטבע
- **Debounced**: מניעת שליחות מרובות (500ms delay)

### 4. User Identification
- **התחברות משתמש**: `setCustomer` + `contacts.createOrUpdate`
- **עדכון פרטים**: אוטומטי כשמשתמש מחובר

### 5. Purchase Tracking
- **השלמת רכישה**: `Purchase` עם order ID, product IDs, סכום ומטבע
- **מניעת כפילויות**: flag למניעת שליחה כפולה

## 🔧 פונקציות זמינות ב-Flashy Service

```javascript
import { 
  trackPageView,
  trackProductModalView,
  trackCartUpdate,
  trackPurchase,
  identifyUser,
  trackNewsletterSignup,
  trackCustomEvent,
  debouncedCartUpdate
} from '@services/flashy';
```

### דוגמאות שימוש:

```javascript
// Page View
trackPageView('/product/some-product');

// Product Modal
trackProductModalView('product123');

// Cart Update
trackCartUpdate(cartItems, total, 'ILS');

// Purchase
trackPurchase(orderData);

// User Identification
identifyUser(userInfo);

// Newsletter Signup
trackNewsletterSignup('user@example.com', 'John', 'Doe', 'listId');

// Custom Event
trackCustomEvent('ButtonClick', { button_name: 'cta_button' });
```

## 📊 דוגמאות לאירועים

### ViewContent (עמוד מוצר)
```javascript
window.flashy('ViewContent', { 
  content_ids: ['product-123'] 
});
```

### UpdateCart
```javascript
window.flashy('UpdateCart', {
  content_ids: ['product-123', 'product-456'],
  value: 150.50,
  currency: 'ILS'
});
```

### Purchase
```javascript
window.flashy('Purchase', {
  order_id: 'order-789',
  content_ids: ['product-123', 'product-456'],
  value: 150.50,
  currency: 'ILS'
});
```

## 🛠️ פתרון בעיות

### Flashy לא נטען
- בדוק שה-Account ID נכון ב-`.env.local`
- ודא שהקובץ `.env.local` קיים ולא ב-`.gitignore`
- בדוק את ה-console לראות אם יש שגיאות

### אירועים לא מועברים
- בדוק שה-Flashy script נטען: `console.log(window.flashy)`
- ודא שהפונקציות נקראות אחרי שהדף נטען
- בדוק את ה-console לראות הודעות debug

### Purchase tracking לא עובד
- ודא שפרטי ההזמנה נשמרים ב-sessionStorage
- בדוק שה-order ID מועבר נכון
- ודא שהפונקציה נקראת רק פעם אחת

## 🔍 בדיקת האינטגרציה

### 1. בדיקת Flashy Pixel
```javascript
// ב-console של הדפדפן
console.log(window.flashy); // צריך להחזיר function
```

### 2. בדיקת אירועים
```javascript
// ב-console של הדפדפן
window.flashy('CustomEvent', { 
  event_name: 'TestEvent', 
  test: true 
});
```

### 3. בדיקת Flashy Dashboard
- התחבר ל-Flashy Dashboard
- עבור ל-Events או Analytics
- בדוק שהאירועים מופיעים שם

## 📈 יתרונות האינטגרציה

1. **Tracking מלא** - כל פעולת משתמש נעקבת
2. **Remarketing** - אפשרות לקמפיינים ממוקדים
3. **Automation** - אוטומציות שיווקיות מתקדמות
4. **Analytics** - נתונים מפורטים על התנהגות משתמשים
5. **Segmentation** - חלוקת משתמשים לקבוצות

## 🚨 הערות חשובות

1. **GDPR/Privacy** - ודא שהאינטגרציה תואמת לחוקי הפרטיות
2. **Performance** - האינטגרציה מותאמת לביצועים (debouncing, lazy loading)
3. **Error Handling** - כל הפונקציות כוללות error handling
4. **Testing** - מומלץ לבדוק בכל הדפים והזרימות

## 📞 תמיכה

אם יש בעיות או שאלות:
1. בדוק את ה-console לראות שגיאות
2. ודא שכל הקבצים עודכנו נכון
3. בדוק את ה-Flashy Dashboard
4. פנה לתמיכה טכנית אם נדרש

---

**האינטגרציה מוכנה לשימוש! 🎉**
