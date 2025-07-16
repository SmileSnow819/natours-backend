const Tour = require('../models/tourModel');
const Factory = require('./handlerFactory');

exports.getAllTours = Factory.getAll(Tour);

exports.getTour = Factory.getOne(Tour, 'review');

exports.createTour = Factory.createOne(Tour);

exports.updateTour = Factory.updateOne(Tour);

exports.deleteTour = Factory.deleteOne(Tour);

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      //过滤阶段
      {
        $match: { ratingsAverage: { $gte: 4.6 } },
      },
      // 根据指定的表达式对文档进行分组,每个分组由 _id 字段的值唯一标识
      {
        $group: {
          _id: { $toUpper: 'difficulty' },
          // _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgRating: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  } catch (err) {
    res.status(400).json({
      status: '失败了',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      //将startDates数组展开成多个文档
      {
        $unwind: '$startDates',
      },
      //过滤后剩余2021年的数据
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      //分组 $month返回月份
      {
        $group: {
          _id: { $month: '$startDates' },
          totalTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      //添加月份属性
      {
        $addFields: { month: '$_id' },
      },
      //让_id不再展示
      {
        $project: {
          _id: 0,
        },
      },
      //按照totalTourStarts降序
      {
        $sort: { totalTourStarts: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: '失败了',
      message: err,
    });
  }
};
