module.exports = (fn) => (req, res, next) => {
  // fn(req, res, next).catch((err) => next(err));
  fn(req, res, next).catch(next); // same as above
  // our error ends up in our global error hadling middleware
};
