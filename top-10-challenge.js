(function () {
  'use strict';

  const form = document.getElementById('top10-form');
  const input = document.getElementById('top10-input');
  const submitBtn = form?.querySelector('button[type="submit"]');
  const feedback = document.getElementById('top10-feedback');
  const livesEl = document.getElementById('lives-count');
  const livesWrap = document.querySelector('.top10-lives');
  const panel = document.querySelector('.top10-panel');
  const titleEl = document.getElementById('challenge-title');
  const descEl = document.getElementById('challenge-desc');

  if (!form || !input || !livesEl || !submitBtn) return;

  const TOTAL_SLOTS = 10;
  let challenge = null;
  let lives = 3;
  let incorrectGuesses = 0;
  let gameState = 'idle'; // idle | playing | won | lost
  const found = new Set();

  function normalize(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getNames(entry) {
    return [entry.name, ...(entry.aliases || [])].map(normalize);
  }

  function findEntryByGuess(guess) {
    if (!guess || !challenge) return null;
    return challenge.answers.find((entry) => getNames(entry).includes(guess)) || null;
  }

  function isPlaying() {
    return gameState === 'playing';
  }

  function resetBoard() {
    found.clear();
    incorrectGuesses = 0;
    gameState = 'idle';

    document.querySelectorAll('.top10-slot').forEach((slot) => {
      slot.classList.remove('top10-slot--filled', 'top10-slot--revealed');
      slot.querySelector('.top10-slot__answer').textContent = '—';
    });

    panel?.classList.remove('top10-panel--won', 'top10-panel--lost');
    livesWrap?.classList.remove('top10-lives--empty');
    feedback.hidden = true;
    feedback.textContent = '';
    input.disabled = false;
    submitBtn.disabled = false;
    input.value = '';
  }

  function fillSlot(entry) {
    const slot = document.querySelector(`.top10-slot[data-rank="${entry.rank}"]`);
    if (!slot) return;
    slot.classList.add('top10-slot--filled');
    slot.querySelector('.top10-slot__answer').textContent = entry.name;
  }

  function revealAllAnswers() {
    challenge.answers.forEach((entry) => {
      const slot = document.querySelector(`.top10-slot[data-rank="${entry.rank}"]`);
      if (!slot) return;
      slot.classList.add('top10-slot--revealed');
      if (!found.has(entry.rank)) {
        slot.querySelector('.top10-slot__answer').textContent = entry.name;
      }
    });
  }

  function updateLivesDisplay() {
    livesEl.textContent = String(lives);
    livesWrap?.classList.toggle('top10-lives--empty', lives <= 0);
  }

  function showFeedback(message, type) {
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.className = 'quiz-feedback';
    if (type === 'success') feedback.classList.add('quiz-feedback--correct');
    if (type === 'error') feedback.classList.add('quiz-feedback--error');
  }

  function lockGame() {
    input.disabled = true;
    submitBtn.disabled = true;
  }

  function winGame() {
    gameState = 'won';
    lockGame();
    panel?.classList.add('top10-panel--won');
    showFeedback('You win! All 10 players found.', 'success');
  }

  function loseGame() {
    gameState = 'lost';
    lockGame();
    panel?.classList.add('top10-panel--lost');
    revealAllAnswers();
    showFeedback('Game over — 3 incorrect guesses. Better luck next time!', 'error');
  }

  function handleCorrect(entry) {
    found.add(entry.rank);
    fillSlot(entry);
    showFeedback(`Correct! ${entry.name} is #${entry.rank}.`, 'success');

    if (found.size === TOTAL_SLOTS) {
      winGame();
    }
  }

  function handleWrong() {
    incorrectGuesses += 1;
    lives -= 1;
    updateLivesDisplay();

    if (incorrectGuesses >= 3 || lives <= 0) {
      loseGame();
      return;
    }

    showFeedback(
      `Incorrect. ${lives} ${lives === 1 ? 'life' : 'lives'} remaining.`,
      'error'
    );
  }

  function handleGuess(rawGuess) {
    if (!isPlaying()) return;

    const guess = normalize(rawGuess);
    if (!guess) return;

    const entry = findEntryByGuess(guess);

    if (!entry) {
      handleWrong();
      return;
    }

    if (found.has(entry.rank)) {
      showFeedback(`${entry.name} is already on the board.`, 'error');
      return;
    }

    handleCorrect(entry);
  }

  function startGame(data) {
    resetBoard();
    challenge = data;
    lives = data.lives ?? 3;
    gameState = 'playing';

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.description;
    document.title = `${data.title} — Football Quiz UK`;

    updateLivesDisplay();
    input.focus();
  }

  function getChallengeId() {
    return new URLSearchParams(window.location.search).get('id') || 'pl-2425-top-scorers';
  }

  async function loadChallenge() {
    try {
      const response = await fetch('top10-challenges.json');
      if (!response.ok) throw new Error('Failed to load challenges');

      const data = await response.json();
      const id = getChallengeId();
      const selected = data.challenges.find((item) => item.id === id) || data.challenges[0];

      if (!selected) throw new Error('No challenges found');
      startGame(selected);
    } catch (error) {
      if (titleEl) titleEl.textContent = 'Unable to load challenge';
      if (descEl) descEl.textContent = 'Please refresh the page or run the site from a local server.';
      showFeedback('Could not load challenge data.', 'error');
      lockGame();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isPlaying()) return;

    const value = input.value;
    handleGuess(value);
    input.value = '';
    if (isPlaying()) input.focus();
  });

  loadChallenge();
})();
