let currentQuestion = 0;
let timer;
let username;

function startQuiz() {
    username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter a username!');
        return;
    }
    document.getElementById('username-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    loadQuestion();
}

function loadQuestion() {
    fetch('backend/quiz.php?action=get_question&index=' + currentQuestion)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('quiz-section').style.display = 'none';
                document.getElementById('completion-section').style.display = 'block';
                return;
            }
            document.getElementById('question-text').innerText = data.question;
            const optionsDiv = document.getElementById('options');
            optionsDiv.innerHTML = '';
            data.options.forEach((option, index) => {
                const div = document.createElement('div');
                div.className = 'option';
                div.innerText = option;
                div.onclick = () => submitAnswer(index);
                optionsDiv.appendChild(div);
            });
            startTimer();
        });
}

function startTimer() {
    let timeLeft = 10;
    document.getElementById('time-left').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitAnswer(-1); // Unanswered
        }
    }, 1000);
}

function submitAnswer(selectedIndex) {
    clearInterval(timer);
    fetch('backend/quiz.php?action=submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, questionIndex: currentQuestion, answer: selectedIndex })
    }).then(() => {
        currentQuestion++;
        loadQuestion();
    });
}

// Anti-cheating: Detect tab switch
let tabSwitchTime = 0;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabSwitchTime = Date.now();
    } else {
        if (Date.now() - tabSwitchTime > 5000) {
            alert('Tab switch detected for too long! Restarting quiz.');
            currentQuestion = 0;
            loadQuestion();
        }
    }
});