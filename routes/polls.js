var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Poll = require("../models/poll");
var Song = require("../models/song");
var Vote = require("../models/vote");
var middleware = require("../middleware");

//INDEX -
router.get("/", middleware.isLoggedIn, function(req, res){
    res.redirect("/");
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

function voteCountCheck(pollId, newVoteSet){
  return new Promise(function(resolve, reject){
    Poll.findById(pollId, function(err, foundPoll){
      if(err){
        console.log(err);
        throw new Error(err);
      }else {
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
        } else {
          resolve(foundPoll);
        }
      }
    });
  });
}

function checkForOldVoteInUser(pollId, userId){
  return new Promise(function(resolve, reject){
    User.findById(userId).populate({path:"participantVotes"}).exec(function(err, foundUser){
      if(err){
        console.log(err);
        throw new Error(err);
      }else {
        var hasVotedBefore = false;
        var voteId = "";
        var voteSongSet = [];
        console.log(foundUser);
        foundUser.participantVotes.some(function(vote){
          console.log("vote.poll", typeof vote.poll);
          console.log("pollId", typeof pollId);
          if(vote.poll == pollId){
            console.log("User has voted on this poll before");
            hasVotedBefore = true;
            voteId = vote._id;
            voteSongSet = vote.songs;
            foundUser.participantVotes.remove(voteId);
            foundUser.save();
            console.log("removed old vote from user");
            console.log(foundUser.participantVotes)
          } else {
            console.log("Skipped", vote);
          }
          return vote.poll === pollId;
        })
        var result = {hasVotedBefore: hasVotedBefore, voteId: voteId, voteSongSet: voteSongSet};
        console.log("finished checkForOldVoteInUser", result);
        resolve(result);
      }
    });
  });
}

function removeOldVoteFromSongs(voteId, songArray) {
  return new Promise(function(resolve, reject){
    if(songArray.length>0){
      var songCounter = 0;
      songArray.forEach(function(songId){
        Song.findById(songId, function(err, foundSong){
          if(err){
            console.log(err);
            throw new Error(err);
          }else {
            console.log(foundSong);
            foundSong.votes.remove(voteId);
            foundSong.save();
            songCounter++;
            if( songCounter === songArray.length) {
              console.log("finished removeOldVoteFromSongs")
              resolve(voteId);
            }
          }
        })
      });
    } else {
      console.log("No songs part of vote");
      resolve(voteId);
    }
  });
}

function removeVoteFromDB(voteId){
  return new Promise(function(resolve, reject){
    Vote.findByIdAndRemove(voteId, function(err){
       if(err){
           console.log(err);
       } else {
           resolve(voteId);
           console.log("removedVoteFromDB", voteId);
       }
     });
  });
}

function removeOldVoteIfExists(foundPoll, userId){
  return new Promise(function(resolve, reject){
    if (foundPoll.songs.length === 0 ) {
      resolve("emptyPoll");
    } else {
      checkForOldVoteInUser(foundPoll.id, userId).then(function(voteState){
        if (voteState.hasVotedBefore) {
          var oldVoteId = voteState.voteId;
          var oldVoteSongSet = voteState.voteSongSet;
          //Remove from Song
          return removeOldVoteFromSongs(oldVoteId, oldVoteSongSet);
          //returns voteId if success
        } else {
          resolve("firstVote");
        }
      }).then(function(oldVoteId){
          resolve(removeVoteFromDB(oldVoteId));
      }).catch(function(error){
        console.log("Error", error);
        throw new Error(error);
      });
    }
  });
}

function createNewVote(newVote) {
  return new Promise(function(resolve, reject){
    Vote.create(newVote, function(err, newlyCreatedVote){
      if (err) {
        console.log(err);
        throw new Error(err);
      } else {
        console.log("createNewVote", newlyCreatedVote);
        User.findById(newVote.user, function(err, foundUser){
          if(err){
            console.log(err)
          }else {
            foundUser.participantVotes.push(newlyCreatedVote._id);
            foundUser.save();
            resolve(newlyCreatedVote._id);
          }
        })
      }
    });
  });
}

function handleNewSongs(newVoteId, pollId, userId, newSongArray) {
  return new Promise(function(resolve, reject){
    Poll.findById(pollId, function(err, foundPoll){
      if(err){
        console.log(err);
      } else {
        Vote.findById(newVoteId, function(err, foundVote){
          if(err){
            console.log(err);
          }else {
            var newSongCounter = 0;
            newSongArray.forEach(function(newSong){
              newSong.author =  userId;
              if(newSong.checked){
                newSong.votes = [ newVoteId ];
              }
              Song.create(newSong, function(err, newlyCreatedSong){
                if(err){
                    console.log(err);
                } else {
                    console.log(newlyCreatedSong);
                    foundPoll.songs.push(newlyCreatedSong._id);
                    foundVote.songs.push(newlyCreatedSong._id);
                    newSongCounter++;
                    if( newSongCounter === newSongArray.length) {
                      foundPoll.save();
                      foundVote.save();
                      resolve(newVoteId);
                    }
                }
              });
            });
          }
        });
      }
    })
  });
}

function handleRegisteredVotes(newVoteId, pollId, registeredVotesArray){
  return new Promise(function(resolve, reject){
    var newVoteCounter = 0;
    Vote.findById(newVoteId, function(err, foundVote){
      if(err){
        console.log(err);
        throw new Error(err);
      } else {
        registeredVotesArray.forEach(function(registeredSongId){
          Song.findById(registeredSongId, function(err, foundSong){
            if(err){
              console.log(err);
              throw new Error(err);
            } else {
              foundVote.songs.push(foundSong._id);
              foundVote.save();
              foundSong.votes.push(newVoteId);
              foundSong.save();
              newVoteCounter++;
              if (newVoteCounter === registeredVotesArray.length){
                console.log("finished handleRegisteredVotes")
                resolve(newVoteId);
              }
            }
          })
        })
      }
    });
  });
}


router.post("/:id/vote", middleware.isLoggedIn, function(req, res){
  var newVoteSet = JSON.parse(JSON.stringify(req.body));
  console.log('newVoteSet', newVoteSet);
  voteCountCheck(req.params.id, newVoteSet).then(function(foundPoll){
    if(!!foundPoll){
      return removeOldVoteIfExists(foundPoll, req.user._id);
    }
  }).then(function(result){
    var newVote = {
      poll: req.params.id,
      user: req.user._id,
      songs: newVoteSet.registeredVotes
    }
    return createNewVote(newVote);
  }).then(function(newVoteId){
    console.log("handlingNewSongs");
    if(newVoteSet.newSongs.length === 0){
      console.log("no new songs to create");
      return newVoteId;
    } else {
      return handleNewSongs(newVoteId, req.params.id, req.user._id, newVoteSet.newSongs);
    }
  }).then(function(newVoteId){
    console.log("handlingRegisteredSongs");
    if(newVoteSet.registeredVotes.length === 0) {
      return newVoteId
    } else {
      return handleRegisteredVotes(newVoteId, req.params.id, newVoteSet.registeredVotes);
    }
  }).then(function(error){
    res.json({status: "Success", redirect: "/polls/"+req.params.id+"/r"});
  }).catch(function(error){
    console.log(error);
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


function removeSongFromDB(songId){
  return new Promise(function(resolve, reject){
    Song.findByIdAndRemove(songId, function(err){
       if(err){
           console.log(err);
           throw new Error(err);
       } else {
           resolve(songId);
           console.log("removedSongFromDB", songId);
       }
     });
  });
}

function removeSongFromVotes(songId, foundSong){
  return new Promise(function(resolve, reject){
    var voteCounter = 0;
    foundSong.votes.forEach(function(voteId){
      Vote.findById(voteId, function(err, foundVote){
          if(err){
            console.log(err);
            throw new Error(err);
          }else {
            console.log("foundVote", foundVote);
            foundVote.songs.remove(songId);
            foundVote.save();
            voteCounter++;
            if(voteCounter === foundSong.votes.length){
              resolve(songId);
            }
          }
      });
    });
  });
}

// DESTROY song ROUTE
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
        console.log("isInPoll", isInPoll);
          if(isInPoll){
            foundPoll.songs.remove(req.params.songid);
            foundPoll.save();
            console.log("removedSongFromPoll");
            Song.findById(req.params.songid, function(err, foundSong){
              if(err){
                console.log(err);
              } else {
                console.log("foundSong",foundSong)
                var voteCounter = 0;
                if(foundSong.votes.length === 0) {
                  console.log("no votes in Song");
                  removeSongFromDB(req.params.songid).then(function(songId){
                    res.json({status: "Success"});
                  }).catch(function(err){
                    res.json({status: "Error", error: err});
                  })
                }else {
                  removeSongFromVotes(req.params.songid, foundSong).then(function(songId){
                    return removeSongFromDB(songId);
                  }).then(function(songId){
                    res.json({status: "Success"});
                  }).catch(function(err){
                    res.json({status: "Error", error: err});
                  })
                }
              }
            });
          }else{
            res.json({status: "Error", error: "Song not found in Poll"});
          }
      }
    });
});

//destroy poll route
router.delete("/:id",middleware.checkPollOwnership, function(req, res){
    console.log("reached delete poll route");
    Vote.remove({ poll: req.params.id }, function (err) {
      if (err) {
        console.log(err);
      }
    });
    Poll.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/dashboard");
      } else {
          res.redirect("/dashboard");
      }
    });
});

module.exports = router;


/**
Vote.findOne({poll: req.params.id, user: req.params.}, function(err, foundVote){
  foundVote.createdAt = Date.now();
  console.log(foundVote.createdAt);
  foundVote.save();
  var songCounter = 0;
  foundVote.songs.forEach(function(songId){
    Song.findById(songId, function(err, foundSong){
      foundSong.votes.remove(foundVote._id);
      foundSong.save();
      songCounter++;
      if( songCounter === foundVote.songs.length) {
        resolve(foundPoll);
      }
    })
  });
});**/
