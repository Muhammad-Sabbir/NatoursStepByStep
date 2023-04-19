const Tour = require('./../models/tourModel');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//check body middleware
exports.checkBody = (req, res, next) => {
  // if(!req.body.name||req.body.price){
  if (
    req.body.hasOwnProperty('name') == false ||
    req.body.hasOwnProperty('price') == false
  ) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing Name or Price',
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: { tours },
  });
};
exports.getTour = (req, res) => {
  console.log(req.params);
  const id = parseInt(req.params.id); // another tricks in js is to convert a string to a number
  //that req.params.id *1 means if a string is multiple by a integer, it will be converted to a number
  // const tour = tours.find((tour) => tour.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: { tour },
  // });
};
exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
