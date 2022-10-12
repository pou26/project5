const UserModel = require("../models/userModel")
const { uploadFile } = require("../AWS/aws")
const valid = require("../Validator/validator")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")




const createUser = async (req, res) => {
    try {
       
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "for registration user data is required" })
        }
        let { fname,lname,email,profileImage, phone,password,address} = req.body

        let files= req.files
    if(files && files.length>0){
    
        let uploadedFileURL= await uploadFile(files[0])

    
        profileImage=uploadedFileURL
    }
    else{
        return res.status(400).send({ msg: "No file found" })
    }

        if (!fname) {return res.status(400).send({ status: false, msg: "Enter your  fname" }); }
        if (!lname) {return res.status(400).send({ status: false, msg: "Enter your  lname" }); }
        if (!email) {return res.status(400).send({ status: false, msg: "Enter your  email" }); }
        if (!profileImage) {return res.status(400).send({ status: false, msg: "Enter your  profilrImage" }); }
        if (!phone) {return res.status(400).send({ status: false, msg: "Enter your  phone" }); }
        if (!password) {return res.status(400).send({ status: false, msg: "Enter your  password" }); }
        if (!address) {return res.status(400).send({ status: false, msg: "Enter your  Address" }); }
        if (!address['shipping']) {return res.status(400).send({ status: false, msg: "Enter your shipping Address" }); }
        if (!address['shipping']['street']) {return res.status(400).send({ status: false, msg: "Enter your shipping street" }); }
        if (!address.shipping.city) {return res.status(400).send({ status: false, msg: "Enter your shipping city" }); }
        if (!address.shipping.pincode) {return res.status(400).send({ status: false, msg: "Enter your shipping pincode" }); }
        if (!address.billing) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.street) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.city) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.pincode) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
      
         if (!valid.isValidName(fname.trim())) {
            return res.status(400).send({ status: false, msg: "Please enter a valid FName" })
        }
        if (!valid.isValidName(lname.trim())) {
            return res.status(400).send({ status: false, msg: "Please enter a valid LName" })
        }
        if (!valid.isValidMobile(phone.trim())) {
            return res.status(400).send({ status: false, msg: "Please Enter valid phone Number" })
        }


        let existphone = await UserModel.findOne({ phone: phone })
        if (existphone) { return res.status(400).send({ status: false, msg: "User with this phone number is already registered." }) }
        email=email.trim()
            if (!valid.isValidEmail(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid Email" })
        }
        
        
        let existEmail = await UserModel.findOne({ email: email })
        if (existEmail) {

            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }

        if (!valid.isValidPassword(password)) {                                            
            return res.status(400).send({ status: false, message: "please Enter valid Password and it's length should be 8-15" })
        }

        if(!valid.isValidpin(address.shipping.pincode))return res.status(400).send({status:false,message:"Please enter valid shipping pincode"})
        if(!valid.isValidpin(address.billing.pincode))return res.status(400).send({status:false,message:"Please enter valid billing pincode"})

        if(address.shipping.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for shipping "})
        if(address.shipping.street.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid street address for shipping "})
        if(address.billing.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for billing "})
        if(address.billing.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for billing "})

        const salt = await bcrypt.genSalt(10)
          password = await bcrypt.hash(req.body.password, salt)


        const hello ={
            fname:fname,lname:lname ,email:email,profileImage:profileImage, phone:phone,password:password,address:address}

        let savedData = await UserModel.create(hello);
        
        return res.status(201).send({ status: true, message: 'Success', data: savedData });


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const loginUser = async function (req, res) {
    try {
        let requestBody = req.body;

        //Extract Params
        let { email, password } = requestBody
        if (Object.keys(requestBody) == 0) { return res.status(400).send({status:false,message:"Please provide email and password"})}
        if (!email) {return res.status(400).send({ status: false, msg: "Enter your  email" })}
        if (!password) {return res.status(400).send({ status: false, msg: "Enter your  password" })}

        if (!valid.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed" })
        }
        //Validation start
        if (!valid.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please enter an email address." })
        }

        if (!valid.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please enter Password." })
        }

        let user = await UserModel.findOne({ email });
        if (!user)
            return res.status(400).send({ status: false, message: "Login failed! Email  is incorrect." });

        let passwordBody = user.password;
        console.log(passwordBody);
        let encryptPassword = await bcrypt.compare(password, passwordBody);
        console.log(encryptPassword);

        if (!encryptPassword) return res.status(400).send({ status: false, message: "Login failed! password is incorrect." });
        //Validation End

        let userId = user._id
        // create token
        let token = jwt.sign(
            {
                userId: user._id.toString(),
            },
            'project-5-Products_Management_61',
            {expiresIn:"12h"}
        )

        res.status(200).send({ status: true, message: 'Success', userId: { userId, token } });

    } catch (err) {
        res.status(500).send({ message: "Server not responding", error: err.message });
    }
};


//================================getuserprofile=================================================//
const getuserprofile = async function (req, res) {
    try {
        let userId = req.params.userId
        if(!userId){
            return res.status(400).send({ status: false, msg: "Provide user Id" })

        }

    //if userId is given then is it valid or not

        if (userId) {
            if (!valid.isValidObjectId (userId))
                return res.status(400).send({ status: false, msg: "Not a valid userId" });
        }
        // finding user in DB
        const getdata = await UserModel.findById(userId)
        if (!getdata) {
            return res.status(404).send({ status: false, message: "No User found" });
        }
        return res.status(200).send({ status: true, data: getdata })

    
    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}

//==============================UpdateUser=================================================//

let updateUser = async (req, res) => {
    try {
        let { lname, fname, password, address, phone, email, profileImage } = req.body
        let UserId = req.params.userId
        let files = req.files
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
           req.body.profileImage = uploadedFileURL
        }

        if (!valid.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Provide details to Update" })
        }
        if (fname) {

            if (!valid.isValidName(fname)) {
                return res.status(400).send({ status: false, message: "Provide valid First name" })
            }
        }

        if (lname) {
            if (!valid.isValidName(lname)) {
                return res.status(400).send({ status: false, message: "Provide valid last name" })
            }
        }
        if (email) {
            if (!valid.isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Provide valid email" })
            }
            let checkemail = await UserModel.findOne({ email: email })
            if (checkemail) {
                return res.status(400).send({ status: false, message: "Email already present" })
            }
        }

        if (phone) {
            if (!valid.isValidMobile(phone)) {
                return res.status(400).send({ status: false, message: "Provide valid phone" })
            }
            let checkphone = await UserModel.findOne({ phone: phone })
            if (checkphone) {
                return res.status(400).send({ status: false, message: "phone already present" })
            }
        }

        if (password) {
            if (!valid.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Provide valid password" })
            }
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(password, salt)
        }
        if (address) {
            if(address["shipping"]){
                if(address["shipping"]["street"]){
             if (!valid.isValid(address["shipping"]["street"])) { return res.status(400).send({ status: false, msg: "provide street" })};
         }if(address["shipping"]["city"]){
            if (!valid.isValid(address["shipping"]["city"])) { return res.status(400).send({ status: false, msg: "provide city" })}}
        }
         if (address) {
            if(address["shipping"]){
                ;
         }}}
         if (address) {
            if(address["shipping"]){
                if(address["shipping"]["pincode"]){
             if (!valid.isValid(address["shipping"]["pincode"])) { return res.status(400).send({ status: false, msg: "provide pincode" })};
         }}}
         if (address) {
            if(address["billing"]){
                if(address["billing"]["street"]){
             if (!valid.isValid(address["billing"]["street"])) { return res.status(400).send({ status: false, msg: "provide street " })};
         }}}
         if (address) {
            if(address["billing"]){
                if(address["billing"]["city"]){
             if (!valid.isValid(address["billing"]["city"])) { return res.status(400).send({ status: false, msg: "provide city " })};
         }}}
         if (address) {
            if(address["billing"]){
                if(address["billing"]["pincode"]){
             if (!valid.isValid(address["billing"]["pincode"])) { return res.status(400).send({ status: false, msg: "provide pincode " })};
         }}}
         
        let updatedData = await UserModel.findOneAndUpdate({_id:UserId},req.body,{new:true})
        return res.status(200).send({ status: true, Data : updatedData})

    }
    catch (error) {
        return res.status(500).send({ status: false, msg : error.message})
}
}



module.exports={createUser,loginUser,getuserprofile,updateUser}
