const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');
// const { dirname } = require('path');
dotenv.config({ path: '../../config.env' });
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
    console.log('数据库连接成功！');
  })
  .catch((err) => {
    console.log(err);
  });

//写入所有数据
const tours = JSON.parse(fs.readFileSync(`tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`reviews.json`, 'utf-8'));
//添加数据到DATEBASE

const importData = async () => {
  try {
    //添加数据
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('添加数据成功');
  } catch (err) {
    console.log(err);
  }
};
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('全部数据删除成功！');
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
//通过命令行来导入和删除 node file --import node file --delete
console.log(process.argv);
