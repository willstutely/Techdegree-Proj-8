var express = require('express');
var router = express.Router();

/* GET books listing. */
router.get('/', function(req, res, next) {
  res.redirect("/books/");
});

module.exports = router;
