const compute = (a, b, op) => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b !== 0 ? a / b : 'Error';
  return b;
};

const calcState = {
  display: '0',
  operand: null,
  operator: null,
  fresh: true,
};

const pressDigit = (digit, state, setState) => {
  if (state.fresh) {
    setState({ display: String(digit), fresh: false });
  } else {
    const next = state.display === '0' ? String(digit) : state.display + digit;
    setState({ display: next });
  }
};

const pressDot = (state, setState) => {
  if (state.fresh) {
    setState({ display: '0.', fresh: false });
  } else if (!state.display.includes('.')) {
    setState({ display: state.display + '.' });
  }
};

const pressOp = (op, state, setState) => {
  const val = parseFloat(state.display);
  if (state.operator && !state.fresh) {
    const result = compute(state.operand, val, state.operator);
    setState({ display: String(result), operand: result, operator: op, fresh: true });
  } else {
    setState({ operand: val, operator: op, fresh: true });
  }
};

const pressEquals = (state, setState) => {
  if (!state.operator) return;
  const result = compute(state.operand, parseFloat(state.display), state.operator);
  setState({ display: String(result), operand: null, operator: null, fresh: true });
};

const pressClear = (state, setState) => {
  setState({ display: '0', operand: null, operator: null, fresh: true });
};

const pressSign = (state, setState) => {
  setState({ display: String(parseFloat(state.display) * -1) });
};

const pressPercent = (state, setState) => {
  setState({ display: String(parseFloat(state.display) / 100) });
};

const Btn = (label, action, cls = '') => node`
  <button class="${() => 'key ' + cls}" click="${(s, ss) => action(s, ss)}">${() => label}</button>
`;

const Calculator = watch(calcState)`
  <div class="calc">
    <div class="display">${s => s.display}</div>
    <div class="keys">
      ${(s, ss) => Btn('AC', pressClear, 'fn')(s, ss)}
      ${(s, ss) => Btn('+/-', pressSign, 'fn')(s, ss)}
      ${(s, ss) => Btn('%', pressPercent, 'fn')(s, ss)}
      ${(s, ss) => Btn('÷', (st, sst) => pressOp('/', st, sst), 'op')(s, ss)}

      ${(s, ss) => Btn('7', (st, sst) => pressDigit(7, st, sst))(s, ss)}
      ${(s, ss) => Btn('8', (st, sst) => pressDigit(8, st, sst))(s, ss)}
      ${(s, ss) => Btn('9', (st, sst) => pressDigit(9, st, sst))(s, ss)}
      ${(s, ss) => Btn('×', (st, sst) => pressOp('*', st, sst), 'op')(s, ss)}

      ${(s, ss) => Btn('4', (st, sst) => pressDigit(4, st, sst))(s, ss)}
      ${(s, ss) => Btn('5', (st, sst) => pressDigit(5, st, sst))(s, ss)}
      ${(s, ss) => Btn('6', (st, sst) => pressDigit(6, st, sst))(s, ss)}
      ${(s, ss) => Btn('−', (st, sst) => pressOp('-', st, sst), 'op')(s, ss)}

      ${(s, ss) => Btn('1', (st, sst) => pressDigit(1, st, sst))(s, ss)}
      ${(s, ss) => Btn('2', (st, sst) => pressDigit(2, st, sst))(s, ss)}
      ${(s, ss) => Btn('3', (st, sst) => pressDigit(3, st, sst))(s, ss)}
      ${(s, ss) => Btn('+', (st, sst) => pressOp('+', st, sst), 'op')(s, ss)}

      ${(s, ss) => Btn('0', (st, sst) => pressDigit(0, st, sst), 'zero')(s, ss)}
      ${(s, ss) => Btn('.', pressDot)(s, ss)}
      ${(s, ss) => Btn('=', pressEquals, 'op')(s, ss)}
    </div>
  </div>
`;

body`${Calculator}`;
