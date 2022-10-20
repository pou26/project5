const orderModel =require('../models/orderModel')
const cartModel =require('../models/cartModel')
const valid = require('../Validator/validator')
const UserModel = require('../models/userModel')


//=============POST /users/:userId/orders==================//

const createOrder = async (req,res) =>{
    try{
    
let userId = req.params.userId
if(!valid.isValidObjectId(userId)){
    return res.status(400).send({ status: false, message: "UsertId is Not Valid" });
}
let data =req.body
let {cartId, cancellable,status,isDeleted} =data
console.log(typeof isDeleted )

if(!valid.isValidRequestBody(data)){
    return res.status(400).send({ status: false, message: " Enter Cart details" });
}

 
const findUser = await UserModel.findById(userId)
if(!findUser){
    return res.status(404).send({ status: false, message: "User not found" });
  }

  if(!(cartId)){
    return res.status(400).send({ status: false, message: "cartId is Required" });  
  }
   if(!valid.isValidObjectId(cartId)){
    return res.status(400).send({ status: false, message: "cartId is Not Valid" });
  } 

  let cartExist = await cartModel.findById(cartId)
  if(!cartExist){
      return res.status(404).send({status:false,message:"Cart not found"})
  }
  if(cartExist.userId != userId){
        return res.status(400).send({status:false,message:"Cart id and userId are not matched"})
  }

  if(cancellable){
       if(typeof cancellable != "boolean"){
          return res.status(400).send({status:false,message:"Cancellable should be true or false only"})
      }}
      

  if(status){
    let validStatus = ["pending", "completed", "canceled"]
    if(!validStatus.includes(status)){
        return res.status(400).send({status:false,message:`status should be one of this :-"pending", "completed", "canceled"`})
    }
   if(status =="completed" || status =="canceled"){
      return res.status(400).send({status:false,message:"status should be  pending while creating order"})
}
}
  let newQuantity = 0;
  for(let i = 0;i< cartExist.items.length;i++){
  newQuantity = newQuantity + cartExist.items[i].quantity

  }
  
  const newOrder = {
    userId:userId,
    items: cartExist.items,
    totalPrice: cartExist.totalPrice,
    totalItems: cartExist.totalItems,
    totalQuantity: newQuantity,
    cancellable,
    status
}
if(!isDeleted){
    newOrder.isDeleted = false   
}
if (isDeleted){
    if (typeof isDeleted =="boolean"){
        newOrder.isDeleted = isDeleted}
        else{
            {return res.status(400).send({status:false,message:"isDeleted should be true or false only"})}}}

const order = await orderModel.create(newOrder)
    return res.status(201).send({status:true,message:"Order created successfully",data:order})


} 
catch(err){
    return res.status(500).send({status:false,message:err.message})
} 
}

//========================================= updateOrder ================================================//


const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        
        const { orderId, isDeleted, status ,cancellable} = req.body;

        if (!valid.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed", });
        };

        if (!orderId)
            return res.status(400).send({ status: false, message: "orderId is required field" });

        if (!valid.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Invalid orderId in body." });
        };

        let orderDetails = await orderModel.findOne({ _id: orderId, userId, isDeleted: false, });

        if (!orderDetails) return res.status(404).send({ status: false, message: "order not found with this UserId and OrderId" });
        //if it is only cancellable 
        if (orderDetails.cancellable== true) {
            if (isDeleted == true) {
                let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId,userId}, { isDeleted, status, deletedAt: Date.now() }, { new: true });

                return res.status(200).send({ status: true, message: "Success", data: updatedOrder });
            }

            let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId,userId}, { status }, { new: true });
            return res.status(200).send({ status: true, message: "Success", data: updatedOrder });
        };
        // if cancellable and status is cancelled
        if (!orderDetails.cancellable && status == "cancelled")
            return res.status(400).send({ status: false, message: "can't modify status to cancelled,as cancellable is false", });
            

        // if (isDeleted == true) {
        //     let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { isDeleted, status, deletedAt: Date.now() }, { new: true });
        //     return res.status(200).send({ status: true, message: "Success", data: updatedOrder });
        // };

        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { status:status,cancellable:cancellable }, { new: true });
        return res.status(200).send({ status: true, message: "Success", data: updatedOrder, });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });  
    }
};
 module.exports = {createOrder,updateOrder}