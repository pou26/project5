const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const valid = require("../Validator/validator")




const updateCart = async function(req,res) {
    try{
        const body = req.body
        const userId = req.params.userId;

        if(Object.keys(body) == 0){
            return res.status(400).send({ status: false, msg: "Please provide data to update."});
        }

        if(!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters"});
        }

        const userSearch = await userModel.findById({_id:userId})
        if(!userSearch) {
            return res.status(400).send({status: false, msg: "userId does not exist"})
        }

        // if(userId !== req.userId) {
        //     return res.status(401).send({status: false, msg: "Unauthorised access"})
        // }

        const {cartId, productId, removeProduct} = body

        if(!valid.isValid(cartId)) {
            return res.status(400).send({status: false, msg: "CartId is required"})
        }

        if(!valid.isValidObjectId(cartId)) {
            return res.status(400).send({status: false, msg: "Invalid cartId"})
        }

        if(!valid.isValid(productId)) {
            return res.status(400).send({status: false, msg: "productId is required"})
        }

        if(!valid.isValidObjectId(productId)) {
            return res.status(400).send({status: false, msg: "Invalid productId"})
        }

        const cartSearch = await cartModel.findOne({_id: cartId})
        if(!cartSearch) {
            return res.status(404).send({status: false, msg: "Cart does not exist"})
        }

        const productSearch = await productModel.findOne({ _id: productId})
        if(!productSearch) {
            return res.status(404).send({status: false, msg: "product does not exist"})
        }

        if(productSearch.isDeleted == true) {
            return res.status(400).send({status: false, msg: "Product is already deleted"})
        }

        if((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({status: false, msg: "Invalid remove product"})
        }


        const cart = cartSearch.items
        for(let i=0; i<cart.length; i++) {
            if(cart[i].productId == productId) {
                const priceChange = cart[i].quantity * productSearch.price
                if(removeProduct == 0) {
                    const productRemove = await cartModel.findOneAndUpdate({_id: cartId}, {$pull: {items:{productId: productId}}, totalPrice: cartSearch.totalPrice-priceChange, totalItems:cartSearch.totalItems-1}, {new:true})
                    return res.status(200).send({status: true, message: 'Success', data: productRemove})
                }

                if(removeProduct == 1) {
                    if(cart[i].quantity == 1 && removeProduct == 1) {
                     const priceUpdate = await cartModel.findOneAndUpdate({_id: cartId}, {$pull: {items: {productId: productId}}, totalPrice:cartSearch.totalPrice-priceChange, totalItems:cartSearch.totalItems-1}, {new: true})
                     return res.status(200).send({status: true, message: 'Success', data: priceUpdate})
                }

                cart[i].quantity = cart[i].quantity - 1
                const updatedCart = await cartModel.findByIdAndUpdate({_id: cartId}, {items: cart, totalPrice:cartSearch.totalPrice - productSearch.price}, {new: true})
                return res.status(200).send({status: true, message: 'Success', data: updatedCart})
                }
            }
           return res.status(400).send({ status: false, message: "Product does not found in the cart"})
        }
        
    }
    catch (error) {
        console.log("This is the error :", error.message)
        res.status(500).send({ msg: "Error", error: error.message })
    } 
}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        //if userId is given then is it valid or not
        if (userId) {
            if (!valid.isValidObjectId(userId))
                return res.status(400).send({ status: false, msg: "wrong userId" });
        }
        // finding user in DB 
        let checkUserId = await userModel.findOne({ _id: userId });
        if (!checkUserId) {
            return res.status(404).send({ status: false, message: "no user details found" });
        }
        // finding in cart 
        let getData = await cartModel.findOne({ userId });
        if (getData.items.length == 0)
            return res.status(400).send({ status: false, message: "items details not found" });
        //If not get
        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" });
        }
        res.status(200).send({ status: true, message: "cart successfully", data: fetchData });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) };
       
        const userExist = await userModel.findById(userId)
        if(!userExist)return res.status(404).send({status:false,msg:"user not found"})
    
        const cartExist = await userModel.findById(userId)
        if(!cartExist)return res.status(404).send({status:false,msg:"cart not found"})
    
        let cart = await cartModel.findByIdAndUpdate((userId),{items:[],totalItems:0,totalPrice:0},{new:true})
        return res.status(204).send({ status: false, data:cart})
    } catch (error) {
        return res.status(500).send({status:false,err:error.message})
    }
}

module.exports = {getCart,updateCart,deleteCart}