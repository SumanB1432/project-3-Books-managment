const express = require('express');
const router = express.Router();
const aws = require('aws-sdk')

const userController = require("../controllers/userController")
const bookController = require("../Controllers/bookController")
const reviewController = require("../Controllers/reviewController")
const middleWare = require("../middleware/auth")


/********************************************AWS S3********************************************************/

    
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})


let uploadFile= async ( file) =>{
  return new Promise( function(resolve, reject) {
   
   let s3= new aws.S3({apiVersion: '2006-03-01'}); 

   var uploadParams= {
       ACL: "public-read",
       Bucket: "classroom-training-bucket",  //HERE
       Key: "groupx76/" + file.originalname, //HERE 
       Body: file.buffer
   }


   s3.upload( uploadParams, function (err, data ){
       if(err) {
           return reject({"error": err})
       }
       console.log(data)
       console.log("file uploaded succesfully")
       return resolve(data.Location)
   })

  })
}


router.post("/aws-s3", async function(req, res){

  try{
      let files= req.files
      if(files && files.length>0){          
          let uploadedFileURL= await uploadFile( files[0] )
          res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }  
  }
  catch(err){
      res.status(500).send({msg: err})
  }
  
})





//----------------------------------------------USER APIS------------------------------------------------------

router.post("/register", userController.registerUser)
router.post("/login", userController.login)

//----------------------------------------------BOOK APIS------------------------------------------------------

router.post("/books",middleWare.Authentication,bookController.createBooks);
router.get("/books",middleWare.Authentication,bookController.getBook)
router.get("/books/:bookId",middleWare.Authentication, bookController.getBookFromBookId)
router.put("/books/:bookId", middleWare.Authentication,bookController.updateBook)
router.delete("/books/:bookId",middleWare.Authentication, bookController.DeleteBook)

//---------------------------------------------REVIEW APIS------------------------------------------------------

router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updatedReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)




// If Invalid API requested.
router.all("/**", function (req, res) {
    res.status(400).send({
      status: false,
      message: "INVALID END-POINT: The API You requested is NOT available.",
    });
  });



  
  

module.exports = router;