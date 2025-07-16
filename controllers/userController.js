const User = require('../models/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const Factory = require('./handlerFactory');

const filterReqBody = (obj, ...allowArg) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //是否包含当前元素el
    if (allowArg.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1.修改密码的话new AppError
  if (req.body.password || req.body.passwordConfirm)
    return new AppError('这里不能更新密码！请使用/updateMyPassword', 400);
  //2.过滤数据 防止更新role：admin之类的
  const filterBody = filterReqBody(req.body, 'name', 'photo');
  //3.更新用户文档
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: '成功',
    data: {
      use: updateUser,
    },
  });
});

//注销用户只是隐藏起来了 实际在数据库中并没有删除
//active:false
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: '成功',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = Factory.getAll(User);

exports.getUser = Factory.getOne(User);

// exports.createUser = Factory.createOne(User);请使用/singup

exports.updateUser = Factory.updateOne(User);

exports.deleteUser = Factory.deleteOne(User);
