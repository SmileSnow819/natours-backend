const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('没有找到这个文档', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      //new: true：Mongoose返回更新后的文档。设置为false，方法将返回更新前的文档
      //runValidators: false：在更新操作之前不运行Mongoose的验证器。
      new: true,
      runValidators: true,
    });
    if (!document) return next(new AppError('没有找到这个文档', 404));
    res.status(200).json({
      status: '成功',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //用于在查询时自动替换文档中的指定路径为其他集合中的实际文档。
    //这相当于关系型数据库中的 JOIN 操作，但在 NoSQL 数据库中实现关联查询。
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;
    //如果没有tour则抛出错误
    if (!document) {
      return next(new AppError('没有找到这个id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //允许在tour中嵌套reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await features.query;
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        data: documents,
      },
    });
  });
