const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

//회원가입
router.post('/', userController.createUser);
router.get('/me', authController.authenticate, userController.getUser); //토큰이 vaild한 값인지? , 맞다면 토큰으로부터 user정보받아오기

module.exports = router;