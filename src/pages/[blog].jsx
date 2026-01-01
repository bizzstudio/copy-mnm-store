// src/pages/[blog].jsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.bubble.css'; // שימוש ב-bubble CSS

// Internal imports
import Layout from "@layout/Layout";
import BlogServices from "@services/BlogServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import AboutUs from "./about-us";
import TermAndConditions from "./terms-and-conditions";
import ContactUs from "./contact-us";

const HEBREW_ROUTES = {
    "עלינו": AboutUs,
    "תקנון-אתר": TermAndConditions,
    "צרו-קשר": ContactUs,
};

// Dynamic import for ReactQuill to avoid SSR issues
import { getI18nProps } from "@utils/i18n";
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-40 rounded"></div>
});

const BlogDetails = ({ blog, pageKey }) => {
    const Component = HEBREW_ROUTES[pageKey];
    if (Component) {
        return <Component />;
    } else {

        const { showingTranslateValue, showDateFormat } = useUtilsFunction();

        if (!blog) {
            // Should fallback to 404 page
            return null;
        }

        const title = showingTranslateValue(blog.title);
        const contentHtml = showingTranslateValue(blog.content);

        return (
            <Layout title={title} description={title}>
                {/* Hero Section */}
                <div className="relative w-full h-64 sm:h-80 md:h-[420px]">
                    {blog.mainImage ? (
                        <Image
                            src={blog.mainImage}
                            alt={title}
                            fill
                            priority
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-mainColor-light relative overflow-hidden">
                            <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 h-[120%] aspect-1 rounded-full bg-white opacity-50 flex items-center justify-center">
                                <IoNewspaperOutline className="h-[50%] w-[50%] text-mainColor-dark" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white px-4">
                        {blog.category && (
                            <Link href={`/blogs?category=${encodeURIComponent(blog.category)}`} className="mb-2 inline-block bg-mainColor-dark text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-mainColor-superDark transition-colors">
                                {blog.category}
                            </Link>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-snug max-w-4xl">
                            {title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm">
                            {blog.authorImage ? (
                                <Image src={blog.authorImage} width={36} height={36} className="rounded-full" alt={blog.author} />
                            ) : (
                                <FaUserCircle size={36} />
                            )}
                            {blog.author && <span className="font-medium">{blog.author}</span>}
                            {blog.publishDate && (
                                <>
                                    <span className="mx-1">•</span>
                                    <span>{showDateFormat(blog.publishDate)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="sm:!container mx-auto mt-10 px-5">
                    <div className="bg-white sm:p-8 p-4 rounded-lg shadow-sm blog-content-responsive-zoom">
                        <ReactQuill
                            value={contentHtml}
                            readOnly={true}
                            theme="bubble"
                            modules={{ toolbar: false }}
                        />
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-8 pb-8 flex flex-wrap gap-2">
                            {blog.tags.map((tag, idx) => (
                                <Link
                                    key={idx}
                                    href={`/blogs?tag=${encodeURIComponent(tag)}`}
                                    className="text-sm px-3 py-1 rounded-full bg-mainColor hover:bg-mainColor-dark hover:text-white transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Layout>
        );
    }
};

export default BlogDetails;

export const getServerSideProps = async (context) => {
    const { blog } = context.params;

    try {
        const i18nProps = await getI18nProps(context);

        // טיפול בעמודים סטטיים
        const hardCodedSlugs = Object.keys(HEBREW_ROUTES);
        if (hardCodedSlugs.includes(blog)) {
            return {
                props: {
                    pageKey: blog,
                    ...i18nProps,
                },
            };
        }

        const blogData = await BlogServices.getPublishedBlogBySlug(blog);

        if (!blogData) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                blog: blogData,
                ...i18nProps,
            },
        };
    } catch (error) {
        return {
            notFound: true,
        };
    }
};