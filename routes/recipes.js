var express = require('express');
var router = express.Router();

const fileUploader = require('../config/cloudinary.config');

const { isLoggedIn, isOwner, isCommentOwner } = require('../middleware/route-guard')

const Recipe = require('../models/Recipe.model')
const Comment = require('../models/Comment.model')

router.get('/all-recipes', (req, res, next) => {
    Recipe.find()
    .then((foundRecipe) => {
        if(req.session.user){
            res.render('recipes/all-recipes.hbs', { recipes: foundRecipe, id: req.session.user._id });
        } else {
            res.render('recipes/all-recipes.hbs', { recipes: foundRecipe});
        }
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/recipe-details/:id', (req, res, next) => {
    Recipe.findById(req.params.id)
    .populate('comments')
    .then((foundRecipe) => {
        console.log(foundRecipe)
        res.render('recipes/recipe-details.hbs', foundRecipe)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/create-recipes', isLoggedIn, (req, res, next) => {

res.render('recipes/create-recipes.hbs')

})

router.post('/create-recipes', isLoggedIn, fileUploader.single('image'), (req, res, next) => {
    const {title, cuisine, ingredients, dishType, duration, level, directions} = req.body

    const newArray = ingredients.split(",");
    console.log(newArray)
    const newest = newArray.map((item) => {
        return item.trim("");
    });

    const newDirectionsArray = directions.split(",");
    const newestDirections = newDirectionsArray.map((item) => {
        return item.trim("");
    });

    Recipe.create(
    {
        image: req.file.path,
        title,
        duration,
        ingredients: newest,
        directions: newestDirections,
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
        console.log(foundRecipe,"found")
        res.render('recipes/edit-recipes.hbs', foundRecipe)
    })
    .catch((err) => {
        console.log(err)
    })
})


router.post('/edit-recipes/:id', fileUploader.single('image'), (req, res, next) => {

    const { title, cuisine, ingredients, dishType, duration, level, directions } = req.body

    const newArray = ingredients.split(",");
    const newest = newArray.map((item) => {
        return item.trim("");
    });

    const newDirectionsArray = directions.split(",");
    const newestDirections = newDirectionsArray.map((item) => {
        return item.trim("");
    });
    console.log(newestDirections)

    Recipe.findByIdAndUpdate(req.params.id, 
        {
            image: req.file.path,
            title,
            duration,
            ingredients: newest,
            directions: newestDirections,
            cuisine,
            dishType,
            level,
        },
        {new: true})
    .then((updatedRecipe) => {
        console.log(updatedRecipe)
        res.redirect(`/recipes/recipe-details/${updatedRecipe._id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/delete-recipe/:id', isOwner, (req, res, next) => {
    Recipe.findByIdAndDelete(req.params.id)
    .then((deletedRecipe) => {
        res.redirect('/recipes/all-recipes')
    })
})

router.post('/add-comment/:id', isLoggedIn, (req, res, next) => {
    console.log(req.session.user, "HOLAAAAAA")
    Comment.create({
        user: req.session.user.username,
        comment: req.body.comment
    })
    .then((newComment) => {
        console.log(newComment)
        return Recipe.findByIdAndUpdate(req.params.id,
        {
            $push: {comments: newComment._id}
        },
        {new: true})
    })
    .then((recipeWithReview) => {

        console.log(recipeWithReview, "klkkkkkkkkkkk")
        res.redirect(`/recipes/recipe-details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.get('/delete-comment/:id', isCommentOwner, (req, res, next) => {
    Comment.findByIdAndDelete(req.params.id)
    .then((deletedComment) => {
        console.log(deletedComment)
        return Recipe.findOneAndUpdate(
            {comments: req.params.id}, 
            {$pull: {comments: req.params.id}}, 
            {new: true})
    })
    .then((updatedRecipe) => {
        console.log(updatedRecipe)
        res.redirect(`/recipes/recipe-details/${updatedRecipe._id}`)   
    })
    .catch((err) => {
        console.log(err)
    })
})


// router.get('/delete-comment/:id', isCommentOwner, (req, res, next) => {
//     Comment.findByIdAndDelete(req.params.id)
//     .then((deletedComment) => {
//         console.log(deletedComment)
//         // return Comment.findByIdAndDelete(req.params.id,
//         // {
//         //     $pop: {comments: deletedComment._id}
//         // },
//         // {new: true})
//     })
//     // .then((recipeWithDeletedComment) => {
//     //     res.redirect(`/recipes/recipe-details/${req.params.id}`, recipeWithDeletedComment)    
//     // })
//     .catch((err) => {
//         console.log(err)
//     })
// })






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