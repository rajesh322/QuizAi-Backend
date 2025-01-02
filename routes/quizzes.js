const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const quizService = require('../services/QuizService');
const { generateQuiz } = require('../services/generateservice'); // Update import to use correct filename and destructure

// GET /api/quizzes/hello
router.get('/hello', (req, res) => {
  res.send('Hello World!');
});

// GET /api/quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes
router.post('/', async (req, res) => {
  try {
    const createdQuiz = await quizService.createQuiz(req.body);
    res.status(201).json(createdQuiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/quizzes/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedQuiz = await quizService.updateQuiz(req.params.id, req.body);
    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/quizzes/:id
router.delete('/:id', async (req, res) => {
  try {
    await quizService.deleteQuiz(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes/:id/result
router.post('/:id/result', async (req, res) => {
    try {
        const quizResult = await quizService.postQuizResult(req.body, req.params.id);
        res.status(201).json(quizResult);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/quizzes/:id/result
router.get('/:id/result', async (req, res) => {
    try {
        const quizResult = await quizService.getQuizResult(req.params.id);
        if (!quizResult) {
            return res.status(404).json({ message: 'Quiz Result not found' });
        }
        res.json(quizResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/quizzes/result
router.get('/result', async (req, res) => {
    try {
        const quizResults = await quizService.getAllQuizResults();
        res.json(quizResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/quizzes/result/:email
router.get('/result/:email', async (req, res) => {
    try {
        const quizResults = await quizService.getQuizResultByUser(req.params.email);
        res.json(quizResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/quizzes/generate
router.post('/generate', async (req, res) => {
    try {
      const { difficulty, topic, numberOfQuestions } = req.body;  // Changed from questionCount to numberOfQuestions
      const savedQuiz = await generateQuiz(difficulty, topic, numberOfQuestions);
      if (!savedQuiz) {
        return res.status(400).json({ error: 'Failed to generate quiz. Please check the input parameters and try again.' });
      }
      
      // Return the saved quiz
      res.json(savedQuiz);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error during quiz generation.' });
    }
});
module.exports = router;