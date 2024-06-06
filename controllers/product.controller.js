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

module.exports = productController;