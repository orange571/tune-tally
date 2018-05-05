const express     = require("express"),
    app         = express(),
    dotenv      = require('dotenv').config(),//environment variables
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("../models/user"),
    path        = require('path'),
    request     = require('request');

//requiring routes
const indexRoutes = require("../routes/index");
const pollRoutes = require("../routes/polls");

//database setup
const url = process.env.DATABASEURL || "mongodb://localhost/tunetally";
mongoose.connect(url);
mongoose.connection.once('open', function(){
  console.log('Connection has been made to mongodb')
}).on('error', function(error){
  console.log('Connection error:', error);
});

//app setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Emboldened pheonix takes world by storm!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use("/", indexRoutes);
app.use("/polls", pollRoutes);

var client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

app.get('/artist',function(req,res){
  console.log("recieved request");
  console.log(req.query);
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/search?q=' + req.query.key + '&type=artist&limit=3',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        console.log(body.artists.items);
        res.end(JSON.stringify(body.artists.items));
      });
    }
  });
});

app.get('/title',function(req,res){
  console.log("recieved request");
  console.log(req.query);
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/search?q=' + req.query.key + '&type=track&limit=3',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        console.log(body.tracks.items);
        res.end(JSON.stringify(body.tracks.items));
      });
    }
  });
});


app.get('*', function(req, res){
  res.render("404")
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Tune Tally Server is up!');
});
