import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoBagHandle } from "react-icons/io5";
import ReactPaginate from "react-paginate";
import { FiZoomIn } from "react-icons/fi";
import { MdRestore } from "react-icons/md";
import { MdPayment } from "react-icons/md";

// Internal import
import Dashboard from "@pages/user/dashboard";
import OrderServices from "@services/OrderServices";
import Loading from "@component/preloader/Loading";
import { UserContext } from "@context/UserContext";
import OrderHistory from "@component/order/OrderHistory";
import { SidebarContext } from "@context/SidebarContext";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";
import useCart from "@hooks/useCart";
import ProductServices from "@services/ProductServices";
import { notifyError, notifySuccess } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import SubModal from "@component/modal/SubModal";
import addingToCart from 'public/addingToCart.svg'

const MyOrders = () => {
  const router = useRouter();
  const { state: { userInfo } } = useContext(UserContext);
  const { currentPage, handleChangePage, isLoading, setIsLoading } = useContext(SidebarContext);
  const { emptyCart, items } = useCart();
  const { handleAddItem } = useAddToCart();

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [totalItems, setTotalItems] = useState(0); // המספר הכולל של הפריטים
  const { totalItems: addedItems } = useCart(); // מספר הפריטים שנוספו כבר לעגלה


  useEffect(() => {
    OrderServices.getOrderCustomer({
      page: currentPage,
      limit: 8,
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        // בדיקת התגובה מהשרת להצגת ההודעה בעברית
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message);
        }
      });
  }, [currentPage]);

  const pageCount = Math.ceil(data?.totalDoc / 8);

  useEffect(() => {
    setIsLoading(false);
    if (!userInfo) {
      router.push("/");
    }
  }, [userInfo]);

  const restoreOrder = async (order) => {
    try {
      setLoadingRestore(true);
      const itemsNotInCartYet = order?.cart?.filter(oldItem => !items.some(item => item.sku === oldItem.sku));
      setTotalItems(addedItems + itemsNotInCartYet.reduce((acc, item) => acc + item.quantity, 0));
      const missingProducts = [];

      // מעבר על כל מוצר בעגלה של ההזמנה הישנה (חוץ מאלו שכבר נמצאים בעגלה הנוכחית)
      for (const item of itemsNotInCartYet) {
        const productSku = item.sku;

        // משיכת פרטי המוצר המעודכנים מהדטאבייס
        const [data] = await Promise.all([
          ProductServices.getShowingStoreProducts({
            category: "",
            sku: productSku,
          }),
        ]);

        const product = data?.products?.find((p) => p.sku === productSku);

        if (!product) {
          missingProducts.push(item);
          continue;
        }

        // חישוב מלאי המוצר
        let stock = 0;
        if (product?.manageStock === false) {
          stock = 9999;
        } else if (product?.stocks && Array.isArray(product.stocks) && product.stocks.length > 0) {
          stock = product.stocks.reduce((sum, stockItem) => sum + (stockItem?.quantity || 0), 0);
        }

        const productPrice = product?.prices?.[0];
        const price = productPrice?.salePrice || productPrice?.price || 0;
        const originalPrice = productPrice?.price || 0;
        const img = product.image?.[0];

        const { categories, description, ...updatedProduct } = product;
        const newItem = {
          ...updatedProduct,
          id: product._id,
          title: product.title,
          image: img,
          price: price,
          originalPrice: originalPrice,
        };

        if (stock >= item.quantity) {
          handleAddItem(newItem, item.quantity);
        } else {
          notifyError(`Not enough stock for ${showingTranslateValue(product.title)}.`);
        }
      }

      // שמירת המוצרים החסרים בלוקל סטורג'
      localStorage.setItem("missingProducts", JSON.stringify(missingProducts));

      // ניתוב לעמוד הצ'קאאוט
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to restore order:", error);
      notifyError("Failed to restore order. Please try again later.");
    }
  };

  const handleRowClick = (orderId) => {
    router.push(`/order/${orderId}`);
  };

  return (
    <>
      {loadingRestore && (
        <SubModal modalOpen={loadingRestore}>
          <div className="px-9 pb-10 pt-7 flex flex-col gap-4">
            <img src={addingToCart.src} alt="Adding to cart image" className="h-56 mr-[13%] up-down-animation" />
            <h2 className="text-xl font-serif font-semibold text-center">
              {t("common:addingItemsToCart", { x: addedItems, y: totalItems })}
            </h2>
          </div>
        </SubModal>
      )}
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Dashboard
          title={showingTranslateValue(storeCustomizationSetting?.dashboard?.my_order)}
          description="This is user order history page"
        >
          <div className="overflow-hidden rounded-md font-serif">
            {loading ? (
              <Loading loading={loading} />
            ) : error ? (
              <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
                {error}
              </h2>
            ) : data?.orders?.length === 0 ? (
              <div className="text-center">
                <span className="flex justify-center my-30 pt-16 text-blackfont-semibold text-6xl text-mainColor">
                  <IoBagHandle />
                </span>
                <h2 className="font-medium text-md my-4 text-gray-600">
                  {t("common:noOrder")}
                </h2>
              </div>
            ) : (
              <div className="flex flex-col">
                <h2 className="text-xl font-serif font-semibold mb-5">
                  {t("common:footer-my-account-myOrders")}
                </h2>
                <div className="flex md:hidden gap-2 justify-between w-full mb-5">
                  <div
                    className="flex flex-grow gap-1 items-center justify-center mx-auto px-3 py-1 bg-mainColor-light text-xs text-mainColor-dark font-semibold rounded-full cursor-auto text-center"
                  >
                    <MdPayment size={17} /> <span>=</span>
                    {t("common:payNow")}
                  </div>
                  <div
                    className="flex flex-grow gap-1 items-center justify-center px-3 py-1 bg-mainColor-light text-xs text-mainColor-dark font-semibold rounded-full cursor-auto text-center"
                  >
                    <MdRestore size={17} /> <span>=</span>
                    {t("common:Reorder")}
                  </div>
                </div>
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="align-middle inline-block border border-gray-100 rounded-md min-w-full pb-2 sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b last:border-b-0 border-gray-100 rounded-md">
                      <table className="table-auto min-w-full border border-gray-100 divide-y divide-gray-200">
                        <thead className="bg-mainColor-superLight">
                          <tr className="bg-gray-100">
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider hidden md:block"
                            >
                              {t("common:orderId")}
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              {t("common:orderTime")}
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider hidden md:block"
                            >
                              {t("common:method")}
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              {t("common:Status")}
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              {t("common:total")}
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold md:px-6 px-2 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              {t("common:action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data?.orders?.map((order) => (
                            <tr key={order._id} onClick={() => handleRowClick(order._id)} className="cursor-pointer hover:bg-mainColor-superLight">
                              <OrderHistory order={order} />
                              <td className="px-1 md:px-5 py-3 whitespace-nowrap text-center text-sm">
                                {order?.status?.name === "Pending" ? (
                                  <>
                                    <button
                                      disabled={loadingRestore}
                                      className="hidden md:flex gap-1 items-center mx-auto px-3 py-1 bg-red-100 text-xs text-red-700 hover:bg-red-500 hover:text-white transition-all font-semibold rounded-full"
                                      onClick={(e) => { e.stopPropagation(); restoreOrder(order); }}
                                    >
                                      <MdPayment size={17} />
                                      {t("common:payNow")}
                                    </button>
                                    <button
                                      disabled={loadingRestore}
                                      className="flex md:hidden gap-1 items-center mx-auto px-3 py-1 bg-red-100 text-xs text-red-700 hover:bg-red-500 hover:text-white transition-all font-semibold rounded-full"
                                      onClick={(e) => { e.stopPropagation(); restoreOrder(order); }}
                                    >
                                      <MdPayment size={17} />
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex gap-2 items-center justify-center">
                                    <button
                                      disabled={loadingRestore}
                                      className="hidden md:flex gap-1 items-center px-3 py-1 bg-red-100 text-xs text-red-700 hover:bg-red-500 hover:text-white transition-all font-semibold rounded-full"
                                      onClick={(e) => { e.stopPropagation(); restoreOrder(order); }}
                                    >
                                      <MdRestore size={17} />
                                      {t("common:Reorder")}
                                    </button>
                                    <button
                                      disabled={loadingRestore}
                                      className="flex md:hidden gap-1 items-center px-3 py-1 bg-red-100 text-xs text-red-700 hover:bg-red-500 hover:text-white transition-all font-semibold rounded-full"
                                      onClick={(e) => { e.stopPropagation(); restoreOrder(order); }}
                                    >
                                      <MdRestore size={17} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data?.totalDoc > 10 && (
                        <div className="paginationOrder">
                          <ReactPaginate
                            breakLabel="..."
                            nextLabel={t("common:next")}
                            onPageChange={(e) => handleChangePage(e.selected + 1)}
                            pageRangeDisplayed={3}
                            pageCount={pageCount}
                            previousLabel={t("common:previous")}
                            renderOnZeroPageCount={null}
                            pageClassName="page--item"
                            pageLinkClassName="page--link"
                            previousClassName="page-item"
                            previousLinkClassName="page-previous-link"
                            nextClassName="page-item"
                            nextLinkClassName="page-next-link"
                            breakClassName="page--item"
                            breakLinkClassName="page--link"
                            containerClassName="pagination"
                            activeClassName="activePagination"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dashboard>
      )}
    </>
  );
};

export default MyOrders;
