const mongoose = require('mongoose');
const QuizEntity = require('./QuizEntity'); // Import the QuizEntity model

const quizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: [QuizEntity.schema], // Embed QuizEntity schema
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Equivalent to @CreatedDate
  },
});

module.exports = mongoose.model('Quiz', quizSchema);