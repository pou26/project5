const valid = require("../Validator/validator")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const UserModel = require("../models/userModel")

const createCart = async function (req,res) {
try {
    let userId =req.params.userId

    let data = req.body
    if(!valid.isValidRequestBody(data)){
        return res.status(400).send({status:false,msg:"Give valid userID",})
    }
    
    let {productId,quantity,cartId} = data
    const user = await UserModel.findById(userId)
    if (!user) {
        return res.status(404).send({ status: false, message: "No User found" });
    }
    if(!valid.isValidObjectId(productId)){
        return res.status(400).send({status:false,msg:"Give valid userID",})
    }
    const product = await productModel.findOne({ _id: productId, isDeleted: false });
    if(!product){
        return res.status(404).send({ status: false, message: "No product found"})
    }
    if(!quantity){
        quantity=1
    }
    if(typeof quantity != Number && quantity <=0 ){
        return res.status(400).send({ status: false, message: "Enter valid Quantity" })
    }
    const cart = await cartModel.findOne({userId:userId})
    if(cart){
    let cartItem =cart.items
    let cartTotalPrice = cart.totalPrice
    // let cartTotalItem = cart.totalItems
    for(let i=0;i<cartItem.length;i++){
        if(cartItem[i].productId._id == productId){
            cartItem[i].quantity = cartItem[i].quantity + quantity
            cart.totalPrice = ((product.price)*quantity) + cartTotalPrice
            cart.save()
    return res.status(200).send({ status: true, message: "product added to cart successfully", data:cart })
}}
    
            cart.items.push({
            productId: productId,
            quantity: quantity
        })
        cart.totalItems= cartItem.length
         cart.totalPrice= ((product.price)*quantity) + cartTotalPrice
         await cart.save()
    return res.status(200).send({ status: true, message: "product added to cart successfully", data:cart })
}
     if(!cart){
        const itemAdded = {
            userId:userId,
            items: [{
                productId: productId,
                quantity: quantity
            }],
            totalPrice: product.price * quantity,
            totalItems: 1,
            // cart.save()
        }  
    const newCart = await cartModel.create(itemAdded)
    return res.status(201).send({ status: true, message: "product added to cart successfully", data: newCart })
    
}
}catch (error) {
    return res.status(500).send({ status: false, message: error.message })
    
}}
// ======================================  deleteCart  ===================================================//

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!valid.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) };
       
        const userExist = await UserModel.findById(userId)
        if(!userExist)return res.status(404).send({status:false,msg:"user not found"})
    
        const cartExist = await UserModel.findById(userId)
        if(!cartExist)return res.status(404).send({status:false,msg:"No cart found"})
    
        let cart = await cartModel.findByIdAndUpdate((userId),{items:[],totalItems:0,totalPrice:0},{new:true})
        return res.status(204).send({ status: false, msg: "CART DELETED SUCESSFULLY", data:cart})
    } catch (error) {
        return res.status(500).send({status:false,err:error.message})
    }
}
module.exports={createCart,deleteCart}