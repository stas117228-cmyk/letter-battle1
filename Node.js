socket.on('submitAnswer', function(answer) {
    var currentQ = questions[currentRound];
    var answerLower = answer.trim().toLowerCase();
    var player = players[socket.id];

    // Игрок может пробовать несколько раз в раунд
    if (!player.roundAnswered) {
        player.roundAnswered = true; // отмечаем, что попытка сделана
    }

    if (currentQ.answers.indexOf(answerLower) !== -1) {
        player.score += answerLower.length;
        player.lastAnswerCorrect = true;
        socket.emit('answerResult', { correct: true });
    } else {
        player.lastAnswerCorrect = false;
        socket.emit('answerResult', { correct: false });
    }

    // Игрок может продолжать пробовать до конца раунда
    // roundEnded событие обновит всех игроков в конце раунда
    io.emit('updatePlayers', Object.values(players));
});
