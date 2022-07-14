const mongoose = require("mongoose");
const bookModel = require("../Models/bookModel");
const userModel = require("../Models/userModel");
const reviewModel = require("../Models/reviewModel");



let isValid = function (value) {
  if (typeof value === "undefined" || typeof value == null) return false
  if (typeof value === "string" && value.trim().length == 0) return false;
  if (typeof value === "number") return false;
  return true;
};

//---------------------------------------------CREATE BOOK ----------------------------------------------------

let createBooks = async function (req, res) {
  try {
    let data = req.body;

    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt,bookCover } = data;

    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, message: "you must enter data for creating books" });
    }

  
    /********************************************TITLE VALIDATION************************************************/
    
    if (!title) return res.status(400).send({ status: false, message: "you must give title" });

    if (!isValid(title)) return res.status(400).send({ status: false, message: "Title should be valid string" });

    let Title = await bookModel.findOne({ title: title });

    if (Title) return res.status(400).send({ status: false, message: "This title is already exist" });

   /********************************************EXCERPT VALIDATION************************************************/
    
    if (!excerpt) return res.status(400).send({ status: false, message: "you must give excerpt of the book" });
   
    if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Excerpt should be vali string" });

    if (!excerpt.trim().match(/^[a-zA-Z,\-.\s]*$/)) return res.status(400).send({ status: false, message: "please enter a excerpt of the book" });


    /********************************************USERID VALIDATION************************************************/
   
    if (!userId) return res.status(400).send({ status: false, message: "you must give UserId" });

    if (!isValid(userId)) return res.status(400).send({ status: false, message: "userId should be valid" });

    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id." });

    let checkUser = await userModel.findById(userId);

    if (!checkUser) return res.status(400).send({ status: false, message: "User doesn't exist" });

    /********************************************ISBN VALIDATION************************************************/

    if (!ISBN) return res.status(400).send({ status: false, message: "you must give ISBN" });

   
    if (ISBN.trim().length!==13 || !Number(ISBN)) return res.status(400).send({ status: false, message: "ISBN must contain 13 digits" });

    let checkIsbn = await bookModel.findOne({ ISBN: ISBN });
    if (checkIsbn) return res.status(400).send({ status: false, message: "This ISBN is already exists" });

    
      /********************************************CATEGORY VALIDATION**********************************************/
   
    if (!category) return res.status(400).send({ status: false, message: "please give the category of book" });

    if (!isValid(category)) return res.status(400).send({ status: false, message: "category should be valid string" });

    if (!category.match(/^[a-zA-Z,\s]*$/)) return res.status(400).send({ status: false, message: "please enter valid category" });

    
      /********************************************SUBCATEGORY VALIDATION**********************************************/

    if (!subcategory) return res.status(400).send({ status: false, message: "please give the subcategory of book" });

    if (!isValid(subcategory) || subcategory.length===0 )
    {
    return res.status(400).send({ status: false, message: "subcategory should be valid string" });
    }

    if (Array.isArray(subcategory)) 
    {
      if (!subcategory.join(" ").match(/^[a-zA-Z,\s]*$/) || !subcategory.join("").trim().length)
      {
        return res.status(400).send({ status: false, message: "please enter valid subCategory" });
      }
      else
      {
      const uniqueSubcat = [...new Set(subcategory)];
      data["subcategory"] = uniqueSubcat;
      }        
    }
   
    
    /******************************************RELEASED AT VALIDATION********************************************/

    if (!releasedAt)
      return res.status(400).send({ status: false, message: "releasedAt must be present" });

    if (!releasedAt.trim().match(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/))
      return res.status(400).send({ status: false, message: "please enter valid date" });
   
      
      /********************************************AUTHORISATION************************************************/

    if (data.userId != req.userId)
      return res.status(403).send({status: false, message: "You don't have authority to create this Book."});


     








      /********************************************BOOK CREATE************************************************/

    let newBook = await bookModel.create(data);
    res.status(201).send({ status: true, message: "Success", data: newBook });
  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};




//---------------------------------------------GET BOOKS ----------------------------------------------------

const getBook = async function (req, res) {
  try {
    let data = req.query;
  
    let filterData = { isDeleted: false };
    const { userId, category, subcategory } = data;

    if (userId) 
    {
      if (!mongoose.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "Please enter valid userId " });

      let uid = await userModel.findById(userId);

      if (!uid) 
      {
        return res.status(400).send({ status: false, message: "userId doesn't exist" });
      } 
      else 
      {
        filterData.userId = userId;
      }
    }


    if (category) 
    {
      if (isValid(category) && /^[a-zA-Z ]{2,20}$/.test(category)) 
      {
        filterData.category = category;
      } 
      else 
      {
        return res.status(400).send({ status: false, message: "Please enter valid category name" });
      }
    }

    if (subcategory) 
    {
      if (isValid(subcategory) && /^[a-zA-Z ]{2,20}$/.test(subcategory)) 
      {
        filterData.subcategory = subcategory;
      } 
      else 
      {
        return res.status(400).send({status: false,message: "Please enter valid subcategory name"});
      }
    }


    let findData = await bookModel.find(filterData).select({title: 1,excerpt: 1,userId: 1,category: 1,
        reviews: 1,releasedAt: 1,}).collation({ locale: "en", strength: 2 }).sort({ title: 1 });  //.sort({ title: 1 });

    if (findData.length == 0)
    {
      return res.status(404).send({ status: false, message: "No books found" });
    }
    else 
    {
     return res.status(200).send({ status: true, message: "Books list", data: findData });
    }
  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


//---------------------------------------------GET BOOKS BY ID --------------------------------------------------


const getBookFromBookId = async function (req, res) {
  try {

    let data = req.params.bookId;

    if (!mongoose.isValidObjectId(data)) 
    {
      return res.status(400).send({ status: false, message: "BookId must be valid" });
    }

    const findBook = await bookModel.findOne({ _id: data, isDeleted: false });
    
    if (!findBook) return res.status(404).send({ status: false, message: "Book not found" });


    let reviewedBook = await reviewModel.find({ bookId: data, isDeleted: false })

    if (!reviewedBook.length)
    {
    reviewedBook = [];
    }

    const result = {findBook};
    result.reviewedBook=reviewedBook

    return res.status(200).send({ status: true, message: "Book lists", data: result });
  } 
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};



//--------------------------------------------- UPDATE BOOK ----------------------------------------------------

const updateBook = async function (req, res) {
  try {

    let id = req.params.bookId;

    /********************************************BOOK ID VALIDATION************************************************/

    if (!mongoose.isValidObjectId(id))
      return res.status(400).send({ status: false, message: "Please enter valid bookId " });

    let bookData = await bookModel.findOne({ _id: id ,isDeleted:false});
    if (!bookData )
      return res.status(404).send({ status: false, message: "No book found with this bookId " });


      /********************************************AUTHORIZATION************************************************/

    if (bookData.userId.toString() != req.userId)
      return res.status(401).send({status: false, message: "You don't have authority to update this Book."});

      /********************************************BASIC VALIDATION************************************************/

    let data = req.body;
    if (!Object.keys(data).length)
      return res.status(400).send({ status: false, message: "Please enter valid parameter " });


    const { title, excerpt, releasedAt, ISBN } = data
    let filterData = { isDeleted: false };
    

    if (title) 
    {
      if (isValid(title)) 
      {
        let findTitle = await bookModel.findOne({title});
        if(findTitle) return res.status(400).send({status: false, message: " Book title is not unique" })
        filterData.title = title;
      } 
      else 
      {
        return res.status(400).send({ status: false, message: "Please enter valid book title" });
      }
    }

    


    if (excerpt) 
    {
      if (isValid(excerpt) && /^[a-zA-Z,\-.\s]*$/.test(excerpt)) 
      {
        filterData.excerpt = excerpt;
      } 
      else 
      {
        return res.status(400).send({ status: false, message: "Please enter valid book excerpt" });
      }
    }


    if (releasedAt) 
    {
      if (isValid(releasedAt) && /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(releasedAt))
      {
        filterData.releasedAt = releasedAt;
      } 
      else 
      {
        return res.status(400).send({ status: false, message: "Please enter valid released date" });
      }
    }

    if (ISBN) 
    {
      if (isValid(ISBN) && /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) 
      {
        
        let findISBN = await bookModel.findOne({ISBN});
        if(findISBN) return res.status(400).send({status: false, message: " ISBN is not unique" })
        filterData.ISBN = ISBN;
      } 
      else 
      {
        return res.status(400).send({ status: false, message: "Please enter valid book ISBN" });
      }
    }

 


  let findData = await bookModel.find(filterData);
 
   if (findData.length !== 0) return res.status(400).send({ status: false, message: "Data Not Unique" });
    
    
      let updateData = await bookModel.findOneAndUpdate({ _id: id},{$set: 
        {
            title,
            excerpt,
            releasedAt,
            ISBN,
          },
        },{ new: true, upsert: true });

      return res.status(200).send({ status: true, message: "Success", data: updateData });   
  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};



//---------------------------------------------DELETE BOOK------------------------------------------------------

const DeleteBook = async function (req, res) {
  try {

    let bookId = req.params.bookId;

    if (!mongoose.isValidObjectId(bookId)) 
    {
     return res.status(400).send({status: false, message: "Please enter a valid bookId",});
    }


    let authCheck = await bookModel.findById(bookId);
    if (!authCheck)
      return res.status(404).send({ status: false, message: "No Document found." });

      /********************************************AUTHORISATION************************************************/

    if (authCheck.userId != req.userId)
      return res.status(403).send({status: false, message: "You don't have authority to delete this Book."});


    /********************************************DELETE BOOK************************************************/

    let deleteBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } } );

    if (!deleteBook) 
    {
      return res.status(404).send({ status: false, message: "No book Found or already deleted" });
    }
     else 
     {
      return res.status(200).send({ status: true, message: "deleted successfully" });
    }
  } 
  catch (error) {
    res.status(500).send({ message: error.message });
  } 
};

module.exports = {createBooks,getBook,getBookFromBookId,updateBook,DeleteBook};

