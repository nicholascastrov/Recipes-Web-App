var express = require('express');
var router = express.Router();

const Recipe = require('../models/Recipe.model')


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index.hbs');
});



module.exports = router;
