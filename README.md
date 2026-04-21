# BourbonJS

BourbonJS is a lightweight, vanilla JavaScript library for creating web components. It is inspired by web frameworks like React but condensed into a single file. The minified version is less than 1 KB.

- No build step — just drop in a `<script>` tag
- No dependencies — pure vanilla JavaScript
- No JSX or templating language — just tagged template literals

## Introduction

BourbonJS has four functions: `node`, `body`, `head`, and `watch`. All four are tagged template literals. You write HTML inside backtick strings and use `${}` interpolations to inject dynamic values, event handlers, and child components.

**The key rule:** all interpolated values inside `node` and `watch` templates must be functions. BourbonJS calls each function at render time to get its value. This is what makes re-rendering work — when state changes, the functions run again and return up-to-date values.

```javascript
// Wrong — this will throw
node`<p>${"hello"}</p>`;

// Correct — wrap the value in a function
node`<p>${() => "hello"}</p>`;
```

Functions receive `(state, setState)` as arguments when used inside a `watch` component. For event handlers, write the event name as an attribute:

```javascript
node`<button click="${(state, setState) => setState({ count: state.count + 1 })}">+</button>`;
```

Each component must have exactly one root element.

> **Note:** `head` is the one exception — it also accepts plain values in interpolations, not just functions.

## API

The full API consists of four functions. Only features that are crucial to every project are included.

### node
A function to create a new node. It is a tagged template literal that returns a factory function `(state, setState) => HTMLElement`. Interpolated values must be wrapped in functions.

```javascript
// A simple greeting component
const Greeting = node`
  <h1>${() => "Hello, World!"}</h1>
`;

// A component that displays a dynamic value
const Price = node`
  <span class="price">${() => "$" + (9.99).toFixed(2)}</span>
`;

// A component with an event handler
const AlertButton = node`
  <button click="${() => alert('Clicked!')}">Click me</button>
`;

// A component that renders child components
const Header = node`
  <header>
    ${Greeting}
    <p>${() => "Welcome to BourbonJS"}</p>
  </header>
`;

// A component that accepts state from a parent
const Display = node`
  <span class="display">${(state) => state.count}</span>
`;
```

### body
A function to append nodes to the document's body. This is the entry point for mounting top-level components.

```javascript
// Mount a single component
body`${Counter}`;

// Mount with surrounding markup
body`
  <div class="app">
    ${Header}
    ${Counter}
  </div>
`;
```

### head
A function to append nodes to the document's head. Used for `<title>`, `<meta>`, `<style>`, `<link>`, and `<script>` tags.

```javascript
// Set the page title
head`<title>My App</title>`;

// Add a viewport meta tag
head`<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

// Inject dynamic styles
const primaryColor = "#3498db";
head`
  <style>
    .btn { background: ${() => primaryColor}; color: white; padding: 8px 16px; }
  </style>
`;
```

### watch
A function that creates a node that watches for changes of the node's state. It wraps `node` in a closure that holds mutable state. Calling `setState` triggers a re-render.

```javascript
// A simple counter
const Counter = watch({ count: 0 })`
  <div>
    <span>${s => s.count}</span>
    <button click="${(state, setState) => setState({ count: state.count + 1 })}">+</button>
  </div>
`;

// A toggle component
const Toggle = watch({ on: false })`
  <div>
    <span>${s => s.on ? "ON" : "OFF"}</span>
    <button click="${(s, set) => set({ on: !s.on })}">Toggle</button>
  </div>
`;

// A component with a list in state
const TagList = watch({ tags: ["html", "css", "js"] })`
  <ul>
    ${(s) => s.tags.map(tag => node`<li>${() => tag}</li>`)}
  </ul>
`;
```

## Passing state to child components

You can pass `setState` down to child nodes to update the state of a parent from a child. Child components defined with `node` accept `(state, setState)` when called:

```javascript
const increment = (state, setState) => {
  setState({ count: state.count + state.increment })
}

const counterState = { count: 0, increment: 1 };

const Button = node`
  <button click="${increment}">Increment</button>
`;

const Counter = watch(counterState)`
  <div>
    <p>Count: ${s => s.count}</p>
    <button click="${increment}">Increment</button>
    <br/>
    ${(s, setS) => Button(s, setS)}
  </div>
`;

body`${Counter}`;
```


## Install

No need to install anything, just copy bourbon.min.js to your scripts folder and add the following script tag to your html file:

```html
<script src="<path to your scripts>/bourbon.min.js"></script>
```

## Run quick test server with gzip
- install serve
- export PATH=$PATH:$(go env GOPATH)/bin
- serve -g -p 8000
