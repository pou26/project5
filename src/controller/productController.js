const productModel = require("../models/productModel")
const aws = require("../AWS/aws")
const valid = require("../Validator/validator")

const createProduct = async function (req, res) {
      try {
          let data = req.body
          let file = req.files
          
          if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}
          let { title, description, price, currencyId, currencyFormat,productImage, availableSizes, installments} = data

          if( file && file.length > 0){
            let image = await aws.uploadFile(file[0])
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

        if(currencyId != "INR"){ 
            return res.status(400).send({status:false, message: "only indian currencyId INR accepted"})
         }
//currency format

         if(currencyFormat != "₹"){
            return res.status(400).send({status:false, message: "only indian currency ₹ accepted "})
         }
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
//================================ getProductsByQuery ==============================================//
const getProductsByQuery = async function (req, res) {
    try {
        const queryParams = req.query
        //Extract params
        let { size, name, priceGreaterThan, priceLessThan, priceSort} = queryParams

        const filterQuery = { isDeleted: false}
        // validation start
        if (size) {
            if (!size) return res.status(400).send({ status: false, msg: "provide size" })

            if (!valid.isValidAvailableSizes(size))
                return res.status(400).send({ status: false, msg: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            filterQuery['availableSizes'] = size
        };

        if (priceGreaterThan) {
            if (!valid.isValidPrice(priceGreaterThan))
                return res.status(400).send({ status: false, msg: "provide priceGreaterThan in numeric" })
            filterQuery['price'] = { $gte: priceGreaterThan }
        };

        if (priceLessThan) {
            if (!valid.isValidPrice(priceLessThan))
                return res.status(400).send({ status: false, msg: "provide priceLessThan in numeric" })
            filterQuery['price'] = { $lte: priceLessThan }
        };
       
        if (valid.isValid(name)) {
        filterQuery['title'] = { $regex: name, $options: "i" };
        };

        // validation of priceSort
        if(priceSort){
            if (!((priceSort == 1) || (priceSort == -1))){
                return res.status(400).send({status : false, message : "Price sort only takes 1 or -1 as a value" })
            }

            let filterProduct = await productModel.find(filterQuery).sort({price: priceSort})
            if(Object.keys(filterProduct).length ==0){return res.status(400).send({status:false, message: "No products found with this query"})}
            return res.status(200).send({ status: true, message: 'Success', data: filterProduct })
        }
        // validation end

        const products = await productModel.find(filterQuery).sort({ price: 1 })

        if(Object.keys(products).length ==0){return res.status(400).send({status:false, message: "Product not found"})}
        return res.status(200).send({ status: true, message: "Success", data: products })
        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
//========================================= getproduct =========================================//
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


const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }

        let checkProductId = await productModel.findOne({ _id: productId })
        if (!checkProductId) { return res.status(404).send({ status: false, msg: "Product not found for the request id" }) }
        if (checkProductId.isDeleted == true) { return res.status(404).send({ status: false, msg: "Product is already deleted" }) }

        /*----------------------------------------------------------------------------------------------------------------------*/

        let data = req.body;
        let files = req.files;

        /*--------------------------------------------file Updation--------------------------------------------------------------*/

        if (!isvalidBody(data)) { return res.status(400).send({ status: false, message: "Please provide data to update" }) }

        //CHECKING ProductImage
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.productImage = uploadedFileURL;
        } 

        /*--------------------------------------------Title Validation------------------------------------------------------------*/

        if (data.title) {
          // console.log(typeof(data.title))
            if ((data.title).trim().length==0) {
                return res.status(400).send({ status: false, msg: "title should be not empty string" })
            }

            //checking title duplicasy
            let titleExist = await productModel.findOne({ title: data.title })
            if (titleExist) { return res.status(400).send({ status: false, msg: "title is already exist" }) }
        }
        /*-------------------------------------------Description Validation--------------------------------------------------------*/

        if (data.description) {
            if (!valid.isvalid(data.description)) {
                return res.status(400).send({ status: false, msg: "Description should be not empty string" })
            }
        }
        /*--------------------------------------------Price Validation------------------------------------------------------------*/


        if (data.price) {
            if (!priceRegex(data.price)) {
                return res.status(400).send({ status: false, msg: "price should be not empty string" })
            }
           }

        /*--------------------------------------------isFreeShipping validation-----------------------------------------------------*/
         
        if (data. isFreeShipping) {
            if (!isvalid(data. isFreeShipping)) {
                return res.status(400).send({ status: false, msg: " isFreeShipping should be not empty string" })
            }

        }


        const deleteproduct = async function (req, res) {
            try {
                let productId = req.params.productId;
                // edge case 1 ----check productId valid or not 
            
                if (!valid.isValidObjectId (productId))
                    return res.status(400).send({ status: false, msg: "Invalid productId" });
        
                // Is product present with given productId
                let savedData = await productModel.findById({_id:productId})
                if (!savedData) {
                    
                    return res.status(404).send("No such productId is present");
                }
                //If it is already deleted
                if (savedData.isDeleted)
                 return res.status(404).send({ status: false, msg: "you have already deleted the product" });
        
             await productModel.findByIdAndUpdate(savedData, { $set: { isDeleted: true ,deletedAt: Date.now()} });
                res.status(200).send({msg: "product is sucessfully deleted"});
            } catch (error) {
                res.status(500).send({ status: false, msg: error.message });
            }
        }


module.exports = {createProduct,getProductsByQuery,getproduct,updateProduct,deleteproduct}
