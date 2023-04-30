class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // three dot structuring an object shallow copy here
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // there are some special query string that will be used to find or for paginations and not actually query into the database. So we will have to specifi these special query string saperately.

    //1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this; // means, return this object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; // means, return this object
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this; // means, return this object
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // '123'*1 = 123 this is how convert a string to a number in js. and Here default page is 1.
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //Example:
    // page=3&limit=10, 1-10--> page 1, 11-20--> page 2, 21-30--> page3
    // query = query.skip(20).limit(10);
    this.query = this.query.skip(skip).limit(limit);
    return this; // means, return this object
  }
}

module.exports = APIFeatures;
