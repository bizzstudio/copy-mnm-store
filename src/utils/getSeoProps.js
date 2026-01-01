// src/utils/getSeoProps.js
import SettingServices from "@services/SettingServices";

/**
 * Helper function להבאת SEO settings מהשרת
 * משמש ב-getServerSideProps של כל עמוד
 * 
 * @param {string} path - נתיב העמוד (אופציונלי, לספציפיות per-page)
 * @returns {Promise<{seo: object}>} - אובייקט עם seo
 */
export async function getSeoProps(path = null) {
    try {
        const seoSetting = await SettingServices.getStoreSeoSetting(path);
        return {
            seo: seoSetting?.seo || {},
        };
    } catch (error) {
        console.error("Failed to fetch SEO settings:", error);
        return {
            seo: {},
        };
    }
};