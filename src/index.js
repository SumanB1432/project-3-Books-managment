const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require("express")
const app = express();
const multer=require('multer')
const route = require('./routes/route');
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());

app.use(multer().any())


mongoose.connect("mongodb+srv://Suman-1432:Suman1432@cluster0.bkkfmpr.mongodb.net/group76Database", {
    useNewUrlParser: true
})
.then(() => console.log("MongoDb is connected ✔✔✔"))
.catch ( err => console.log(err) )

app.use("/", route)

app.listen(process.env.PORT || 3000, (err)=> {
    console.log("Connected to PORT 3000✅✅✅ ")
})