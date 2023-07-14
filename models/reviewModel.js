// review // rating //createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
      trim: true,
      maxlength: [200, 'A tour must have less or equal then 200 characters'],
      minlength: [5, 'A tour must have more or equal then 5 characters'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // }); // this was creating an inefficient chain of populates
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratinngsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
  // let's now just take a second and recap what we did here.
  // So we started by creating a static method. So this entire function here to basically create the statistics of the average and number of ratings for the tour ID for which the current review was created, okay. And we created this function as a static method, because we needed to call the aggregate function on the model. So in a static method to this variable calls exactly to a method. So it's very handy in these cases. So we constructed our aggregation pipeline here where we selected all the reviews that matched the current tour ID, and then they're calculated, the statistics for all of these reviews. Then after that was done we saved the statistics to the current tour, okay. Then in order to actually use this function we call it after a new review has been created, okay. For that we need to use this.constructor because this is what points to the current model.

  //Now keep in mind how we said that we also want to update the statistics whenever a review is edited or deleted, because these actions will, of course, also influence the number and the average.
};

reviewSchema.post('save', function () {
  // this points to current review. Because of presave the current review is not really in the colletion just yet, so therefore, when we then do this math here it should'nt be able to then appear in the output here, because again at this point in time it's not really saved into the collection just yet, okay... so instead post save all the documents are already saved in the database and so that' then a great time to atually do this calculation with all the reviews already and then store the result on the tour.
  // Important: Next middleware is not using in post save middleware.
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
