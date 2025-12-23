// src/pages/blogs/index.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "@layout/Layout";
import BlogCard from "@component/blog/BlogCard";
import BlogServices from "@services/BlogServices";
import MinimalTitle from "@component/common/MinimalTitle";
import Loading from "@component/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import useTranslation from "next-translate/useTranslation";

const BlogsPage = ({ initialBlogs, totalBlogs, category, tag }) => {
    const { t } = useTranslation();
    const { isLoading, setIsLoading } = useContext(SidebarContext);
    const router = useRouter();

    // נשמור כאן את כל המאמרים מכל העמודים
    const [allBlogs, setAllBlogs] = useState(initialBlogs || []);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    // state לניהול page = עמוד נוכחי
    const [page, setPage] = useState(1);

    // האם יש עוד מאמרים בעמוד הבא?
    const [hasMore, setHasMore] = useState(totalBlogs > (initialBlogs?.length || 0));

    // ref לאלמנט האחרון
    const observerTarget = useRef(null);

    const pageTitle = t("common:blogsTitle");
    const pageSubtitle = tag ? `#${tag}` : category ? `#${category}` : t("common:allBlogs");

    useEffect(() => {
        setIsLoading(false);
    }, [initialBlogs]);

    // איפוס כשמשנים קטגוריה או תגית
    useEffect(() => {
        setAllBlogs(initialBlogs || []);
        setPage(1);
        setHasMore(totalBlogs > (initialBlogs?.length || 0));
    }, [category, tag, initialBlogs, totalBlogs]);

    // הוספת Intersection Observer
    useEffect(() => {
        if (!hasMore || isLoadMore || isInitialLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting) {
                    handleLoadMore();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, isLoadMore, page, allBlogs, isInitialLoading]);

    // טעינת עמודים נוספים
    const handleLoadMore = async () => {
        if (isLoadMore || !hasMore) return;

        const nextPage = page + 1;
        setIsLoadMore(true);

        try {
            const res = await BlogServices.getPublishedBlogs({
                page: nextPage,
                limit: 9,
                category: category || "",
                tag: tag || ""
            });

            // אם אין מאמרים בעמוד הבא, סוגרים hasMore
            if (!res.blogs || res.blogs.length < 9) {
                setHasMore(false);
            } else {
                // מוסיפים את המאמרים החדשים למערך
                setAllBlogs(prev => [...prev, ...res.blogs]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Load More blogs error: ", err);
            setHasMore(false);
        } finally {
            setIsLoadMore(false);
        }
    };

    return (
        <Layout title={pageTitle} description={pageTitle}>
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 2xl:pt-0 lg:pt-10">
                <div className="flex flex-col py-5 gap-6">
                    <div className="flex justify-between gap-3 items-center my-3 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                        <MinimalTitle title={pageTitle} subtitle={pageSubtitle} />
                        <h6 className="text-sm font-serif">
                            {t("common:totalI")} <span className="font-bold">{totalBlogs}</span> {t("common:itemsFound")}
                        </h6>
                    </div>

                    {isInitialLoading ? (
                        <Loading loading={isInitialLoading} />
                    ) : !allBlogs?.length ? (
                        <div className="flex flex-col items-center text-center align-middle mx-auto p-5 my-5">
                            <Image
                                className="my-4"
                                src="/noBlogsFound.svg"
                                alt="no-result"
                                width={380}
                                height={380}
                            />
                            <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                                {t("common:noBlogsFound")}
                            </h2>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {allBlogs.map((blog) => (
                                    <BlogCard key={blog._id} blog={blog} />
                                ))}
                            </div>

                            {/* אלמנט המעקב לגלילה */}
                            <div ref={observerTarget} />

                            {/* אינדיקטור טעינה */}
                            {isLoadMore && (
                                <div className="w-full py-4 mt-4" style={{ minHeight: '100px' }}>
                                    <Loading loading={isLoadMore} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BlogsPage;

export const getServerSideProps = async (context) => {
    const { category = "", tag = "" } = context.query;

    try {
        const data = await BlogServices.getPublishedBlogs({
            page: 1,
            limit: 9,
            category,
            tag
        });

        return {
            props: {
                initialBlogs: data?.blogs || [],
                totalBlogs: data?.totalBlogs || 0,
                category: category || null,
                tag: tag || null,
            },
        };
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return {
            props: {
                initialBlogs: [],
                totalBlogs: 0,
                category: category || null,
                tag: tag || null,
            },
        };
    }
};