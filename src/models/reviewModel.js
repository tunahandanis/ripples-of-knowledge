/* eslint-disable no-undef */
const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
  reviews: [Number],
  bookId: Number,
})

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema)
