var mongoose = require("mongoose");

var pollSchema = new mongoose.Schema({
   title: String,
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   createdAt: { type: Date, default: Date.now },
   deadline: { type: Date },
   maxVotes: Number,
   openAdd: Boolean,
   spotifyEnforced: Boolean,
   enforceLogin: Boolean,
   loginOptions: [ String ],
   songs: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "Song"
   }]
});

module.exports = mongoose.model("Poll", pollSchema);
