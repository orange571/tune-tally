var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Poll = require("../models/poll");
var Song = require("../models/song");
var middleware = require("../middleware");

//root route
router.get("/", function(req, res){
    res.render("index");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to Tune Tally " + user.username);
           res.redirect("/");
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'});
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        //successRedirect: req.session.returnTo || '/',
        failureRedirect: "/login",
        failureFlash:true,
        successFlash: "Welcome to Tune Tally"
    }), function(req, res){
      res.redirect(req.session.returnTo || '/');
      console.log(req.session.returnTo);
      delete req.session.returnTo;
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});

//Dashboard
router.get("/dashboard", middleware.isLoggedIn, function(req, res){
    User
      .findById(req.user._id)
      .populate({path:"authoredPolls"})
      .populate({path:"participantPolls"})
      .exec(function(err,foundUser){
        if(err) {
          console.log(err)
        } else {
          console.log(foundUser);
          var authoredPolls = [];
          var participantPolls = [];
          var username = foundUser.username;
          foundUser.authoredPolls.forEach(function(poll){
            var pollData = {};
            pollData.title = poll.title;
            pollData._id = poll._id;
            pollData.songCount = poll.songs.length;
            pollData.deadline = poll.deadline;
            authoredPolls.push(pollData);
          });
          foundUser.participantPolls.forEach(function(poll){
            var pollData = {};
            pollData.title = poll.title;
            pollData._id = poll._id;
            pollData.songCount = poll.songs.length;
            pollData.deadline = poll.deadline;
            participantPolls.push(pollData);
          });
          var foundUserPollData = {username: username, authoredPolls: authoredPolls, participantPolls: participantPolls};
          res.render("dashboard", {data: foundUserPollData});
        }
      })
});

router.get("/searchpage", function(req, res){
  res.render("search")
})



module.exports = router;
