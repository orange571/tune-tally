var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Poll = require("../models/poll");
var Song = require("../models/song");
var middleware = require("../middleware");


//INDEX -
router.get("/", middleware.isLoggedIn, function(req, res){
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
          res.render("polls/dashboard", {data: foundUserPollData});
        }
      })
});

//CREATE - create poll
router.post("/createpoll", middleware.isLoggedIn, function(req, res){
	console.log('body: ' + JSON.stringify(req.body));
  console.log(req.body);
  var newPoll = JSON.parse(JSON.stringify(req.body));
  var title = req.body.title;
  var author = req.user._id;
  var maxVotes = req.body.maxVotes;
  newPoll.author = req.user._id;
  //Check for leading or trailing whitespace
  newPoll.title = req.body.title.replace(/^\s+/, '').replace(/\s+$/, '');
  if (newPoll.title === '') {
      console.log("text was all whitespace");
      req.flash("error", "Title field was empty or only contained white space.");
      return res.redirect("/polls/createpoll");
  }
  console.log("newPoll");
  console.log(newPoll);
  var response = {
      status  : 200,
      success : 'Updated Successfully'
  }
  Poll.create(newPoll, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else {
          console.log(newlyCreated);
          var pollId = newlyCreated._id
          User.findById(req.user._id, function(err, foundUser){
            foundUser.authoredPolls.push(pollId);
            foundUser.save();
          })
          res.json({status: "Success", redirect: "/polls/"+pollId});
      }
  });
});

//NEW - show form to create new announcement
router.get("/createpoll", middleware.isLoggedIn, function(req, res){
   res.render("polls/createpoll");
});

router.post("/:id/vote", middleware.isLoggedIn, function(req, res){
  var newVoteSet = JSON.parse(JSON.stringify(req.body));
  console.log('newVoteSet', newVoteSet);
  //CHECK THAT TOTAL VOTES NOT GREATER THAN MAX VOTES
  Poll.findById(req.params.id).exec().then(function(foundPoll){
    console.log("found it");
    var numRegistedVotes = newVoteSet.registeredVotes.length;
    var numNewSongVotes = 0;
    newVoteSet.newSongs.forEach(function(newSong){
      if(newSong.checked){
        numNewSongVotes++;
      }
    });
    var totalVotes = numRegistedVotes + numNewSongVotes;
    if(totalVotes > foundPoll.maxVotes) {
      throw new Error("Total votes exceeds max votes allowed on poll.")
    } else if(totalVotes === 0){
      throw new Error("Total votes is zero.")
    } else if (foundPoll.songs.length === 0 ) {
      User.findById(req.user._id, function(err, foundUser){
        foundUser.participantPolls.push(req.params.id);
        foundUser.save();
      })
      return foundPoll;
    } else {
      return new Promise(function(resolve, reject){
        var songCounter = 0
        console.log("reached part 342");
        User.findById(req.user._id, function(err, foundUser){
          foundUser.participantPolls.push(req.params.id);
          foundUser.save();
        })
        console.log("Thisis Me", req.user._id)
        foundPoll.songs.forEach(function(songId){
          Song.findById(songId, function(err, foundSong){
            console.log("asb", foundSong);
            foundSong.votes.remove(req.user._id);
            foundSong.save();
            console.log("asb2", foundSong);
            songCounter++;
            if( songCounter === foundPoll.songs.length) {
              resolve(foundPoll);
            }
          });
        });
      });
    }

  }).then(function(foundPoll){
    console.log("reached part 2");
    var newSongCounter = 0;
    if(newVoteSet.newSongs.length === 0) {
      return {newSongsAdded: 0}
    } else {
      return new Promise(function(resolve, reject){
        newVoteSet.newSongs.forEach(function(newSong){
          newSong.author =  req.user._id;
          if(newSong.checked){
            newSong.votes = [ req.user._id ];
          }
          Song.create(newSong, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                console.log(newlyCreated);
                foundPoll.songs.push(newlyCreated._id);
                newSongCounter++;
                if( newSongCounter === newVoteSet.newSongs.length) {
                  console.log("Song List", foundPoll.songs)
                  foundPoll.save();
                  resolve({newSongsAdded: newSongCounter})
                }
            }
          });
        });
      });
    }
  }).then(function(voteData){
    console.log("reached part 3");
    var newVoteCounter = 0;
    if(newVoteSet.registeredVotes.length === 0) {
      return {registeredVotes: 0}
    } else {
      return new Promise(function(resolve, reject){
        newVoteSet.registeredVotes.forEach(function(newVoteSongId){
          Song.findById(newVoteSongId, function(err, foundSong){
             if(err){
                 console.log(err);
             } else {
               foundSong.votes.push(req.user._id);
               console.log("rrr", foundSong);
               foundSong.save();
               newVoteCounter++;
               if( newVoteCounter === newVoteSet.registeredVotes.length) {
                 resolve({status: "Success!"})
               }
             }
          });
        });
      });
    }
  }).then(function(status){
    res.json({status: "Success", redirect: "/polls/"+req.params.id+"/r"});
  })
  .catch(function(err){
    console.log(err);
  });
});

router.get("/createpoll", middleware.isLoggedIn, function(req, res){
   res.render("polls/createpoll");
});

router.get("/:id/r", function(req,res){
  Poll
    .findById(req.params.id)
    .populate({path:"songs"})
    .exec(function(err,foundPoll){
      if(err) {
        console.log(err)
      } else {
        var title = foundPoll.title;
        var pollId = foundPoll._id;
        var deadline = foundPoll.deadline;
        var foundSongs = [];
        foundPoll.songs.forEach(function(song){
          var voteCount = song.votes.length;
          var artist = song.artist;
          var title = song.title;
          var _id = song._id;
          foundSongs.push({voteCount:voteCount, artist:artist, title:title, _id:_id})
        });
        console.log(foundSongs);
        var total = 0;
        for (var i = 0; i < foundSongs.length; i++) {
          total += foundSongs[i].voteCount;
        }
        var pollResultsData = {pollId:pollId, title:title, deadline:deadline, songs: foundSongs, total: total};
        console.log(pollResultsData);
        res.render("polls/pollresults", {data: pollResultsData});
      }
    })
});

// SHOW - shows more info about one poll
router.get("/:id", middleware.isLoggedIn,  function(req, res){
  Poll.
      findById(req.params.id)
      .populate({path:"songs"})
      .exec(function(err, foundPoll){
          if(err){
              console.log(err);
          } else {
              console.log("This is the poll");
              console.log(JSON.stringify(foundPoll, null, "\t"))
              //render show template with that announcement
              console.log("This is the poll");
              res.render("polls/vote", {data: foundPoll});
          }
      });
});

// EDIT announcement ROUTE
//router.get("/:id/edit", middleware.checkAnnouncementOwnership, function(req, res){
  /**
    Announcement.findById(req.params.id, function(err, foundAnnouncement){
        if(err){
            console.log(err)
        } else{
            res.render("announcements/edit", {announcement: foundAnnouncement, page: 'announcements'});
        }
    });**/
//});

// UPDATE announcement ROUTE
//router.put("/:id",middleware.checkAnnouncementOwnership, function(req, res){
  /**
    var title = req.body.announcement.title;
    var post_body = req.body.announcement.post_body;
    //Check for leading or trailing whitespace
    post_body = post_body.replace(/^\s+/, '').replace(/\s+$/, '');
    title = title.replace(/^\s+/, '').replace(/\s+$/, '');
    if (post_body === '' || title === '') {
        console.log("text was all whitespace");
        req.flash("error", "Field(s) was empty or only contained white space.");
        return res.redirect("back");
    }
    // find and update the correct announcement
    Announcement.findByIdAndUpdate(req.params.id, req.body.announcement, function(err, updatedAnnouncement){
       if(err){
           res.redirect("/announcements");
       } else {
           //redirect somewhere(show page)
           res.redirect("/announcements/" + req.params.id);
       }
    });**/
//});



// DESTROY poll ROUTE
router.delete("/:id/song/:songid",middleware.checkPollOwnership, function(req, res){
    console.log("reached delete song route");
   Poll.findById(req.params.id, function(err, foundPoll){
      if(err){
        console.log(err);
          res.json({status: "Error", error: err});
      } else {
        console.log(foundPoll);
        console.log(foundPoll.songs);
        console.log(req.params.songid);
        var isInPoll = foundPoll.songs.some(function (song) {
            return song.equals(req.params.songid);
        });
        console.log(isInPoll);
          if(isInPoll){
            foundPoll.songs.remove(req.params.songid);
            foundPoll.save();
            Song.findByIdAndRemove(req.params.songid, function(err){
               if(err){
                   res.json({status: "Error", error: err});
               } else {
                  res.json({status: "Success"});
               }
             });
          }else{
            res.json({status: "Error", error: "Song not found in Poll"});
          }
      }
    });
});

router.delete("/:id",middleware.checkPollOwnership, function(req, res){
    console.log("reached delete poll route");
   Poll.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/dashboard");
      } else {
          res.redirect("/dashboard");
      }
    });
});




module.exports = router;
