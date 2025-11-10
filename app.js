const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) 全局中间件

// set security HTTP headers security 安全
app.use(helmet());

//dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  //1h允许IP发送500请求
  max: 500,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour!',
});
app.use('/api', limiter);

//Body parse，reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 导入并使用 cors
app.use(cors());

//Data sanitization against NOSQL query injetion  sanitization=>净化 against=>反对，防止
app.use(mongoSanitize());

//Data sanitization against XSS   HTML code
app.use(xss());

//Prevent paramter pollution 防止参数污染
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'maxGroupSize',
      'price',
    ],
  }),
);

//Serving static files 提供静态文件
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//404错误处理，放在所有路由最后 '*'通配符表示匹配任何路径
app.all('*', (req, res, next) => {
  //自动跳到catch阶段
  next(new AppError(`没有在服务器找到${req.originalUrl}这个路径`, 404));
});

//错误处理中间件
app.use(globalErrorHandler);

module.exports = app;
