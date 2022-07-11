const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController")
const bookController = require("../Controllers/bookController")
const reviewController = require("../Controllers/reviewController")
const middleWare = require("../middleware/auth")

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


module.exports = router;