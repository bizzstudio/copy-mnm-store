import { notifyError } from "@utils/toast";
import Cookies from "js-cookie";
import React, { useEffect } from "react";

const Error = ({ errorName, notifyMsg = '' }) => {

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

  const translateError = (error) => {
    if (!error) return;
    if (errorName?.type == "required") {
      if (currentLang) {
        return "שדה זה חובה"
      } else {
        return "This field is required"
      }
    } else {
      return error;
    }
  };

  useEffect(() => {
    if (notifyMsg) {
      notifyError(notifyMsg)
    }
  }, [notifyMsg, errorName])
  

  return (
    <>
      {errorName && (
        <span className="text-red-400 text-sm mt-2">{
          translateError(
          errorName.message
          )
        }</span>
      )}
    </>
  );
};

export default Error;
