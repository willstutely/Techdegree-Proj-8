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
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* GET Update a book form */
router.get('/:id/update', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book) {
    res.render("books/update-book", {book: book, title: book.title})
  } else {
    res.sendStatus(404)
  }
}));

/* POST Update Book */
router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id)
    if (book) {
      await book.update(req.body);
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}))

/* POST Delete an individual book */
router.post('/:id/delete'), asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404)
  }
  
});

module.exports = router;
