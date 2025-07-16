const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//注册
router.post('/signup', authController.signup);

//登录
router.post('/login', authController.login);

//忘记密码
router.post('/forgotPassword', authController.forgotPassword);

//重置密码
router.patch('/resetPassword/:token', authController.resetPassword);

//保护中间件
router.use(authController.protect);

//更新密码
router.patch('/updateMyPassword', authController.updatePassword);

//注销用户
router.delete('/deleteMe', userController.deleteMe);

//更新用户数据
router.patch('/updateMe', userController.updateMe);

//观看自己数据
router.get('/getMe', userController.getMe, userController.getUser);

//管理员权限执行
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
