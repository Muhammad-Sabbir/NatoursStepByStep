// one endpoint getting all reviews
// one endpoint for creating new reviews all on your own.// done
// create the controller file // done
// the create the controller functio // done
// also then create the routes in a review routes file.
// create some new reviews
// and also retrieve them from the database using get all reviews.
const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const reviews = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const review = await reviews.query;
  //query.sort().select().skip().limit() // this is a big query. We can add multiple statements to the query

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: review.length,
    data: { review },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
