router.post("/:id/vote", middleware.isLoggedIn, function(req, res){
  var newVoteSet = JSON.parse(JSON.stringify(req.body));
  console.log('newVoteSet', newVoteSet);
  //CHECK THAT TOTAL VOTES NOT GREATER THAN MAX VOTES
  Poll.findById(req.params.id).exec().then(function(foundPoll){
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
      if (foundPoll.songs.length === 0 ) {
        return "empty";
      } else {
        return new Promise(function(resolve, reject){
          Vote.findOne({poll: req.params.id, user: req.user._id}, function(err, foundVote){
            console.log("foundVOte", foundVote);
            if(foundVote){
              User.findById(req.user._id, function(err, foundUser){
                if(err){
                  console.log(err);
                }else {
                  foundUser.participantVotes.remove(foundVote._id);
                  foundUser.save();
                  console.log("removed old vote from user");
                }
              })
              var songCounter = 0;
              foundVote.songs.forEach(function(songId){
                Song.findById(songId, function(err, foundSong){
                  if(err){
                    console.log(err)
                  }else {
                    foundSong.votes.remove(foundVote._id);
                    foundSong.save();
                    songCounter++;
                    if( songCounter === foundVote.songs.length) {
                      console.log("Song List", foundVote.songs)
                      foundPoll.save();
                      resolve(foundVote._id)
                    }
                  }
                })
              });
            } else {
              resolve("empty");
            }
          });
        });
      }
    }
  }).then(function(voteId){
    if (voteId !== "empty") {
      Vote.findByIdAndRemove(voteId, function(err){
         if(err){
             console.log(err);
         } else {
             console.log("deleted vote", voteId);
         }
       });
    }
  }).then(function(){
    console.log("reached part 2");
    var newVote = {
      poll: req.params.id,
      user: req.user._id,
      songs: newVoteSet.registeredVotes
    }
    var newSongCounter = 0;
    return new Promise(function(resolve, reject){
      Vote.create(newVote, function(err, newlyCreatedVote){
        if(err){
          console.log(err);
        } else {
          var newVoteId = newlyCreatedVote._id;
            if(newVoteSet.newSongs.length === 0) {
              console.log("newVoteId no new songs", newVoteId);
              resolve(newVoteId);
            } else {
              return new Promise(function(resolve, reject){
                Poll.findById(req.params.id,function(err, foundPoll){
                  if(err){
                    console.log(err);
                  } else {
                    var newVoteId = newlyCreatedVote._id;
                    newVoteSet.newSongs.forEach(function(newSong){
                      newSong.author =  req.user._id;
                      if(newSong.checked){
                        newSong.votes = [ newVoteId ];
                      }
                      Song.create(newSong, function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        } else {
                            console.log(newlyCreated);
                            foundPoll.songs.push(newlyCreated._id);
                            newSongCounter++;
                            if( newSongCounter === newVoteSet.newSongs.length) {
                              console.log("Song List2", foundPoll.songs)
                              foundPoll.save();
                              resolve(newVoteId)
                            }
                        }
                      });
                    });
                   }
                });
              });
            }
          }
        });
      });
  }).then(function(newVoteId){
    console.log("reached part 3");
    var newVoteCounter = 0;
    if(newVoteSet.registeredVotes.length === 0) {
      return newVoteId
    } else {
      return new Promise(function(resolve, reject){
        newVoteSet.registeredVotes.forEach(function(newVoteSongId){
          Song.findById(newVoteSongId, function(err, foundSong){
             if(err){
                 console.log(err);
             } else {
               foundSong.votes.push(newVoteId);
               console.log("rrr", foundSong);
               foundSong.save();
               newVoteCounter++;
               if( newVoteCounter === newVoteSet.registeredVotes.length) {
                 resolve(newVoteId)
               }
             }
          });
        });
      });
    }
  }).then(function(newVoteId){
    User.findById(req.user._id, function(err, foundUser){
      if(err){
        console.log(err)
      }else {
        foundUser.participantVotes.push(newVoteId);
        foundUser.save();
      }
    })
    res.json({status: "Success", redirect: "/polls/"+req.params.id+"/r"});
  })
  .catch(function(err){
    console.log(err);
  });
});
