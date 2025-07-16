const mongoose = require('mongoose');
const dotenv = require('dotenv');
//全局处理未捕获的异常 同步代码错误
process.on('uncaughtException', (err) => {
  console.log('未捕获异常! 💥 正在关闭app...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//连接数据库
const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections)
    // console.log('数据库连接成功！');
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
//全局处理拒绝的Promise
process.on('unhandledRejection', (err) => {
  console.log('未处理的拒绝! 💥 正在关闭app...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
