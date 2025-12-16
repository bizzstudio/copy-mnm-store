import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import parse from "html-react-parser";
import useUtilsFunction from "@hooks/useUtilsFunction";
import MinimalTitle from "@component/common/MinimalTitle";

const CMSkeleton = ({
  html,
  count,
  height,
  color,
  loading,
  error,
  data,
  highlightColor,
  isImage = false,
  title = '',
  subTitle = '',
}) => {
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <>
      {loading ? (
        <Skeleton
          count={count || 6}
          height={height || 25}
          // className="bg-gray-200"
          baseColor={color || "#f1f5f9"}
          highlightColor={highlightColor || "#cbd5e1"}
        />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : showingTranslateValue(title) || showingTranslateValue(subTitle) ? (
          <MinimalTitle title={title ? showingTranslateValue(title) : null} subtitle={subTitle ? showingTranslateValue(subTitle) : null} />
        ) : data ? (
          // if the data is an image
          isImage ? (
            <img src={data} alt="skeleton" className="h-28 mx-auto -mb-10 -mt-4" />
          ) :
            // if the data is text
            html ? (
              parse(showingTranslateValue(data))
            ) : (
              showingTranslateValue(data)
            )
      ) : null}
    </>
  );
};

export default CMSkeleton;
