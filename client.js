document.addEventListener('DOMContentLoaded', function() {
    var socket = io();

    var nickname = '';
    var loginDiv = document.getElementById('login');
    var lobbyDiv = document.getElementById('lobby');
    var gameDiv = document.getElementById('game');

    var nicknameInput = document.getElementById('nickname');
    var joinBtn = document.getElementById('joinBtn');
    var startBtn = document.getElementById('startBtn');
    var answerInput = document.getElementById('answerInput');
    var submitAnswerBtn = document.getElementById('submitAnswer');
    var playersList = document.getElementById('playersList');
    var playersListGame = document.getElementById('playersListGame');
    var leaderboardDiv = document.getElementById('leaderboard');
    var roundTitle = document.getElementById('roundTitle');
    var questionText = document.getElementById('questionText');
    var timerSpan = document.getElementById('timer');

    // Войти в комнату
    joinBtn.onclick = function() {
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
    startBtn.onclick = function() {
        socket.emit('startGame');
    };

    // Отправка ответа
    submitAnswerBtn.onclick = function() {
        var answer = answerInput.value.trim();
        if (answer) {
            socket.emit('submitAnswer', answer);
            answerInput.value = '';
        }
    };

    // Обновление игроков и лидерборда
    socket.on('updatePlayers', function(players) {
        // Обновляем лобби
        if (lobbyDiv.style.display === 'block') {
            playersList.innerHTML = '';
            for (var i = 0; i < players.length; i++) {
                var p = players[i];
                var li = document.createElement('li');
                li.textContent = p.nickname + (p.answered ? ' ✔️' : '') + ' (' + p.score + ')';
                playersList.appendChild(li);
            }
        }

        // Обновляем игровую панель
        playersListGame.innerHTML = '';
        for (var j = 0; j < players.length; j++) {
            var p2 = players[j];
            var li2 = document.createElement('li');
            li2.textContent = p2.nickname + (p2.answered ? ' ✔️' : '') + ' (' + p2.score + ')';
            playersListGame.appendChild(li2);
        }

        updateLeaderboard(players);
    });

    socket.on('gameStarted', function() {
        lobbyDiv.style.display = 'none';
        gameDiv.style.display = 'block';
    });

    socket.on('newRound', function(data) {
        roundTitle.textContent = 'Раунд ' + data.round;
        questionText.textContent = data.question;
        timerSpan.textContent = data.roundTime;
    });

    socket.on('timer', function(timeLeft) {
        timerSpan.textContent = timeLeft;
    });

    socket.on('roundEnded', function(players) {
        updateLeaderboard(players);
    });

    socket.on('gameOver', function(players) {
        // Определяем победителя
        players.sort(function(a,b){ return b.score - a.score; });
        var winner = players[0];
        alert('Игра окончена! Победитель: ' + winner.nickname);
        location.reload();
    });

    // Обновление лидерборда
    function updateLeaderboard(players) {
        leaderboardDiv.innerHTML = '';
        players.sort(function(a,b){ return b.score - a.score; });
        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            var bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = (p.score * 10) + 'px';
            bar.textContent = p.nickname + ': ' + p.score;
            leaderboardDiv.appendChild(bar);
        }
    }
});
