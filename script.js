// حالة التطبيق
let currentState = {
    currentQuestionIndex: 0,
    userAnswers: {},
    score: 0,
    questions: [],
    theme: localStorage.getItem('theme') || 'light'
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadQuestions();
    setupEventListeners();
});

// تحميل الأسئلة من ملف JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        currentState.questions = data.questions;
        
        updateStats();
        displayQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionContainer').innerHTML = 
            '<p>❌ حدث خطأ في تحميل الأسئلة. يرجى المحاولة لاحقاً.</p>';
    }
}

// عرض السؤال الحالي
function displayQuestion() {
    const question = currentState.questions[currentState.currentQuestionIndex];
    const questionContainer = document.getElementById('questionContainer');
    
    let optionsHTML = '';
    
    if (question.type === 'multiple_choice') {
        question.options.forEach((option, index) => {
            const isSelected = currentState.userAnswers[question.id] === option;
            optionsHTML += `
                <div class="option ${isSelected ? 'selected' : ''}" 
                     data-value="${option}"
                     onclick="selectAnswer(${question.id}, '${option}')">
                    ${String.fromCharCode(65 + index)}. ${option}
                </div>
            `;
        });
    } else if (question.type === 'true_false') {
        optionsHTML = `
            <div class="option ${currentState.userAnswers[question.id] === 'صح' ? 'selected' : ''}" 
                 data-value="صح"
                 onclick="selectAnswer(${question.id}, 'صح')">
                صح
            </div>
            <div class="option ${currentState.userAnswers[question.id] === 'خطأ' ? 'selected' : ''}" 
                 data-value="خطأ"
                 onclick="selectAnswer(${question.id}, 'خطأ')">
                خطأ
            </div>
        `;
    }
    
    questionContainer.innerHTML = `
        <div class="question-card">
            <h3>${question.question}</h3>
            <div class="category-badge">${question.category} - ${question.difficulty}</div>
            <div class="options-container">
                ${optionsHTML}
            </div>
        </div>
    `;
    
    updateControls();
}

// اختيار إجابة
function selectAnswer(questionId, answer) {
    currentState.userAnswers[questionId] = answer;
    displayQuestion();
}

// تحديث أزرار التحكم
function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.disabled = currentState.currentQuestionIndex === 0;
    nextBtn.disabled = currentState.currentQuestionIndex === currentState.questions.length - 1;
    submitBtn.style.display = currentState.currentQuestionIndex === currentState.questions.length - 1 ? 
        'flex' : 'none';
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('currentQuestion').textContent = currentState.currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = currentState.questions.length;
    document.getElementById('score').textContent = currentState.score;
}

// التالي
document.getElementById('nextBtn').addEventListener('click', function() {
    if (currentState.currentQuestionIndex < currentState.questions.length - 1) {
        currentState.currentQuestionIndex++;
        displayQuestion();
        updateStats();
    }
});

// السابق
document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentState.currentQuestionIndex > 0) {
        currentState.currentQuestionIndex--;
        displayQuestion();
        updateStats();
    }
});

// تصحيح الإجابات
document.getElementById('submitBtn').addEventListener('click', function() {
    calculateScore();
    showResults();
});

// حساب النتيجة
function calculateScore() {
    currentState.score = 0;
    
    currentState.questions.forEach(question => {
        const userAnswer = currentState.userAnswers[question.id];
        if (userAnswer && userAnswer === question.answer) {
            currentState.score++;
        }
    });
}

// عرض النتائج
function showResults() {
    const resultsContainer = document.getElementById('results');
    const quizContainer = document.querySelector('.quiz-container');
    const finalScore = document.getElementById('finalScore');
    const totalScore = document.getElementById('totalScore');
    const resultMessage = document.getElementById('resultMessage');
    
    finalScore.textContent = currentState.score;
    totalScore.textContent = currentState.questions.length;
    
    // رسالة النتيجة
    const percentage = (currentState.score / currentState.questions.length) * 100;
    if (percentage >= 80) {
        resultMessage.textContent = "ممتاز! لديك معرفة رائعة 🎉";
        resultMessage.style.color = "#28a745";
    } else if (percentage >= 60) {
        resultMessage.textContent = "جيد جداً! يمكنك التحسين 🌟";
        resultMessage.style.color = "#17a2b8";
    } else if (percentage >= 40) {
        resultMessage.textContent = "مقبول، استمر في التعلم 📚";
        resultMessage.style.color = "#ffc107";
    } else {
        resultMessage.textContent = "يحتاج إلى تحسين، لا تستسلم 💪";
        resultMessage.style.color = "#dc3545";
    }
    
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
}

// إعادة الاختبار
document.getElementById('restartBtn').addEventListener('click', function() {
    currentState.currentQuestionIndex = 0;
    currentState.userAnswers = {};
    currentState.score = 0;
    
    document.querySelector('.quiz-container').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    updateStats();
    displayQuestion();
});

// عرض الإجابات الصحيحة
document.getElementById('showAnswers').addEventListener('click', function() {
    const questionContainer = document.getElementById('questionContainer');
    document.querySelector('.quiz-container').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    let answersHTML = '<h2><i class="fas fa-check-circle"></i> الإجابات الصحيحة</h2>';
    
    currentState.questions.forEach((question, index) => {
        const userAnswer = currentState.userAnswers[question.id];
        const isCorrect = userAnswer === question.answer;
        
        answersHTML += `
            <div class="question-card ${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                <h3>سؤال ${index + 1}: ${question.question}</h3>
                <p><strong>إجابتك:</strong> ${userAnswer || 'لم تجب'}</p>
                <p><strong>الإجابة الصحيحة:</strong> ${question.answer}</p>
                <p class="${isCorrect ? 'text-success' : 'text-danger'}">
                    ${isCorrect ? '✓ صحيح' : '✗ خطأ'}
                </p>
            </div>
        `;
    });
    
    questionContainer.innerHTML = answersHTML;
    
    // أزرار إضافية
    const controls = document.querySelector('.controls');
    controls.innerHTML = `
        <button onclick="location.reload()" class="btn-primary">
            <i class="fas fa-home"></i> العودة للبداية
        </button>
        <button onclick="restartQuiz()" class="btn-warning">
            <i class="fas fa-redo"></i> إعادة الاختبار
        </button>
    `;
});

// إعادة الاختبار من البداية
function restartQuiz() {
    currentState.currentQuestionIndex = 0;
    currentState.userAnswers = {};
    currentState.score = 0;
    
    loadQuestions();
    document.querySelector('.quiz-container').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

// إعداد الوضع الليلي
function initTheme() {
    if (currentState.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = 
            '<i class="fas fa-sun"></i> وضع نهاري';
    }
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// تبديل الوضع الليلي
function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (currentState.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        currentState.theme = 'dark';
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> وضع نهاري';
    } else {
        document.documentElement.removeAttribute('data-theme');
        currentState.theme = 'light';
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> وضع ليلي';
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تحديث الأسئلة عند التغيير في قاعدة البيانات
    window.addEventListener('storage', function(e) {
        if (e.key === 'questions_updated') {
            loadQuestions();
        }
    });
}