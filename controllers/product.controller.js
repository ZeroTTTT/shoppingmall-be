const Product = require("../models/Product");

const PAGE_SIZE=5;
const productController = {};

productController.createProduct = async (req,res) =>{
    try{
        const {
            sku,
            name,
            size, 
            image, 
            category, 
            description, 
            price, 
            stock, 
            status} = req.body
        const product = new Product ({
            sku, 
            name, 
            size, 
            image, 
            category, 
            description, 
            price, 
            stock, 
            status
        });
        await product.save();
        return res.status(200).json({status:'success', product})
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message})
    }
}

// productController.getProducts = async (req, res) => {
//     try{
//         const {page, name}= req.query
//         const cond = name?{name:{$regex:name, $options:'i'}}:{}
//         let query = Product.find(cond)
//         let response = { status:'success'}  //response 객체로 만든이유는 필요한값 추가로 넣어서 리턴줄 수 있기 때문
//         if(page){
//             query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);
//             //최종 몇개페이지인지?
//             //전체 페이지 개수 = 전체데이터 개수 / 페이지 사이즈

//             //데이터 총 개수 
//             const totalItemNum = await Product.find(cond).count();
//             //데이터 총 개수 / PAGE_SIZE
//             const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
//             response.totalPageNum = totalPageNum;
//         }

//         const productList = await query.exec();
//         response.data = productList;
//         // res.status(200).json({status:'success', data:productList});
//         res.status(200).json(response);
//     } catch (error) {
//         res.status(400).json({status:'fail', error: error.message});
//     }
// }

// isDeleted false 인것만 가져오기 
productController.getProducts = async (req, res) => {
    try {
      const { page, name } = req.query;
      let response = { status: "success" };
      const cond = name
        ? { name: { $regex: name, $options: "i" }, isDeleted: false }
        : { isDeleted: false };
      let query = Product.find(cond);
  
      if (page) {
        query = query.skip((page - 1) * PAGE_SIZE).limit(5);
        const totalItemNum = await Product.find(cond).count();
  
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        response.totalPageNum = totalPageNum;
      }
      const productList = await query.exec();
      response.data = productList;
  
      res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  };




productController.updateProduct = async (req, res) => {
    try{
        const productId= req.params.id;
        const {
            sku,
            name,
            size,
            image,
            price,
            description,
            category,
            stock,
            status
        }= req.body;
        
        const product = await Product.findByIdAndUpdate(
            {_id: productId},
            {
                sku,
                name,
                size,
                image,
                price,
                description,
                category,
                stock,
                status
            },
            { new: true}
        );
        if (!product) throw new Error("item doesn't exist");
        res.status(200).json({status:'success', data:product});
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message});
    }
}


// 상품 삭제 로직 
productController.deleteProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findByIdAndUpdate(
        { _id: productId },
        { isDeleted:true }
        // { name: "test" }
      );
      if (!product) throw new Error("No item found");
      res.status(200).json({ status: "success" });
    } catch (error) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  };

  productController.getProductById = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if (!product) throw new Error("No item found");
      res.status(200).json({ status: "success", data: product });
    } catch (error) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
};


//아이템 하나하나 재고와비교
productController.checkStock = async (item) => {

  //내가 사려는 아이템 재고 정보들고오기
  const product = await Product.findById(item.productId);
  //내가 사려는 아이템 qty, 재고 비교
  if (product.stock[item.size] < item.qty) {
    //불충분하다면 불충분 메세지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다.`,
    };
  }

  //충분하다면, 재고에서 -qty 성공
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];

  //재고를 확인하는 로직
  //Promise.all : async, await을 사용하는 비동기를 한번에 처리할 수 있게해준다. 직렬로 하나씩 처리하는게 아니라 병렬로 동시에 시작한다. 그러면 빨리 끝낼수있다.
  // 배열처럼 여러개 비동기로 할때 쓰면좋다
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message }); //push 값 넣어주는거
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;