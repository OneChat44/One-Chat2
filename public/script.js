const socket = io();

const loginPage = document.getElementById('loginPage');
const chatPage = document.getElementById('chatPage');

const nicknameInput = document.getElementById('nickname');
const genderSelect = document.getElementById('gender');
const interestsInput = document.getElementById('interests');
const startBtn = document.getElementById('startBtn');

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const skipBtn = document.getElementById('skipBtn');
const statusDiv = document.getElementById('status');

let nickname = '';
let gender = '';
let interests = '';

startBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim() || 'Guest';
    gender = genderSelect.value;
    interests = interestsInput.value.trim();
    loginPage.style.display = 'none';
    chatPage.style.display = 'block';
    statusDiv.textContent = 'Looking for a chat partner...';
    socket.emit('login', nickname);
});

socket.on('chatStart', (partnerNickname) => {
    chatBox.innerHTML = '';
    statusDiv.textContent = Connected with ${partnerNickname};
});

socket.on('waiting', () => {
    statusDiv.textContent = 'Waiting for a chat partner...';
});

socket.on('partnerLeft', () => {
    statusDiv.textContent = 'Your partner left. Waiting for a new partner...';
});

sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message === '') return;
    appendMessage(You: ${message});
    socket.emit('message', message);
    messageInput.value = '';
});

socket.on('message', (msg) => {
    appendMessage(msg);
});

skipBtn.addEventListener('click', () => {
    socket.emit('skip');
    chatBox.innerHTML = '';
    statusDiv.textContent = 'Skipping to a new partner...';
});

function appendMessage(msg) {
    const p = document.createElement('p');
    p.textContent = msg;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}