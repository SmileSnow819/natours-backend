//接受一个异步函数为参数 会返回一个Promise
//封装函数的错误处理步骤，摆脱try...catch
//return一个函数给函数变量名

module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
