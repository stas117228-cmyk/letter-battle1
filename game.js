const socket = io();
const nickname = localStorage.getItem('nickname');
const roomId = localStorage.getItem('roomId');

socket.emit('joinRoom', { nickname, roomId });

const ctx = document.getElementById('scoreChart').getContext('2d');
const scoreChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Очки', data: [], backgroundColor: 'rgba(75, 192, 192, 0.6)' }] },
    options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
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
    input.style.backgroundColor = '
