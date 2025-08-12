/* =========================
   LOGIN + CONTROLE DE ACESSO
   ========================= */
const overlay = document.getElementById('loginOverlay');
const form = document.getElementById('loginForm');
const erro = document.getElementById('loginErro');

const gameContainer = document.getElementById('gameContainer');
const playerDisplay = document.getElementById('player');

/** Valida nome (>= 2 palavras) e telefone (10-15 dígitos após limpar máscara) */
function validarDados(nome, telefone) {
  const nomeOk = typeof nome === 'string' && nome.trim().length >= 3;
  const digits = (telefone || '').replace(/\D/g, '');
  const telOk = digits.length >= 10 && digits.length <= 15; // flexível p/ BR e intl
  return nomeOk && telOk;
}

/** Carrega jogador do localStorage */
function jogadorSalvo() {
  try {
    const raw = localStorage.getItem('jogador_memoria');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

/** Salva jogador no localStorage */
function salvarJogador(nome, telefone) {
  localStorage.setItem('jogador_memoria', JSON.stringify({ nome, telefone, ts: Date.now() }));
}

/** Mostra jogo e oculta overlay */
function liberarJogo(jogador) {
  overlay.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  playerDisplay.textContent = `Jogador: ${jogador.nome}`;
  initGame();
}

// Se já tiver salvo, libera direto
const saved = jogadorSalvo();
if (saved) liberarJogo(saved);

// Submit do formulário
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  erro.classList.add('hidden');

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (!validarDados(nome, telefone)) {
    erro.textContent = 'Verifique o nome e o telefone (ex.: (11) 98888-7777).';
    erro.classList.remove('hidden');
    return;
  }

  salvarJogador(nome, telefone);
  liberarJogo({ nome, telefone });
});

/* =========================
   JOGO DA MEMÓRIA (mantendo sua lógica)
   ========================= */
let timerInterval; // criado após login

function initGame() {
  // Seu baralho (mantido)
  const cardsArray = [
    '01.jpg', '02.jpg', '03.jpg', '04.jpg',
    '05.jpg', '06.jpg', '07.jpg', '08.jpg'
  ];
  let cards = [...cardsArray, ...cardsArray].sort(() => 0.5 - Math.random());

  const gameBoard = document.getElementById('gameBoard');
  const scoreDisplay = document.getElementById('score');
  const timerDisplay = document.getElementById('timer');
  const winMessage = document.getElementById('winMessage');

  // Estado do jogo
  let revealedCards = [];
  let matched = [];
  let score = 0;
  let startTime = Date.now();
  let gameEnded = false;
  const maxTime = 30;

  // Limpa tabuleiro (caso reentre)
  gameBoard.innerHTML = '';
  winMessage.classList.add('hidden');
  scoreDisplay.textContent = 'Pontos: 0';
  timerDisplay.textContent = `Tempo: ${maxTime}s`;

  // Timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = maxTime - elapsed;
    timerDisplay.textContent = `Tempo: ${remaining}s`;
    if (remaining <= 0 && !gameEnded) endGame(false);
  }, 1000);

  // Render
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

  // Interação
  function flipCard() {
    const card = this;
    // bloqueios
    if (gameEnded || revealedCards.length >= 2 ||
        card.classList.contains('revealed') ||
        card.classList.contains('matched')) return;

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
    // evita clique até resolver
    gameBoard.style.pointerEvents = 'none';

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
      gameBoard.style.pointerEvents = ''; // reabilita clique
    }, 800);
  }

  function checkWin() {
    if (matched.length === cardsArray.length) endGame(true);
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
}

