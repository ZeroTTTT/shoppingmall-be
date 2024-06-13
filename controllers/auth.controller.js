const { response } = require('express');
const User = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");

require('dotenv').config();
const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const authController = {};

authController.loginWithEmail = async (req,res) =>{
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (user) {
            const isMatch = await bcrypt.compare(password,user.password)
            if(isMatch){
                //token
                const token = await user.generateToken()
                return res.status(200).json({status:'success', user, token})
            }
        }
        throw new Error('invalid email or password')
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message})
    }
}

authController.authenticate = async (req, res, next) => {
    try{
        const tokenString = req.headers.authorization;
        if (!tokenString) throw new Error('Token not found');
        const token = tokenString.replace('Bearer ', '');
        // console.log('token', token)
        // console.log('JWT_SECRET_KEY', JWT_SECRET_KEY)
        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if (error) throw new Error('invalid token');
            req.userId = payload._id;
        });
        next();

    } catch (error) {
        res.status(400).json({status:'fail', error: error.message})
    }
}

authController.checkAdminPermission = async (req, res, next) => {
    try{
        const {userId} = req;
        const user = await User.findById(userId);
        if (user.level !== 'admin') throw new Error('no permission');
        next();
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message})
    }
}


authController.loginWithGoogle = async (req, res) => {
        //   구글 로그인
        //   1. 구글 로그인 버튼 가져오기
        //   2. Oauth로그인을 위해서 google api 사이트에 가입하고 클라이언트키, 시크릿키 받아오기
        //   3. 로그인
        //   4. 백엔드에서 로그인하기
        //    a. 이미 로그인을 한적이 있는 유저 => 로그인시키고 토큰값 주면 장땡
        //    b. 처음 로그인 시도를 한 유저다 => 유저정보 먼저 새로 생성 => 토큰값
    try {
      const { token } = req.body;
      const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
  
      const { email, name } = ticket.getPayload();
  
      let user = await User.findOne({ email });
  
      if (!user) {
        // 유저를 새로 생성
        const randomPassword = "" + Math.floor(Math.random() * 100000000);
        const salt = await bcrypt.genSaltSync(10);
        const newPassword = await bcrypt.hash(randomPassword, salt);
        user = new User({ name, email, password: newPassword });
        await user.save();
      }
      //토큰을 발행하고 리턴
      const sessionToken = await user.generateToken();
  
      return res.status(200).json({ status: "ok", user, token: sessionToken });
    } catch (err) {
      res.status(400).json({ status: "fail", error: err.message });
    }
  };

module.exports = authController;