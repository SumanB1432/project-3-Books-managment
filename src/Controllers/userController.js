const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");

let isValid = function (value) {
  if (typeof value == "undefined" || typeof value == null) return false;
  if (typeof value === "string" && value.trim().length == 0) return false;
  if (typeof value === "number") return false;
  return true;
};

let registerUser = async function (req, res) {
  try {
    let data = req.body;

    const { name, phone, email, password, title, address } = data;

    if (!Object.keys(data).length)
      return res.status(400).send({ status: false, message: "you must enter data" });

    //-----------------------------TITLE VALIDATION----------------------------------------------------

  

    if (!isValid(title)) {
      return res.status(400).send({ status: false, message: "title should be given with a valid string" });
    }
   
    if (!title.trim().match(/^(Miss|Mr|Mrs)$/)) {
      return res.status(400).send({ status: false, message: "enter valid title" });
    }
    //----------------------------------NAME VALIDATION------------------------------------------------
    

    if (!isValid(name)) {
      return res.status(400).send({ status: false, message: "please enter name with a valid string" });
    }

    if (!/^[a-zA-Z ]{2,30}$/.test(data.name.trim())) {
      return res.status(400).send({ status: false, msg: "Enter a valid  name." });
    }

    //-----------------------------------PHONE VALIDATION-----------------------------------------------

    

    if (!isValid(phone)) {
      return res.status(400).send({ status: false, message: "Please enter Phone number with a valid string." });
    }

    if (!phone.trim().match(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/)) {
      return res.status(400).send({ status: false, message: "Enter a valid phone number" });
    }

    let Phone = await userModel.findOne({ phone});
    if (Phone) {
      return res.status(400).send({ status: false, message: "Phone Number already registered" });
    }

    //------------------------------------------EMAIL VALIDATION--------------------------------------------
    

    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "please enter email with a valid string" });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return res.status(400).send({ status: false, message: "Enter a valid email address." });
    }

    let Email = await userModel.findOne({ email });

    if (Email) {
      return res.status(400).send({ status: false, message: "email already registerd" });
    }
    //----------------------------------------PASSWORD VALIDATION------------------------------------------
  

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "please enter password with a valid string" });
    }

    if (password.length<8 || password.length>15) {
      return res.status(400).send({status: false,message:"Password should be 8 to 15 characters"});
    }
    //--------------------------------------------ADDRESS VALIDATION-----------------------------------------
   
if(Object.keys(data).includes('address'))
{
    if(typeof address!=="object") return res.status(400).send({ status: false, message: "address should be an object" })
   
      if (Object.keys(address).length == 0) {
        return res.status(400).send({status: false,message: "address should not be empty",
        });
      }

      if (!isValid(address)) {
        return res.status(400).send({ status: false, message: "address should not be empty" });
      }

      if (!/^[1-9][0-9]{5}$/.test(address.pincode)){ 
        return res.status(400).send({ status: false, message: "Invalid pincode" });}
    }
    //----------------------------------------CREATE USER------------------------------------------------
    
    let newUser = await userModel.create(data);
    return res.status(201).send({ status: true, message: "Success", data: newUser });
  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//------------------------------------------LOGIN USER---------------------------------------------------

let login = async function (req, res) {
  try {
    let data = req.body;
    const { email, password } = data;

    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, message: "email & password must be given" });
    }
    ////////////////////////////////////-----CHECK EMAIL---////////////////////////////////////////
    if (!isValid(email)) {
      return res.status(400).send({ status: false, messgage: "email is required " });
    }
    //////////////////////////////////---------CHECK PASSWORD---------///////////////////////////////
    if (!isValid(password)) {
      return res.status(400).send({ status: false, messsge: "password is required" });
    }

    let checkedUser = await userModel.findOne({
      email: email,
      password: password,
    });

    if (!checkedUser) {
      return res.status(401).send({ status: false, message: "email or password is not correct" });
    }
    ////////////////////////////////////------------CEATE TOKEN----------////////////////////////////////
    let date = Date.now();
    let createTime = Math.floor(date / 1000);
    let expTime = createTime + 3000;

    let token = jwt.sign(
      {
        userId: checkedUser._id.toString(),
        iat: createTime,
        exp: expTime,
      },
      "group76"
    );

    res.setHeader("x-api-key", token);
    return res.status(200).send({ status: true, message: "Success", data: { token: token } });
  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports= {registerUser,login};

