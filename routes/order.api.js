const express = require("express");
const orderController = require("../controllers/order.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//order생성
//내가 내 order를 생성해야되는거니까! authController.authenticate 필요!
router.post("/", authController.authenticate, orderController.createOrder);


router.get("/me", authController.authenticate, orderController.getOrder);
router.get(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.getOrderList
);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
