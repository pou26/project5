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


// const getproduct = async function (req, res) {
//     try {
//         
//         let data = req.query
//         let { size, price, name, priceSort } = data;

//         if (size)
//             size = size.toUpperCase()
//         let givenSizes = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
//         if (!givenSizes) {
//             return res.status(400).send({ status: false, message: `size should be one these only ${givenSizes}` })
//         }
//         if (name) {
//             if (!(name))
//                 return res.status(400).send({ status: false, message: "Product title is required" });
//             if (!isValidName(name))
//                 return res.status(400).send({ status: false, message: "Product title should be valid" });

//             if (priceSort) {
//                 if (!((priceSort == 1) || (priceSort == -1))) {
//                     return res.status(400).send({ status: false, message: 'In price sort it contains only 1 & -1' });
//                 }
//             }

//             let products = await productModel.find({ isDeleted: false }).sort({ price: priceSort })
//             res.status(200).send({ status: true, msg: products })
//         }
//     }
//     catch (err) {
//         res.status(500).send({ msg: err.message })
//     }
// }

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
            filterQuery['price'] = { $gt: priceGreaterThan }
        };

        if (priceLessThan) {
            if (!valid.isValidPrice(priceLessThan))
                return res.status(400).send({ status: false, msg: "provide priceLessThan in numeric" })
            filterQuery['price'] = { $lt: priceLessThan }
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
    
            if(filterProduct.length>0){
                return res.status(200).send({status : false, message : "Success", data : filterProduct})
            }
            else{
                return res.status(404).send({status : false, message : "No products found with this query"})
            }
        };
        // validation end

        const products = await productModel.find(filterQuery).sort({ price: 1 }) //rest operator

        if (!(products.length)) return res.status(404).send({ status: false, msg: 'Product not found' })
        return res.status(200).send({ status: true, msg: "Success", data: products })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


module.export={createProduct,getProductsByQuery}