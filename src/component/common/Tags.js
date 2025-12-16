import React from 'react';

const Tags = ({ product }) => {
  return (
    <>
      {product.tag.length !== 0 && (
        <div className="flex flex-row gap-1 flex-wrap mt-1">
          {JSON.parse(product?.tag).map((t, i) => (
            <span
              key={i + 1}
              className="bg-gray-100 border-0 text-gray-600 rounded-full inline-flex items-center justify-center px-3 py-1 text-xs font-semibold font-serif"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default Tags;
