import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  const body = JSON.parse(req.body)
  const query = { _id: body.bookId }

  await Book.findOne(query).then((foundBook) => res.json(foundBook))
}
