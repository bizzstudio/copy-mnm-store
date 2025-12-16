// src/services/SettingServices.js
import requests from "./httpServices";

const SettingServices = {
  //store setting all function
  getStoreSetting: async () => {
    return requests.get("/setting/store-setting/all");
  },

  getStoreSeoSetting: async (path) => {
    return requests.get(`/setting/store-setting/seo${path ? `?path=${encodeURIComponent(path)}` : ""}`);
  },
  //store customization setting all function
  getStoreCustomizationSetting: async () => {
    return requests.get("/setting/store/customization/all");
  },

  getShowingLanguage: async () => {
    return requests.get(`/language/show`);
  },

  getGlobalSetting: async () => {
    return requests.get("/setting/global/all");
  },

  // ✅ חדש: סקריפטים דינמיים (head, bodyStart, bodyEnd)
  getStoreScripts: async () => {
    try {
      const data = await requests.get("/setting/store-scripts/all");

      return {
        head: typeof data?.head === "string" ? data.head : "",
        bodyStart: typeof data?.bodyStart === "string" ? data.bodyStart : "",
        bodyEnd: typeof data?.bodyEnd === "string" ? data.bodyEnd : "",
      };
    } catch (err) {
      console.error("Failed to fetch scripts:", err);
      return { head: "", bodyStart: "", bodyEnd: "" };
    }
  },
};

export default SettingServices;
