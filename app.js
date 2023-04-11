const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});
app.post('/', (req, res) => {
  res.send('You can post to this end point');
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
