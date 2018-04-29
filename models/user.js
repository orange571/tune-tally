var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    authoredPolls: [
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Poll"
      }
    ],
    participantPolls: [
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Poll"
      }
    ]
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);
