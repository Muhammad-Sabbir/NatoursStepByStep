const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLER EXCEPTION! 🥵😱 Shutting down');
  console.log(err.name, err.message);
  // to shutdown the server
  process.exit(1);
});
// console.log(x); // this line is related to the upper process.on() method above

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(app.get('env')); // these are global variables
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .set('strictQuery', false)
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });
// .catch((err) => {
//   console.log('Error');
// });

const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
//power shell commands 'set NODE_ENV=development;node server.js'

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! 🥵😱 Shutting down');
  console.log(err.name, err.message);
  // to shutdown the server
  server.close(() => {
    process.exit(1);
  });
});
// Example 1:
// process.on('uncaughtException', (err) => {
//   console.log('UNHANDLER EXCEPTION! 🥵😱 Shutting down');
//   console.log(err.name, err.message);
//   // to shutdown the server
//   server.close(() => {
//     process.exit(1);
//   });
// });
// console.log(x);
