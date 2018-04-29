const express     = require("express"),
    app         = express(),
    dotenv      = require('dotenv').config(),//environment variables
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    path        = require('path');

const publicPath = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;

//requiring routes
const indexRoutes = require("./routes/index"),


var url = process.env.DATABASEURL || "mongodb://localhost/tunetally";
mongoose.connect(url);
mongoose.connection.once('open', function(){
  console.log('Connection has been made to mongodb')
}).on('error', funcction(error){
  console.log('Connection error:', error);
});

app.set("view engine", "ejs");

app.get('*', function(req, res){
  res.render("Hello world");
});

app.listen(port, () => {
  console.log('Server is up!');
});
