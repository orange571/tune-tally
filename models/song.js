var mongoose = require("mongoose");

var songSchema = new mongoose.Schema({
   createdAt: { type: Date, default: Date.now },
   title: String,
   artist: String,
   votes: [
     {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vote"
     }
   ],
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   voteCounter: { type: Number, default: 0 }
});

module.exports = mongoose.model("Song", songSchema);
