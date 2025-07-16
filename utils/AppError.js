class AppError extends Error {
  constructor(message, statusCode) {
    //调用父类
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? '失败了' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
