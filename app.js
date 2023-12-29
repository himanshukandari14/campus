var createError = require('http-errors');
var express = require('express');
const http = require('http');
var path = require('path');
const chatModule = require('./routes/socket');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

require('dotenv').config();

process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/instclone";
process.env.SESSION_SECRET = "secret key";

const mongoose = require('mongoose'); 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(flash());

var server = http.createServer(app);
var io = chatModule(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'secret key',
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

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
