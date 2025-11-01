import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf8"));
let currentQuestions = [];
let currentRound = 0;
const totalRounds = 10;
let currentQuestion = null;
let scores = {};

function pickRandomQuestions() {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, totalRounds);
}

function nextQuestion() {
  if (currentRound >= totalRounds) {
    io.emit("gameOver", scores);
    return;
  }
  currentQuestion = currentQuestions[currentRound];
  io.emit("newQuestion", {
    question: currentQuestion.question,
    round: currentRound + 1,
    total: totalRounds
  });
}

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);
  scores[socket.id] = { name: "Игрок", score: 0 };

  socket.on("joinGame", (name) => {
    scores[socket.id].name = name || "Игрок";
    socket.emit("joined");
    io.emit("updateScores", scores);
  });

  socket.on("startGame", () => {
    currentQuestions = pickRandomQuestions();
    currentRound = 0;
    scores = {};
    io.emit("resetGame");
    nextQuestion();
  });

  socket.on("answer", (answer) => {
    if (!currentQuestion) return;
    const correctAnswers = currentQuestion.answers.map(a => a.trim().toLowerCase());
    const userAnswer = answer.trim().toLowerCase();

    if (correctAnswers.includes(userAnswer)) {
      scores[socket.id].score += 1;
      socket.emit("answerResult", { correct: true, correctAnswer: currentQuestion.answers[0] });
      currentRound++;
      setTimeout(nextQuestion, 1500);
    } else {
      socket.emit("answerResult", { correct: false });
    }
    io.emit("updateScores", scores);
  });

  socket.on("disconnect", () => {
    delete scores[socket.id];
    io.emit("updateScores", scores);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`✅ Сервер работает на порту ${PORT}`));
