// src/component/common/SortDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { HiOutlineSortAscending, HiOutlineSortDescending } from 'react-icons/hi';
import { BiSortAlt2 } from 'react-icons/bi';
import { AiOutlineHeart } from 'react-icons/ai';

const SortDropdown = ({ sortedField, setSortedField }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { 
      value: "Alphabetical", 
      label: t("common:sortAlphabetical"),
      icon: <BiSortAlt2 className="w-[17px] h-[17px]" />
    },
    { 
      value: "Low", 
      label: t("common:sortPriceLowToHigh"),
      icon: <HiOutlineSortAscending className="w-4 h-4 mt-[1px]" />
    },
    { 
      value: "High", 
      label: t("common:sortPriceHighToLow"),
      icon: <HiOutlineSortDescending className="w-4 h-4 mt-[2px]" />
    },
    { 
      value: "Popular", 
      label: t("common:sortByBestSelling"),
      icon: <AiOutlineHeart className="w-4 h-4 mt-[1px]" />
    },
  ];

  const selectedOption = sortOptions.find(option => option.value === sortedField);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value) => {
    setSortedField(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {/* Custom Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full min-w-[225px] px-3 py-2 bg-white 
            border-2 border-gray-200 rounded-xl
            text-sm font-medium text-gray-700
            hover:border-mainColor-dark hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-mainColor-dark/20 focus:border-mainColor-dark
            transition-all duration-200 ease-in-out
            flex items-center justify-between gap-3
            ${isOpen ? 'border-mainColor-dark shadow-lg ring-2 ring-mainColor-dark/20' : ''}
          `}
        >
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm font-medium me-1">
              {t("common:sortBy")}:
            </span>
            <span className="text-mainColor-dark">
              {selectedOption?.icon}
            </span>
            <span className="text-left">
              {selectedOption?.label}
            </span>
          </div>
          
          <span className={`text-mainColor-dark transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <FiChevronDown className="w-4 h-4" />
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    w-full px-4 py-3 text-sm font-medium text-left
                    hover:bg-mainColor-dark/5 hover:text-mainColor-dark
                    flex items-center gap-3 transition-all duration-150
                    ${sortedField === option.value 
                      ? 'bg-mainColor-dark/10 text-mainColor-dark border-r-4 border-mainColor-dark' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  <span className={`${sortedField === option.value ? 'text-mainColor-dark' : 'text-gray-400'}`}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown; 