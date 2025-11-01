const socket = io();

let nickname = '';
const loginDiv = document.getElementById('login');
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');

const nicknameInput = document.getElementById('nickname');
const joinBtn = document.getElementById('joinBtn');
const startBtn = document.getElementById('startBtn');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswer');
const playersList = document.getElementById('playersList');
const leaderboardDiv = document.getElementById('leaderboard');
const roundTitle = document.getElementById('roundTitle');
const questionText = document.getElementById('questionText');
const timerSpan = document.getElementById('timer');

// Войти в комнату
joinBtn.onclick = () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit('join', nickname);
        loginDiv.style.display = 'none';
        lobbyDiv.style.display = 'block';
    } else {
        alert('Введите никнейм!');
    }
};

// Начать игру
startBtn.onclick = () => {
    socket.emit('startGame');
};

// Отправка ответа
submitAnswerBtn.onclick = () => {
    const answer = answerInput.value.trim();
    if (answer) {
        socket.emit('submitAnswer', answer);
        answerInput.value = '';
    }
};

// Обновление списка игроков и лидеров
socket.on('updatePlayers', (players) => {
    // Лобби
    if (lobbyDiv.style.display === 'block') {
        playersList.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = ${p.nickname} ${p.answered ? '✔️' : ''} (${p.score});
            playersList.appendChild(li);
        });
    }
    // Лидерборд
    updateLeaderboard(players);
});

// Игра началась
socket.on('gameStarted', () => {
    lobbyDiv.style.display = 'none';
    gameDiv.style.display = 'block';
});

// Новый раунд
socket.on('newRound', (data) => {
    roundTitle.textContent = Раунд ${data.round};
    questionText.textContent = data.question;
    timerSpan.textContent = data.roundTime;
});

// Таймер
socket.on('timer', (timeLeft) => {
    timerSpan.textContent = timeLeft;
});

// Раунд завершён
socket.on('roundEnded', (players) => {
    updateLeaderboard(players);
});

// Игра окончена
socket.on('gameOver', (players) => {
    const winner = players.sort((a,b)=>b.score - a.score)[0];
    alert(`Игра окончена! Победитель: ${winner.nickname}`);
    location.reload();
});

// Обновление лидерборда с динамическими столбиками
function updateLeaderboard(players) {
    leaderboardDiv.innerHTML = '';
    // сортировка по очкам
    players.sort((a,b) => b.score - a.score);
    players.forEach(p => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = (p.score * 10) + 'px';
        bar.textContent = ${p.nickname}: ${p.score};
        leaderboardDiv.appendChild(bar);
    });
}
