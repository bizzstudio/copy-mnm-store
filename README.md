================================================================================
BizzExpo
SYSTEM README FOR NEW DEVELOPERS
================================================================================
Generated from actual codebase analysis. Do not guess; refer to this document
and the code when making changes.

================================================================================
1. SYSTEM OVERVIEW
================================================================================

WHAT THE SYSTEM DOES
--------------------
- E-commerce and B2B order management: products, categories, price lists,
  customer accounts (MainCustomer + sub-users), orders, payments, deliveries.
- Admin dashboard (mnm-admin): staff management, products, categories, offers,
  coupons, orders, cashier orders, customers, statuses, settings, store
  customization, popups, WhatsApp bot (messages), blogs, price lists,
  Rivhit documents (invoices, receipts, credit notes, delivery notes).
- Customer-facing store (mnm-store): browse products, cart, checkout,
  card payment (Cardcom or iCredit), guest/registered orders, user dashboard,
  blogs, offers, cashier-desk (in-store), voice search.
- Backend (mnm-backend): REST API, MongoDB, JWT auth (admin, customer, app/cashier,
  WhatsApp server), payment webhooks, email (nodemailer), stock alerts (cron),
  Rivhit API (invoicing), optional WhatsApp/LionWheel integrations.

HIGH-LEVEL ARCHITECTURE
-----------------------
- Three main codebases under BizzExpo/:
  - mnm-backend   = Node.js (Express 5) API server, entry api/index.js
  - mnm-admin     = React (Vite) SPA, port 4105, admin panel
  - mnm-store     = Next.js 16 SSR/SPA, customer store (Vercel: mnm-store.vercel.app)
- Backend is single entry point; all API routes are under /api/*.
- Admin and store both call the same backend base URL (each has its own env var).
- Payment flow: store checkout -> backend creates Pending order -> redirect to
  gateway (Cardcom or iCredit) -> gateway calls webhook -> backend finalizes
  order (status, stock, email).

HOW FRONTEND AND BACKEND COMMUNICATE
------------------------------------
- HTTP REST: admin uses axios (VITE_APP_API_BASE_URL), store uses axios
  (NEXT_PUBLIC_API_BASE_URL). Auth via Bearer token in Authorization header
  (admin: adminInfo.token in cookie; store: userInfo.token in cookie).
- Admin and store use Socket.io client (VITE_APP_API_SOCKET_URL /
  NEXT_PUBLIC_API_SOCKET_URL) for real-time notifications; the backend
  package.json includes socket.io but the current api/index.js does NOT
  attach an Socket.io server to the HTTP server—so either a separate
  socket server exists elsewhere or this is prepared for future use.

EXTERNAL INTEGRATIONS (from code)
---------------------------------
- MongoDB (MONGO_URI).
- AWS S3: file uploads (AMAZON_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET).
- Payment: Cardcom or iCredit (selected by PAYMENT_GATEWAY); webhooks on
  /api/payments/cardcom/webhook/:orderId and /api/payments/icredit/ipn/:orderId.
- Rivhit: invoicing API (RIVHIT_API_TOKEN, RIVHIT_API_TOKEN_TEST, VAT_PERCENTAGE).
- Email: SMTP (HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS).
- Optional: Imgur (KIRSHNER_IMGUR_CLIENT_ID), WhatsApp server
  (KIRSHNER_WHATSAPP_API_KEY, KIRSHNER_WHATSAPP_URL), LionWheel (LIONWHEEL_KEY),
  Google OAuth (store: NEXT_PUBLIC_GOOGLE_CLIENT_ID / admin store setting),
  Hotjar (store, hardcoded siteId), Flashy (store: NEXT_PUBLIC_FLASHY_*),
  Facebook Pixel (store: NEXT_PUBLIC_FACEBOOK_PIXEL_ID, commented in _app.js).

================================================================================
2. BACKEND ARCHITECTURE (mnm-backend)
================================================================================

ENTRY POINT
-----------
- File: api/index.js
- Loads dotenv, connects DB (config/db.js), starts stock alert cron
  (jobs/stockAlertJob.js), mounts all routes, global error middleware,
  listens on PORT (default 5000). No Socket.io server attached in this file.

ROUTING STRUCTURE
-----------------
All routes are under /api. Mount order in index.js:

  /                     -> GET health check
  /api/upload           -> POST (isAuth) multipart -> S3 upload (utils/awsUploader)
  /api/products/       -> productRoutes
  /api/offers/         -> offerRoutes
  /api/category/       -> categoryRoutes
  /api/coupon/         -> couponRoutes
  /api/customer/       -> customerRoutes
  /api/order/          -> customerOrderRoutes (store: add order, get order/customer orders)
  /api/cashier-orders/ -> cashierOrderRoutes
  /api/attributes/     -> attributeRoutes
  /api/setting/        -> settingRoutes
  /api/currency/       -> currencyRoutes (isAuth)
  /api/language/       -> languageRoutes
  /api/notification/   -> notificationRoutes (isAuth)
  /api/deliveries      -> deliveryRoutes
  /api/popup           -> popupRoutes
  /api/message         -> messageRoutes (WhatsApp bot)
  /api/blog/           -> blogRoutes
  /api/payments/       -> paymentsRoutes (webhooks only: cardcom, icredit)
  /api/rivhit          -> rivhitDocumentsRoutes
  /api/admin/          -> adminRoutes (login, forgot password, MFA, staff, etc.)
  /api/orders/         -> orderRoutes (admin order management, refunds; isAdmin or isWhatsappServer)
  /api/status/         -> statusRoutes (isAdmin)
  /api/price-list/     -> priceListRoutes (isAdmin)
  /api/app/login       -> loginApp (Status-based app login)
  /api/app/orders/     -> appOrderRoutes (isApp)

CONTROLLERS AND RESPONSIBILITIES
--------------------------------
- productController: CRUD products, getShowingProducts, getShowingStoreProducts,
  getProductBySlug, findProductByTranscript (voice), getFacebookFeedCSV,
  updateProductPrice, updateManyProducts, status, delete single/many.
- offerController: CRUD offers, get active/inactive (env GET_NOT_ACTIVE_OFFERS).
- customerController: register, login, verify email, forgot/reset password,
  get profile, update, createGuestCustomer (middleware for guest orders).
- customerAdminController: admin-side customer operations (e.g. unpaid balance).
- customerOrderController: addOrder (auth), addOrder guest (createGuestCustomer),
  getOrderById, getOrderCustomer; validates cart (stock, price, barcode
  restrictions), applies offers/coupons, calls createCheckout or createCreditOrder.
- orderController: admin list/update orders, status changes, refunds, surveys,
  WhatsApp error report, LionWheel task create (if LIONWHEEL_KEY), etc.
- cashierOrderController: cashier-order CRUD and flow (getNotActiveOffers).
- adminController: login, forgot password, reset password, MFA (signTempMfaToken,
  verifyTrustedDeviceToken), add staff, etc.
- paymentsController: handleProviderWebhook — single handler for Cardcom and
  iCredit; verifies token and provider payload, then finalizePaidOrder.
- settingController: get/update settings, store customization, scripts, SEO.
- categoryController, couponController, attributeController, deliveryController,
  popupController, messageController, blogController, notificationController,
  languageController, currencyController, statusController, priceListController,
  rivhitDocumentsController: standard CRUD or domain-specific actions.

SERVICES LAYER (BUSINESS LOGIC)
-------------------------------
- services/orderPaymentService.js: createCheckout(orderData, customer, ...).
  Creates Pending order, builds customer snapshot, gets active payment provider
  (paymentFactory), creates payment URL (Cardcom or iCredit).
- services/orderFinalizeService.js: finalizePaidOrder(orderId, provider,
  verifiedData, webhookBody). Idempotent: checks isPaid, updates order (status
  Paid, provider-specific fields), handles stock (handleProductQuantity),
  coupon usage, sendOrderNotificationEmail, logStatusChange.
- services/orderServices.js: createCreditOrder, status transitions, product
  quantity, email notifications.
- services/rivhitDocuments*.js: Rivhit document issue/fetch (invoice, receipt,
  delivery note, credit invoice); rivhitCustomerService for customer sync.
- payments/paymentFactory.js: getPaymentProvider(name), getActivePaymentProvider()
  (from PAYMENT_GATEWAY env).
- payments/providers/cardcomProvider.js, icreditProvider.js: createPaymentUrl,
  verifyWebhook, getOrderWebhookToken.

DATABASE STRUCTURE AND MODELS
-----------------------------
- MongoDB via Mongoose. Connection: config/db.js (connectDB, MONGO_URI).
- Models (models/*.js): Admin, Application, Attribute, Blog, Category, Coupon,
  Currency, Customer (ref MainCustomer), Delivery, Language, MainCustomer,
  Message, Notification, Offer, Order (ref Customer, MainCustomer, Status;
  cart, user_info, delivery, paymentMethod, paymentProvider, status, invoice,
  cardcom/icredit sub-docs, rivhit docs), Popup, PriceList, Product (categories,
  prices by PriceList, stock, slug, barcode, status, etc.), Setting, Status,
  CashierOrder.
- Customer belongs to MainCustomer; Order has both user (Customer) and
  mainCustomer (MainCustomer). Price lists and permitted barcodes are on
  MainCustomer.

AUTHENTICATION / AUTHORIZATION FLOW
-----------------------------------
- config/auth.js:
  - signInToken(user, mainCustomer): JWT with JWT_SECRET, 14d (customer/admin).
  - tokenForVerify: JWT_SECRET_FOR_VERIFY, 15m (email verification links).
  - isAuth: Bearer token required; sets req.user.
  - isAdmin: Bearer token + role Admin/CEO + Admin document exists.
  - isApp: Bearer token (Status login for app/cashier).
  - loginApp: body phone+password, validates Status, returns token.
  - isWhatsappServer: Admin Bearer OR x-api-key === KIRSHNER_WHATSAPP_API_KEY.
  - isCashier: Bearer token, decoded.isCashier must be true.
  - extractUserDetails: optional auth; sets req.user or {}.
  - signTempMfaToken (JWT_SECRET_MFA), signTrustedDeviceToken /
    verifyTrustedDeviceToken (JWT_SECRET_TRUSTED).
- Admin login: adminRoutes -> adminController; token stored in cookie
  (adminInfo) on frontend.
- Customer login: customerRoutes -> customerController; token in cookie
  (userInfo) on store.
- Guest orders: createGuestCustomer middleware creates/assigns guest customer
  then addOrder runs.

MIDDLEWARE RESPONSIBILITIES
---------------------------
- express.json(4mb), helmet, cors, urlencoded in api/index.js.
- Auth middlewares above; route-level (e.g. isAdmin on admin/orders/status/
  price-list, isAuth on customer order, upload, currency, notification).
- Global error middleware: (err, req, res, next) -> 400 with err.message.

ENVIRONMENT VARIABLES (BACKEND)
------------------------------
Required / important (from code scan):
  MONGO_URI
  PORT (default 5000)
  JWT_SECRET
  JWT_SECRET_FOR_VERIFY
  JWT_SECRET_MFA
  JWT_SECRET_TRUSTED
  COMPANY_NAME
  STORE_URL (customer store base URL for links and redirects)
  API_BASE_URL (backend base URL for webhook URLs)
  EMAIL: HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS
  ADMINS_EMAILS (comma-separated), EMAIL_USER fallback
  OUR_EMAIL (e.g. for WhatsApp error report)
  AWS: AMAZON_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET
  Payment: PAYMENT_GATEWAY (icredit|cardcom)
  iCredit: ICREDIT_ENV (prod/test), ICREDIT_PAYMENT_PAGE_TOKEN,
    ICREDIT_PAYMENT_PAGE_TOKEN_TEST
  Cardcom: CARDCOM_ENV, CARDCOM_TERMINAL_NUMBER(_TEST), CARDCOM_API_NAME,
    CARDCOM_API_PASSWORD, CARDCOM_API_NAME_TEST
  Rivhit: RIVHIT_API_TOKEN, RIVHIT_API_TOKEN_TEST, VAT_PERCENTAGE
  Optional: GET_NOT_ACTIVE_OFFERS (true to include inactive offers in store/app)
  Optional: KIRSHNER_IMGUR_CLIENT_ID, KIRSHNER_WHATSAPP_API_KEY,
    KIRSHNER_WHATSAPP_URL, LIONWHEEL_KEY, SURVEY_DAYS_BACK, ENV (dev/prod),
    ADMIN_URL (admin panel URL for reset-password link)

EXTERNAL APIs / INTEGRATIONS
----------------------------
- Rivhit: utils/rivhit.js (documentNew, receiptNew, documentList, receiptList,
  customerGet, customerNew); services/rivhitDocuments*.
- iCredit: utils/icredit.js; payments/providers/icreditProvider.js.
- Cardcom: utils/cardcom.js; payments/providers/cardcomProvider.js.
- Email: lib/email-sender/sender.js (sendEmail, sendEmailSilent, rate limits
  for password/MFA/OTP); templates under lib/email-sender/templates/.

ERROR HANDLING STRUCTURE
-------------------------
- Global handler in api/index.js: 400 JSON with err.message; checks
  res.headersSent before sending.
- Controllers use try/catch and res.status(...).send(...) or .json(...).
- No centralized error code enum; messages often bilingual (he/en) in
  auth and email.

IMPORTANT UTILITIES / HELPERS
-----------------------------
- utils/priceUtils.js: getFinalPrice(product, customer) for price list.
- utils/offerCalculations.js: findOptimalOfferCombination.
- utils/productHelpers.js: generateProductSlug, etc.
- utils/importProducts.js, productHelpers: import products.
- utils/queryUtils.js: normalizeQueryValue.
- utils/voiceParser.js: parseText, generateHebrewVariations (voice search).
- utils/date.js: dayjs-based.
- utils/awsUploader.js: uploadFileToS3 (multer + S3).
- utils/imgurUploader.js: multer config (Imgur used in productController
  for Facebook feed in one place; upload route uses S3).
- utils/rivhit*.js: Rivhit types and helpers.
- utils/logStatusChange.js: status change logging.
- lib/stock-controller/others.js: handleProductQuantity.

================================================================================
3. FRONTEND ARCHITECTURE
================================================================================

--- 3A. ADMIN (mnm-admin) ---

ENTRY POINT
-----------
- src/main.jsx: ReactDOM.createRoot, registerSW (PWA), Provider (Redux),
  PersistGate (redux-persist), AdminProvider, SidebarProvider, Windmill theme,
  App. Imports tailwind + custom CSS, rc-tree and skeleton CSS, i18n.

ROUTING STRUCTURE
----------------
- react-router-dom in App.jsx. Routes:
  /, /login -> Login or redirect to /dashboard if adminInfo exists
  /forgot-password, /reset-password/:token, /mfa
  Private route (Layout) with nested routes from src/routes/index.js:
  /dashboard, /products, /product/:id, /deliveries, /deliveries/:id,
  /attributes, /attributes/:id, /categories, /categories/:id, /offers,
  /languages, /currencies, /customers, /customer/add, /customer/:id,
  /customer-order/:id, /our-staff, /orders, /order/:id, /cashier-orders,
  /cashier-order/:id, /statuses, /status/:id, /coupons, /settings,
  /store/customization, /store/store-settings, /store/scripts, /popups,
  /whatsappbot, /blogs, /price-lists, /edit-profile, /404, /coming-soon
- PrivateRoute: checks AdminContext.adminInfo; redirects to /login if missing.

MAIN PAGES
----------
Dashboard, Products, ProductDetails, Category, ChildCategory, Offers,
Attributes, ChildAttributes, Customers, CustomerAdd, CustomerPage, CustomerOrder,
Orders, OrderInvoice, CashierOrders, CashierOrderInvoice, Statuses, StatusInvoice,
Coupons, Deliveries, DeliveryEdit, Setting, StoreHome (customization),
StoreSetting, Scripts, Popups, Messages (WhatsApp), Blogs, PriceLists,
Staff, Languages, Currencies, EditProfile, Login, ForgotPassword, ResetPassword,
MFA, 404, ComingSoon.

COMPONENT HIERARCHY
-------------------
- App -> Router -> Routes -> PrivateRoute -> Layout (Main, Sidebar, Outlet)
  or public (Login, ForgotPassword, etc.). Layout uses Main.jsx, Sidebar,
  SidebarToggle; Outlet renders matched route component.
- Sidebar content from routes/sidebar.js. Many feature pages use drawers
  (e.g. ProductDrawer, PriceListDrawer), modals, tables, forms.

STATE MANAGEMENT
----------------
- Redux (reduxStore/store.js): combineReducers(setting, data); persisted with
  redux-persist (localStorage). Slices: settingSlice, dynamicDataSlice.
- AdminContext (context/AdminContext.jsx): adminInfo in cookie + reducer
  (USER_LOGIN, USER_LOGOUT). Used for auth and PrivateRoute.

API COMMUNICATION LAYER
-----------------------
- src/services/httpService.js: axios instance, baseURL from
  import.meta.env.VITE_APP_API_BASE_URL. Request interceptor adds
  Authorization: Bearer <adminInfo.token> and company cookie. Methods:
  get, post, put, patch, delete.
- Feature-specific services: AdminServices, ProductServices, OrderServices,
  CustomerServices, SettingServices, etc., calling httpService and
  returning promises.

REUSABLE COMPONENTS / HOOKS
---------------------------
- Hooks: useExport, useProductSubmit, usePriceListSubmit, usePriceListImport,
  useStoreHomeSubmit, useUtilsFunction, useTranslationValue, useToggleDrawer,
  useStoreSettingSubmit, useStatusSubmit, useStaffSubmit, useSettingSubmit,
  useScriptsSubmit, useQuery, useProductFilter, usePopupSubmit, useOfferSubmit,
  useNotification (socket), useMessageSubmit, useLoginSubmit, useLanguageSubmit,
  useInvoiceReceiptSubmit, useImport, etc.
- Components: modal (e.g. ImportResultsModal), drawer (ProductDrawer,
  PriceListDrawer), invoice (InvoiceForPrint), settings (StoreSetting),
  store-home (HomePage), sidebar, theme (ThemeSuspense).

STYLING
-------
- Tailwind CSS (tailwind.config.js, PostCSS). Windmill UI (@windmill/react-ui),
  custom theme (assets/theme/myTheme). custom.css, rc-tree and skeleton CSS.

ENVIRONMENT CONFIGURATION (ADMIN)
---------------------------------
- Vite: import.meta.env. VITE_APP_API_BASE_URL (backend), VITE_APP_API_SOCKET_URL
  (proxy in vite.config server.proxy), VITE_APP_STORE_DOMAIN, VITE_APP_LIKUTAPP_DOMAIN,
  VITE_APP_ENVIRONMENT, VITE_APP_KIRSHNER_WHATSAPP_SOCKET_URL.

--- 3B. STORE (mnm-store) ---

ENTRY POINT
-----------
- Next.js: pages/_app.js wraps all pages. Providers: NextIntlClientProvider,
  GoogleOAuthProvider, UserProvider, Redux Provider, PersistGate,
  SidebarProvider, UserScopedCartProvider (react-use-cart with user-scoped
  storage; migrates guest cart to user on login). Loads store settings and
  scripts (getStoreSetting, getStoreScripts), injects dynamic head/body
  scripts (sanitized). Route change tracking: Flashy, GA4, Meta Pixel.
  Hotjar init (hardcoded siteId). Redirect /product-category/מבצעים -> /offers.

ROUTING STRUCTURE
-----------------
- File-based (pages/): index.js (home), product/[slug].jsx, product-category/
  [categoryName].jsx, product-category/.../[subCategoryName].jsx, search.jsx,
  offers.js, offer.js, contact-us, checkout.jsx, order/[id].js, user/
  (dashboard, update-profile, my-orders, recent-order, change-password,
  forget-password/[token], email-verification/[token]), success/index.jsx,
  failed/index.jsx, blogs/index.jsx, [blog].jsx, terms-and-conditions,
  privacy-policy, about-us, faqs, accessibility-statement, cashier-desk.jsx,
  loading.jsx, 404.js, _offline.js. API routes: api/sitemap.js, api/manifest.js.

MAIN PAGES
----------
Home (index): carousel, offers, featured categories, popular/discount
  products, blogs; getServerSideProps fetches products, blogs, SEO, i18n.
Product by slug: product/[slug].jsx. Category/subcategory: product-category
  dynamic routes. Checkout: checkout.jsx (useCheckoutSubmit, delivery,
  coupon, credit/card flows). Success/failed: payment result. User area:
  dashboard, orders, profile, password, email verification.

COMPONENT HIERARCHY
-------------------
- Layout (layout/Layout.js) wraps pages; navbar (Navbar, NavBarTop,
  NavbarUserButton, NavbarPromo), footer (Footer, FooterTop, MobileFooter).
- Components: product (ProductCard, slug Card), checkout (CheckoutItems,
  OrderCosts, PersonalDetails, DeliveryOptions, etc.), modal (MainModal,
  MissingProductsModal, PriceUpdatedModal), voice-search (VoiceSearchModal,
  CashierVoicePanel, etc.), userAddressUpdate, banner, carousel, blog,
  offer, category (FeatureCategory), etc.

STATE MANAGEMENT
----------------
- Redux (redux/store.js): setting + data slices; persisted with
  redux-persist (sessionStorage; blacklist "/"). Same slice names as admin.
- UserContext: userInfo, shippingAddress, couponInfo from cookies; reducer
  USER_LOGIN, USER_LOGOUT, SAVE_SHIPPING_ADDRESS, SAVE_COUPON. Flashy
  identifyUser on userInfo.
- Cart: react-use-cart (CartProvider) with user-scoped storage key
  (getCartStorageId(userInfo)); guest cart merged into user on login.

API COMMUNICATION LAYER
-----------------------
- src/services/httpServices.js: axios, baseURL process.env.NEXT_PUBLIC_API_BASE_URL.
  Interceptor adds Authorization: Bearer <userInfo.token> when present.
  get, post, put. Used by SettingServices, OrderServices, ProductServices,
  CustomerServices, etc.

HOOKS
-----
useAddToCart, useAsync, useCart, useCheckoutSubmit, useGetSetting,
useUtilsFunction, useFilter, useNotification (socket), useLoginSubmit,
useInView, etc.

STYLING
-------
- Tailwind (tailwind.config.js), styled-components, next-intl for i18n.
  Styles: custom.css, Tailwind typography/aspect-ratio.

ENVIRONMENT CONFIGURATION (STORE)
---------------------------------
- Next.js: process.env.NEXT_PUBLIC_*. NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STORE_DOMAIN, NEXT_PUBLIC_CUSTOMER_SERVICE,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_API_SOCKET_URL,
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID, NEXT_PUBLIC_FLASHY_ACCOUNT_ID,
  NEXT_PUBLIC_FLASHY_LIST_WELCOME, NEXT_PUBLIC_FLASHY_LIST_BUYERS.

================================================================================
4. DATA FLOW (EXAMPLE: CUSTOMER PLACES ORDER WITH CARD)
================================================================================

1) Frontend (store): User fills checkout (checkout.jsx). useCheckoutSubmit
   submitHandler builds cart + delivery + coupon from form and state.
2) If payment is card: OrderServices or equivalent POST to
   /api/order/add (registered) or /api/order/add-guest (guest).
   Request: body with cart, user_info, delivery, coupon, etc. Headers:
   Authorization Bearer <token> for /add; none for /add-guest (createGuestCustomer
   creates/assigns guest customer).
3) Backend: customerOrderRoutes -> addOrder (customerOrderController).
   - Loads customer (and MainCustomer), validates cart: product exists, stock,
     barcode restrictions, status show, purchaseLimit, price (getFinalPrice vs
     client price). Returns 409 with missingProducts or priceConflicts if any.
   - Loads offers (filter by active/dates/oncePerCustomer/forNewCustomersOnly),
     findOptimalOfferCombination, applies coupon, calculates shipping.
   - If payment method is card: createCheckout (orderPaymentService).
   - createCheckout: creates Order with status Pending, builds customer snapshot,
     getActivePaymentProvider() (Cardcom or iCredit), provider.createPaymentUrl(...).
   - Response: { order, paymentUrl }. Frontend redirects to paymentUrl.
4) User pays on gateway. Gateway sends POST to backend:
   /api/payments/cardcom/webhook/:orderId?token=... or
   /api/payments/icredit/ipn/:orderId?token=...
5) paymentsController.handleProviderWebhook: gets provider from path, loads
   order (with webhookToken), verifies query.token === provider.getOrderWebhookToken(order),
   provider.verifyWebhook(order, req). If verified.paid, finalizePaidOrder.
6) orderFinalizeService.finalizePaidOrder: idempotent (checks provider isPaid),
   updates order (status Paid, provider doc), handleProductQuantity (stock),
   coupon usage, sendOrderNotificationEmail, logStatusChange.
7) Response 200 to gateway. User is redirected to STORE_URL/success?orderId=...
   or /failed?orderId=... by gateway.
8) Frontend: success/failed page shows result; cart can be cleared.

================================================================================
5. INSTALLATION & RUNNING
================================================================================

BACKEND (mnm-backend)
---------------------
- Node.js. Install: npm install
- Env: copy .env (do not commit). Set at least: MONGO_URI, PORT, JWT_SECRET,
  JWT_SECRET_FOR_VERIFY, COMPANY_NAME, STORE_URL, API_BASE_URL, email vars,
  AWS vars if using upload, payment and Rivhit vars as needed.
- Dev: npm run dev (nodemon api/index.js)
- Host (bind 0.0.0.0): npm run host (PORT=5055)
- Production: npm run start (node api/index.js)
- Scripts: npm run data:import (script/seed.js), npm run product (script/product.js)

FRONTEND ADMIN (mnm-admin)
--------------------------
- Install: npm install
- Env: .env with VITE_APP_API_BASE_URL (and VITE_APP_API_SOCKET_URL if used)
- Dev: npm run dev (Vite, port 4105). npm run host for 0.0.0.0.
- Build: npm run build. Preview: npm run preview.
- Test: npm run test (vitest)

FRONTEND STORE (mnm-store)
--------------------------
- Install: npm install
- Env: .env with NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_STORE_DOMAIN, NEXT_PUBLIC_GOOGLE_CLIENT_ID, etc.
- Dev: npm run dev (Next.js). npm run host for HOST=0.0.0.0 PORT=3000.
- Build: npm run build. Start: npm run start.
- Lint: npm run lint

REQUIRED ENVIRONMENT VARIABLES (SUMMARY)
----------------------------------------
- Backend: MONGO_URI, JWT_SECRET, STORE_URL, API_BASE_URL, email (HOST,
  EMAIL_PORT, EMAIL_USER, EMAIL_PASS), COMPANY_NAME. For payments:
  PAYMENT_GATEWAY and corresponding gateway env (iCredit or Cardcom). For
  upload: AWS vars. For Rivhit: RIVHIT_API_TOKEN (or _TEST).
- Admin: VITE_APP_API_BASE_URL pointing to backend (e.g. http://localhost:5000
  or full URL). Optional: VITE_APP_API_SOCKET_URL, VITE_APP_ENVIRONMENT,
  VITE_APP_STORE_DOMAIN, VITE_APP_KIRSHNER_WHATSAPP_SOCKET_URL.
- Store: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STORE_DOMAIN.
  Optional: NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_API_SOCKET_URL,
  NEXT_PUBLIC_CUSTOMER_SERVICE, NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  NEXT_PUBLIC_FLASHY_*.

================================================================================
6. FOLDER STRUCTURE EXPLANATION
================================================================================

mnm-backend/
  api/
    index.js                 Entry; express app, routes, server listen
  config/
    auth.js                  JWT helpers, isAuth, isAdmin, isApp, isCashier, etc.
    db.js                    connectDB (MongoDB)
  controller/
    *.js                     One file per domain (product, order, customer, admin,
                             payments, setting, rivhitDocuments, etc.)
  routes/
    *.js                     Express routers mounted in api/index.js
  models/
    *.js                     Mongoose schemas (Product, Order, Customer, etc.)
  services/
    orderPaymentService.js   createCheckout
    orderFinalizeService.js  finalizePaidOrder
    orderServices.js         createCreditOrder, status flow, email
    rivhitDocuments*.js       Rivhit issue/fetch
    rivhitCustomerService.js
  payments/
    paymentFactory.js        getActivePaymentProvider
    paymentShared.js         buildCustomerSnapshot, etc.
    providers/
      cardcomProvider.js
      icreditProvider.js
  lib/
    email-sender/            nodemailer, templates, rate limits
    stock-controller/        handleProductQuantity
    stripe/, paypal/         (present in package; usage not central in scanned flow)
    notification/
  jobs/
    stockAlertJob.js         Cron every hour; low stock email
  utils/
    awsUploader.js, imgurUploader.js, date.js, data.js, priceUtils.js,
    offerCalculations.js, productHelpers.js, queryUtils.js, voiceParser.js,
    rivhit*.js, logStatusChange.js, importProducts.js, etc.
  scripts/
    seed.js, product.js, importCategories.js, importProducts.js,
    importCustomersFromExcel.js, listCategories.js

mnm-admin/
  src/
    main.jsx, App.jsx        Entry and router
    routes/
      index.js               Route list (path, component)
      sidebar.js             Sidebar menu config
    pages/                   Page components (lazy in routes)
    layout/
      Layout.jsx, Main.jsx   Shell and sidebar + outlet
    components/              Reusable (sidebar, modal, drawer, invoice, etc.)
    services/                httpService + feature services (ProductServices, etc.)
    reduxStore/
      store.js
      slice/                 settingSlice, dynamicDataSlice
    context/                 AdminContext, SidebarContext
    hooks/                   useProductSubmit, useCheckoutSubmit, etc.
    utils/                   toast, dateUtils, products, orders, etc.
    assets/                  theme, css, images
  vite.config.js
  tailwind.config.js

mnm-store/
  src/
    pages/                   Next.js pages and api/
    layout/                  Layout, navbar, footer
    component/               Product, checkout, modal, voice-search, etc.
    services/                httpServices + feature services
    redux/
      store.js
      slice/                 settingSlice, dynamicDataSlice
    context/                 UserContext, SidebarContext
    hooks/
    utils/
    lib/                     seo.js
    functions/               sortProducts, scrollUp
  tailwind.config.js

Separation of concerns: Backend = routes -> controllers -> services/utils and
models. Frontend = pages/layout/components use services and hooks; state in
Redux and context; auth via cookies and Bearer in HTTP client.

================================================================================
7. KEY DESIGN DECISIONS
================================================================================

- Single backend API for both admin and store; auth differs by route
  (isAdmin vs isAuth vs isApp vs isWhatsappServer vs isCashier).
- Payment: factory pattern (paymentFactory + providers); one webhook handler
  (handleProviderWebhook) dispatches by path to provider and then
  orderFinalizeService (idempotent, atomic).
- Customer model: MainCustomer (company/account) + Customer (sub-users);
  Order stores both user and mainCustomer; price lists and barcode
  restrictions on MainCustomer.
- Store: Next.js for SSR/SEO and getServerSideProps on home; admin is SPA
  (Vite) with lazy routes.
- Cart: react-use-cart with user-scoped storage; guest cart merged to user
  on login (UserScopedCartProvider in _app.js).
- Admin auth: cookie adminInfo (token); store auth: cookie userInfo (token).
  MFA and trusted device use separate JWT secrets (JWT_SECRET_MFA,
  JWT_SECRET_TRUSTED).
- Stock alerts: cron every hour (node-cron); Product.hasSentStockAlert
  prevents repeat emails until next low-stock state.
- Hebrew/RTL: admin sets document.dir by lang (SidebarContext); store uses
  next-intl and locale.

================================================================================
8. IMPORTANT WARNINGS
================================================================================

- Do not break payment webhook flow: handleProviderWebhook must verify token
  and provider payload; finalizePaidOrder must remain idempotent (check
  isPaid before updating). Changing PAYMENT_GATEWAY or provider logic
  affects live payments.
- Do not remove or weaken auth middlewares (isAdmin, isAuth, isApp,
  isWhatsappServer, isCashier). Admin and order routes must stay protected.
- Order creation (addOrder) validates cart server-side (price, stock,
  barcode restrictions). Do not rely only on client-side totals; duplicate
  logic exists in utils/offerCalculations and utils/priceUtils—keep backend
  as source of truth.
- Environment: never commit .env. JWT_SECRET, JWT_SECRET_FOR_VERIFY,
  JWT_SECRET_MFA, JWT_SECRET_TRUSTED, email and AWS keys are sensitive.
- Rivhit and payment provider credentials (tokens, API names, passwords)
  are env-based; test vs prod is controlled by ICREDIT_ENV / CARDCOM_ENV.
- Stock: handleProductQuantity (lib/stock-controller/others) is called on
  order finalize and possibly on status changes; ensure stock is not
  double-decremented or left inconsistent.
- Admin cookie name (adminInfo) and store cookie name (userInfo) are
  hardcoded in context and httpService; changing them breaks auth.
- Store dynamic scripts (getStoreScripts) are sanitized (sanitizeScripts)
  before injection; do not bypass sanitization in _app.js.
- Socket.io: backend does not attach io in api/index.js; if admin/store
  rely on real-time notifications, confirm where the socket server runs
  (separate process or add to index.js).

================================================================================
END OF README
================================================================================
