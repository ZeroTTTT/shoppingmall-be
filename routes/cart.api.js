const express = require('express')
const authController = require('../controllers/auth.controller')
const cartController = require('../controllers/cart.controller')
const router = express.Router()

//카트추가
router.post('/',
    authController.authenticate, //token값 확인하는게 들어있으니까 활용
    cartController.addItemToCart
);
router.get("/", authController.authenticate, cartController.getCart);

//카트 아이템 개수 수정, 삭제, 주문내역 가격 변동
router.put("/:id", authController.authenticate, cartController.editCartItem);

router.delete(
    "/:id",
    authController.authenticate,
    cartController.deleteCartItem
  );

router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;