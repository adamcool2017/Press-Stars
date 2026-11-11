
const pads = document.querySelectorAll(".pad");
const startButton = document.querySelector("#start-button");
const levelDisplay = document.querySelector("#level");
const highScoreDisplay = document.querySelector("#high-score");
const message = document.querySelector("#message");

const colours = ["green", "red", "blue", "yellow"];
const MAX_LEVEL = 15;

let sequence = [];
let playerSequence = [];
let level = 0;
let acceptingInput = false;
let gameRunning = false;

let highScore = Number(localStorage.getItem("pressStarsHighScore")) || 0;
highScoreDisplay.textContent = highScore;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function flashPad(colour, duration = 450) {
  return new Promise(resolve => {
    const pad = document.querySelector(`[data-color="${colour}"]`);

    pad.classList.add("active");

    setTimeout(() => {
      pad.classList.remove("active");
      resolve();
    }, duration);
  });
}

async function playSequence() {
  acceptingInput = false;
  message.textContent = "WATCH THE SEQUENCE!";

  await wait(600);

  const speed = Math.max(220, 550 - level * 20);

  for (const colour of sequence) {
    await flashPad(colour, speed);
    await wait(180);
  }

  playerSequence = [];
  acceptingInput = true;

  message.textContent = "YOUR TURN! REPEAT IT!";
}

function updateHighScore() {
  if (level > highScore) {
    highScore = level;
    localStorage.setItem("pressStarsHighScore", highScore);
    highScoreDisplay.textContent = highScore;
  }
}

function startGame() {
  sequence = [];
  playerSequence = [];
  level = 0;
  gameRunning = true;
  acceptingInput = false;

  levelDisplay.textContent = level;
  startButton.disabled = true;
  startButton.textContent = "GAME RUNNING";

  nextRound();
}

async function nextRound() {
  if (level >= MAX_LEVEL) {
    winGame();
    return;
  }

  level++;
  levelDisplay.textContent = level;

  const nextColour = colours[
    Math.floor(Math.random() * colours.length)
  ];

  sequence.push(nextColour);

  await playSequence();
}

async function pressColour(colour) {
  if (!acceptingInput || !gameRunning) return;

  acceptingInput = false;

  await flashPad(colour, 180);

  playerSequence.push(colour);

  const currentIndex = playerSequence.length - 1;

  if (playerSequence[currentIndex] !== sequence[currentIndex]) {
    endGame();
    return;
  }

  if (playerSequence.length === sequence.length) {
    if (level === MAX_LEVEL) {
      winGame();
      return;
    }

    message.textContent = "CORRECT! NEXT LEVEL!";

    await wait(700);
    nextRound();
  } else {
    acceptingInput = true;
  }
}

function endGame() {
  gameRunning = false;
  acceptingInput = false;

  updateHighScore();

  message.textContent = `GAME OVER! YOU REACHED LEVEL ${level}.`;

  startButton.disabled = false;
  startButton.textContent = "PLAY AGAIN";
}

function winGame() {
  gameRunning = false;
  acceptingInput = false;

  updateHighScore();

  message.textContent = "🏆 YOU BEAT PRESS STARS! ALL 15 LEVELS COMPLETED!";

  startButton.disabled = false;
  startButton.textContent = "PLAY AGAIN";
}

pads.forEach(pad => {
  pad.addEventListener("click", () => {
    pressColour(pad.dataset.color);
  });
});

startButton.addEventListener("click", startGame);
