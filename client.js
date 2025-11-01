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

    startBtn.onclick = function() {
        socket.emit('startGame');
    };

    submitAnswerBtn.onclick = function() {
        var answer = answerInput.value.trim();
        if (answer) {
            socket.emit('submitAnswer', answer);
            answerInput.value = '';
        }
    };

    // Обновление игроков
    socket.on('updatePlayers', function(players) {
        // Лобби
        playersList.innerHTML = '';
        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            var li = document.createElement('li');
            li.textContent = p.nickname + ' (' + p.score + ')';
            if (p.answered) li.className = 'correct';
            playersList.appendChild(li);
        }

        // Игра
        playersListGame.innerHTML = '';
        for (var j = 0; j < players.length; j++) {
            var p2 = players[j];
            var li2 = document.createElement('li');
            li2.textContent = p2.nickname + ' (' + p2.score + ')';
            if (p2.answered) li2.className = 'correct';
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
        // Сбрасываем цвета игроков
        var lis = playersListGame.getElementsByTagName('li');
        for (var i = 0; i < lis.length; i++) lis[i].className = '';
    });

    socket.on('timer', function(timeLeft) {
        timerSpan.textContent = timeLeft;
    });

    socket.on('roundEnded', function(players) {
        // Помечаем правильные ответы
        playersListGame.innerHTML = '';
        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            var li = document.createElement('li');
            li.textContent = p.nickname + ' (' + p.score + ')';
            if (p.lastAnswerCorrect) li.className = 'correct';
            else li.className = 'wrong';
            playersListGame.appendChild(li);
        }

        updateLeaderboard(players);
    });

    socket.on('gameOver', function(players) {
        players.sort(function(a,b){ return b.score - a.score; });
        var winner = players[0];
        alert('Игра окончена! Победитель: ' + winner.nickname);
        location.reload();
    });

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
