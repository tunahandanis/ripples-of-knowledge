import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  await Book.find().then((foundBooks) => res.json(foundBooks))
}
