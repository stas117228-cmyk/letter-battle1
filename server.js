const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let players = {};
let roomStarted = false;
let currentRound = 0;
const totalRounds = 10;
const roundTime = 20; // секунд

const questions = require('./questions.json');

io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    socket.on('join', (nickname) => {
        players[socket.id] = { nickname, score: 0, currentAnswer: '', answered: false };
        io.emit('updatePlayers', Object.values(players));
    });

    socket.on('startGame', () => {
        if (Object.keys(players).length >= 2 && !roomStarted) {
            roomStarted = true;
            currentRound = 0;
            io.emit('gameStarted');
            startRound();
        }
    });

    socket.on('submitAnswer', (answer) => {
        if (players[socket.id] && roomStarted) {
            let q = questions[currentRound];
            answer = answer.trim().toLowerCase();
            let correct = q.answers.some(a => a.toLowerCase() === answer);
            players[socket.id].currentAnswer = answer;
            players[socket.id].answered = correct;
            if (correct) {
                players[socket.id].score += answer.replace(/\s+/g,'').length;
            }
            io.emit('updatePlayers', Object.values(players));
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', Object.values(players));
    });
});

function startRound() {
    if (currentRound >= totalRounds) {
        io.emit('gameOver', Object.values(players));
        roomStarted = false;
        for (let p in players) {
            players[p].score = 0;
            players[p].currentAnswer = '';
            players[p].answered = false;
        }
        return;
    }

    io.emit('newRound', { 
        round: currentRound + 1, 
        question: questions[currentRound].question,
        roundTime
    });

    let timeLeft = roundTime;
    const interval = setInterval(() => {
        timeLeft--;
        io.emit('timer', timeLeft);
        if (timeLeft <= 0) {
            clearInterval(interval);
            io.emit('roundEnded', Object.values(players));
            // сброс ответов
            for (let p in players) {
                players[p].currentAnswer = '';
                players[p].answered = false;
            }
            currentRound++;
            setTimeout(startRound, 5000); // 5 сек между раундами
        }
    }, 1000);
}

http.listen(process.env.PORT || 3000, () => {
    console.log('Сервер запущен на порту 3000');
});
