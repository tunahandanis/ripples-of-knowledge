import dbConnect from "../../utils/dbConnect"
import Review from "../../models/reviewModel"

dbConnect()

export default async function handler(req, res) {
  const rating = req.body.rating
  const bookId = req.body.bookId

  const filter = { bookId: bookId }

  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  await Review.findOneAndUpdate(
    filter,
    {
      $push: { reviews: rating },
    },
    options
  ).then((response) => {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Cache-Control", "max-age=180000")
    res.end(JSON.stringify(response))
  })
}
