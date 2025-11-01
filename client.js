// client.js
// Нужна строка подключения socket.io в index.html перед этим файлом:
// <script src="/socket.io/socket.io.js"></script>
// <script src="client.js"></script>

const socket = io(); // <--- Убедись, что /socket.io/socket.io.js подключён ДО client.js

// Элементы страницы (идентичные index.html)
const lobbyDiv = document.getElementById('lobby');
const joinBtn = document.getElementById('joinBtn');
const nicknameInput = document.getElementById('nickname');

const gameArea = document.getElementById('gameArea');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const sendBtn = document.getElementById('sendBtn');

const playersList = document.getElementById('players');
const leaderboardEl = document.getElementById('leaderboard');

// Локальные переменные
let myName = '';
let joined = false;

// --- Вход в комнату ---
joinBtn.addEventListener('click', () => {
  const name = nicknameInput.value.trim();
  if (!name) {
    alert('Введите никнейм');
    return;
  }
  myName = name;
  socket.emit('joinGame', name);
});

// Enter в поле ника тоже отправляет
nicknameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

// --- Отправка ответа ---
sendBtn.addEventListener('click', () => {
  const text = answerInput.value.trim();
  if (!text) return;
  socket.emit('answer', text);
  // не очищаем ответ немедленно если хочешь позволить видеть введенное — но удобнее очистить
  answerInput.value = '';
});

answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

// --- События от сервера ---
socket.on('joined', (payload) => {
  // сервер подтвердил присоединение (если ты используешь 'joined' — иначе используем 'joined' в сервере)
  // прячем лобби, показываем игровую панель
  lobbyDiv.style.display = 'none';
  gameArea.style.display = 'block';
  joined = true;
});

socket.on('newQuestion', (data) => {
  // data: { question, round, total } — или как у тебя на сервере
  questionEl.textContent = (data.round && data.total)
    ? `Вопрос ${data.round}/${data.total}: ${data.question}`
    : data.question;
  // убираем подсказки от предыдущих попыток
  answerInput.classList.remove('correct', 'wrong');
  answerInput.focus();
});

socket.on('answerResult', (data) => {
  // data: { correct: boolean, correctAnswer?: string }
  if (data && data.correct) {
    // короткая визуальная подсказка
    answerInput.classList.remove('wrong');
    answerInput.classList.add('correct');
  } else {
    answerInput.classList.remove('correct');
    answerInput.classList.add('wrong');
  }
  // чистим подсветку через 800 мс
  setTimeout(() => {
    answerInput.classList.remove('correct', 'wrong');
  }, 800);
});

socket.on('updateScores', (scores) => {
  // scores — объект { socketId: { name, score }, ... } или массив — подстраиваемся
  // Если сервер шлёт объект — преобразуем в массив
  let arr = [];
  if (!scores) return;
  if (Array.isArray(scores)) arr = scores;
  else arr = Object.values(scores);

  // players list (левый)
  playersList.innerHTML = '';
  arr.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name || p.nickname || 'Игрок'} — ${p.score ?? 0}`;
    playersList.appendChild(li);
  });

  // leaderboard (правый) — сортируем по очкам
  const sorted = arr.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  leaderboardEl.innerHTML = '';
  sorted.forEach((p, idx) => {
    const div = document.createElement('div');
    div.textContent = `${idx + 1}. ${p.name || p.nickname || 'Игрок'}: ${p.score ?? 0}`;
    leaderboardEl.appendChild(div);
  });
});

socket.on('gameOver', (finalScores) => {
  questionEl.textContent = 'Игра окончена!';
  // показать итог в leaderboard
  let arr = Array.isArray(finalScores) ? finalScores : Object.values(finalScores || {});
  arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  leaderboardEl.innerHTML = '<strong>Итоги:</strong>';
  arr.forEach((p, idx) => {
    const div = document.createElement('div');
    div.textContent = `${idx + 1}. ${p.name || p.nickname || 'Игрок'} — ${p.score ?? 0}`;
    leaderboardEl.appendChild(div);
  });
});

// Если у тебя сервер использует другие имена событий — свяжи их с этим файлом.
// Например: если сервер присылает 'question' вместо 'newQuestion', добавь:
// socket.on('question', data => { ... });

// --- Удобная диагностика в консоли ---
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});
socket.on('disconnect', () => {
  console.log('Socket disconnected');
});
