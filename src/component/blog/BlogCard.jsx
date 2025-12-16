// src/component/blog/BlogCard.jsx
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

// Internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";
import MainBT from "@component/button/MainBT";
import { IoArrowForwardOutline, IoNewspaperOutline } from "react-icons/io5";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";

const stripHtml = (htmlString = "") => {
    if (!htmlString) return "";
    // Replace line breaks and block elements with spaces first
    return htmlString
        .replace(/<br\s*\/?>/gi, " ") // Replace <br> tags with spaces
        .replace(/<\/?(p|div|h[1-6]|li|ul|ol)\b[^>]*>/gi, " ") // Replace block elements with spaces
        .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing spaces
};

const BlogCard = ({ blog, isHome = false }) => {
    const { t } = useTranslation();
    const { showingTranslateValue } = useUtilsFunction();

    // Get translated title & preview/content
    const title = showingTranslateValue(blog?.title);

    const previewText = useMemo(() => {
        // Prefer explicit preview text, fallback to content
        return showingTranslateValue(blog?.preview) || stripHtml(showingTranslateValue(blog?.content)) || "";
    }, [blog, showingTranslateValue]);

    return (
        <Link href={`/${blog?.slug}`} className="group block">
            <div className="flex flex-col overflow-hidden rounded-md shadow-md bg-white transition-shadow duration-200 hover:shadow-lg h-full">
                {blog?.mainImage ? (
                    <div className="relative h-52 w-full">
                        <Image
                            src={blog.mainImage}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className={`relative h-52 w-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${isHome ? "bg-mainColor-superLight" : "bg-mainColor-light"}`}>
                        <div className="flex items-center justify-center p-8 rounded-full bg-white bg-opacity-50">
                            <IoNewspaperOutline size={70} className="text-mainColor-dark" />
                        </div>
                    </div>
                )}
                <div className="flex flex-col flex-grow p-5 pt-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 flex-grow leading-relaxed line-clamp-5 overflow-hidden">
                        {previewText}
                    </p>
                    <div className="mt-4 flex justify-end">
                        <MainBT className="!w-auto px-4 py-1 text-sm">
                            <div className="flex justify-center items-center gap-1">
                                {t("common:readMore")}
                                <MdKeyboardDoubleArrowLeft size={20} className="mt-[3px]" />
                            </div>
                        </MainBT>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
