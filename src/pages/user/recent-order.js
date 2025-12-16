import React, { useContext } from "react";
import { IoBagHandle } from "react-icons/io5";
import ReactPaginate from "react-paginate";
import { SidebarContext } from "@context/SidebarContext";
import { useRouter } from "next/router";

// Internal import
import Loading from "@component/preloader/Loading";
import OrderHistory from "@component/order/OrderHistory";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";

const RecentOrder = ({ data, loading, error }) => {
  const router = useRouter();
  const { handleChangePage } = useContext(SidebarContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const pageCount = Math.ceil(data?.totalDoc / 8);

  const handleRowClick = (orderId) => {
    router.push(`/order/${orderId}`);
  };

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <div className="rounded-md font-serif">
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
              <h3 className="text-lg font-serif font-medium mb-5">
                {showingTranslateValue(
                  storeCustomizationSetting?.dashboard?.recent_order
                )}
              </h3>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.orders?.map((order) => (
                          <tr key={order._id} onClick={() => handleRowClick(order._id)} className="cursor-pointer hover:bg-mainColor-superLight">
                            <OrderHistory order={order} />
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
      </div>
    </>
  );
};

export default RecentOrder;
