# BourbonJS

BourbonJS is a lightweight, vanilla JavaScript library for creating web components. It is inspired by web frameworks like React but condensed into a single file. BourbonJS is designed to be simple and easy to use, with a tiny API that is easy to learn.

There is no added syntax or templating language to learn, just plain JavaScript. BourbonJS uses template strings to create web components, making it easy to create and manage components.

The minified version of BourbonJS is less than 1 KB, making it a great choice for projects where size is a priority.

## Features

The features of BourbonJS are limited to the very basics of creating web components. Only features that are crucial to every project are included. Following is a list of features that BourbonJS provides:

### body
A function to append nodes to the document's body.

### node
A function to create a new node.

### head
A function to append nodes to the document's head.

### watch
A function that creates a node that watches for changes of the node's state.

## Usage

All API functions are returning functions that create nodes. The functions can be called with a template string to create a new node. Template strings need to pass functions as well.

nodes can only contain one root node.

The following is an example of how to create a simple web component using BourbonJS:

```javascript
// Create a new node
const count = 0;
const Counter = node`
  <span>${() => count}</span>
`;
```

To add this node to the document's body, you can use the `body` function:

```javascript
// Append the node to the document's body
body`
  ${Counter}
`;
```

To update the node's state, you can use the `watch` function. watch will call the function passed to the template string with state and setState parameters. The state parameter is the current state of the node, and the setState parameter is a function that can be used to update the node's state. The initial state is passed to as a parameter to the watch function. The following is an example of how to create a node that watches for changes of the node's state:

```javascript
// Watch for changes of the node's state
const Counter = watch({count: 0})`
  <div>
    <span>${(state) => state.count}</span>
    <button click="${(state, setState) => {
      setState({count: state.count+=1})}
    }">Increment</button>
  </div>
`;
```

You can also pass setState down to child nodes if you want to update the state of a parent node from a child node. The following is an example of how to pass setState down to a child node:

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
    ${(s, setS) => Button(s,setS)}
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
