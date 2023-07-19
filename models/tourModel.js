const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel'); // // for tour guides embeding
// const validator = require('validator');
// const opts = { toObject: { virtuals: true } };
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true, //white spaces will be removed from both sides of the string
      maxlength: [40, 'A tour must have less or equal then 40 characters'],
      minlength: [10, 'A tour must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // demonstrates purpose.
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maximum group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.66666, 46.666, 47, 4.7
    },
    ratinngsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    // Custom validator lecture 8.28
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation and not in update!!
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // all whitespace will remove this
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // false means we don't want to show this created field to clients
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
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
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // for tour guides embeding
    guides: [
      // this guides field only contains the reference.
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // here tour referencing the review, but we will do it by virtual populate
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Example 01: only price.
//tourSchema.index({ price: 1 }); // We can set here 1 or -1, one means that we're sorting the price index in an ascending order. and for -1 viseversa // "totalDocsExamined": 3,

// Example 02:  price and ratingsAverage.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // here we use function instead of arrow function, becused arrow function does not support this keyword // fuck this line, cause this line takes my extra 1 hour!!! shittttttttttt
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // In our reviewModel.js file, we have field called tour and this where the ID of the tour is being stored, and that's why here, in this foreign field we specify that name of that field in oder to connect these two models.
  localField: '_id',
  // so lets do that populate actually right in the controller, so the tourController.js and where we have getTour we need to add the populate after the query, and need to pass the name of the field 'reviews' that we want to populate.
});

// DOCUMENT MIDDLEWARE: rund before .save() and .create() //// this only points to current doc on NEW document creation and not in update!!
//Example-1:
// tourSchema.pre('save', function () {
//   console.log(this);
// });
// Example-2:
// tourSchema.pre('save', function (next) {
//   // this is a pre middleware
//   this.slug = slugify(this.name, { lower: true });
//   next(); // because this is a middleware, so next()
// });

// Example-3: there can be multiple pre middleware
// tourSchema.pre('save', function (next) {
//   // this is the first pre middleware
//   this.slug = slugify(this.name, { lower: true });
//   next(); // because this is a middleware, so next()
// });

// tourSchema.pre('save', (next) => {
//   // this is the second pre middleware
//   console.log('Will save document.....');
//   next(); // because this is a middleware, so next()
// });

// Example-4: there can be multiple pre middleware
// tourSchema.pre('save', function (next) {
//   // this is the first pre middleware
//   this.slug = slugify(this.name, { lower: true });
//   next(); // because this is a middleware, so next()
// });

// tourSchema.pre('save', (next) => {
//   // this is the second pre middleware
//   console.log('Will save document.....');
//   next(); // because this is a middleware, so next()
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// let's comment the console.log functions
tourSchema.pre('save', function (next) {
  // this is the first pre middleware
  this.slug = slugify(this.name, { lower: true });
  next(); // because this is a middleware, so next()
});

// Example: For Tour guide embeding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// let's now add a pre-find hook, so basically, a middleware that is gonna run before any find query is executed.
// QUERY MIDDLEWARE
// SECRET EXAMPLES, FOR SPECIAL PEOPLE OR CUSTOMER. we never want the secret tours to show up in any query
// example-1: this will not work because we set findByone in route.
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// example:2 this will work only in findbyOne route.
// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// // example:3 this will work in containing find in route
// tourSchema.pre(/^find/, function (next) {
//   // read the docs of middleware in mongoose
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// example:4 this will work in containing find in route
// let's create a kind off clock to measure how long it takes to execute the current query.

tourSchema.pre(/^find/, function (next) {
  // read the docs of middleware in mongoose
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// this query middleware is gonna run after the query is executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// // Example-1:
// tourSchema.pre('aggregate', function (next) {
//   console.log(this);
//   next();
// });
// // Example-2:
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// }); // this line is commented because of $geoNear is only valid as the first stage in a pipeline. error.lecture number 11. 26

const Tour = mongoose.model('Tour', tourSchema); // First letter of model variable name must be capital letter. here Tour, T is in capital letter.
module.exports = Tour;
