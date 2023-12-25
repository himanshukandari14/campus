const mongoose= require('mongoose');


const postSchema= mongoose.Schema({
 isVideo: {
    type: Boolean,
    default: false,
  },
  video: {
    type: String, // Assuming you store the video file path or URL as a string
  },
  picture:{
    type:String,
},
 caption:{
    type:String,
},
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  date:{
    type:Date,
    default:Date.now()
  },
  likes:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    }
  ],
  posts:[
    {type:mongoose.Schema.Types.ObjectId,
      ref:"post"}
    ],
    
})


module.exports=mongoose.model("Post",postSchema);