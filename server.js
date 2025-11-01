const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
let selectedQuestions = [];

app.use(express.static(__dirname));

let players = {};
let currentRound = 0;
let roundTime = 20;
let roundInterval;

function getRandomQuestions(num) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

io.on('connection', (socket) => {
    console.log('Новый игрок подключился: ' + socket.id);

    socket.on('join', (nickname) => {
        players[socket.id] = {
            nickname,
            score: 0,
            lastAnswerCorrect: false,
            answered: false
        };
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('startGame', () => {
        currentRound = 0;
        selectedQuestions = getRandomQuestions(10);
        startRound();
        io.emit('gameStarted');
    });

    socket.on('submitAnswer', (answer) => {
        const player = players[socket.id];
        if (!player) return;

        const currentQ = selectedQuestions[currentRound];
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

function startRound() {
    if (currentRound >= selectedQuestions.length) {
        io.emit('gameOver', Object.values(players));
        return;
    }

    for (const id in players) {
        players[id].answered = false;
        players[id].lastAnswerCorrect = false;
    }

    let timeLeft = roundTime;
    io.emit('newRound', { round: currentRound + 1, question: selectedQuestions[currentRound].question, roundTime: timeLeft });

    roundInterval = setInterval(() => {
        timeLeft--;
        io.emit('timer', timeLeft);

        if (timeLeft <= 0) {
            clearInterval(roundInterval);
            currentRound++;
            io.emit('roundEnded', Object.values(players));
            setTimeout(startRound, 2000);
        }
    }, 1000);
}

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
