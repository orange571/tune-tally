var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Poll = require("../models/poll");
var Song = require("../models/song");
var Vote = require("../models/vote");
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
           //req.flash("success", "Welcome to Tune Tally " + user.username);
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
        //successFlash: "Welcome to Tune Tally"
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
      .populate({path:"participantVotes", populate: {path: "poll"}})
      .exec(function(err,foundUser){
        if(err) {
          console.log(err)
        } else {
          console.log(foundUser);
          var authoredPolls = [];
          var participantVotes = [];
          var username = foundUser.username;
          foundUser.authoredPolls.forEach(function(poll){
            var pollData = {};
            pollData.title = poll.title;
            pollData._id = poll._id;
            pollData.songCount = poll.songs.length;
            pollData.deadline = poll.deadline;
            pollData.createdAt = poll.createdAt;
            authoredPolls.push(pollData);
          });
          foundUser.participantVotes.forEach(function(vote){
            var pollData = {};
            pollData.title = vote.poll.title;
            pollData._id = vote.poll._id;
            pollData.songCount = vote.poll.songs.length;
            pollData.deadline = vote.poll.deadline;
            pollData.lastInteraction = vote.createdAt;
            participantVotes.push(pollData);
          });
          participantVotes.sort(comparelastInteraction);
          authoredPolls.sort(compareDateCreated);
          var foundUserPollData = {username: username, authoredPolls: authoredPolls, participantVotes: participantVotes};
          res.render("dashboard", {data: foundUserPollData});
        }
      })
});

function comparelastInteraction(a, b) {
  //Returns recent date first
  var dateA = new Date(a.lastInteraction);
  var dateB = new Date(b.lastInteraction);
  return dateB - dateA;
}

function compareDateCreated(a,b) {
  //Returns recent date first
  var dateA = new Date(a.createdAt);
  var dateB = new Date(b.createdAt);
  return dateB - dateA;
}

router.get("/searchpage", function(req, res){
  res.render("search")
})



module.exports = router;
