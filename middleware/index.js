var Poll = require("../models/poll");
var moment = require("moment")

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkPollOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Poll.findById(req.params.id, function(err, foundPoll){
           if(err){
               req.flash("error", "Poll not found");
               res.redirect("back");
           }  else {
               // does user own the poll?
            if(foundPoll.author.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isBeforeDeadline = function(req, res, next) {
  Poll.findById(req.params.id, function(err, foundPoll){
     if(err){
         req.flash("error", "Poll not found");
         res.redirect("back");
     }  else {
         //has poll expired
      if(moment(foundPoll.deadline).isSameOrAfter(moment())) {
          next();
      } else {
        if(req.isAuthenticated()){
          if(foundPoll.author.equals(req.user._id) || req.user.isAdmin) {
              next();
          }
        }
          req.flash("error", "Deadline to vote has passed");
          res.redirect("/polls/" + req.params.id + "/r");
      }
     }
  });
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
}

middlewareObj.enforceLogin = function(req, res, next) {
  Poll.findById(req.params.id, function(err, foundPoll){
     if(err){
         req.flash("error", "Poll not found");
         res.redirect("back");
     }  else {
        if(foundPoll.enforceLogin) {
          if(req.isAuthenticated()){
              return next();
          }
          req.flash("error", "This poll requires you to be logged in.");
          req.session.returnTo = req.originalUrl;
          res.redirect("/login");
        } else {
          return next();
        }
     }
  });
}

middlewareObj.isAdmin = function(req, res, next){
    if(res.locals.currentUser.isAdmin){
        return next();
    }
    req.flash("error", "You need do not have permission to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;
