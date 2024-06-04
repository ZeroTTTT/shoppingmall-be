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

productController.getProducts = async (req, res) => {
    try{
        const {page, name}= req.query
        const cond = name?{name:{$regex:name, $options:'i'}}:{}
        let query = Product.find(cond)
        let response = { status:'success'}  //response 객체로 만든이유는 필요한값 추가로 넣어서 리턴줄 수 있기 때문
        if(page){
            query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);
            //최종 몇개페이지인지?
            //전체 페이지 개수 = 전체데이터 개수 / 페이지 사이즈

            //데이터 총 개수 
            const totalItemNum = await Product.find(cond).count();
            //데이터 총 개수 / PAGE_SIZE
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }

        const productList = await query.exec();
        response.data = productList;
        // res.status(200).json({status:'success', data:productList});
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({status:'fail', error: error.message});
    }
}



module.exports = productController;