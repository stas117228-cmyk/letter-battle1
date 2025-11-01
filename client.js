document.addEventListener('DOMContentLoaded', function() {
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
    const playersListGame = document.getElementById('playersListGame');
    const leaderboardDiv = document.getElementById('leaderboard');
    const roundTitle = document.getElementById('roundTitle');
    const questionText = document.getElementById('questionText');
    const timerSpan = document.getElementById('timer');

    joinBtn.onclick = function() {
        nickname = nicknameInput.value.trim();
        if (nickname) {
            socket.emit('join', nickname);
            loginDiv.style.display = 'none';
            lobbyDiv.style.display = 'block';
        } else alert('Введите никнейм!');
    };

    startBtn.onclick = () => socket.emit('startGame');

    function sendAnswer() {
        const answer = answerInput.value.trim();
        if (answer) {
            socket.emit('submitAnswer', answer);
            answerInput.value = '';
        }
    }

    submitAnswerBtn.onclick = sendAnswer;

    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendAnswer();
    });

    socket.on('answerResult', (data) => {
        answerInput.style.border = data.correct ? '2px solid #4CAF50' : '2px solid #f44336';
        setTimeout(() => answerInput.style.border = '', 800);
    });

    socket.on('updatePlayers', (players) => {
        if (!playersListGame) return;
        playersListGame.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.nickname + ' (' + p.score + ')';
            li.className = p.lastAnswerCorrect ? 'correct' : (p.answered ? 'wrong' : '');
            playersListGame.appendChild(li);
        });
        updateLeaderboard(players);
    });

    socket.on('gameStarted', () => {
        lobbyDiv.style.display = 'none';
        gameDiv.style.display = 'block';
    });

    socket.on('newRound', (data) => {
        roundTitle.textContent = 'Раунд ' + data.round;
        questionText.textContent = data.question;
        timerSpan.textContent = data.roundTime;
    });

    socket.on('timer', (timeLeft) => timerSpan.textContent = timeLeft);

    socket.on('roundEnded', (players) => updateLeaderboard(players));

    socket.on('gameOver', (players) => {
        players.sort((a,b)=>b.score-a.score);
        alert('Игра окончена! Победитель: ' + players[0].nickname);
        location.reload();
    });

    function updateLeaderboard(players) {
        if (!leaderboardDiv) return;
        leaderboardDiv.innerHTML = '';
        players.sort((a,b)=>b.score-a.score);
        players.forEach(p => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = (p.score*10)+'px';
            bar.textContent = p.nickname + ': ' + p.score;
            leaderboardDiv.appendChild(bar);
        });
    }
});
