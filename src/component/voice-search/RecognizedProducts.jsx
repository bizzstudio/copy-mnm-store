// src/component/voice-search/RecognizedProducts.jsx
import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import VoiceSearchItem from './VoiceSearchItem';
import productsImg from 'public/productsImg.svg';
import Image from 'next/image';

const RecognizedProducts = ({ products, isProcessing, onQuantityChange, onRemoveProduct }) => {
  const { t } = useTranslation();

  if (!products || products.length === 0) {
    return (
      <div className="h-full border p-2 border-gray-200 rounded-lg text-center py-4 flex flex-col items-center justify-center gap-1.5 text-lg font-semibold text-gray-400">
        <Image src={productsImg} alt="products" width={110} height={110} className='sm:block hidden object-contain' />
        {t('common:theProductsWillBeDisplayedHere')}...
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-blacktext-center">
        {products.length} {t('common:voiceSearchRecognizedProducts')}
      </h3>
      
      <div className="sm:max-h-44 max-h-fit overflow-y-auto border border-gray-200 rounded-lg bg-white">
        {products.map((product) => (
          <VoiceSearchItem
            key={product._id}
            item={product}
            currency="₪"
            onQuantityChange={onQuantityChange}
            onRemove={onRemoveProduct}
          />
        ))}
      </div>

      {isProcessing && (
        <div className="text-center py-2 text-mainColor">
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-mainColor me-2"></span>
          {t('common:processing')}...
        </div>
      )}
    </div>
  );
};

export default RecognizedProducts; 