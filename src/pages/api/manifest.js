// src/pages/api/manifest.js
import SettingServices from "@services/SettingServices";

/**
 * בודק את סוג הקובץ לפי ה-URL
 */
function getIconType(url) {
    if (!url) return "image/png";
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'ico') return "image/x-icon";
    if (ext === 'svg') return "image/svg+xml";
    return "image/png"; // default
}

export default async function handler(req, res) {
    try {
        const setting = await SettingServices.getStoreSeoSetting().catch(() => null);
        const seo = setting?.seo || {};

        const icons = [];

        // Favicon - עם type דינמי
        if (seo.favicon) {
            icons.push({
                src: seo.favicon,
                sizes: "32x32 16x16", // גדלים נפוצים ל-favicon
                type: getIconType(seo.favicon)
            });
        }

        // Icons לגדלים שונים - רק אם יש meta_img
        if (seo.meta_img) {
            icons.push(
                {
                    src: seo.meta_img,
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any maskable"
                },
                {
                    src: seo.meta_img,
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable"
                }
            );
        }

        const manifest = {
            ...(seo.meta_title && { name: seo.meta_title }),
            ...(seo.meta_title && { short_name: seo.meta_title }),
            ...(seo.meta_description && { description: seo.meta_description }),
            start_url: "/",
            display: "standalone",
            ...(seo.background_color && { background_color: seo.background_color }),
            ...(seo.theme_color && { theme_color: seo.theme_color }),
            icons,
        };

        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
        // Cache: שעה ב-client, 24 שעות ב-edge (Vercel)
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, must-revalidate");
        res.status(200).json(manifest);
    } catch (error) {
        console.error("Manifest generation error:", error);
        res.status(500).json({ error: "Failed to generate manifest" });
    }
};