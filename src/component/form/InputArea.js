import React, { useEffect } from "react";
import Label from "@component/form/Label";
import Cookies from "js-cookie";

const InputArea = ({
  name,
  label,
  type,
  Icon,
  register,
  defaultValue,
  autocomplete,
  placeholder,
  onChange = () => { },
  isRequired = true,
}) => {
  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  }

  useEffect(() => {
    const input = document.getElementById(name);
    if (input) {
      input.addEventListener('animationstart', (e) => {
        if (e.animationName === 'onAutoFillStart') {
          // Trigger onChange event with the current value
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      });
    }
  }, [name]);

  return (
    <>
      {label && <Label label={label} htmlFor={name} />}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-800 focus-within:text-gray-900 sm:text-base">
              <Icon />{" "}
            </span>
          </div>
        )}
        <input
          id={name}
          dir={currentLang ? 'rtl' : 'ltr'}
          {...register(`${name}`, {
            required: isRequired ? `${label} is required!` : false,
          })}
          type={type}
          pattern={type === 'tel' ? '[0-9]*' : undefined} // אפשור של מספרים בלבד
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete={autocomplete}
          onChange={(e) => {
            register(name).onChange(e);
            onChange(e);
          }}
          className={
            Icon
              ? "py-2 px-4 pl-10 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              : "py-2 px-4 md:px-5 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          }
        />
      </div>
    </>
  );
};

export default InputArea;