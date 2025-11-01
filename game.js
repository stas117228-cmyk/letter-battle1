const socket = io();
const nickname = localStorage.getItem('nickname');
const roomId = localStorage.getItem('roomId');

console.log('Отправляем joinRoom', nickname, roomId);
socket.emit('joinRoom', { nickname, roomId });

// Инициализация графика
const ctx = document.getElementById('scoreChart').getContext('2d');
const scoreChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Очки',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
    }
});

socket.on('updatePlayers', players => {
    document.getElementById('players').innerText = 'Игроки: ' + players.join(', ');
});

socket.on('timer', time => document.getElementById('timer').innerText = 'Осталось: ' + time + 's');

socket.on('newQuestion', ({ round, question }) => {
    document.getElementById('question').innerText = Раунд ${round}: ${question};
    document.getElementById('answer').value = '';
});

socket.on('correctAnswer', () => {
    const input = document.getElementById('answer');
    input.style.backgroundColor = 'lightgreen';
    setTimeout(() => input.style.backgroundColor = '', 500);
});

socket.on('wrongAnswer', () => {
    const input = document.getElementById('answer');
    input.style.backgroundColor = 'lightcoral';
    setTimeout(() => input.style.backgroundColor = '', 500);
});

socket.on('roundOver', () => document.getElementById('nextRoundBtn').style.display='inline-block');

socket.on('updateScores', players => {
    scoreChart.data.labels = players.map(p => p.nickname);
    scoreChart.data.datasets[0].data = players.map(p => p.score);
    scoreChart.update();
});

document.getElementById('sendBtn').onclick = () => {
    const ans = document.getElementById('answer').value.trim();
    if(ans) socket.emit('answer', { roomId, answer: ans });
};

document.getElementById('nextRoundBtn').onclick = () => {
    document.getElementById('nextRoundBtn').style.display='none';
    socket.emit('nextRound', { roomId });
};
