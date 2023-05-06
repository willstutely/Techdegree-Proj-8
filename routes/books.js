const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const {Op} = require('sequelize');

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

/* Pagination Home Page 
Pagination code here heavily influenced by reading Sequelize docs, beating my head against
the wall trying to figure out how to implement them, and then finding this article on medium.com
that pieced it together:
https://medium.com/hackernoon/how-to-paginate-records-in-mysql-using-sequelize-and-nodejs-a3465d12aad5
*/
router.get('/pagination', async (req, res, next) => {
  try {
    let limit = 5;
    let offset = 0;
    const {count, rows} = await Book.findAndCountAll()
    let page = req.query.page;
    let pages = Math.ceil(count / limit);
    offset = limit * (page - 1)
    const books = await Book.findAll({limit: limit, offset: offset})
    res.render("paginatedIndex", {books: books, pages: pages, currentPage: page})
  } catch (error) {
    throw error
  }
})

/* Create a New Book Form */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book" })
});

/* POST Create Book */
router.post('/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    console.log(req.body)
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
router.get('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id)
    res.render("books/update-book", {book: book, title: "Update Book"})
  } catch (error) {
    throw error;
  }
}));

/* POST Update Book */
router.post('/:id', asyncHandler(async (req, res) => {
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
      book.id = req.params.id;
      res.render("books/update-book", { book: book, errors: error.errors, title: "Update Book"})
    } else {
      throw error;
    }
  }
}))

/* POST Delete an individual book */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy({
      truncate: true,
      restartIdentity: true
    });
    res.redirect("/books")
  } else {
    res.sendStatus(404)
  }
}));

/* Search Route */
router.get('/search/results', asyncHandler(async (req, res) => {
  const searchInput = req.query.search;
  let books;
  if (searchInput) {
    try {
      books = await Book.findAll({
        where: {
          [Op.or]: [
            {author: {
              [Op.like]: '%' + searchInput + '%'
            }
          },
            {title: {
              [Op.like]: '%' + searchInput + '%'
            }
          },
            {genre: {
              [Op.like]: '%' + searchInput + '%'
            }
          },
            {year: {
              [Op.like]: '%' + searchInput + '%'
            }
          }
        ]
        }});
        if (books.length != 0) {
          res.render("index", {books: books, home: "Back to Home"})
        } else {
          res.render("index", {message: "Your search was in vain...", home: "Back to Home"})
        }
    } catch (error) {
      throw error
    }
  } else {
    res.render("index", {message: "The search field was blank...", home: "Back to Home"})
  }
}))

module.exports = router;

