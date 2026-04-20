'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readFileSync } = require('fs');
const { join } = require('path');

const bourbonSrc = readFileSync(join(__dirname, '..', 'bourbon.js'), 'utf-8');

/**
 * Creates a fully isolated browser-like environment per test.
 * bourbon.js is eval'd inside jsdom's window so all its globals
 * (document, HTMLElement, …) resolve to jsdom's own implementations.
 *
 * The appended assignment exposes bourbon's module-scope consts for
 * inspection — it is test infrastructure only and does not touch bourbon.js.
 */
function createEnv() {
  const dom = new JSDOM(
    '<!DOCTYPE html><html><head></head><body><div id="sandbox"></div></body></html>',
    { runScripts: 'dangerously' }
  );
  const win = dom.window;

  win.eval(bourbonSrc + '\nwindow._b={node,watch,body,head,appendEvents,deferredEventHandlers};');

  const { node, watch, body, head, appendEvents, deferredEventHandlers } = win._b;
  const sandbox = win.document.getElementById('sandbox');

  /** Mount a bourbon factory into the sandbox and flush deferred events. */
  function mount(factory) {
    const wrap = win.document.createElement('div');
    sandbox.appendChild(wrap);
    wrap.appendChild(factory());
    appendEvents(deferredEventHandlers);
    return wrap;
  }

  return { win, node, watch, body, head, appendEvents, deferredEventHandlers, sandbox, mount };
}

// ── node ─────────────────────────────────────────────────────────────────────

describe('node', () => {
  test('renders a basic element', () => {
    const { node, mount } = createEnv();
    const wrap = mount(node`<p class="t">hello</p>`);
    const el = wrap.querySelector('p.t');
    assert.ok(el, 'element not rendered');
    assert.equal(el.textContent, 'hello');
  });

  test('interpolates a string value', () => {
    const { node, mount } = createEnv();
    const wrap = mount(node`<span>${() => 'bourbon'}</span>`);
    assert.equal(wrap.querySelector('span').textContent, 'bourbon');
  });

  test('interpolates a number value', () => {
    const { node, mount } = createEnv();
    const wrap = mount(node`<span>${() => 42}</span>`);
    assert.equal(wrap.querySelector('span').textContent, '42');
  });

  test('attaches a click handler', () => {
    const { node, mount } = createEnv();
    let fired = false;
    const wrap = mount(node`<button click="${() => (fired = true)}">go</button>`);
    wrap.querySelector('button').click();
    assert.ok(fired, 'click handler did not fire');
  });

  test('renders an array of child nodes', () => {
    const { node, mount } = createEnv();
    const wrap = mount(
      node`<ul>${() => ['a', 'b', 'c'].map(v => node`<li>${() => v}</li>`)}</ul>`
    );
    const lis = wrap.querySelectorAll('li');
    assert.equal(lis.length, 3);
    assert.equal(lis[0].textContent, 'a');
    assert.equal(lis[1].textContent, 'b');
    assert.equal(lis[2].textContent, 'c');
  });

  test('composes a nested node component', () => {
    const { node, mount } = createEnv();
    const Badge = node`<span class="badge">inner</span>`;
    const wrap = mount(node`<div class="card">${() => Badge()}</div>`);
    assert.ok(wrap.querySelector('.card .badge'), 'nested component not found inside parent');
  });
});

// ── watch ─────────────────────────────────────────────────────────────────────

describe('watch', () => {
  test('renders initial state', () => {
    const { watch, mount } = createEnv();
    const Comp = watch({ score: 7 })`<p class="v">${s => s.score}</p>`;
    const wrap = mount(Comp);
    assert.equal(wrap.querySelector('.v').textContent, '7');
  });

  test('setState updates the DOM', () => {
    const { watch, mount } = createEnv();
    const Comp = watch({ n: 0 })`
      <div>
        <span class="n">${s => s.n}</span>
        <button click="${(s, set) => set({ n: s.n + 1 })}">+</button>
      </div>`;
    const wrap = mount(Comp);
    wrap.querySelector('button').click();
    assert.equal(wrap.querySelector('.n').textContent, '1');
  });

  test('setState shallow-merges — unrelated keys are preserved', () => {
    const { watch, mount } = createEnv();
    const Comp = watch({ a: 1, b: 2 })`
      <div>
        <span class="a">${s => s.a}</span>
        <span class="b">${s => s.b}</span>
        <button click="${(s, set) => set({ a: 99 })}">go</button>
      </div>`;
    const wrap = mount(Comp);
    wrap.querySelector('button').click();
    assert.equal(wrap.querySelector('.a').textContent, '99', '"a" not updated');
    assert.equal(wrap.querySelector('.b').textContent, '2',  '"b" was clobbered by setState');
  });

  test('event handler fires correctly after a re-render', () => {
    const { watch, mount } = createEnv();
    let count = 0;
    const Comp = watch({ x: 0 })`
      <div>
        <span>${s => s.x}</span>
        <button click="${(s, set) => { count++; set({ x: s.x + 1 }); }}">go</button>
      </div>`;
    const wrap = mount(Comp);
    wrap.querySelector('button').click(); // triggers re-render
    wrap.querySelector('button').click(); // fires on the new element
    assert.equal(count, 2, `expected 2, got ${count}`);
  });

  test('event handler fires exactly once per click after 10 setState calls', () => {
    const { watch, mount } = createEnv();
    let count = 0;
    const Comp = watch({ x: 0 })`
      <div>
        <span>${s => s.x}</span>
        <button click="${(s, set) => { count++; set({ x: s.x + 1 }); }}">go</button>
      </div>`;
    const wrap = mount(Comp);
    for (let i = 0; i < 10; i++) wrap.querySelector('button').click();
    assert.equal(count, 10, `expected 10, got ${count} — possible duplicate listeners`);
  });

  test('child nodes receive updated state on each re-render', () => {
    const { node, watch, mount } = createEnv();
    const Child = s => node`<span class="child">${() => s.label}</span>`;
    const Comp = watch({ label: 'before' })`
      <div>
        ${(s) => Child(s)()}
        <button click="${(s, set) => set({ label: 'after' })}">go</button>
      </div>`;
    const wrap = mount(Comp);
    wrap.querySelector('button').click();
    assert.equal(wrap.querySelector('.child').textContent, 'after');
  });
});

// ── head ─────────────────────────────────────────────────────────────────────

describe('head', () => {
  test('appends an element to document.head', () => {
    const { win, head } = createEnv();
    const before = win.document.head.querySelectorAll('meta[name="bourbon-test"]').length;
    head`<meta name="bourbon-test" content="1">`;
    const after = win.document.head.querySelectorAll('meta[name="bourbon-test"]').length;
    assert.equal(after, before + 1);
  });
});

// ── known bugs ────────────────────────────────────────────────────────────────

describe('known bugs', () => {
  test('[bug] deferredEventHandlers is cleared after appendEvents', () => {
    const { watch, mount, deferredEventHandlers, win } = createEnv();
    const Comp = watch({ v: 0 })`
      <div>
        <button click="${(s, set) => set({ v: s.v + 1 })}">go</button>
      </div>`;

    mount(Comp);
    assert.equal(
      deferredEventHandlers.length, 0,
      `after mount: ${deferredEventHandlers.length} entries remain — appendEvents does not clear the array`
    );

    win.document.querySelector('button').click(); // setState → calls appendEvents internally
    assert.equal(
      deferredEventHandlers.length, 0,
      `after setState: ${deferredEventHandlers.length} entries remain`
    );
  });

  test('[bug] for..in loop in events IIFE does not leak "i" into global scope', () => {
    const { win } = createEnv();
    assert.ok(
      !Object.prototype.hasOwnProperty.call(win, 'i'),
      `window.i = ${JSON.stringify(win.i)} — undeclared loop variable "i" leaked into global scope`
    );
  });
});
