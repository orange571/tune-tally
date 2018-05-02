var mongoose = require("mongoose");

var VoteSchema = new mongoose.Schema({
    poll: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Poll"
    },
    createdAt: { type: Date, default: Date.now },
    user: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Poll"
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ]
});

module.exports = mongoose.model("Vote", VoteSchema);
