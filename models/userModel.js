const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//用户架构
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '必须有一个名字'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, '请输入邮箱'],
    unique: true,
    lowercase: true,
    //查看邮箱是否有效
    validate: [validator.isEmail, '请输入正确的邮箱'],
  },
  photo: {
    type: String,
    default: '默认头像',
  },
  password: {
    type: String,
    required: [true, '必须设置一个密码'],
    minlength: 8,
    maxlength: 20,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, '请确认密码'],
    //验证器确认密码，这仅在创建文档和保存文档有效！
    validate: {
      //返回ture/false
      validator(el) {
        return el === this.password;
      },
      message: '两次密码输入不相同',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    defalut: true,
    select: false,
  },
});

//密码被修改，存储加密密码 钩子
userSchema.pre('save', async function (next) {
  // 如果密码没有被修改，直接跳到下一个中间件
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //删除确认密码
  this.passwordConfirm = undefined;
  next();
});

// 添加passwordChangedAt钩子
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//查找中间件
userSchema.pre(/^find/, function (next) {
  //这指向当前查询
  this.find({ active: { $ne: false } });
  next();
});

//添加模型全局方法

//比较明文密码和加密密码
userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

//Timestamp 时间戳
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    //修改密码时间大于token创建时间则Error
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //生成resetToken 生成一个64字符长的随机十六进制字符串，用作重置令牌
  const resetToken = crypto.randomBytes(32).toString('hex');
  //加密后储存到数据库
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //10分钟后过期

  return resetToken;
};
//model 大写
const User = mongoose.model('User', userSchema);

module.exports = User;
