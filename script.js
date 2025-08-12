/* =============== LOGIN + FULLSCREEN =============== */
const overlay = document.getElementById('loginOverlay');
const form = document.getElementById('loginForm');
const erro = document.getElementById('loginErro');
const gameContainer = document.getElementById('gameContainer');
const playerDisplay = document.getElementById('player');
const logoBtn = document.getElementById('logoBtn');

const rankingOverlay = document.getElementById('rankingOverlay');
const rankingList = document.getElementById('rankingList');
const lastResult = document.getElementById('lastResult');
const btnVoltar = document.getElementById('btnVoltar');

const telInput = document.getElementById('telefone');
telInput.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

function validarNome(nome) {
  return typeof nome === 'string' && nome.trim().length >= 3;
}
function validarTelefone(telefone) {
  const digits = (telefone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

/* Fullscreen no clique do logo */
logoBtn.addEventListener('click', async () => {
  const elem = document.documentElement;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    } else {
      await (elem.requestFullscreen?.() ||
             elem.webkitRequestFullscreen?.() ||
             elem.msRequestFullscreen?.());
    }
  } catch (_) {}
});

/* Autologin se tiver salvo */
(function autoLoginSeSalvo() {
  try {
    const raw = localStorage.getItem('jogador_memoria');
    if (!raw) return;
    const dados = JSON.parse(raw);
    if (dados?.nome && dados?.telefone && validarTelefone(dados.telefone)) {
      liberarJogo(dados.nome);
    }
  } catch (_) {}
})();

/* Submit login */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  erro.classList.add('hidden');

  const nome = document.getElementById('nome').value.trim();
  const telefone = telInput.value.trim();

  if (!validarNome(nome) || !validarTelefone(telefone)) {
    erro.textContent = 'Digite nome válido e telefone com 10 ou 11 dígitos (apenas números).';
    erro.classList.remove('hidden');
    return;
  }

  localStorage.setItem('jogador_memoria', JSON.stringify({ nome, telefone, ts: Date.now() }));
  liberarJogo(nome);
});

function liberarJogo(nome) {
  overlay.classList.add('hidden');
  rankingOverlay.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  playerDisplay.textContent = `Jogador: ${nome}`;
  initGame(nome);
}

/* =============== RANKING (localStorage) =============== */
function getRanking() {
  try { return JSON.parse(localStorage.getItem('memoria_ranking')) || []; }
  catch { return []; }
}
function saveRanking(list) {
  localStorage.setItem('memoria_ranking', JSON.stringify(list));
}
function addToRanking(entry) {
  const list = getRanking();
  list.push(entry);
  list.sort((a, b) => (b.score - a.score) || (a.elapsed - b.elapsed));
  saveRanking(list);
  return list;
}
function renderTop3() {
  rankingList.innerHTML = '';
  getRanking().slice(0, 3).forEach((it, i) => {
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${it.nome} — ${it.score} pts — ${it.elapsed}s`;
    rankingList.appendChild(li);
  });
}
function showRanking(entryText) {
  lastResult.textContent = entryText || '';
  renderTop3();
  gameContainer.classList.add('hidden');
  overlay.classList.add('hidden');
  rankingOverlay.classList.remove('hidden');
}
btnVoltar.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  rankingOverlay.classList.add('hidden');
  gameContainer.classList.add('hidden');
});

/* =============== JOGO DA MEMÓRIA =============== */
function initGame(nomeJogador) {
  const cardsArray = [
    '01.jpg','02.jpg','03.jpg','04.jpg',
    '05.jpg','06.jpg','07.jpg','08.jpg'
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
  score




