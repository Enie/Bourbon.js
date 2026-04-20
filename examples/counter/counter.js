const increment = (state, setState) => {
  setState({ count: state.count + state.increment })
}

const decrement = (state, setState) => {
  setState({ count: state.count - state.increment })
}

const counterState = { count: 0, increment: 1 };

const DecrementButton = node`
  <button class="btn danger" click="${decrement}">Decrement</button>
`;

const Counter = watch(counterState)`
  <div class="counter">
    <h1>Counter</h1>
    <div class="display">${s => s.count}</div>
    <div class="controls">
      <button class="btn danger" click="${decrement}">&minus;</button>
      <button class="btn primary" click="${increment}">+</button>
    </div>
  </div>
`;

body`${Counter}`;
