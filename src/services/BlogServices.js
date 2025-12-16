// src/services/BlogServices.js
import requests from "./httpServices";

const BlogServices = {
    // Fetch published blogs list with pagination and optional filters
    getPublishedBlogs: async ({ page = 1, limit = 10, category = "", tag = "" }) => {
        const encodedCategory = encodeURIComponent(category);
        const encodedTag = encodeURIComponent(tag);
        return requests.get(
            `/blog/published?page=${page}&limit=${limit}&category=${encodedCategory}&tag=${encodedTag}`
        );
    },

    // Fetch a single published blog by slug
    getPublishedBlogBySlug: async (slug) => {
        const encodedSlug = encodeURIComponent(slug);
        return requests.get(`/blog/published/${encodedSlug}`);
    },

    // Fetch distinct categories that exist in published blogs
    getBlogCategories: async () => {
        return requests.get("/blog/categories");
    },

    // Fetch distinct tags that exist in published blogs
    getBlogTags: async () => {
        return requests.get("/blog/tags");
    },
};

export default BlogServices;
