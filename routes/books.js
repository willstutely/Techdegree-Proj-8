const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error);
    }
  }
};

/* GET home page. */
router.get('/', async (req, res, next) => {
  const books = await Book.findAll();
  res.render("index", {books: books})
});

/* GET home page. */
router.get('/books', async (req, res, next) => {
  const books = await Book.findAll();
  res.render("index", {books: books})
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
    res.redirect("/books/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", { book: book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* GET Update a book form */
router.get('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id)
    res.render("books/update-book", {book: book, title: "Update Book"})
  } catch (error) {
    throw error;
  }
  // const book = await Book.findByPk(req.params.id)
  // if (book) {
  //   res.render("books/update-book", {book: book, title: "Update Book"})
  // } else {
  //   res.render("books/book-not-found", {id: req.params.id})
  // }
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
      res.render("books/book-not-found", {id: req.params.id})
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/update-book", { book: book, errors: error.errors, title: "Update Book"})
      console.log(req.body)
    } else {
      throw error;
    }
  }
}))

/* GET Delete Book form */ 
// router.get('/:id/delete', asyncHandler(async (req, res) => {
//   const book = await Book.findByPk(req.params.id);
//   if (book) {
//     res.render("books/delete-book", {book: book, title: "Delete Book"})
//   } else {
//     res.sendStatus(404)
//   }
// }))

/* POST Delete an individual book */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books")
  } else {
    res.sendStatus(404)
  }
}));

module.exports = router;
