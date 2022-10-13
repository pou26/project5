const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const middleWare = require("../middleware/auth")


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",middleWare.authentication,userController.getuserprofile)
router.put("/user/:userId/profile",middleWare.authentication,middleWare.authorization,userController.updateUser)


//product
router.post('/products', productController.createProduct);  
router.get('/products', productController.getProductsByQuery);  
 



router.all("/*",(req,res)=>{
  res.status(400).send({status:false,message:"Endpoint is not correct"})})



module.exports = router;