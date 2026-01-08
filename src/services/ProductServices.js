import requests from "./httpServices";

const ProductServices = {

  getShowingProducts: async () => {
    return requests.get("/products/show");
  },

  getShowingStoreProducts: async ({ category = "", title = "", slug = "", sku = "" }) => {
    // resolve the issue with URLs that include non-English letters.
    let newSlug = slug.toLowerCase().replace(/[()]+/g, "").replace(/\s+/g, "-");
    const encodedSlug = encodeURIComponent(newSlug);
    // Replace '[' and '\' with '' - משום מה זה גורם לקריסה, צריך לבדוק מה הלוז
    const cleanTitle = title.replace(/[\[\\]/g, "");
    const encodedTitle = encodeURIComponent(cleanTitle);
    const encodedCategory = encodeURIComponent(category || "");

    // console.log({ encodedSlug })

    return requests.get(
      `/products/store?category=${encodedCategory}&title=${encodedTitle}&slug=${encodedSlug}&sku=${sku}`
    );
  },

  findProductByTranscript: async (transcript) => {
    return requests.get(`/products/voice-search?transcript=${transcript}`);
  },

  getDiscountedProducts: async () => {
    return requests.get("/products/discount");
  },

  getProductBySlug: async (slug) => {
    const encodedSlug = encodeURIComponent(slug);
    return requests.get(`/products/product/${encodedSlug}`);
  },
};

export default ProductServices;
