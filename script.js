import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { questions } from "./questions.js";

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

let student = {}, timer;
let timeLeft = 25 * 60; // 25 minutes

const loginContainer = document.getElementById('login-container');
const examContainer = document.getElementById('exam-container');
const resultContainer = document.getElementById('result-container');
const studentForm = document.getElementById('studentForm');
const allQuestionsBox = document.getElementById('all-questions-box');
const submitExamBtn = document.getElementById('submit-exam-btn');

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    student.name = document.getElementById('studentName').value;
    student.roll = document.getElementById('rollNumber').value;
    if(!student.name || !student.roll) return;

    loginContainer.classList.add('hidden');
    examContainer.classList.remove('hidden');
    document.getElementById('student-info-display').innerText = `নাম: ${student.name} | রোল: ${student.roll}`;
    
    startTimer();
    loadAllQuestions();
});

function startTimer() {
    timer = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('time').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft <= 0) { 
            clearInterval(timer); 
            submitExam(); 
        }
        timeLeft--;
    }, 1000);
}

// Shob proshno ek shathe render korar function
function loadAllQuestions() {
    let html = '';
    questions.forEach((q, index) => {
        let optionsHtml = '';
        q.options.forEach(opt => {
            optionsHtml += `
                <label class="option-label">
                    <input type="radio" name="question_${index}" value="${opt}"> ${opt}
                </label>`;
        });

        html += `
            <div class="question-card">
                <p><b>প্রশ্ন ${index + 1}: ${q.question}</b></p>
                ${optionsHtml}
            </div>`;
    });
    allQuestionsBox.innerHTML = html;
}

submitExamBtn.addEventListener('click', () => {
    // Confirm message
    if(!confirm("আপনি কি নিশ্চিতভাবে পরীক্ষা জমা দিতে চান?")) return;

    clearInterval(timer);
    submitExam();
});

async function submitExam() {
    examContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    let score = 0;
    let reviewHtml = "<h3>উত্তর বিস্তারিত পর্যালোচনা:</h3>";

    questions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name="question_${index}"]:checked`);
        let userAnswer = selectedOption ? selectedOption.value : "উত্তর দেওয়া হয়নি";
        let isCorrect = (userAnswer === q.answer);

        if (isCorrect) score++;

        reviewHtml += `
            <div style="margin-bottom: 15px;">
                <p><b>প্রশ্ন ${index + 1}: ${q.question}</b><br>
                আপনার উত্তর: <span style="color:${isCorrect ? 'green' : 'red'}">${userAnswer}</span><br>
                সঠিক উত্তর: ${q.answer}</p>
            </div><hr>`;
    });

    document.getElementById('score-display').innerText = `আপনার মোট প্রাপ্ত নম্বর: ${score} / ${questions.length}`;
    document.getElementById('review-box').innerHTML = reviewHtml;

    // Firebase-e data save kora
    try {
        await addDoc(collection(db, "ict_chapter3_results"), {
            studentName: student.name,
            rollNumber: student.roll,
            totalScore: score,
            maxScore: questions.length,
            submittedAt: serverTimestamp()
        });
        console.log("ডাটা সফলভাবে ফায়ারবেজে সংরক্ষিত হয়েছে!");
    } catch (err) {
        console.error("ডাটা সংরক্ষণ করতে সমস্যা হয়েছে: ", err);
    }
      }
                             
