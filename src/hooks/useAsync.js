import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const useAsync = (asyncFunction) => {
  const [data, setData] = useState([] || {});
  const [error, setError] = useState("");
  const [errCode, setErrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    (async () => {
      try {
        const res = await asyncFunction({ cancelToken: source.token });
        if (!unmounted) {
          setData(res);
          // console.log("res", res);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.log(err)
        setErrCode(err?.response?.status);
        if (!unmounted) {
          console.log(err.message);
          // בדיקה אם יש הודעת שגיאה מותאמת מהשרת
          if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(err.message);
          }
          
          if (axios.isCancel(err)) {
            setError(err.message);
            setLoading(false);
            setData({});
          } else {
            // console.log('another error happened:' + err.message);
            setError(err.message);
            setLoading(false);
            setData({});
          }
        }
      }
    })();

    return () => {
      unmounted = true;
      source.cancel("Cancelled in cleanup");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [currentPage]);
  }, []);

  useEffect(() => {
    if (errCode === 401) {
      Cookies.remove("userInfo");
      window.location.replace(`${process.env.NEXT_PUBLIC_STORE_DOMAIN}`);
    }
  }, [errCode]);

  return {
    data,
    error,
    loading,
  };
};

export default useAsync;
