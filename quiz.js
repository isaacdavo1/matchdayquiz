(function () {
  'use strict';

  const quizRoot = document.getElementById('quiz-app');
  if (!quizRoot || !window.QUIZ_DATA) return;

  const quiz = window.QUIZ_DATA;
  const state = {
    index: 0,
    score: 0,
    answered: false,
    questions: []
  };

  const screens = {
    start: document.getElementById('quiz-start'),
    play: document.getElementById('quiz-play'),
    results: document.getElementById('quiz-results')
  };

  const els = {
    progressBar: document.getElementById('quiz-progress-bar'),
    progressLabel: document.getElementById('quiz-progress-label'),
    scoreLive: document.getElementById('quiz-score-live'),
    question: document.getElementById('quiz-question'),
    options: document.getElementById('quiz-options'),
    feedback: document.getElementById('quiz-feedback'),
    nextBtn: document.getElementById('quiz-next-btn'),
    startBtn: document.getElementById('quiz-start-btn'),
    retryBtn: document.getElementById('quiz-retry-btn'),
    finalScore: document.getElementById('quiz-final-score'),
    finalMessage: document.getElementById('quiz-final-message'),
    finalBreakdown: document.getElementById('quiz-final-breakdown'),
    seasonTag: document.getElementById('quiz-season-tag')
  };

  if (els.seasonTag) {
    els.seasonTag.textContent = quiz.season;
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (el) el.hidden = key !== name;
    });
  }

  function startQuiz() {
    state.index = 0;
    state.score = 0;
    state.answered = false;
    state.questions = shuffle(quiz.questions).slice(0, 10);
    showScreen('play');
    renderQuestion();
  }

  function renderQuestion() {
    const current = state.questions[state.index];
    const total = state.questions.length;
    const progress = ((state.index + 1) / total) * 100;

    state.answered = false;
    els.progressBar.style.width = `${progress}%`;
    els.progressLabel.textContent = `${state.index + 1} / ${total}`;
    els.scoreLive.textContent = `${state.score} pts`;
    els.question.textContent = current.question;
    els.feedback.hidden = true;
    els.feedback.textContent = '';
    els.nextBtn.hidden = true;
    els.options.innerHTML = '';

    current.options.forEach((option, optionIndex) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = option;
      btn.addEventListener('click', () => selectAnswer(optionIndex, btn));
      els.options.appendChild(btn);
    });
  }

  function selectAnswer(optionIndex, button) {
    if (state.answered) return;

    state.answered = true;
    const current = state.questions[state.index];
    const isCorrect = optionIndex === current.answer;
    const buttons = els.options.querySelectorAll('.quiz-option');

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === current.answer) btn.classList.add('quiz-option--correct');
      if (i === optionIndex && !isCorrect) btn.classList.add('quiz-option--wrong');
    });

    if (isCorrect) {
      state.score += 100;
      els.scoreLive.textContent = `${state.score} pts`;
    }

    els.feedback.hidden = false;
    els.feedback.className = `quiz-feedback${isCorrect ? ' quiz-feedback--correct' : ''}`;
    els.feedback.textContent = current.fact;
    els.nextBtn.hidden = false;
    els.nextBtn.textContent = state.index === state.questions.length - 1 ? 'See results' : 'Continue';
  }

  function showResults() {
    showScreen('results');
    const total = state.questions.length;
    const maxScore = total * 100;
    const pct = Math.round((state.score / maxScore) * 100);

    els.finalScore.textContent = `${state.score / 100}/${total}`;

    if (pct >= 90) {
      els.finalMessage.textContent = `Outstanding — you know the ${quiz.season} season inside out.`;
    } else if (pct >= 70) {
      els.finalMessage.textContent = `Solid knowledge of the ${quiz.season} campaign.`;
    } else if (pct >= 50) {
      els.finalMessage.textContent = 'Not bad — room to improve.';
    } else {
      els.finalMessage.textContent = 'Time for a recap and another go.';
    }

    els.finalBreakdown.textContent = `${pct}% correct`;
  }

  els.startBtn?.addEventListener('click', startQuiz);
  els.retryBtn?.addEventListener('click', startQuiz);
  els.nextBtn?.addEventListener('click', () => {
    if (state.index < state.questions.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      showResults();
    }
  });
})();
