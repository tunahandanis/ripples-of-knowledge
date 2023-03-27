/* eslint-disable no-undef */
const mongoose = require("mongoose")

const bookSchema = mongoose.Schema({
  bookId: Number,
  ipfsHash: String,
})

module.exports = mongoose.models.Book || mongoose.model("Book", bookSchema)
