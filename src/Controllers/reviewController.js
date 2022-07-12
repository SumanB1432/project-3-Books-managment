const reviewModel = require("../Models/reviewModel");
const mongoose = require("mongoose");
const bookModel = require("../Models/bookModel");

let isValid = function (value) {
    if (typeof value === "undefined" || typeof value == null) return false
    if (typeof value === "string" && value.trim().length == 0) return false;
    return true;
  };

///////////////////////// -CREATE REVIEW- ///////////////////////////////

const createReview = async function(req, res){
    try {
     let data = req.body
     let bookId = req.params.bookId
 
     /**************Validation**************/
     if (!mongoose.isValidObjectId(bookId)) 
     return res.status(400).send({ status: false, message: "Invalid book id."})
     
     if(!Object.keys(data).length) 
     return res.status(400).send({status: false, message: "You must give data for review creation."})
 
     
     data.bookId = bookId
 
     
     let checkBookId = await bookModel.findOne({_id: bookId, isDeleted: false});

     if (!checkBookId) return res.status(404).send({status: false, message: "Book doesn't exist"})
 
     if(data.reviewedBy!==undefined){
        if(!isValid(data.reviewedBy)){
            return res.status(400).send({ status: false, message: "Name shouldn't be blank" })
        }
    }

     if (!data.reviewedBy.match(/^[a-zA-Z,\-.\s]*$/)) 
     return res.status(400).send({ status: false, message: "enter a valid name" })
     
     data.reviewedAt = Date.now();
 
    if(data.review!==undefined){
        if(!isValid(data.review)){
            return res.status(400).send({ status: false, message: "Review can't be empty" })  
        }
    }

     if(!data.rating) return res.status(400).send({status: false, message: "You must give rating of this book."})

     if (typeof data.rating != 'number' || data.rating < 1 || data.rating > 5)
     return res.status(400).send({status: false, message: 'Rating should be a number between 1 to 5'})
 
     
     const updatedBooks = await bookModel.findOneAndUpdate({_id: bookId, isDeleted: false}, {$inc: {reviews: 1}},{new:true})
 
     let createdReview = await reviewModel.create(data)
 
     let updatedBooksdata = {updatedBooks}
     
     updatedBooksdata.reviewsData = createdReview
     return res.status(201).send({ status: true, message: 'Success', data: updatedBooksdata})
 }
 catch(error){
     res.status(500).send({ status: false, message: error.message }) 
 }
 }



const updatedReview = async function (req, res) {
    try {
        let data = req.body
        let reviewId = req.params.reviewId

        if(!Object.keys(data).length)
        return res.status(400).send({ status: false, message: "Specify  parameters to update" })

        if (!mongoose.isValidObjectId(reviewId)) 
        return res.status(400).send({ status: false, message: "review id is not valid" })


        let bookId = req.params.bookId
        if (!mongoose.isValidObjectId(reviewId))return res.status(400).send({ status: false, message: "Invalid book id." })

        if(data.reviewedBy!==undefined){
            if(!isValid(data.reviewedBy) || typeof data.reviewedBy!=="string"){
                return res.status(400).send({ status: false, message: "Enter your name properly" })
            }
        }

        if(data.review!==undefined){
            if(!isValid(data.review) || typeof data.review!=="string"){
                return res.status(400).send({ status: false, message: "Enter review properly" })
            }
        }


        let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBook)
        return res.status(404).send({ status: false, message: 'Book Id Not Found ' })

        if(data.rating){
        if (typeof data.rating != 'number' || data.rating < 1 || data.rating > 5)
     return res.status(400).send({status: false, message: 'Rating should be an Integer & between 1 to 5'})
        }

        if (data.reviewedBy && !data.reviewedBy.match(/^[a-zA-Z,\-.\s]*$/)) 
     return res.status(400).send({ status: false, message: "enter a valid name" })
     
            const updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },{
             
                review: data.review,
                rating: data.rating,
                reviewedBy: data.reviewedBy
            
        }, { new: true, upsert: true })


    if(!updateReview)
       return res.status(404).send({status: false, message: 'Nothing found to update'})
    else{
        let result={updateReview}
        result.checkBook=checkBook
        return res.status(200).send({status: true, message: 'Success',data:result})
       }
       
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};




const deleteReview= async function(req,res){
    try{
    let reviewId=req.params.reviewId

    if (!mongoose.isValidObjectId(reviewId)) 
     return res.status(400).send({ status: false, message: "Invalid review id."})

    let data1=await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!data1)
    return res.status(404).send({ status: false, message: 'Review Id Not Found or already deleted'})
     
     let bookId=req.params.bookId
     if (!mongoose.isValidObjectId(bookId)) 
     return res.status(400).send({ status: false, message: "Invalid book id."})

     let data2=await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!data2)
    return res.status(404).send({ status: false, message: 'Book Id Not Found '})

    const deletedReview=await reviewModel.findOneAndUpdate({_id:reviewId},{isDeleted:true,deletedAt:Date.now()},{new:true})

    const updatedBooks = await bookModel.findOneAndUpdate({_id: bookId}, {$inc: {reviews: -1}},{new:true})
    
    return res.status(200).send({ status: true, message: 'Review successfully deleted',Data:{updatedBooks,deleteReview}})
    }
    catch(error){
        res.status(500).send({ status: false, message: error.message }) 
    }
}



 module.exports= {createReview,updatedReview,deleteReview}