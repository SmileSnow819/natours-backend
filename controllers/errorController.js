const AppError = require('../utils/AppError');
//路径错误Cast属性
const handleCastErrorDB = (err) => {
  const message = `无效的 ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
//处理一样名字的错误
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `拥有重复的名字: ${value}. 请换一个名字!`;
  return new AppError(message, 400);
};
//令牌篡改，重新登陆
const handleJWTError = () => new AppError('无效令牌，请重新登录', 401);
//令牌过期
const handleJWTExpiredError = () => new AppError('令牌失效，请重新登录', 401);
//验证DB错误
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `无效的输入数据。 ${errors.join('. ')}`;
  return new AppError(message, 400);
};
//开发者错误
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //告知用户错误
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //编程或其他未知错误:不发送详细信息
  else {
    //打印错误在控制台上
    console.log('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'something went vrey wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //区分开发者模式还是产品模式
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //拷贝对象
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
