// src/pages/accessibility-statement.jsx
import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import { notifySuccess } from "@utils/toast";
import PageHeader from "@component/header/PageHeader";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import accessibilityStatement from 'public/Accessibility Statement.svg'
import MinimalTitle from "@component/common/MinimalTitle";

const AccessibilityStatement = () => {
  const { t } = useTranslation();

  const { storeCustomizationSetting, loading, error } = useGetSetting();
  // console.log('storeCustomizationSetting :>> ', storeCustomizationSetting);

  return (
    <Layout title={t("common:accessibilityStatementTitle")} description={t("common:accessibilityStatementDescription")}>
      <PageHeader
        headerBg={storeCustomizationSetting?.contact_us?.header_bg}
        title={t("common:accessibilityStatementTitle")}
      />

      <div className="sm:py-10 py-5 px-5 sm:px-10">
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-10 bg-white rounded-lg">
          <div className="elementor-element elementor-element-378a75c8 elementor-widget elementor-widget-text-editor" data-id="378a75c8" data-element_type="widget" data-widget_type="text-editor.default">
            <div className="elementor-widget-container">
              <h2 className="text-2xl font-bold mb-4">הצהרת נגישות</h2>
              <div>
                <p>אנו בחברת תמרים בתומר מחוייבים למתן שוויון הזדמנויות לאנשים עם צרכים מיוחדים. ולפיכך עיצבנו ותכננו את האתר לעמוד בהנחיות הנגישות. האתר של תמרים בתומר עומד בדרישות תקנות שיוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע”ג 2013.</p>
                <p>התאמות הנגישות בוצעו בו עפ”י המלצות התקן הישראלי (ת”י 5568) לנגישות תכנים באינטרנט ברמת AA ומסמך WCAG2.0 הבינלאומי.</p>
                <p>הבדיקות נבחנו לתאימות הגבוהה ביותר עבור דפדפנים Chrome, Firefox ו- Internet Explorer.</p>
                <p>האתר מספק מבנה סמנטי עבור טכנולוגיות מסייעות ותמיכה בדפוס השימוש המקובל להפעלה עם מקלדת בעזרת מקשי החיצים, Enter ו- Esc ליציאה מתפריטים וחלונות. ראו סעיף תפעול האתר להרחבה. מותאם לתצוגה בדפדפנים הנפוצים ולשימוש בטלפון הסלולרי.</p>
                <h2 className="text-2xl font-bold mt-6 mb-4">עמידה בתקנים</h2>
                <ol className="list-decimal mr-6">
                  <li>כל העמודים באתר זה כתובים בקוד תקין HTML5. כתיבה בקוד תקין מבטיחה עבודה תקינה של טכנולוגיות מסייעות בהם משתמשים אנשים עם מוגבלות (כגון קוראי-מסך לשימושם של עיוורים).</li>
                  <li>האתר עוצב בצבעים ניגודיים המאפשרים שימוש מיטבי לכבדי ראייה ועוורי צבעים.</li>
                  <li>התוכן באתר סמנטי. מכיל כותרות, טבלאות מידע, רשימות, פסקאות, קישורים תקניים, פקדים לטפסים ותיאורי תמונות אם הן בעלות משמעות.</li>
                  <li>באתר ישנם אזורי תוכן בפריימים המוצגים מאתרים אחרים. אזורים אלה מוגדרים באמצעות title. נגישותם, עם זאת, תלויה באתר המתארח. למשל – פייסבוק באזור הצד בעמודי התוכן.</li>
                  <li>הטפסים באתר נגישים לקוראי מסך ומשתמשי מקלדת.</li>
                </ol>
                <h2 className="text-2xl font-bold mt-6 mb-4">התצוגה באתר</h2>
                <ul className="list-disc mr-6">
                  <li>אפשר לשנות את גודל הטקסטים באתר באמצעות שימוש במקלדת CTRL + או בשימוש בתפריט.</li>
                  <li>הגדלת הטקסט ב-200% תציג את האתר כפי שמוצג במכשירי מובייל – זאת לשם תצוגה מיטבית של התוכן.</li>
                  <li>הרזולוציה המינימלית המומלצת לצפייה באתר היא רוחב 980 פיקסלים. יצוין כי גם ברזולוציה נמוכה מזו האתר ניתן לצפייה.</li>
                  <li>האתר מותאם לצפייה במכשירים ניידים (רספונסיבי).</li>
                  <li>הפונטים באתר הנם סן-סריפיים (sans serifs) – כלומר אינם מכילים קצוות המפריעים לרצף הקריאה.</li>
                  <li>ניתן לגלוש באתר ללא CSS ולקבל תוצאה ראויה.</li>
                  <li>אם אתם רוצים לבצע שינויים אחרים בגודל הטקסטים ובצבעים באתר, תוכלו לעשות זאת באמצעות הדפדפן. אתם מוזמנים לפעול על פי ההנחיות לשינוי צבעים וגופנים בדפדפן. שינויים אלה ישפיעו על כל האתרים שבהם תצפו באמצעות הדפדפן שלכם. ייתכן שחלק מהאתרים לא יגיבו לשינויים משום שהם אינם נגישים.</li>
                </ul>
                <h2 className="text-2xl font-bold mt-6 mb-4">כיצד להפעיל את האתר באמצעות מקלדת</h2>
                <p>לחיצה חוזרת ונשנית על המקש Tab תעביר אתכם בין הקישורים השונים בעמוד. לחיצה על Enter תפעיל את הקישור. שימו לב, לחיצה על Tab תעביר אתכם לקישור הבא ולחיצה על Shift + Tab תחזיר אתכם לקישור הקודם.</p>
                <p>בנוסף לכך, האתר מאפשר שימוש במקשי קיצור המאפשרים לכם להגיע במהירות לעמודים או לאזורים חשובים באתר.</p>
                <p>הפעלת מקשי הקיצור תלויה בדפדפן בו אתם משתמשים:</p>
                <ul className="list-disc mr-6">
                  <li>ב-Internet Explorer, וב-Chrome ובגרסאות ישנות של Firefox: לחצו על מקש Alt ועל מקש המספר או האות על-פי הרשימה. לדוגמה, אם תרצו להגיע לעמוד הבית, לחצו Alt+1.</li>
                  <li>ב-Firefox 3 ומעלה: לחצו על המקשים Alt + Shift + המספר או האות על פי הרשימה. לדוגמא לחצו על Alt+Shift+1 כדי להגיע לעמוד הבית.</li>
                </ul>
                <h2 className="text-2xl font-bold mt-6 mb-4">כיצד לגלוש באתר באמצעות קורא-מסך</h2>
                <p>מידע זה מיועד לגולשים עיוורים או כבדי-ראייה המשתמשים בתוכנת קורא-מסך. באתר מצוינים אזורי תוכן עיקריים וכן נעשה שימוש ב-ARIA לעזרה ביישומים מורכבים כגון קרוסלת מידע בדפים ראשיים, תפריט נפתח, מודאל להצגת תמונות, טפסים וטאבים. כל התפריטים בנויים באמצעות רשימות כדי לאפשר התמצאות נוחה.</p>
                <h2 className="text-2xl font-bold mt-6 mb-4">פניות בנושא הנגשת האתר</h2>
                <p>ליווי ופיקוח הנגשת אתר האינטרנט של תמרים בתומר בוצע על ידי חברת חלב ודבש בניית אתרי אינטרנט מתקדמים.<br />
                  במידה והמשתמש נתקל בבעיה, הוא מוזמן ליצור קשר עם רכז הנגישות של האתר.</p>
                <p>פרטי רכז הנגישות מטעם תמרים בתומר:</p>
                <p><strong>שם:</strong> מוטי בוטבול</p>
                <p><strong>טלפון:</strong> <a title="0542542428" href="tel:0542542428" target="_blank" rel="noopener" role="link">0542542428</a></p>
                <p><strong>דואר אלקטרוני:</strong> <a title="Motty@halavudvash.co.il" href="mailto:motty@halavudvash.co.il" target="_blank" rel="noopener" role="link">motty@halavudvash.co.il</a></p>
                <p>ההצהרה עודכנה לאחרונה בתאריך: 30.07.2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityStatement;