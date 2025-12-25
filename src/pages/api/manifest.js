// src/pages/api/manifest.js
import SettingServices from "@services/SettingServices";

export default async function handler(req, res) {
    const setting = await SettingServices.getStoreSeoSetting().catch(() => null);
    const seo = setting?.seo || {};

    const manifest = {
        name: seo.meta_title || "MNM יבוא שיווק והפצה",
        short_name: seo.meta_title || "MNM יבוא שיווק והפצה",
        description: seo.meta_description || "",
        start_url: "/",
        display: "standalone",
        background_color: "#d0daf5",
        theme_color: "#d0daf5",
        icons: [
            ...(seo.favicon
                ? [{ src: seo.favicon, sizes: "any", type: "image/png" }]
                : [{ src: "/Tomer dates.png", sizes: "any", type: "image/png" }]),
            ...(seo.meta_img
                ? [
                    { src: seo.meta_img, sizes: "192x192", type: "image/png", purpose: "any maskable" },
                    { src: seo.meta_img, sizes: "512x512", type: "image/png", purpose: "any maskable" },
                ]
                : []),
        ],
    };

    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    res.status(200).end(JSON.stringify(manifest)); // בטוח JSON טהור
}
