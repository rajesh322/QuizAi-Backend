const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const quizService = require('./quizservice'); // Import quizService
require('dotenv').config(); // Load environment variables

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Define system instructions outside function for better reusability
const SYSTEM_INSTRUCTIONS = `You are an expert quiz generator. Your task is to generate JSON data for quizzes based on given topics and difficulty levels. 
  The generated quizzes must strictly adhere to the output JSON structure provided and MUST generate exactly the number of questions specified - no more, no less. 
  Ensure each question is unique and relevant to the specified topic. 
  Provide clear and concise explanations for the correct answers. Randomize the order of options for each question.
  Include a variety of question types (multiple-choice, true/false, fill-in-the-blank, predict output of the program, etc.) if necessary.
  Add code snippets in the questions themselves when appropriate and add backslash before double quotes in the generated json.`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: SYSTEM_INSTRUCTIONS,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function generateQuiz(difficulty, topic, numberOfQuestions) {
    console.log(difficulty, topic, numberOfQuestions);
  if (!difficulty || !topic || !numberOfQuestions) {
    console.error("Error: Difficulty, topic, and numberOfQuestions must be provided.");
    return null;
  }

  // Ensure numberOfQuestions is a valid number
  numberOfQuestions = parseInt(numberOfQuestions);
  if (isNaN(numberOfQuestions) || numberOfQuestions < 1 || numberOfQuestions > 50) {
    console.error("Error: Number of questions must be between 1 and 50");
    return null;
  }

  const prompt = `Generate strictly valid JSON data for a quiz with EXACTLY ${numberOfQuestions} questions based on the following:
    Topic: ${topic}
    Difficulty: ${difficulty}
    
    IMPORTANT: The response MUST contain exactly ${numberOfQuestions} questions - no more, no less.
    
    Output JSON Structure without any ellipses or additional text:

    {
      "quizName": "<Topic> Quiz",
      "description": "<Description of the quiz covering the specified topic>",
      "questions": [
        {
          "question": "<Question 1>",
          "options": [
            "<Option 1>",
            "<Option 2>",
            "<Option 3>",
            "<Option 4>"
          ],
          "correctOption": "<Correct Option>",
          "explanation": "<Concise Explanation of the correct answer>"
        }
        // Add more questions as needed without using ellipses
      ]
    }`;

  try {
    const chatSession = model.startChat({
      generationConfig,
    });
   
    const result = await chatSession.sendMessage(prompt);
    let generatedText = result.response.text();
    
    // Remove every backtick from the generated text
    generatedText = generatedText.replace(/`/g, '');
    // Remove the first occurrence of "JSON" (case-insensitive)
    generatedText = generatedText.replace(/JSON/i, '');

    // Extract JSON content between the first { and the last }
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new SyntaxError('JSON delimiters not found.');
    }
    const jsonString = generatedText.substring(jsonStart, jsonEnd + 1);

    // Parse the extracted JSON string
    let quizData;
    try {
      quizData = JSON.parse(jsonString);
      
      // Validate number of questions
      if (quizData.questions.length !== numberOfQuestions) {
        console.error(`Generated quiz has ${quizData.questions.length} questions instead of ${numberOfQuestions}`);
        // Retry generation or trim/pad questions as needed
        if (quizData.questions.length > numberOfQuestions) {
          quizData.questions = quizData.questions.slice(0, numberOfQuestions);
        }
      }
      
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Generated Text:", generatedText);
      throw parseError;
    }

    // Add a timestamp to the quiz data
    quizData.timestamp = new Date();
    console.log("Generated Quiz Data:", quizData);
    // Save the quiz to the database using quizService
    const savedQuiz = await quizService.createQuiz(quizData);
    
    // Return the saved quiz
    return savedQuiz;
      
  } catch (error) {
    console.error("Error during quiz generation:", error);
    return null;
  }
}

module.exports = {
  generateQuiz
};
