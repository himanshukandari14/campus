const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Use environment variables for sensitive information
const databaseUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instclone';

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    unique: true,
  },
  course: String,
  password: String,
  profileImage: String,
  bio: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  story: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
