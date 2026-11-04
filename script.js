import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { questions } from "./questions.js";

// Apnar Firebase Config (Screenshot theke add kora hoyeche)[span_0](start_span)[span_0](end_span)
const firebaseConfig = {
  apiKey: "AIzaSyCDXgu9AtxKzb0ZLCx5W-gCnN8rY5XHM4g",
  authDomain: "results-66d6b.firebaseapp.com",
  projectId: "results-66d6b",
  storageBucket: "results-66d6b.firebasestorage.app",
  messagingSenderId: "753969248476",
  appId: "1:753969248476:web:03478368242173a295c19",
  measurementId: "G-XN7MDLKXGV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let index = 0, score = 0, userAnswers = [], student = {}, timer;
let timeLeft = 25 * 60; // 25 minutes

const loginContainer = document.getElementById('login-container');
const examContainer = document.getElementById('exam-container');
const resultContainer = document.getElementById('result-container');
const studentForm = document.getElementById('studentForm');
const questionBox = document.getElementById('question-box');
const nextBtn = document.getElementById('next-btn');

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    student.name = document.getElementById('studentName').value;
    student.roll = document.getElementById('rollNumber').value;
    if(!student.name || !student.roll) return;

    loginContainer.classList.add('hidden');
    examContainer.classList.remove('hidden');
    document.getElementById('student-info-display').innerText = `Nam: ${student.name} | Roll: ${student.roll}`;
    
    startTimer();
    loadQ();
});

function startTimer() {
    timer = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('time').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft <= 0) { clearInterval(timer); submitExam(); }
        timeLeft--;
    }, 1000);
}

function loadQ() {
    let q = questions[index];
    let html = '';
    q.options.forEach(opt => {
        html += `<label class="option-label"><input type="radio" name="opt" value="${opt}"> ${opt}</label>`;
    });
    questionBox.innerHTML = `<h3>${q.question}</h3>${html}`;
    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    const sel = document.querySelector('input[name="opt"]:checked');
    if (!sel) { alert("Doya kore ekti uttor nirbachon korun!"); return; }

    let ans = sel.value;
    userAnswers.push({ q: questions[index].question, selected: ans, correct: questions[index].answer });
    if (ans === questions[index].answer) score++;

    index++;
    if (index < questions.length) {
        loadQ();
    } else {
        clearInterval(timer);
        submitExam();
    }
});

async function submitExam() {
    examContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    document.getElementById('score-display').innerText = `Apnar mot prapto nombor: ${score} / ${questions.length}`;

    let review = "<h3>Uttor bistarito porjalochona:</h3>";
    userAnswers.forEach((item, i) => {
        let correct = item.selected === item.correct;
        review += `<p><b>Proshno ${i+1}: ${item.q}</b><br>
        Apnar uttor: <span style="color:${correct ? 'green' : 'red'}">${item.selected}</span><br>
        Sothik uttor: ${item.correct}</p><hr>`;
    });
    document.getElementById('review-box').innerHTML = review;

    try {
        await addDoc(collection(db, "ict_chapter3_results"), {
            studentName: student.name,
            rollNumber: student.roll,
            totalScore: score,
            maxScore: questions.length,
            submittedAt: serverTimestamp()
        });
        console.log("Data successfully saved to Firebase!");
    } catch (err) {
        console.error("Data save korte shomossha hoyeche: ", err);
    }
  }
      
