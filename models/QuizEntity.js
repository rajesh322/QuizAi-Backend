const mongoose = require('mongoose');

const quizEntitySchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctOption: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('QuizEntity', quizEntitySchema);