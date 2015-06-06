var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser')();
var bodyParser   = require('body-parser');
var fs           = require('fs');
var flash        = require('connect-flash');
var app          = express();

var settings     = require('./settings.json');

// Redis Session Store
var redis        = require('redis');
var session      = require('express-session');
var redisStore   = require('connect-redis')(session);

// Routes
var index = require('./routes/index');

// Waterline
var Waterline_init = require("./models/index");

// Instantiate a new instance of the ORM
var orm = Waterline_init.waterline;

// Build a config object
var config = Waterline_init.config;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Session store
app.use(cookieParser);
app.use(session({
    key: settings.session.key,
    store: new redisStore(),
    secret: settings.session.secret,
    cookie: {
      path: '/',
      domain: settings.general.parent_domain
    },
    resave: false,
    saveUninitialized: false
}));

// Flash messages
app.use(flash());

app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  //console.log(req.session);
  next();
});

// Routes
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Initialize orm
orm.initialize(config, function(err, models) {
  if(err) throw err;

  app.models = models.collections;
  app.connections = models.connections;
});

module.exports = app;