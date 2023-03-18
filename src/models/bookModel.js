/* eslint-disable no-undef */
const mongoose = require("mongoose")

const bookSchema = mongoose.Schema({
  authorWalletAddress: String,
  bookName: String,
  premiumPrice: String,
  chapters: [{ chapterName: String, content: String }],
})

module.exports = mongoose.models.Book || mongoose.model("Book", bookSchema)
