import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  const bookId = req.body.bookId
  const newHash = req.body.newHash

  const filter = { bookId: bookId }

  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  await Book.findOneAndUpdate(
    filter,
    {
      ipfsHash: newHash,
    },
    options
  ).then((response) => {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Cache-Control", "max-age=180000")
    res.end(JSON.stringify(response))
  })
}
