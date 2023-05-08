module.exports = (err, req, res, next) => {
  // console.log(err.stack); // actualy will show us where the error happened
  //default error status code
  err.statusCode = err.statusCode || 500; //which mean internal server error
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
