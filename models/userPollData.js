var mongoose = require("mongoose");

var UserPollDataSchema = new mongoose.Schema({
    poll: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Poll"
    },
    lastInteraction: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserPollData", UserPollDataSchema);
