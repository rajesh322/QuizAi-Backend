const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

const QuizService = {
  getAllQuizzes: async () => {
    try {
      return await Quiz.find();
    } catch (err) {
      console.error("Error in getAllQuizzes:", err);
      throw new Error("Failed to fetch quizzes");
    }
  },

  getQuizById: async (id) => {
    try {
      return await Quiz.findById(id);
    } catch (err) {
      console.error("Error in getQuizById:", err);
      throw new Error("Failed to fetch quiz");
    }
  },

  createQuiz: async (quizData) => {
    try {
      const newQuiz = new Quiz(quizData);
      return await newQuiz.save();
    } catch (err) {
      console.error("Error in createQuiz:", err);
      throw new Error("Failed to create quiz");
    }
  },

  updateQuiz: async (id, updatedQuizData) => {
    try {
      return await Quiz.findByIdAndUpdate(id, updatedQuizData, { new: true });
    } catch (err) {
      console.error("Error in updateQuiz:", err);
      throw new Error("Failed to update quiz");
    }
  },

  deleteQuiz: async (id) => {
    try {
      return await Quiz.findByIdAndDelete(id);
    } catch (err) {
      console.error("Error in deleteQuiz:", err);
      throw new Error("Failed to delete quiz");
    }
  },

  postQuizResult: async (answers, quizId) => {
    try {
      const quiz = await Quiz.findById(quizId).populate('questions');
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      let correctAnswers = 0;
      let incorrectAnswers = 0;

      quiz.questions.forEach((question, index) => {
        const questionId = question._id.toString();

        // Check if an answer exists for the current question
        if (answers.hasOwnProperty(questionId)) {
          const userAnswer = answers[questionId];

          if (userAnswer === question.correctOption) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        } else {
          console.log(`No answer provided for question ${questionId}`);
          incorrectAnswers++; 
        }
      });

      const totalQuestions = quiz.questions.length;
      const score = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;

      const quizResult = new QuizResult({
        quizId: quizId,
        quizName: quiz.quizName,
        userEmail: answers.email,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        score: score,
      });

      return await quizResult.save();
    } catch (err) {
      console.error("Error in postQuizResult:", err);
      throw new Error("Failed to post quiz result");
    }
  },

  getQuizResult: async (id) => {
    try {
      return await QuizResult.findById(id);
    } catch (err) {
      console.error("Error in getQuizResult:", err);
      throw new Error("Failed to fetch quiz result");
    }
  },

  getAllQuizResults: async () => {
    try {
      return await QuizResult.find();
    } catch (err) {
      console.error("Error in getAllQuizResults:", err);
      throw new Error("Failed to fetch all quiz results");
    }
  },

  getQuizResultByUser: async (userEmail) => {
    try {
      return await QuizResult.find({ userEmail: userEmail });
    } catch (err) {
      console.error("Error in getQuizResultByUser:", err);
      throw new Error("Failed to fetch quiz results by user");
    }
  },
};

module.exports = QuizService;