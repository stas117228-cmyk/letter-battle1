const socket = io();

const joinScreen = document.getElementById("joinScreen");
const gameScreen = document.getElementById("gameScreen");
const nameInput = document.getElementById("name");
const joinButton = document.getElementById("join");
const startButton = document.getElementById("start");
const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answer");
const submitButton = document.getElementById("submit");
const feedback = document.getElementById("feedback");
const leaderboard = document.getElementById("leaderboard");

joinButton.onclick = () => {
  socket.emit("joinGame", nameInput.value);
};

startButton.onclick = () => {
  socket.emit("startGame");
};

submitButton.onclick = () => {
  const answer = answerInput.value.trim();
  if (answer) socket.emit("answer", answer);
  answerInput.value = "";
};

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitButton.click();
  }
});

socket.on("joined", () => {
  joinScreen.style.display = "none";
  gameScreen.style.display = "block";
});

socket.on("newQuestion", (data) => {
  questionElement.textContent = Вопрос ${data.round}/${data.total}: ${data.question};
  feedback.textContent = "";
});

socket.on("answerResult", (data) => {
  if (data.correct) {
    feedback.textContent = "✅ Правильно!";
    feedback.style.color = "limegreen";
  } else {
    feedback.textContent = "❌ Неправильно!";
    feedback.style.color = "red";
  }
});

socket.on("updateScores", (scores) => {
  leaderboard.innerHTML = "";
  Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .forEach((player) => {
      const item = document.createElement("div");
      item.textContent = ${player.name}: ${player.score};
      leaderboard.appendChild(item);
    });
});

socket.on("gameOver", (scores) => {
  questionElement.textContent = "Игра окончена!";
  feedback.textContent = "";
  leaderboard.innerHTML = "<h3>🏆 Итоговый счет:</h3>";
  Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .forEach((player) => {
      const item = document.createElement("div");
      item.textContent = ${player.name}: ${player.score};
      leaderboard.appendChild(item);
    });
});
