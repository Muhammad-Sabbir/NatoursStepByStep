//// Example:1
// const express = require('express');

// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.status(200).send('Hello from the server side!');
// });
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
// Example:2
const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server side!', app: 'Natours' });
});
app.post('/', (req, res) => {
  res.send('You can post to this end point');
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
