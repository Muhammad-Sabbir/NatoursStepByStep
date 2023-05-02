const mongoose = require('mongoose');
const slugify = require('slugify');

// const opts = { toObject: { virtuals: true } };
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratinngsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // here we use function instead of arrow function, becused arrow function does not support this keyword // fuck this line, cause this line takes my extra 1 hour!!! shittttttttttt
});

// DOCUMENT MIDDLEWARE: rund before .save() and .create()
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

const Tour = mongoose.model('Tour', tourSchema); // First letter of model variable name must be capital letter. here Tour, T is in capital letter.
module.exports = Tour;
