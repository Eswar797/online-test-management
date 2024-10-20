// frontend/script.js
const loginBtn = document.getElementById('login-btn');
const createTestBtn = document.getElementById('create-test-btn');
const submitTestBtn = document.getElementById('submit-test-btn');
const testList = document.getElementById('test-list');
const testTitleDisplay = document.getElementById('test-title-display');
const questionsDisplay = document.getElementById('questions-display');

loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Determine if user is teacher or student
    if (username === 'teacher' && password === 'teacher123') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('teacher-section').style.display = 'block';
    } else if (username === 'student' && password === 'student123') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('student-section').style.display = 'block';
        fetchTests();
    } else {
        alert('Invalid credentials');
    }
});

createTestBtn.addEventListener('click', async () => {
    const title = document.getElementById('test-title').value;
    const questionsJSON = document.getElementById('questions').value;

    try {
        const response = await fetch('http://localhost:5000/api/tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, questions: JSON.parse(questionsJSON) }),
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error creating test:', error);
    }
});

async function fetchTests() {
    try {
        const response = await fetch('http://localhost:5000/api/tests');
        const tests = await response.json();
        testList.innerHTML = '';
        tests.forEach(test => {
            const li = document.createElement('li');
            li.textContent = test.title;
            li.onclick = () => loadTest(test._id, test.questions);
            testList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
    }
}

function loadTest(testId, questions) {
    testTitleDisplay.textContent = `Test: ${testId}`;
    questionsDisplay.innerHTML = '';
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `<strong>${q.question}</strong><br>`;
        q.options.forEach(option => {
            questionDiv.innerHTML += `<input type="radio" name="q${index}" value="${option}">${option}<br>`;
        });
        questionsDisplay.appendChild(questionDiv);
    });
    document.getElementById('test-taker').style.display = 'block';

    submitTestBtn.onclick = () => submitTest(testId, questions);
}

async function submitTest(testId, questions) {
    const answers = [];
    questions.forEach((_, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        answers.push(selectedOption ? selectedOption.value : null);
    });

    try {
        const response = await fetch('http://localhost:5000/api/tests/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentName: 'student', testId, answers }),
        });
        const data = await response.json();
        alert(data.message + ` Score: ${data.score}/${questions.length}`);
    } catch (error) {
        console.error('Error submitting test:', error);
    }
}
