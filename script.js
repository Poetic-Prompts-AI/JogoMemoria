/* ===== LOGIN ===== */
const overlay = document.getElementById('loginOverlay');
const form = document.getElementById('loginForm');
const erro = document.getElementById('loginErro');
const gameContainer = document.getElementById('gameContainer');
const playerDisplay = document.getElementById('player');

function validarNome(nome) {
  return typeof nome === 'string' && nome.trim().length >= 3;
}
function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

// Força só números no input
document.getElementById('telefone').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  erro.classList.add('hidden');

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (!validarNome(nome) || !validarTelefone(telefone)) {
    erro.textContent = 'Digite nome válido e telefone com 10 ou 11 dígitos (apenas números).';
    erro.classList.remove('hidden');
    return;
  }

  overlay.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  playerDisplay.textContent = `Jogador: ${nome}`;
  initGame();
});

/* ===== JOGO DA MEMÓRIA ===== */
function initGame() {
  const cardsArray = [
    '01.jpg', '02.jpg', '03.jpg', '04.jpg',
    '05.jpg', '06.jpg', '07.jpg', '08.jpg'
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

  gameBoard.innerHTML = '';
  winMessage.classList.add('hidden');
  scoreDisplay.textContent = 'Pontos: 0';
  timerDisplay.textContent = `Tempo: ${maxTime}s`;

  const timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = maxTime - elapsed;
    timerDisplay.textContent = `Tempo: ${remaining}s`;
    if (remaining <= 0 && !gameEnded) endGame(false);
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

    if (revealedCards.length === 2) checkMatch();
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
    if (matched.length === cardsArray.length) endGame(true);
  }

  function endGame(victory) {
    gameEnded = true;
    clearInterval(timerInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    winMessage.textContent = victory
      ? `🎉 Parabéns! Você venceu com ${score} pontos em ${elapsed}s!`
      : `⏳ Tempo esgotado! Você fez ${score} pontos.`;
    winMessage.classList.remove('hidden');
  }

  createBoard();
}
