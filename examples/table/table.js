let data = {
  header: ['Name', 'Age', 'City'],
  rows: [
    ['John', 25, 'San Francisco'],
    ['Jane', 24, 'New York'],
    ['Doe', 26, 'Los Angeles']
 ]
};

body`${Table(data)}`;
