var mongoose = require("mongoose");

var songSchema = new mongoose.Schema({
   createdAt: { type: Date, default: Date.now },
   title: String,
   artist: String,
   votes: [
     {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
     }
   ],
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   fromSpotify: Boolean,
});

module.exports = mongoose.model("Song", songSchema);
