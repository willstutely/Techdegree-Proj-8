const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
      // res.render('error', {error: error})
      // return;
    }
  }
};

/* GET home page. */
router.get('/', async (req, res, next) => {
  const books = await Book.findAll();
  console.log(res.json(books));
});

/* Create a New Book Form */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book" })
});

/* POST Create Book */
router.post('/', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + article.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Article.build(req.body);
      res.render("books/new", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));


module.exports = router;
