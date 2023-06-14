const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value:"${err.keyValue.name}". Please use another value!`;
  return new AppError(message, 400);
};
const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log(errors);
  const message = `Invalid inpur data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again!', 401);
const sendErrorDev = (err, res) => {
  // if (err.name === 'CastError') {
  //   let error = { ...err };
  //   error = handleCastErrorDB(error);
  //   res.status(error.statusCode).json({
  //     status: error.status,
  //     error: error,
  //     message: error.message,
  //     stack: error.stack,
  //   });
  // }
  // console.log(err.name);
  // console.log(err.isOperational);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send messsage to client.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Programming or other unknown error: don't leak error details to client
  else {
    //1) Log error
    console.error('ERROR 🙈');
    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
      // stack: err.stack,
      error: err,
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack); // actualy will show us where the error happened
  //default error status code
  err.statusCode = err.statusCode || 500; //which mean internal server error
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    console.log(err.message);
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    if (error.CastError) error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error?.errors?.name?.name === 'ValidatorError')
      error = handleValidatorErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
