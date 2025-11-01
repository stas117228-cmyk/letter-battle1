const socket = io();

document.addEventListener('DOMContentLoaded', () => {
  const joinBtn = document.getElementById('joinBtn');
  const startBtn = document.getElementById('startBtn');
  const submitBtn = document.getElementById('submitBtn');
  const nicknameInput = document.getElementById('nickname');
  const answerInput = document.getElementById('answerInput');
  const roomDiv = document.getElementById('room');
  const gameDiv = document.getElementById('game');
  const questionEl = document.getElementById('question');
  const playersList = document.getElementById('playersList');
  const leaderItems = document.getElementById('leaderItems');
  const progressBar = document.querySelector('.progress');

  let currentQuestion = null;

  // Вход в комнату
  joinBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) return;
    socket.emit('joinRoom', nickname);
    document.getElementById('login').style.display = 'none';
    roomDiv.style.display = 'block';
  });

  // Старт игры
  startBtn.addEventListener('click', () => {
    socket.emit('startGame');
    startBtn.disabled = true;
  });

  // Отправка ответа
  submitBtn.addEventListener('click', () => {
    const answer = answerInput.value.trim();
    if (!answer || !currentQuestion) return;
    socket.emit('submitAnswer', answer);
    answerInput.value = '';
  });

  // Enter = ответить
  answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });

  // Получение игроков
  socket.on('updatePlayers', (players) => {
    playersList.innerHTML = '';
    players.forEach(p => {
      const div = document.createElement('div');
      div.classList.add('player-item');
      div.textContent = p;
      playersList.appendChild(div);
    });
  });

  // Получение лидерборда
  socket.on('updateLeaderboard', (board) => {
    leaderItems.innerHTML = '';
    board.forEach(entry => {
      const div = document.createElement('div');
      div.classList.add('leader-item');
      div.textContent = ${entry.name}: ${entry.score};
      leaderItems.appendChild(div);
    });
  });

  // Новый вопрос
  socket.on('newQuestion', (question) => {
    currentQuestion = question;
    questionEl.textContent = question.text;
    progressBar.style.width = '100%';

    // Сброс цвета ввода
    answerInput.classList.remove('correct', 'incorrect');
  });

  // Подсветка ответа
  socket.on('answerResult', (result) => {
    if (result.correct) {
      answerInput.classList.remove('incorrect');
      answerInput.classList.add('correct');
    } else {
      answerInput.classList.remove('correct');
      answerInput.classList.add('incorrect');
    }
  });

  // Прогресс раунда (анимация уменьшения)
  socket.on('roundProgress', (percent) => {
    progressBar.style.width = percent + '%';
  });

  // Конец игры
  socket.on('gameOver', (winner) => {
    alert(`Игра завершена! Победитель: ${winner}`);
    startBtn.disabled = false;
    gameDiv.style.display = 'none';
    roomDiv.style.display = 'block';
  });

  // Начало игры (показ игрового поля)
  socket.on('gameStarted', () => {
    roomDiv.style.display = 'none';
    gameDiv.style.display = 'block';
  });
});
