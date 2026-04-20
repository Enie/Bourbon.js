const randomId = () => Math.random().toString(36).substring(2, 15);
const events = (() => {
  const es=[];
  for(const i in document) es.push(i);
  return es.filter(i=>i.substring(0,2)=='on').map(i=>i.substring(2));
})()

const deferredEventHandlers = []

// --- Event delegation ---
const eventHandlers = {};
const registeredEvents = new Set();

const appendEvents = events => {
  events.forEach(event => {
    eventHandlers[event.id] = event.handler;
    if (!registeredEvents.has(event.name)) {
      registeredEvents.add(event.name);
      document.body.addEventListener(event.name, e => {
        let el = e.target;
        while (el && el !== document.body) {
          const id = el.getAttribute?.('event-id');
          if (id && eventHandlers[id]) {
            eventHandlers[id](e);
            return;
          }
          el = el.parentElement;
        }
      });
    }
  });
  events.length = 0;
}

// --- DOM morphing ---
const morph = (from, to) => {
  if (from.nodeType !== to.nodeType ||
      (from.nodeType === 1 && from.tagName !== to.tagName)) {
    from.replaceWith(to);
    return to;
  }
  if (from.nodeType === 3) {
    if (from.textContent !== to.textContent) from.textContent = to.textContent;
    return from;
  }
  if (from.nodeType !== 1) return from;

  for (const {name} of [...from.attributes]) {
    if (!to.hasAttribute(name)) from.removeAttribute(name);
  }
  for (const {name, value} of [...to.attributes]) {
    if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  }
  if ('value' in from && from.value !== to.value) from.value = to.value;
  if ('checked' in from) from.checked = to.checked;

  const fc = [...from.childNodes];
  const tc = [...to.childNodes];
  for (let i = 0; i < tc.length; i++) {
    if (i < fc.length) {
      morph(fc[i], tc[i]);
    } else {
      from.appendChild(tc[i]);
    }
  }
  while (from.childNodes.length > tc.length) {
    from.removeChild(from.lastChild);
  }

  return from;
};

const bind = (values, state, setState) => values.map(value =>
  typeof value === 'function' ? value.bind(null, state, setState) : value
)

const getContainer = (html) => {
  const tag = html.match(/^\s*<(\w+)/)?.[1]?.toLowerCase();
  const map = { tr: 'tbody', td: 'tr', th: 'tr', thead: 'table', tbody: 'table', tfoot: 'table', col: 'colgroup', colgroup: 'table', caption: 'table' };
  return map[tag] || 'div';
};

const node = (strings, ...values) => (state, setState) => {
  const boundValues = bind(values,state,setState);
  let html = strings[0] || '';
  const deferredNodes = [];

  boundValues.forEach((value, i) => {
    const id = randomId();
    const si = strings[i], si1 = strings[i+1];
    const m = si.match(RegExp(`(${events.join('|')})="$`));
    const v = m ? null : value();
    if (m) {
      html = html.slice(0, -si.length) + si.replace(m[0], `event-id="${id}`) + si1;
      deferredEventHandlers.push({name: m[1], id, handler: value});
    } else if (v instanceof HTMLElement || Array.isArray(v)) {
      html += `<template node-id="${id}"></template>` + si1;
      deferredNodes.push({id, node: v});
    } else {
      html += v + si1;
    }
  });

  const trimmed = html.trim();
  const template = document.createElement(getContainer(trimmed));
  template.insertAdjacentHTML('beforeend', trimmed);
  let child = template.firstChild;
  deferredNodes.forEach (({id, node}) => {
    const element = child.querySelector?.(`[node-id="${id}"]`) || child;
    if (Array.isArray(node)) {
      element.replaceWith(...node.map(childNode => typeof childNode === 'function' ? childNode() : childNode));
    } else {
      if (element === child) {
        child = node;
      } else {
        element.replaceWith(node);
      }
    }
  });

  return child;
};

const body = (strings, ...values) => {
  document.body.appendChild(node(strings, ...values)());
  appendEvents(deferredEventHandlers);
};

const head = (strings, ...values) => {
  let html = strings[0] || '';
  const boundValues = bind(values, undefined, undefined);
  boundValues.forEach((value, i) => {
    html += (typeof value === 'function' ? value() : value) + (strings[i + 1] || '');
  });
  document.head.insertAdjacentHTML('beforeend', html.trim());
};

const watch = initialState => (strings, ...values) => {
  let state = {...initialState};
  let element = null;

  const update = () => {
    const newNode = node(strings, ...values)(state, setState);
    element = morph(element, newNode);
    appendEvents(deferredEventHandlers)
  }

  const setState = newStates => {
    state = { ...state, ...newStates };
    update();
  };

  return () => {
    element = node(strings, ...values)(state, setState);
    return element;
  };
};
