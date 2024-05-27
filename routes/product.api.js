const express = require('express')
const authController = require('../controllers/auth.controller')
const productController = require('../controllers/product.controller')
const router = express.Router()

//상품등록 // admin인지아닌지 확인 -> 상품등록
router.post('/',
authController.authenticate, //token값 확인하는게 들어있으니까 활용
authController.checkAdminPermission, 
productController.createProduct
);

module.exports = router;