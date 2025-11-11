const mongoose = require('mongoose');
// const User = require('./userModel');
//Schema 架构
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '必须有一个名字'],
      unique: true,
      trim: true,
      maxlength: [40, '名字最大长度不能超过40'],
      minlength: [4, '名字最小长度不能少于过4'],
    },
    duration: {
      type: String,
      required: [true, '必须有一个持续时间'],
    },
    maxGroupSize: {
      type: String,
      required: [true, '必须有一个大小'],
    },
    difficulty: {
      type: String,
      required: [true, '必须有一个难度'],
      enum: {
        values: ['简单', '中等', '困难'],
        message: '不能是easy，medium，difficult以外的值！',
      },
    },
    //平均评分
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, '最大评分不能超过5'],
      min: [1, '最大评分不能超过1'],
    },
    //评分数量
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, '必须有一个价格'],
    },
    //折扣
    priceDiscount: {
      type: Number,
      //自定义验证器
      validate: {
        //this仅指向新文档创建时的当前文档
        validator(val) {
          //打折时折扣价应该低于price 否则return false
          return val < this.price;
        },
        message: '打折价格({VALUE})不应该高于原价',
      },
    },
    //摘要
    summary: {
      type: String,
      trim: true,
      required: [true, '必须有一个描述'],
    },
    //描述
    description: {
      type: String,
      trim: true,
    },
    //封面
    imageCover: {
      type: String,
      required: [true, '你必须有一个图片'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      defalut: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        defalut: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          defalut: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    //ref 引用
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  //让虚拟属性显示
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
//中间件是在结构级别指定的，对于编写 plugins 很有用。
//只在.save() 和.create()之间 不报错update

/*
tourSchema.pre('save', async function (next) {
  //通过id实现User嵌入
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

//createIndex 加快查询速度
tourSchema.index({ price: 1, ratingsAverage: -1 });

//virtual populate sql JOIN
tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour', //外键
  localField: '_id', //本地主键
});

tourSchema.pre('save', (next) => {
  // console.log('即将保存到数据库');
  next();
});
//文档保存在数据库之后
tourSchema.post('save', (doc, next) => {
  // console.log('保存数据库成功');
  // console.log(doc);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });

  next();
});

//虚拟属性,只有访问时候才存在
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//model 大写
const Tour = mongoose.model('Tour', tourSchema);

/* 
const testTour=new Tour({
//   name:'Shang-Hai',
//   rating:4.9,
//   price:100
// })

// //保存添加到数据库一条数据
// testTour.save().then(doc=>{
//   console.log(doc)
// }).catch(err=>{
//   console.log('ERROR:',err)
 })
*/
module.exports = Tour;
