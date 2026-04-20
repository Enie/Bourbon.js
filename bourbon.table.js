const ListItem = (item, props, setProps) => node`<li>
  ${() => item}
  <button click="${() => removeItem(item,props,setProps)}">Delete</button
</li>`;

const Cell = (value, setValue) => node`
  <td>
    ${() => {
      return value
    }}
  </td>`;

const Table = (data) => {
  const { header, rows, cellTemplates } = data;
  const table = node`
    <table>
      <thead>
        <tr>
          ${() => header.map((value, i) => Cell(value, () => {header[i] = value}))}
        </tr>
      </thead>
      <tbody>
        ${() => rows.map(row => node`
          <tr>
            ${() => row.map((value,i) => Cell(value, () => {row[i] = value}))}
          </tr>
        `)}
      </tbody>
    </table>
  `;
  return table;
};
