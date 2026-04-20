const toHex = n => n.toString(16).padStart(2, '0');

const mixerState = { r: 99, g: 102, b: 241 };

const SliderRow = (label, channel, state, setState) => node`
  <div class="row">
    <label>${() => label}</label>
    <input type="range" min="0" max="255" value="${() => state[channel]}"
      input="${(_, __, e) => setState({ [channel]: parseInt(e.target.value) })}">
    <span class="val">${() => state[channel]}</span>
  </div>
`(state, setState);

const ColorMixer = watch(mixerState)`
  <div class="mixer">
    <h1>Color Mixer</h1>
    <div class="preview" style="${s => `background: rgb(${s.r},${s.g},${s.b})`}"></div>
    <div class="hex">${s => `#${toHex(s.r)}${toHex(s.g)}${toHex(s.b)}`.toUpperCase()}</div>
    ${(s, ss) => SliderRow('R', 'r', s, ss)}
    ${(s, ss) => SliderRow('G', 'g', s, ss)}
    ${(s, ss) => SliderRow('B', 'b', s, ss)}
  </div>
`;

body`${ColorMixer}`;
