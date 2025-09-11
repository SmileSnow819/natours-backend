const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path'); // 引入 path 模块

const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

// dotenv.config({ path: '../../config.env' }); // 保持不变，假设 config.env 在项目根目录

// 修正 config.env 的路径，使其相对于脚本文件路径
// 脚本文件在 `dev-data/data/`，需要向上两级到达项目根目录
dotenv.config({ path: path.join(__dirname, '../../config.env') });

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
    console.log('数据库连接成功！');
  })
  .catch((err) => {
    console.log(err);
  });

// 修正数据文件的路径
// 数据文件（tours.json, users.json, reviews.json）与脚本文件在同一目录下
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8'),
);

//添加数据到DATEBASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('添加数据成功');
    process.exit(); // 添加这一行，在操作完成后退出进程
  } catch (err) {
    console.log(err);
    process.exit(1); // 错误时退出
  }
};

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('全部数据删除成功！');
    process.exit(); // 添加这一行，在操作完成后退出进程
  } catch (err) {
    console.log(err);
    process.exit(1); // 错误时退出
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
console.log(process.argv);
