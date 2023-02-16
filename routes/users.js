var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')

const bcryptjs = require('bcryptjs');

const saltRounds = 10;

const Recipe = require('../models/Recipe.model')
const User = require('../models/User.model')

const { isLoggedIn, isOwner, isCommentOwner, isLoggedOut } = require('../middleware/route-guard')

/* GET users listing. */

router.get('/my-profile/profile/:id', (req, res, next) => {
  return User.findById(req.params.id)
  .then((user) => {
    console.log(user)
    return Recipe.find({creator: user.username})
    .then((foundRecipes) => {
      console.log(foundRecipes)
      res.render('users/profile.hbs', {user: user, foundRecipes: foundRecipes})
    })
  })
  .catch((err) => {
    console.log(err);
  })
  
})

router.get('/profile/:creator', (req, res, next) => {
  console.log(req.params.creator)
  Recipe.find(
    {
      creator:req.params.creator
    })
    .then((foundRecipes) =>{
      res.render('users/profile.hbs', {recipes: foundRecipes})
    })
    .catch((err) => {
      console.log(err);
    })
})

router.get('/signup',(req, res, next) => {
  res.render('users/signup.hbs');
});

router.post('/signup', (req, res, next) => {
  console.log(req.body)
  const {username, email, password} = req.body

  if (!username || !email || !password) {
    res.render('users/signup.hbs', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return;
  }
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => {
      return bcryptjs.hash(password, salt)
    })
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        password: hashedPassword
      });
    })
    .then((userFromDB) => {
      console.log('Newly created user is: ', userFromDB);
      res.redirect('/users/login')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('users/signup.hbs', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('users/signup.hbs', {
           errorMessage: 'Username and email need to be unique. Either username or email is already used.'
        });
      } else {
        next(error);
      }
    })
})

router.get('/login', (req, res, next) => {
  res.render('users/login.hbs');
});

router.post('/login', isLoggedOut, (req,res) => {
  const {email, password} = req.body

  if(!email || !password) {
    res.render('users/login.hbs', { errorMessage: "Please enter both username and password to login"})
    return;
  }

  User.findOne({email})
  .then((user) => {
    if(!user) {
      res.render('users/login.hbs', { errorMessage: 'Email is not registered. Try with other email.' })
      return;
    } else if (bcryptjs.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect(`/users/my-profile/profile/${req.session.user._id}`)
    } else {
      res.render('users/login', { errorMessage: 'Password incorrect, Try Again' })
    }
  })
  .catch((err) => {
    console.log(err);
  })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});

module.exports = router;
