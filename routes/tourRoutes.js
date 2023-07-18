const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);
// router.param('', tourController.checkBody);

// POST /tour/4u5u5u/reviews
//GET /tour/4u5u5u/reviews
//GET /tour/4u5u5u/reviews/RU5U58T

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); // This is a mongoose feature. router itself is really just a middleware. so we can use the method on it. and then say that for this specific route here we want to use the reviewRouter instead. this is actually a router. we did the same thing inside the app.js file.

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
// we want to pass a parameter name year that is why we added the :year on the url
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router
  .route('/')
  // .get(authController.protect, tourController.getAllTours)
  .get(tourController.getAllTours) // // We might want to allow other travel site to embeded our tours into theid own website. And so that's what this API is basically for, and so therefor we will not have any authorization on get tour requests. We want to expose this part of the API to everyone.
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  ); // the actions of creating or editing tours, we only want to allow lead guides and administrators to perform these actions, so ofcourse no normal users and also no normal guides. just admin and lead guides.
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  ); // Protect: if a user is logged in..// restrictTo: authorization

module.exports = router;
