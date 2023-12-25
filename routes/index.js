var express = require('express');
var router = express.Router();
const userModel= require("./users");
const postModel= require("./post");
const storyModel= require("./story");
const passport = require('passport');
const upload= require('./multer')
const localStrategy=require("passport-local");

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn,async function(req, res,next) {
 const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  const posts= await postModel.find().populate("user");
  const story= await storyModel.find().populate("user")

  res.render('feed', {footer: true,posts,user,story,req});
});

router.get('/profile',isLoggedIn,async function(req, res) {
  const user= await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('profile', {footer: true,user});
});

router.get('/search',isLoggedIn,async function(req, res) {
   const user= await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('search', {footer: true,user,});
});

// for search
router.get('/username/:username',isLoggedIn,async function(req, res) {
  const regex= new RegExp(`^${req.params.username}`,'i');
 const users=await userModel.find({username:regex});
 res.json(users);
});

// like
router.get('/like/post/:id',isLoggedIn,async function (req,res){
  const user= await userModel.findOne({username:req.session.passport.user});
  // find current post on which like action is going to happen
  const post= await postModel.findOne({_id: req.params.id});

// if already like remove like
// if not liked remove it
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }

  await post.save();
  res.redirect('/feed')

})

router.get('/edit',async function(req, res) {
  const user= await userModel.findOne({username:req.session.passport.user})
  res.render('edit', {footer: true,user});
});

router.get('/upload',isLoggedIn,async function(req, res) {
 const user= await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('upload', {footer: true,user});
});

router.post("/register", function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    course: req.body.course,
  });

  userModel.register(userData, req.body.password, function (err, user) {
    if (err) {
      console.error("Registration error:", err);
      // Handle the error here
      res.status(500).send("Username already taken or you are entering invalid email"); // You can customize the error response
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("./profile");
      });
    }
  });
});

router.post("/login",passport.authenticate("local",{
  successRedirect:"/feed",
  failureRedirect:"/login",
}),function(req,res){
  
})

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}

// profile upload
router.post('/update',upload.single('image'),async function(req,res,next){
  const user= await userModel.findOneAndUpdate(
    {username:req.session.passport.user},
    {username:req.body.username,name:req.body.name,bio:req.body.bio},
    {new:true}
    );

    if(req.file){
      user.profileImage=req.file.filename
    }
    
    await user.save();
    res.redirect('/profile');
})

//upload post
router.post('/upload',isLoggedIn,upload.single('image'),async function(req,res,next){
   if(!req.file){
      return res.status(404).send("No files uploaded");
    }
  const user= await userModel.findOne({username:req.session.passport.user});
  const post= await postModel.create({
    picture:req.file.filename,
    user:user._id,
    caption:req.body.caption,

  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed")
})

// Add this route in your routes file (e.g., routes.js)
// Delete post
// Update the delete post route
router.get('/delete/post/:id', isLoggedIn, async function (req, res,next) {
  try {
    const postId = req.params.id;
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Find the post and check if the user owns it
    const post = await postModel.findOne({ _id: postId, user: user._id });

    if (!post) {
      // Post not found or user does not own the post
      return res.status(404).send('oops You cannot delete the post as you are not woner of this post');
    }

    // Remove the post from the user's posts
    user.posts.pull(postId);
    await user.save();

    // Delete the post
    await postModel.deleteOne({ _id: postId });

    // Redirect back to the feed
    res.redirect('/feed');
  } catch (error) {
    // Handle errors
    next(error);
  }
});



// Route for opening profile based on user ID
router.get('/profile/user/:id', async function (req, res) {
  try {
    const userId = req.params.id;
    const user=await userModel.findOne({username:req.session.passport.user})
    const visiteduser = await userModel.findById(userId).populate('posts');
    const post = await postModel.findOne({_id:req.params.id})
    res.render('visitprofile', { footer: true, user,userId,post,visiteduser });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// follow route
router.get('/user/follow/:id', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    const visiteduser = await userModel.findById(req.params.id).populate('posts');

    // if already following, remove follow; if not following, add follow
    if (visiteduser.followers.indexOf(user._id) === -1) {
      visiteduser.followers.push(user._id);
      visiteduser.notifications.push(user._id);
      user.following.push(visiteduser._id);
    } else {
      visiteduser.followers.splice(visiteduser.followers.indexOf(user._id), 1);
      visiteduser.notifications.splice(visiteduser.notifications.indexOf(user._id), 1);
      user.following.splice(user.following.indexOf(visiteduser._id), 1);
    }

    await visiteduser.save();
    await user.save(); // Save the changes

    res.redirect(`/profile/user/${visiteduser._id}`);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// notification get route
router.get('/notification', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user })
      .populate('username')
      .populate('posts');

    res.render('notification', { footer: true, user});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// story route
// story route
router.post('/story', isLoggedIn, upload.single('file'), async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    
    // Check if the user already has a story
    const existingStory = await storyModel.findOne({ user: user._id });

    if (existingStory) {
      // Update the existing story
      existingStory.media = req.file.filename;
      await existingStory.save();
    } else {
      // Create a new story
      const story = await storyModel.create({
        media: req.file.filename,
        user: user._id,
      });

      user.story.push(story._id);
      await user.save();
    }

    console.log("Story successfully uploaded");
    res.redirect('/feed');
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// story viewing route
router.get("/story/user/:id", isLoggedIn, async function(req,res,next){
  try {
    
    const userId = req.params.id;
    const user=await userModel.findOne({username:req.session.passport.user})
    const visitedviewer = await userModel.findById(userId).populate('story');
    const story = await storyModel.findOne({_id:req.params.id}).populate("user")
    res.render('viewstory', { footer: true, user,userId,story,visitedviewer });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

// chat logic
router.get('/chat', function(req, res) {
  res.render('chat', {footer: false});
});
//menu
router.get('/menu',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});

  res.render('menu', {footer: false,user});
});

// view posts dynamically of user
router.get('/user/post/:id',isLoggedIn, async function(req,res,next){
   const userId = req.params.id;
  const user= await userModel.findOne({username:req.session.passport.user});
  // find current post on which like showing is going to happen
  const posts= await postModel.find({_id: req.params.id});

  const visiteduser = await userModel.findById(userId).populate('posts');

  res.render('viewposts',{footer:true,user,visiteduser,posts})
})
module.exports = router;
