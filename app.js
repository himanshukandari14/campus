require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
// socket
const http= require('http');
var path = require('path');
const chatModule= require('./routes/socket')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession= require('express-session');
const passport=require('passport');
const flash = require('connect-flash');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instclone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var app = express();
// Use the flash middleware
app.use(flash());

var server = http.createServer(app); // Create an HTTP server for Socket.io
var io = chatModule(server); // Pass the server to the chat module


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave:false,
  saveUninitialized: false,
  secret:'secret key',
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
