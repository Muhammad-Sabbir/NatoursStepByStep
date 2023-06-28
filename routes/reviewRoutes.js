const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST /tour/4u5u5u/reviews
const router = express.Router({ mergeParams: true }); // magical merge param. // fuck this line, this line tookes my 30min!!
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
