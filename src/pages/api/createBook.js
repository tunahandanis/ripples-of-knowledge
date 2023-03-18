import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  const bookName = req.body.bookName
  const authorWalletAddress = req.body.authorWalletAddress
  const premiumPrice = req.body.premiumPrice

  const newBook = new Book({
    bookName,
    authorWalletAddress,
    premiumPrice,
  })

  newBook.save()
  res.send(200)
}

/* import dbConnect from "../../utils/dbConnect"
import Book from "../../models/bookModel"

dbConnect()

export default async function handler(req, res) {
  const books = await Book.find({})
  res.status(200).json(books)

  const bookName = req.body.bookName
  const chapter = req.body.chapters
  const authorWalletAddress = req.body.authorWalletAddress
  const premiumPrice = req.body.premiumPrice

  const filter = { bookName: bookName }

  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  Book.findOneAndUpdate(
    filter,
    {
      $set: {
        bookName: bookName,
        authorWalletAddress: authorWalletAddress,
      },
      $push: { nfts: collectionNfts },
    },
    options,
    (error: Error, data: object) => {
      if (error) {
        console.log(error)
      } else {
        console.log(data)
        res.status(200)
      }
    }
  )
} */
