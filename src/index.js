const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route.js");
const mongoose = require("mongoose");
const multer = require("multer")

const app = express();

app.use(express.json());

app.use(multer().any());

mongoose.connect("mongodb+srv://Deepanshuyadav:DEEPyadav1446@cluster0.f9r26yw.mongodb.net/group61Database")

  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));


app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});

