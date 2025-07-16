const Review = require('../models/reviewModel');
const Factory = require('./handlerFactory');

//查询中间件
exports.setTourUserId = (req, res, next) => {
  //嵌套路由 nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

//创建评论
exports.createReview = Factory.createOne(Review);

//删除评论
exports.deleteReview = Factory.deleteOne(Review);

//修改评论
exports.updateReview = Factory.updateOne(Review);

//查询一条评论
exports.getReview = Factory.getOne(Review);

//获取所有评论
exports.getAllReviews = Factory.getAll(Review);
