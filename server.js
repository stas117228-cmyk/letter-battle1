const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Загружаем вопросы
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));

// Статика
app.use(express.static(__dirname));

let players = {};
let currentRound = 0;
let roundTime = 20;
let roundInterval;

// Подключение игрока
io.on('connection', (socket) => {
    console.log('Новый игрок подключился: ' + socket.id);

    socket.on('join', (nickname) => {
        players[socket.id] = {
            nickname: nickname,
            score: 0,
            lastAnswerCorrect: false,
            answered: false
        };
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('startGame', () => {
        currentRound = 0;
        startRound();
        io.emit('gameStarted');
    });

    socket.on('submitAnswer', (answer) => {
        const player = players[socket.id];
        if (!player) return;

        const currentQ = questions[currentRound];
        const answerLower = answer.trim().toLowerCase();

        if (currentQ.answers.includes(answerLower)) {
            player.score += answerLower.length;
            player.lastAnswerCorrect = true;
            socket.emit('answerResult', { correct: true });
        } else {
            player.lastAnswerCorrect = false;
            socket.emit('answerResult', { correct: false });
        }

        player.answered = true;
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', Object.values(players));
    });
});

// Функция запуска раунда
function startRound() {
    if (currentRound >= questions.length) {
        io.emit('gameOver', Object.values(players));
        return;
    }

    // Сброс статусов игроков
    for (const id in players) {
        players[id].answered = false;
        players[id].lastAnswerCorrect = false;
    }

    let timeLeft = roundTime;
    io.emit('newRound', { round: currentRound + 1, question: questions[currentRound].question, roundTime: timeLeft });

    // Таймер раунда
    roundInterval = setInterval(() => {
        timeLeft--;
        io.emit('timer', timeLeft);

        if (timeLeft <= 0) {
            clearInterval(roundInterval);
            currentRound++;
            io.emit('roundEnded', Object.values(players));
            setTimeout(startRound, 2000); // пауза 2 секунды перед следующим раундом
        }
    }, 1000);
}

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
