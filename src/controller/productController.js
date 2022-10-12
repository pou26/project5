const productModel = require("../models/productModel")
const aws = require("../AWS/aws")
const valid = require("../Validator/validator")

const createProduct = async function (req, res) {
      try {
          let data = req.body
          let pic = req.files
          
          if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}
          let { title, description, price, currencyId, currencyFormat,productImage, availableSizes, installments} = data

          if( pic && pic.length > 0){
            let image = await aws.uploadFile(pic[0])
            data.productImage = image
       } else {
          return res.status(400).send({status:false,message: "please provide the productImage"})
       }

          if (!title)
          return res.status(400).send({ status: false, message: "Title is mandatory" });
          if(!valid.isValidT(title)){
            return res.status(400).send({ status: false, message: "title not in valid format." })}

          let duplicateTitle = await productModel.findOne({title:title})
          if(duplicateTitle){
               return res.status(400).send({status:false, message: "title already exist"})
            }
          if (!description)
          return res.status(400).send({ status: false, message: "description is mandatory" });

          if (!price)
          return res.status(400).send({ status: false, message: "price is mandatory." });
          if(price){
            if (!(valid.isValidPrice(price))) {
                return res.status(400).send({ status: false, message: "Invalid price" })}
            }
          if (!availableSizes)
          return res.status(400).send({ status: false, message: "availableSizes is mandatory." });
          let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let size2 = availableSizes
        .toUpperCase()
        .split(",")
        .map((x) => x.trim());
      for (let i = 0; i < size2.length; i++) {
        if (!size1.includes(size2[i])) {
          return res.status(400).send({status: false,message:"Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'",});
          }
        }data.availableSizes=size2
          

        //price validation
        
        if(installments){
            if (!(valid.isValidI(installments))) {
                return res.status(400).send({ status: false, message: "Invalid installments" })
            }
            }
          //currency id

         data.currencyId = "INR"
         data.currenyFormat ="₹"
         
         //creation

         const created = await productModel.create(data)
         return res.status(201).send({ status: true, message:"Success",data: created })
      
    }
      catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
const getproduct = async function (req, res) {
    try {
        let data = req.query
        let {size,price, name} = data;
        let products = await productModel.find({ isDeleted: false }).sort({priceSort : 1},{priceSort : -1})
        let productprice = { $gte: priceGreaterThan, $lte: priceLessThan }
        res.status(200).send({ status: true, msg: products })
    
        }
           catch (err) {
            res.status(500).send({ msg: err.message })
    
    }
}
module.exports = {createProduct,getproduct}