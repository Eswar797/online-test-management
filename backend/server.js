// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://eswarnarayana797:hY0SlsGm7wZmDZ7J@cluster0.bk2y7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define a Test schema and model
const testSchema = new mongoose.Schema({
    title: String,
    questions: [{
        question: String,
        options: [String],
        answer: String
    }]
});

const Test = mongoose.model('Test', testSchema);

// Hardcoded login for demo purposes
app.post('/api/login/teacher', (req, res) => {
    const { username, password } = req.body;
    if (username === 'teacher' && password === 'teacher123') {
        return res.status(200).json({ message: 'Teacher logged in' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/login/student', (req, res) => {
    const { username, password } = req.body;
    if (username === 'student' && password === 'student123') {
        return res.status(200).json({ message: 'Student logged in' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

// Create a new test (for teacher)
app.post('/api/tests', async (req, res) => {
    const { title, questions } = req.body;
    const newTest = new Test({ title, questions });
    await newTest.save();
    res.status(201).json({ message: 'Test created', test: newTest });
});

// Get all tests
app.get('/api/tests', async (req, res) => {
    const tests = await Test.find();
    res.status(200).json(tests);
});

// Submit test results
app.post('/api/tests/submit', async (req, res) => {
    const { studentName, testId, answers } = req.body;
    
    // Fetch the test from the database to validate answers
    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    let score = 0;
    test.questions.forEach((question, index) => {
        if (question.answer === answers[index]) {
            score++;
        }
    });

    res.status(200).json({ message: 'Test submitted', score });
});

// Listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
