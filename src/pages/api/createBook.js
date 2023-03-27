import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  const bookId = req.body.bookId
  const ipfsHash = req.body.ipfsHash

  const newBook = new Book({
    bookId,
    ipfsHash,
  })

  newBook.save()
  res.send(200)
}
