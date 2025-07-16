class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    //excluded 排除 Fields 领域
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //1.高级过滤(替换字符串成原生过滤，增加>< >= <=)
    let queryStr1 = JSON.stringify(queryObj);
    queryStr1 = queryStr1.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(queryStr1));
    return this;
  }

  sort() {
    //2.sorting
    if (this.queryStr.sort) {
      //查询多个用,隔开 如+price,+duration
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //默认按照创建日期
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //3.查询指定数据
    if (this.queryStr.fields) {
      //只查询输入的数据
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //排除敏感数据 不发给客户端
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //4.分页 page--limit
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
