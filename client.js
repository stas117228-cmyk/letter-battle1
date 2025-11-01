const socket = io();

// Элементы интерфейса
const loginSection = document.getElementById('login');
const gameSection = document.getElementById('game');
const leaderboardSection = document.getElementById('leaderboard');
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit');
const nicknameInput = document.getElementById('nickname');
const loginButton = document.getElementById('loginButton');
const playersList = document.getElementById('players');
const leaderboardList = document.getElementById('leaderboardList');
const feedbackText = document.getElementById('feedback');
const roundText = document.getElementById('round');

// --- Подключение игрока ---
loginButton.addEventListener('click', () => {
  const nickname = nicknameInput.value.trim();
  if (nickname) {
    socket.emit('join', nickname);
  }
});

// --- Нажатие Enter для кнопки “Войти” ---
nicknameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    loginButton.click();
  }
});

// --- Отправка ответа ---
submitBtn.addEventListener('click', () => {
  const answer = answerInput.value.trim();
  if (answer) {
    socket.emit('answer', answer);
    answerInput.value = '';
  }
});

// --- Нажатие Enter для кнопки “Ответить” ---
answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitBtn.click();
  }
});

// --- Получение вопроса ---
socket.on('question', (data) => {
  questionText.textContent = data.question;
  roundText.textContent = Раунд ${data.round}/10;
  feedbackText.textContent = '';
});

// --- Обратная связь по ответу ---
socket.on('answerResult', (data) => {
  if (data.correct) {
    feedbackText.textContent = '✅ Правильно!';
    feedbackText.style.color = 'limegreen';
  } else {
    feedbackText.textContent = '❌ Неправильно!';
    feedbackText.style.color = 'red';
  }
});

// --- Обновление списка игроков ---
socket.on('updatePlayers', (players) => {
  playersList.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = ${p.nickname}: ${p.score};
    playersList.appendChild(li);
  });
});

// --- Обновление таблицы лидеров ---
socket.on('updateLeaderboard', (leaders) => {
  leaderboardList.innerHTML = '';
  leaders.forEach(p => {
    const li = document.createElement('li');
    li.textContent = ${p.nickname}: ${p.score};
    leaderboardList.appendChild(li);
  });
});

// --- Переход к игре ---
socket.on('gameStart', () => {
  loginSection.style.display = 'none';
  gameSection.style.display = 'block';
  leaderboardSection.style.display = 'block';
});
