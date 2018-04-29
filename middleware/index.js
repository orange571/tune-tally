var Poll = require("../models/poll");

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

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next){
    if(res.locals.currentUser.isAdmin){
        return next();
    }
    req.flash("error", "You need do not have permission to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;
