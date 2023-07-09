const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST /tour/4u5u5u/reviews
const router = express.Router({ mergeParams: true }); // magical merge param. // fuck this line, this line tookes my 30min!!

router.use(authController.protect);
router.route('/').get(reviewController.getAllReviews).post(
  // authController.protect, // we dont need this because we are using router.use(authController.protect)
  authController.restrictTo('user'),
  reviewController.setTourUserIds,
  reviewController.createReview
);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
