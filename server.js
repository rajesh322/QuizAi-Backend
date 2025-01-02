const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Database connection
const quizRoutes = require('./routes/quizzes');
const cors = require('cors');

const app = express();
app.use(cors());
// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/quizzes', quizRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});