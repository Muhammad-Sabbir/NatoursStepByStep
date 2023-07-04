// one endpoint getting all reviews
// one endpoint for creating new reviews all on your own.// done
// create the controller file // done
// the create the controller functio // done
// also then create the routes in a review routes file.
// create some new reviews
// and also retrieve them from the database using get all reviews.
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync'); //We just comment it and keep this here because who knows maybe in the future we are gonna need it for some other Middleware function here.

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
