const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//导入父级参数到子级配置
const router = express.Router({ mergeParams: true });

//获取所有评论,创建评论 限制登录,用户
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview,
  );

//修改评论,删除评论,获取评论
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.protect, reviewController.updateReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = router;
