var express = require('express');
var router = express.Router();

const Recipe = require('../models/Recipe.model')


/* GET home page. */
router.get('/', (req, res, next) => {
  // res.render('index.hbs');
  Recipe.find()
  .then((foundRecipe) => {
    res.render('index.hbs', { recipes: foundRecipe });
  })
  .catch((err) => {
      console.log(err)
  })
});

module.exports = router;
