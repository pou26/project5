const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")

const middleWare = require("../middleware/auth")


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",middleWare.authentication,userController.getuserprofile)
// router.put("/user/:userId/profile", userController.updateUser)
router.put("/user/:userId/profile",middleWare.authentication,middleWare.authorization,userController.updateUser)
//==========================productapi=============================================// 
// router.get("/getproduct",productController.getproduct)
router.post("/products",productController.createProduct )
router.get('/products', productController.getProductsByQuery)
router.get("/products/:productId", productController.productByid)
router.put("/products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteproduct)

//==========================cartapi=============================================// 

router.post("/users/:userId/cart",cartController.createCart )





router.all("/*",(req,res)=>{
  res.status(400).send({status:false,message:"Endpoint is not correct"})})



module.exports = router;