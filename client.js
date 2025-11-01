const socket = io();

let nickname = '';
const loginDiv = document.getElementById('login');
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');

document.getElementById('joinBtn').onclick = () => {
    nickname = document.getElementById('nickname').value.trim();
    if(nickname) {
        socket.emit('join', nickname);
        loginDiv.style.display = 'none';
        lobbyDiv.style.display = 'block';
    }
};

document.getElementById('startBtn').onclick = () => {
    socket.emit('startGame');
};

document.getElementById('submitAnswer').onclick = () => {
    const answer = document.getElementById('answerInput').value;
    if(answer.trim()) {
        socket.emit('submitAnswer', answer);
        document.getElementById('answerInput').value = '';
    }
};

socket.on('updatePlayers', (players) => {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = ${p.nickname} ${p.answered ? '✔️' : ''} (${p.score});
        list.appendChild(li);
    });
    updateLeaderboard(players);
});

socket.on('gameStarted', () => {
    lobbyDiv.style.display = 'none';
    gameDiv.style.display = 'block';
});

socket.on('newRound', (data) => {
    document.getElementById('roundTitle').textContent = Раунд ${data.round};
    document.getElementById('questionText').textContent = data.question;
    document.getElementById('timer').textContent = data.roundTime;
});

socket.on('timer', (timeLeft) => {
    document.getElementById('timer').textContent = timeLeft;
});

socket.on('roundEnded', (players) => {
    updateLeaderboard(players);
});

socket.on('gameOver', (players) => {
    alert('Игра окончена! Победитель: ' + players.sort((a,b)=>b.score-a.score)[0].nickname);
    location.reload();
});

function updateLeaderboard(players) {
    const lb = document.getElementById('leaderboard');
    lb.innerHTML = '';
    players.sort((a,b)=>b.score-a.score);
    players.forEach(p => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = (p.score*10)+'px';
        bar.textContent = ${p.nickname}: ${p.score};
        lb.appendChild(bar);
    });
}
