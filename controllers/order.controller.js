const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

const orderController = {};
const PAGE_SIZE = 10;

orderController.createOrder = async (req, res) => {
  try {
    //프론트엔드에서 데이터 보낸거 받아와
    const { userId } = req;
    const { totalPrice, shipTo, contact, orderList } = req.body;

    //재고 확인 & 재고 업데이트 (product와 관련된 느낌이기 때문에 productController에서 컨트롤) 
    //재고 업데이트 부분이 있어서 시간이 걸리니까 await걸어준다
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    //재고가 불충분한 아이템이 있었다. => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(  //reduce 뽑아주세요
        (total, item) => (total += item.message),
        "" //string으로 반환되는걸 암시하기위해 적어줌
      );
      throw new Error(errorMessage);
    }

    //order를 만들자
    const newOrder = await new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    //세이브 후에 카트를 비워주자

    res.status(200).json({ status: "ok", orderNum: newOrder.orderNum });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;

    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "image name",
      },
    });
    const totalItemNum = await Order.find({ userId: userId }).count();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);


    let response = {status:'success'}
    response.totalPageNum = totalPageNum
    response.orderList = orderList

    // res.status(200).json({ status: "success", data: orderList, totalPageNum });
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, orderNum } = req.query;

    let cond = {};
    if (orderNum) {
      cond = {
        orderNum: { $regex: orderNum, $options: "i" },
      };
    }

    // const orderList = await Order.find(cond)
    //   .populate("userId")
    //   .populate({
    //     path: "items",
    //     populate: {
    //       path: "productId",
    //       model: "Product",
    //       select: "image name",
    //     },
    //   })
    //   .skip((page - 1) * PAGE_SIZE)
    //   .limit(PAGE_SIZE);
    // const totalItemNum = await Order.find(cond).count();
    // const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

		let query = Order.find(cond)
		let response = {status:'success'}

		if(page){
			query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE)
			const totalItemNum = await Order.find(cond).countDocuments()
			const totalPages = Math.ceil(totalItemNum / PAGE_SIZE)
			response.totalPageNum = totalPages
		}

		const orderList = await query.exec()
		response.orderList = orderList

    // res.status(200).json({ status: "success", data: orderList, totalPageNum });
    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }

  //bk orderNum=>ordernum으로 수정전
// orderController.getOrderList = async (req, res) => {
//   try {
//     const { page, orderNum } = req.query;

//     let cond = {};
//     if (orderNum) {
//       cond = {
//         orderNum: { $regex: orderNum, $options: "i" },
//       };
//     }

//     const orderList = await Order.find(cond)
//       .populate("userId")
//       .populate({
//         path: "items",
//         populate: {
//           path: "productId",
//           model: "Product",
//           select: "image name",
//         },
//       })
//       .skip((page - 1) * PAGE_SIZE)
//       .limit(PAGE_SIZE);
//     const totalItemNum = await Order.find(cond).count();

//     const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
//     res.status(200).json({ status: "success", data: orderList, totalPageNum });
//   } catch (error) {
//     return res.status(400).json({ status: "fail", error: error.message });
//   }
};

orderController.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        status,
      },
      { new: true }
    );
    if (!order) throw new Error("Can't find order");

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = orderController;
