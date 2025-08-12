const cardsArray = [
  '01.jpg',
  '02.jpg',
  '03.jpg',
  '04.jpg',
  '05.jpg',
  '06.jpg',
  '07.jpg',
  '08.jpg'
];

let cards = [...cardsArray, ...cardsArray].sort(() => 0.5 - Math.random());

const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const winMessage = document.getElementById('winMessage');

let revealedCards = [];
let matched = [];
let score = 0;
let startTime = Date.now();
let gameEnded = false;
const maxTime = 30;

const timerInterval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = maxTime - elapsed;
  timerDisplay.textContent = `Tempo: ${remaining}s`;

  if (remaining <= 0 && !gameEnded) {
    endGame(false);
  }
}, 1000);

function createBoard() {
  cards.forEach((symbol, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });
}

function flipCard() {
  const card = this;
  if (gameEnded || revealedCards.length >= 2 || card.classList.contains('revealed') || card.classList.contains('matched')) return;

  const img = document.createElement('img');
  img.src = card.dataset.symbol;
  img.alt = 'carta';
  card.innerHTML = '';
  card.appendChild(img);
  card.classList.add('revealed');
  revealedCards.push(card);

  if (revealedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = revealedCards;

  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add('matched');
    second.classList.add('matched');
    matched.push(first.dataset.symbol);
    score += 10;
  } else {
    score = Math.max(0, score - 2);
  }

  scoreDisplay.textContent = `Pontos: ${score}`;

  setTimeout(() => {
    revealedCards.forEach(card => {
      if (!card.classList.contains('matched')) {
        card.innerHTML = '';
        card.classList.remove('revealed');
      }
    });
    revealedCards = [];
    checkWin();
  }, 800);
}

function checkWin() {
  if (matched.length === cardsArray.length) {
    endGame(true);
  }
}

function endGame(victory) {
  gameEnded = true;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  if (victory) {
    winMessage.textContent = `🎉 Parabéns! Você venceu com ${score} pontos em ${elapsed}s!`;
  } else {
    winMessage.textContent = `⏳ Tempo esgotado! Você fez ${score} pontos.`;
  }
  winMessage.classList.remove('hidden');
}

createBoard();

