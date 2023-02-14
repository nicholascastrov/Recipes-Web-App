const { Schema, model } = require('mongoose');

const recipeSchema = new Schema({
    title: {type: String, required: true, unique: true},
    level: {type: String, enum: ['Easy Peasy', 'Amateur Chef', 'UltraPro Chef']},
    ingredients: {type: [String]},
    cuisine: {type: String, required: true},
    dishType: {type: String, enum: ['breakfast', 'main_course', 'soup', 'snack', 'drink', 'dessert', 'other']},
    image: String,
    duration: {type: Number, min: 0},
    creator : String,
    created: {type: Date, default: Date.now}
  },
  {
    timestamps: true
  }
  );

  module.exports = model('Recipe', recipeSchema);  