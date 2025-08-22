// script.js
const socket = io();

// Pages
const loginPage = document.getElementById('loginPage');
const chatPage = document.getElementById('chatPage');

// Inputs and buttons
const nicknameInput = document.getElementById('nickname');
const genderSelect = document.getElementById('gender');
const interestsInput = document.getElementById('interests');
const startBtn = document.getElementById('startBtn');

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const skipBtn = document.getElementById('skipBtn');
const statusDiv = document.getElementById('status');

// Store user info
let nickname = '';
let gender = '';
let interests = '';

// --- Login / start chat ---
startBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim() || 'Guest';
    gender = genderSelect.value;
    interests = interestsInput.value.trim();

    // Hide login page, show chat page
    loginPage.style.display = 'none';
    chatPage.style.display = 'block';
    statusDiv.textContent = 'Looking for a chat partner...';

    // Send login info to server
    socket.emit('login', nickname);
});

// --- Receiving chat start ---
socket.on('chatStart', (partnerNickname) => {
    chatBox.innerHTML = '';
    statusDiv.textContent = Connected with ${partnerNickname};
});

// --- Waiting for partner ---
socket.on('waiting', () => {
    statusDiv.textContent = 'Waiting for a chat partner...';
});

// --- Partner left ---
socket.on('partnerLeft', () => {
    statusDiv.textContent = 'Your partner left. Waiting for a new partner...';
});

// --- Sending message ---
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message === '') return;

    appendMessage(You: ${message});
    socket.emit('message', message);
    messageInput.value = '';
});

// --- Receiving message ---
socket.on('message', (msg) => {
    appendMessage(msg);
});

// --- Skip chat ---
skipBtn.addEventListener('click', () => {
    socket.emit('skip');
    chatBox.innerHTML = '';
    statusDiv.textContent = 'Skipping to a new partner...';
});

// --- Helper to append messages ---
function appendMessage(msg) {
    const p = document.createElement('p');
    p.textContent = msg;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}