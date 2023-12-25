const mongoose= require('mongoose');
const plm=require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instclone");

const userSchema= mongoose.Schema({
  username:{
    type:String,
    unique:true,
  },
  name:String,
  email:{
    type:String,
    unique:true,
  },
  course:String,
  password:String,
  profileImage:String,
  bio:String,
  posts:[
    {type:mongoose.Schema.Types.ObjectId,
      ref:"Post"}
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
  story:[
    {
       type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    }
  ],
notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
  ],

  
    
})

userSchema.plugin(plm);
module.exports=mongoose.model("User",userSchema);