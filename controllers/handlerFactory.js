// The goal is create a function which will then return a function that looks like this one below. But not only for the tour but for every single model that we have in our application and that we might have in the future.
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // true means run validator again. lecture 8.27 tourModel.js will execute for validation.
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Ex01: This will show the __V AND changed resetPassword.
    // const tour = await Tour.findById(req.params.id).populate('guides'); // with populate this gonna fill it up with the actual data, the data will show only in query not in actually database.
    //Ex02: Instead of this process we will use query middleware. this is a nice trick from the documents.
    // const tour = await Tour.findById(req.params.id).populate({
    //   path: 'guides',
    //   select: '-__v -passwordChangedAt',
    // }); // requested url is: {{URL}}api/v1/tours/63dfc64c6d9c29d6687816fc

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (doc === undefined) {
      console.log(doc);
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour(small hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //   // example01: using explain();
    // const doc = await features.query.explain(); //"totalDocsExamined": 9, // "totalDocsExamined": 3,
    //query.sort().select().skip().limit() // this is a big query. We can add multiple statements to the query
    // example 02: remove explain();
    const doc = await features.query;
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: { data: doc },
    });
  });
