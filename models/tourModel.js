const mongoose = require('mongoose');
const slugify = require('slugify');
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // here we use function instead of arrow function, becused arrow function does not support this keyword // fuck this line, cause this line takes my extra 1 hour!!! shittttttttttt
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
// Example-2:
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema); // First letter of model variable name must be capital letter. here Tour, T is in capital letter.
module.exports = Tour;
