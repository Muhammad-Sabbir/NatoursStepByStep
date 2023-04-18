const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

// console.log(app.get('env')); // these are global variables
// console.log(process.env);
const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
//power shell commands 'set NODE_ENV=development;node server.js'
