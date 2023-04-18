const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(app.get('env')); // these are global variables
// console.log(process.env);
const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
//power shell commands 'set NODE_ENV=development;node server.js'
