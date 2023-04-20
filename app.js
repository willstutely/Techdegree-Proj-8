var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var books = require('./routes/books');
const { Sequelize } = require('sequelize');

var app = express();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db',
  logging: false
});

(async () => {
  await sequelize.sync();
  console.log("Connection to the database was a success...")
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', routes);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('err');
  err.status = 404;
  err.message = "We're sorry! In spite of intense effort, and much hand wringing we simply could not find the route you were looking for...(Error 404)";
  res.render('page-not-found', {err: err.message});
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.error = err;
  if (err.status === undefined) {
    err.status = 500;
    err.message = "Whoops... there was a problem handling your request (Error 500)";
    console.log(err.message);
    res.status(err.status);
    res.render('error', {error: err, message: err.message})
  } else {
    err.message = "Whoops... the page you're looking for cannot be found (Error 404)";
    console.log(err.message);
    res.status(err.status);
  }
});

module.exports = app;
