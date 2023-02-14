var express = require('express');
var router = express.Router();

const { isLoggedIn, isOwner, isNotOwner } = require('../middleware/route-guard')

const Recipe = require('../models/Recipe.model')
const Review = require('../models/Review.model')

router.get('/all-recipes', (req, res, next) => {
    Recipe.find()
    .then((foundRecipe) => {
        res.render('recipes/all-recipes.hbs', { recipes: foundRecipe });
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/recipe-details/:id', (req, res, next) => {
    Recipe.findById(req.params.id)
    .then((foundRecipe) => {
        res.render('recipes/recipe-details.hbs', foundRecipe)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/create-recipes', isLoggedIn,  (req, res, next) => {

res.render('recipes/create-recipes.hbs')

})

router.post('/create-recipes', isLoggedIn, (req, res, next) => {
    const {title, cuisine, image, ingredients, dishType, duration, level} = req.body

    let formattedIngredients = ingredients.replace(',', '').split(" ")

    Recipe.create(
    {
        image,
        title,
        duration,
        ingredients: formattedIngredients,
        cuisine,
        dishType,
        level,
        creator: req.session.user.username

    })
    .then((createdRecipe) => {
        console.log(createdRecipe)
        res.redirect('/recipes/all-recipes')
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/edit-recipes/:id', isOwner, (req, res, next) => {
    const id = req.params.id
    Recipe.findById(id)
    .then((foundRecipe) => {
        res.render('recipes/edit-recipes.hbs', foundRecipe)
    })
    .catch((err) => {
        console.log(err)
    })
})


router.post('/edit-recipes/:id', (req, res, next) => {

    const { title, cuisine, image, ingredients, dishType, duration, level } = req.body
    
    Recipe.findByIdAndUpdate(req.params.id, 
        {
            image,
            title,
            duration,
            ingredients,
            cuisine,
            dishType,
            level,
        },
        {new: true})
    .then((updatedRecipe) => {
        console.log(updatedRecipe)
        res.redirect(`/recipes/recipe-details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/delete/:id', isOwner, (req, res, next) => {
    Recipe.findByIdAndDelete(req.params.id)
    .then((deletedRecipe) => {
        res.redirect('/recipes/all-recipes')
    })
})

router.post('/add-review/:id', (req, res, next) => {
    console.log(req.params.id, "HOLAAAAAA")
    Review.create({
        user: req.session.user,
        comment: req.body.comment
    })
    .then((newReview) => {
        console.log(newReview)
        return Recipe.findByIdAndUpdate(req.params.id,
        {
            $push: {reviews: newReview._id}
        },
        {new: true})
    })
    .then((recipeWithReview) => {
        console.log(recipeWithReview)
        res.redirect(`/recipes/recipe-details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})



module.exports = router;



// title: {type: String, required: true, unique: true},
// level: {type: String, enum: ['Easy Peasy', 'Amateur Chef', 'UltraPro Chef']},
// ingredients: {type: [String]},
// cuisine: {type: String, required: true},
// dishType: {type: String, enum: ['breakfast', 'main_course', 'soup', 'snack', 'drink', 'dessert', 'other']},
// image: {type: String, default: "https://images.media-allrecipes.com/images/75131.jpg" },
// duration: {type: Number, min: 0},
// creator : {type: String},
// created: {type: Date, default: Date.now}