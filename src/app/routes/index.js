const express = require("express");
const userRouter = require("../modules/user/user.route");
const biodataRouter = require("../modules/biodata/biodata.route");
const unlockPremiumRouter = require("../modules/unlockPremium/unlockPremium.route");
const servicesPackageRouter = require("../modules/servicesPackage/servicesPackage.route");
const weddingShopRouter = require("../modules/weddingShop/weddingShop.route");
const bookingRouter = require("../modules/booking/booking.route");
const reviewRouter = require("../modules/review/review.route");
const orderRouter = require("../modules/order/order.route");
const cartRouter = require("../modules/cart/cart.route");
const dashboardRouter = require("../modules/dashboard/dashboard.route");

const router = express.Router();

const moduleRoutes = [
  { path: "/", route: userRouter },
  { path: "/", route: biodataRouter },
  { path: "/", route: unlockPremiumRouter },
  { path: "/", route: servicesPackageRouter },
  { path: "/", route: weddingShopRouter },
  { path: "/", route: bookingRouter },
  { path: "/", route: reviewRouter },
  { path: "/", route: orderRouter },
  { path: "/", route: cartRouter },
  { path: "/", route: dashboardRouter },
];

moduleRoutes.forEach((routeObj) => {
  router.use(routeObj.path, routeObj.route);
});

module.exports = router;
