const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    user: String,
    comment: { type: String, maxlength: 200 }
  });

module.exports = model('Comment', commentSchema);