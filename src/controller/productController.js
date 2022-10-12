const productModel = require("../model/productModel")
const aws = require("../aws/aws")
const valid = require("../Validator/validator")

const createProduct = async function (req, res) {
      try {
          let data = req.body
          let files = req.files

          if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}
          let { title, description, price, currencyId, currencyFormat, availableSizes, installments} = data

          //duplicate title
          let duplicateTitle = await productModel.findOne({title:title})
          if(duplicateTitle){
               return res.status(400).send({status:false, message: "title already exist in use"})
            }

        //price validation
        if(price){
            if (!(valid.isValidPrice(price))) {
                return res.status(400).send({ status: false, message: "Invalid price" })
            }
            }

          //currency id

          if(currencyId != "INR"){ 
            return res.status(400).send({status:false, message: "only indian currencyId INR accepted"})
         }

         //currency format

         if(currencyFormat != "₹"){
            return res.status(400).send({status:false, message: "only indian currency ₹ accepted "})
         }
        
         
        if( files && files.length > 0){
              let image = await aws.uploadFile(files[0])
              data.productImage = image
         } else {
            return res.status(400).send({status:false,message: "please provide the productImage"})
         }

         //creation

         const created = await productModel.create(data)
         return res.status(201).send({ status: true, message:"Success",data: created })
      }
      catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}