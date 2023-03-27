import dbConnect from "../../utils/dbConnect"
import Review from "../../models/reviewModel"

dbConnect()

export default async function handler(req, res) {
  await Review.find().then((foundReviews) => res.json(foundReviews))
}
