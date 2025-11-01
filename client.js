const socket = io();

const playerName = prompt('Введите ваше имя') || 'Игрок';
socket.emit('join', playerName);

console.log('Client connected as', playerName);

socket.on('state', (state) => {
  console.log('Game state update:', state);
});
