// client.js

// Подключаем socket.io
const socket = io();

// === Элементы интерфейса ===
const nicknameInput = document.getElementById("nickname");
const joinBtn = document.getElementById("joinBtn");
const lobby = document.getElementById("lobby");
const gameArea = document.getElementById("gameArea");
const questionText = document.getElementById("question");
const answerInput = document.getElementById("answer");
const sendBtn = document.getElementById("sendBtn");
const playersList = document.getElementById("players");
const leaderboard = document.getElementById("leaderboard");

// === Локальные переменные ===
let nickname = "";
let currentQuestion = {};
let gameStarted = false;

// === Событие входа в комнату ===
joinBtn.addEventListener("click", () => {
  nickname = nicknameInput.value.trim();
  if (nickname) socket.emit("joinRoom", nickname);
});

socket.on("roomJoined", (players) => {
  lobby.style.display = "none";
  gameArea.style.display = "block";
  updatePlayersList(players);
});

socket.on("updatePlayers", updatePlayersList);

function updatePlayersList(players) {
  playersList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.nickname + (p.ready ? " ✅" : "");
    playersList.appendChild(li);
  });
}

// === Получение вопроса ===
socket.on("newQuestion", (question) => {
  currentQuestion = question;
  questionText.textContent = question.text;
  answerInput.value = "";
  answerInput.focus();
});

// === Отправка ответа (Enter или кнопка) ===
sendBtn.addEventListener("click", sendAnswer);
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendAnswer();
});

function sendAnswer() {
  const answer = answerInput.value.trim();
  if (answer) socket.emit("submitAnswer", answer);
}

// === Проверка правильности ответа ===
socket.on("answerResult", (isCorrect) => {
  if (isCorrect) {
    answerInput.style.background = "#00cc66"; // зелёный — правильный
  } else {
    answerInput.style.background = "#ff3333"; // красный — неправильный
  }
  setTimeout(() => {
    answerInput.style.background = "white";
  }, 500);
});

// === Обновление лидерборда ===
socket.on("updateLeaderboard", (scores) => {
  leaderboard.innerHTML = "";
  scores.forEach((p, index) => {
    const div = document.createElement("div");
    div.textContent = ${index + 1}. ${p.nickname}: ${p.score};
    leaderboard.appendChild(div);
  });
});
