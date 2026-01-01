// src/component/select/City.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useTranslations } from "next-intl";

const City = ({ setValue, placeholder }) => {
  const t = useTranslations();

  const [cities, setCities] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=100000"
      );
      const data = await response.json();
      let tempCities = []
      data.result.records.forEach(record => {
        tempCities.push(record)
      })
      setCities(tempCities.sort((a, b) => a.city_name_he.localeCompare(b.city_name_he, 'he')))
    })();
  }, []);

  const options = cities.map((city) => ({
    value: city,
    label: city.city_name_he
  }));

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3961ce' : provided.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px #3961ce' : provided.boxShadow,
      '&:hover': {
        borderColor: state.isFocused ? '#3961ce' : provided.borderColor,
      },
      padding: '5px',
      direction: 'rtl',
      textAlign: 'right',
    }),
    menu: (provided) => ({
      ...provided,
      direction: 'rtl', // שינוי כיוון הכתיבה בתפריט האופציות
      textAlign: 'right',
    }),
    option: (provided, state) => ({
      ...provided,
      textAlign: 'right',
      backgroundColor: state.isSelected ? '#3961ce' : state.isFocused ? '#f7f9ff' : provided.backgroundColor,
      '&:active': {
        backgroundColor: '#3961ce', // צבע הרקע כאשר לוחצים על האופציות
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      textAlign: 'right',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  // פונקציה לבדיקה אם המחרוזת היא JSON תקף
  const getPlaceholderText = () => {
    if (!placeholder) {
      return t('selectCity');
    }

    // בדיקה אם זה JSON תקף
    try {
      const parsed = JSON.parse(placeholder);
      // אם זה אובייקט עם city_name_he, נשתמש בו
      if (parsed && typeof parsed === 'object' && parsed.city_name_he) {
        return parsed.city_name_he;
      }
    } catch (e) {
      // אם זה לא JSON תקף, נשתמש במחרוזת כפי שהיא
      return placeholder;
    }

    return t('selectCity');
  };

  return (
    <Select
      options={options}
      onChange={(selectedOption) => setValue(selectedOption ? selectedOption.value : null)}
      placeholder={getPlaceholderText()}
      styles={customStyles}
      noOptionsMessage={() => t('noOptions')}
      isRtl={true}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="absolute"
    />
  );
};

export default City;