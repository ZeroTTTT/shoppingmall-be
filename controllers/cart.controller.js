
const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req,res) =>{
    try{        
        const {userId} = req;
        const { productId,size,qty } = req.body
        // 유저를 가지고 카트 찾기
        let cart = await Cart.findOne({userId})
        if(!cart){        
            //유저가 만든 카트가 없다, 만들어주기
            cart = new Cart({userId});
            await cart.save();
        }

        // 이미 카트에 들어가있는 아이템이냐? productId, size
        const existItem = cart.items.find(
            (item) => item.productId.equals(productId) && item.size === size
        )

        if (existItem) {
            // 그렇다면 에러 ('이미 아이템이 카트에 있습니다')
            throw new Error('아이템이 이미 카트에 담겨 있습니다!');
        }


        // 카트에 아이템을 추가
        cart.items = [...cart.items, {productId, size, qty}];
        await cart.save();

        return res.status(200).json({status:'success', data: cart, cartItemQty: cart.items.length });
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message})
    }
}

cartController.getCart = async (req, res) => {
    try {
      const { userId } = req;
  
      const cart = await Cart.findOne({ userId }).populate({
        path: "items",
        populate: { path: "productId", model: "Product" },
      });
  
      if (!cart) {
        throw new Error("카트가 비어있습니다.");
      }
  
      return res
        .status(200)
        .json({ status: "success", data: cart.items, cartItemQty: cart.items.length });
    } catch (err) {
      res.status(400).json({ status: "fail", error: err.message });
    }
  };

  cartController.editCartItem = async (req, res) => {
    try {
      const { userId } = req;
      const productId = req.params.id;
      const { size, qty } = req.body;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("카트가 비어있습니다.");
      }
  
      const index = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );
  
      if (index === -1) {
        throw new Error("존재하지 않는 아이템입니다.");
      }
  
      cart.items[index].size = size;
      cart.items[index].qty = qty;
  
      await cart.save();
  
      return res.status(200).json({ status: "success", data: cart.items });
    } catch (err) {
      res.status(400).json({ status: "fail", error: err.message });
    }
  };
  

  cartController.deleteCartItem = async (req, res) => {
    try {
      const { userId } = req;
      const productId = req.params.id;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("카트가 비어있습니다.");
      }
  
      const index = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );
      if (index === -1) {
        throw new Error("존재하지 않는 아이템입니다.");
      }
      cart.items.splice(index, 1);
      await cart.save();
  
      return res
        .status(200)
        .json({ status: "success", data: cart.items, cartItemQty: cart.items.length });
    } catch (err) {
      res.status(400).json({ status: "fail", error: err.message });
    }
  };


  cartController.getCartQty = async (req, res) => {
    try {
      const { userId } = req;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("카트가 비어있습니다.");
      }
  
      return res.status(200).json({ status: "success", qty: cart.items.length });
    } catch (err) {
      res.status(400).json({ status: "fail", error: err.message });
    }
  };
  
module.exports = cartController;