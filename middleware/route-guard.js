// middleware/route-guard.js

const Recipe = require('../models/Recipe.model')
const Comment = require('../models/Comment.model')

// checks if the user is logged in when trying to access a specific page
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/users/login');
    }
    next();
  };
  
  // if an already logged in user tries to access the login page it
  // redirects the user to the home page
const isLoggedOut = (req, res, next) => {
if (req.session.user) {
    return res.redirect('/');
}
next();
};

const isOwner = (req, res, next) => {

    Recipe.findById(req.params.id)
    // .populate('creator')
    .then((foundRecipe) => {
        console.log(foundRecipe._id, "HHHHHHEEEELLLLOOOOO")
        console.log(foundRecipe.creator)
        // console.log(req.session.user._id)
        if (!req.session.user || req.session.user.username !== foundRecipe.creator) {
            res.render('index.hbs', {errorMessage: "You are not authorized."})
        } else {
            next()
        }
    })
    .catch((err) => {
        console.log(err)
    })

}

const isCommentOwner = (req, res, next) => {
    console.log(req.params)
    console.log(req.params.id)
    Comment.findById(req.params.id)
    // .populate('creator')
    .then((foundRecipe) => {
        console.log(foundRecipe, "😃")
        if (!req.session.user || req.session.user.username !== foundRecipe.user) {
            res.render('index.hbs', {errorMessage: "You are not authorized."})
        } else {
            next()
        }
    })
    .catch((err) => {
        console.log(err)
    })

}

// const isNotOwner = (req, res, next) => {

//     Recipe.find(req.params)
//     .populate('creator')
//     .then((foundRecipe) => {
//         if (!req.session.user || foundRecipe.creator === req.session.user) {
//             res.render('index.hbs', {errorMessage: "You can't review your own room."})
//         } else {
//             next()
//         }
//     })
//     .catch((err) => {
//         console.log(err)
//     })

// }

module.exports = {
isLoggedIn,
isLoggedOut,
isOwner,
isCommentOwner
};