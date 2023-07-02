const Tour = require('../models/tourModel');
// eslint-disable-next-line import/no-unresolved
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  //query.sort().select().skip().limit() // this is a big query. We can add multiple statements to the query

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // Ex01: This will show the __V AND changed resetPassword.
  // const tour = await Tour.findById(req.params.id).populate('guides'); // with populate this gonna fill it up with the actual data, the data will show only in query not in actually database.
  //Ex02: Instead of this process we will use query middleware. this is a nice trick from the documents.
  // const tour = await Tour.findById(req.params.id).populate({
  //   path: 'guides',
  //   select: '-__v -passwordChangedAt',
  // }); // requested url is: {{URL}}api/v1/tours/63dfc64c6d9c29d6687816fc

  // Ex03: by using middleware
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // Tour.findOne({_ID:req.params.id})
  console.log(typeof tour);
  console.log('hello');
  if (tour === undefined) {
    console.log(tour);
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // true means run validator again. lecture 8.27 tourModel.js will execute for validation.
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // 'https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/'
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // example:1
        // _id: null,
        // example:2
        // _id: '$difficulty',
        //example:3
        // _id: '$ratingsAverage',
        // example:4
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 means ascending order, -1 means descending order
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Example:3 getToursStats
exports.getTourStats = catchAsync(async (req, res, next) => {
  // 'https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/'
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // example:1
        // _id: null,
        // example:2
        // _id: '$difficulty',
        //example:3
        // _id: '$ratingsAverage',
        // example:4
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 means ascending order, -1 means descending order
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // to make in int
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // if we want to set limit then we have to set the $limit field
    // {
    //   $limit: 3,
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
