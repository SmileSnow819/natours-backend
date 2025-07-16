const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouters = require('./reviewRoutes');

const router = express.Router();

// POST /tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouters);

// router.param('id', tourController.checkID);
router.route('/tours-stats').get(tourController.getToursStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    //限制身份中间件
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
