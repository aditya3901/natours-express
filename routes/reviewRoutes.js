const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// GET /api/v1/tours/:tourId/reviews
// POST /api/v1/tours/:tourId/reviews
// POST /api/v1/reviews
// mergeParams to get tourId in reviewRouter

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
