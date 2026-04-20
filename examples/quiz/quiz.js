// --- Data ---

const questions = [
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    answer: 1,
  },
  {
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    answer: 2,
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['186', '206', '226', '246'],
    answer: 1,
  },
  {
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'Mark Twain', 'Leo Tolstoy', 'William Shakespeare'],
    answer: 3,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
  },
  {
    question: 'In what year did the first Moon landing occur?',
    options: ['1965', '1967', '1969', '1971'],
    answer: 2,
  },
  {
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    answer: 2,
  },
];

// --- State ---

const quizState = {
  phase: 'start',         // 'start' | 'question' | 'feedback' | 'results'
  current: 0,
  selected: null,
  score: 0,
};

// --- Actions ---

const beginQuiz = (state, setState) => {
  setState({ phase: 'question', current: 0, selected: null, score: 0 });
};

const selectOption = (index, state, setState) => {
  if (state.phase !== 'question') return;
  const correct = questions[state.current].answer === index;
  setState({
    phase: 'feedback',
    selected: index,
    score: correct ? state.score + 1 : state.score,
  });
};

const nextQuestion = (state, setState) => {
  const next = state.current + 1;
  if (next >= questions.length) {
    setState({ phase: 'results' });
  } else {
    setState({ phase: 'question', current: next, selected: null });
  }
};

const restartQuiz = (state, setState) => {
  setState({ phase: 'start', current: 0, selected: null, score: 0 });
};

// --- Components ---

const ProgressBar = (current, total) => node`
  <div class="progress-bar">
    <div class="progress-fill" style="${() => `width: ${(current / total) * 100}%`}"></div>
  </div>
`();

const OptionButton = (text, index, state, setState) => {
  const q = questions[state.current];
  const isSelected = state.selected === index;
  const isCorrect = q.answer === index;
  const inFeedback = state.phase === 'feedback';

  let cls = 'option';
  if (inFeedback && isCorrect) cls += ' correct';
  else if (inFeedback && isSelected && !isCorrect) cls += ' wrong';

  return node`
    <button class="${() => cls}" click="${() => selectOption(index, state, setState)}">
      <span class="option-letter">${() => 'ABCD'[index]}</span>
      <span class="option-text">${() => text}</span>
    </button>
  `(state, setState);
};

const QuestionCard = (state, setState) => {
  const q = questions[state.current];
  return node`
    <div class="card">
      <div class="meta">
        <span class="counter">Question ${() => state.current + 1} of ${() => questions.length}</span>
        <span class="score-badge">Score: ${() => state.score}</span>
      </div>
      ${() => ProgressBar(state.current, questions.length)}
      <p class="question">${() => q.question}</p>
      <div class="options">
        ${() => q.options.map((opt, i) => OptionButton(opt, i, state, setState))}
      </div>
      <div class="feedback-row">
        ${() => {
          if (state.phase !== 'feedback') return '';
          const correct = q.answer === state.selected;
          const msg = correct ? '✓ Correct!' : `✗ The answer is "${q.options[q.answer]}"`;
          const span = document.createElement('span');
          span.className = correct ? 'feedback correct-text' : 'feedback wrong-text';
          span.textContent = msg;
          return span;
        }}
        ${() => {
          if (state.phase !== 'feedback') return node`<span></span>`(state, setState);
          const label = state.current + 1 >= questions.length ? 'See Results' : 'Next Question';
          return node`<button class="next-btn" click="${nextQuestion}">${() => label}</button>`(state, setState);
        }}
      </div>
    </div>
  `(state, setState);
};

const StartScreen = node`
  <div class="card center">
    <div class="trophy">🧠</div>
    <h1>General Knowledge Quiz</h1>
    <p class="subtitle">${() => questions.length} questions across science, history & more</p>
    <button class="start-btn" click="${beginQuiz}">Start Quiz</button>
  </div>
`;

const ResultsScreen = (state, setState) => {
  const pct = Math.round((state.score / questions.length) * 100);
  const grade = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : pct >= 40 ? 'Keep practicing' : 'Better luck next time';
  return node`
    <div class="card center">
      <div class="trophy">${() => pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : '📚'}</div>
      <h1>Quiz Complete</h1>
      <div class="score-circle">
        <span class="score-number">${() => state.score}</span>
        <span class="score-total">/ ${() => questions.length}</span>
      </div>
      <p class="grade">${() => grade}</p>
      <p class="pct">${() => pct}% correct</p>
      <button class="start-btn" click="${restartQuiz}">Play Again</button>
    </div>
  `(state, setState);
};

// --- Root ---

const Quiz = watch(quizState)`
  <div class="quiz-root">
    ${(s, ss) => {
      if (s.phase === 'start') return StartScreen(s, ss);
      if (s.phase === 'results') return ResultsScreen(s, ss);
      return QuestionCard(s, ss);
    }}
  </div>
`;

body`${Quiz}`;
