let intervalId = null;

const format = ms => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
};

const swState = { elapsed: 0, running: false, laps: [] };

let stateRef = swState;
let setStateRef = null;

const tick = () => {
  stateRef.elapsed += 10;
  setStateRef({ elapsed: stateRef.elapsed });
};

const start = (state, setState) => {
  if (state.running) return;
  stateRef = state;
  setStateRef = setState;
  intervalId = setInterval(tick, 10);
  setState({ running: true });
};

const stop = (state, setState) => {
  clearInterval(intervalId);
  setState({ running: false });
};

const reset = (state, setState) => {
  clearInterval(intervalId);
  setState({ elapsed: 0, running: false, laps: [] });
};

const lap = (state, setState) => {
  if (!state.running) return;
  setState({ laps: [...state.laps, state.elapsed] });
};

const LapItem = (time, index) => node`
  <li>
    <span class="lap-label">Lap ${() => index + 1}</span>
    <span class="lap-time">${() => format(time)}</span>
  </li>
`();

const Stopwatch = watch(swState)`
  <div class="sw">
    <div class="time">${s => format(s.elapsed)}</div>
    <div class="controls">
      <button class="btn secondary" click="${lap}">Lap</button>
      <button class="${s => 'btn ' + (s.running ? 'danger' : 'primary')}"
        click="${(s, ss) => s.running ? stop(s, ss) : start(s, ss)}">
        ${s => s.running ? 'Stop' : 'Start'}
      </button>
      <button class="btn secondary" click="${reset}">Reset</button>
    </div>
    <ul class="laps">
      ${s => s.laps.map((t, i) => LapItem(t, i))}
    </ul>
  </div>
`;

body`${Stopwatch}`;
