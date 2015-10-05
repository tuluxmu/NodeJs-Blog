var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var async=require('async');
var util=require('util');
var passport = require('passport')
    , GithubStrategy = require('passport-github').Strategy;
var app = express();

app.use(passport.initialize());//初始化 Passport
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
passport.use(new GithubStrategy({
  clientID: "b1c6d21b6139cb523956",
  clientSecret: "a5b47948da252034e0ec8156ba1ef6cf5a203223",
  callbackURL: "http://localhost:3000/login/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  done(null, profile);
}));
routes(app);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});