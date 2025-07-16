const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/CatchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = catchAsync(async (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: '成功',
    token,
    data: {
      user,
    },
  });
});

//注册
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  //解构
  const {
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
    passwordResetToken,
    passwordResetExpires,
    active,
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
    passwordResetToken,
    passwordResetExpires,
    active,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1.检查是否输入了邮箱和密码
  if (!email || !password) {
    return next(new AppError('请输入邮箱或密码'), 400);
  }
  //2.检查用户是否存在&密码是否正确
  const user = await User.findOne({
    email,
  }).select('+password');
  //使用比较函数 401代表未经授权
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('账号或密码不正确', 401));
  }

  //3.如果一切正常，向客户端发送令牌token
  const token = signToken(user._id);
  res.status(200).json({
    status: '成功',
    token,
  });
});

//验证是否登录中间件
exports.protect = catchAsync(async (req, res, next) => {
  //1.获取token并检查
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //获取token
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('你没有登录，无权限访问！'), 401);
  //2.验证token是否有效
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3.检查用户是否存在(防止有人窃取JWT)令牌存在但账户可以已经注销
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('属于此令牌的用户已不存在', 401));
  //4.检查token后用户是否更改了密码
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('用户已经修改了密码，请重新登录'), 401);
  }

  //放行访问受保护的路由
  req.user = currentUser;
  next();
});

//管理员权限
exports.restrictTo =
  (...roles) =>
  //返回一个函数
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('你没有执行次操作的权限！', 403));
    //放行
    next();
  };
//忘记密码
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)获取用户邮件
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError('没有找到用户邮箱', 404));

  //2)产生随机重置密码token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3)给用户发邮件
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `忘记密码了吗？请点击下面链接来重置密码\n
  ${resetURL}\n
  如果没有忘记，请忽略此邮件`;
  try {
    await sendEmail({
      email: user.email,
      subject: '您的密码重置令牌(10分钟内有效)',
      message,
    });

    res.status(200).json({
      status: '成功',
      message: '令牌已经发送到电子邮箱！',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('有些错误造成发送失败，再试一次', 500));
  }
});
//重置密码
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.获取用户resetToken 它在数据库hashToken中是加密的
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //获取用户 检查令牌是否过期
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2.如果token没有过期,而且存在这个user=>设置新密码(限制条件：token未过期)
  if (!user) return next(new AppError('令牌已过期或找不到', 400));
  //设置新密码
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //删除重置token和Expires
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3.Update changedPasswordAt property 在userModel中

  //4.登录用户，发送JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: '成功',
    token,
  });
});

//更新密码
exports.updatePassword = catchAsync(async (req, res, next) => {
  //获取用户
  const user = await User.findById(req.user.id).select('+password');
  //验证更改密码前的账号密码
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('更改前的账号或密码不正确', 401));
  }
  //更新用户密码
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate将无法按预期工作！
  //message
  res.status(200).json({
    status: '成功',
    message: '修改密码成功',
  });
});
