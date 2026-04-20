let items = [
  {title:'Eat', state: 'done'},
  {title:'Sleep', state: 'todo'},
  {title:'Code', state: 'todo'},
  {title:'Repeat', state: 'todo'}
];

const addItem = (state, setState) => {
  const newItem = document?.getElementById('new-item')?.value;
  if (newItem) {
    setState({ items: [...state.items, {title: newItem, state: 'todo'}] });
  }
}

const removeItem = (item, state, setState) => {
  setState({ items: state.items.filter(i => i !== item) });
}

const Button = node`
  <button click="${addItem}">Add</button>
`;

const iconTrash = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4A.5.5 0 0 1 12 3.5V3H4v.5a.5.5 0 0 1-.118.5zM2.5 3V2h11v1h-11z"/>
  </svg>
`;

const ListItem = (item, props, setProps) => node`
<li class="${()=>item.state}" click="${()=>setProps({items: props.items.map(i=>
  i === item ? {...item, state: item.state === 'done' ? 'todo' : 'done'} : i
)})}">
  <span>${()=>item.title}</span>
  <button class="delete" click="${(_, __, event) => { event.stopPropagation(); removeItem(item,props,setProps); }}">${() => iconTrash}</button>
</li>`;

const Todo = watch({items})`
  <div class="container">
    <h1>Todo Items</h1>
    <ul>
      ${(state, setState) => state.items.map(item => ListItem(item, state, setState))}
    </ul>
    <h3>New todo</h3>
    <input id="new-item" type="text" />
    ${Button}
  </div>
`;

body`${Todo}`;
